import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BudgetTooLowError, compareStrategies, simulatePayoff } from '../lib/debt-plan'
import { computeHealthScore } from '../lib/health-score'
import { annuityPayment, rankLoanOffers, type LoanOfferRow } from '../lib/loans'
import { simulateWealth } from '../lib/wealth'

describe('annuityPayment', () => {
  it('matches the annuity formula', () => {
    assert.equal(Math.round(annuityPayment(12_000_000, 24, 12)), 1_134_715)
  })
  it('handles a zero rate', () => {
    assert.equal(annuityPayment(1_200_000, 0, 12), 100_000)
  })
})

const offer = (o: Partial<LoanOfferRow> & Pick<LoanOfferRow, 'id' | 'rateMin'>): LoanOfferRow => ({
  bank: o.id,
  product: 'p',
  type: 'CONSUMER',
  rateMax: o.rateMin + 4,
  minAmount: 1_000_000,
  maxAmount: 100_000_000,
  minTermMonths: 6,
  maxTermMonths: 60,
  collateralRequired: false,
  approvalDays: 2,
  onlineApply: false,
  note: '',
  ...o,
})

describe('rankLoanOffers', () => {
  const offers = [
    offer({ id: 'cheap', rateMin: 20, collateralRequired: true, approvalDays: 7 }),
    offer({ id: 'fast', rateMin: 22, approvalDays: 1, onlineApply: true }),
    offer({ id: 'small', rateMin: 15, maxAmount: 5_000_000 }),
    offer({ id: 'auto', rateMin: 10, type: 'AUTO' }),
  ]

  it('drops offers the amount, term or type does not fit', () => {
    const ids = rankLoanOffers(offers, { amount: 20_000_000, termMonths: 24, type: 'CONSUMER' }).map((o) => o.id)
    assert.deepEqual(ids.sort(), ['cheap', 'fast'])
  })
  it('filters collateral and marks the best offer', () => {
    const ranked = rankLoanOffers(offers, { amount: 20_000_000, termMonths: 24, type: 'CONSUMER', noCollateral: true })
    assert.equal(ranked.length, 1)
    assert.deepEqual(ranked[0].badges.slice(0, 1), ['BEST_VALUE'])
  })
  it('computes savings against the current rate', () => {
    const [first] = rankLoanOffers(offers, { amount: 20_000_000, termMonths: 24, type: 'CONSUMER', currentRatePct: 40 })
    assert.ok((first.savingVsCurrent ?? 0) > 0)
  })
})

describe('debt plan', () => {
  const debts = [
    { name: 'Mikroqarz', balance: 5_000_000, ratePct: 45, minPayment: 300_000 },
    { name: 'Karta', balance: 2_000_000, ratePct: 30, minPayment: 150_000 },
    { name: 'Avto', balance: 30_000_000, ratePct: 22, minPayment: 1_000_000 },
  ]

  it('avalanche never pays more interest than snowball', () => {
    const a = simulatePayoff(debts, 2_500_000, 'AVALANCHE')
    const s = simulatePayoff(debts, 2_500_000, 'SNOWBALL')
    assert.ok(a.finished && s.finished)
    assert.ok(a.totalInterest <= s.totalInterest)
  })
  it('snowball closes the smallest debt first', () => {
    assert.equal(simulatePayoff(debts, 2_500_000, 'SNOWBALL').order[0].name, 'Karta')
  })
  it('rejects a budget below the minimum payments', () => {
    assert.throws(() => simulatePayoff(debts, 1_000_000, 'AVALANCHE'), BudgetTooLowError)
  })
  it('beats paying only the minimums and suggests an extra payment', () => {
    const c = compareStrategies(debts, 2_500_000)
    assert.ok(c.interestSavedVsMinimum > 0)
    assert.ok(c.monthsSavedVsMinimum > 0)
    assert.ok(c.extraPaymentTip && c.extraPaymentTip.monthsSaved > 0)
  })
})

describe('simulateWealth', () => {
  it('sums contributions exactly at a zero rate', () => {
    const r = simulateWealth({ initialAmount: 1_000_000, monthlyContribution: 500_000, annualRatePct: 0, years: 2 })
    assert.equal(r.finalBalance, 13_000_000)
    assert.equal(r.totalInterest, 0)
    assert.deepEqual(r.milestones, [{ amount: 10_000_000, year: 2, month: 6 }])
  })
  it('grows faster with interest and shrinks in real terms', () => {
    const r = simulateWealth({ initialAmount: 0, monthlyContribution: 1_000_000, annualRatePct: 20, years: 10, inflationPct: 10 })
    assert.ok(r.finalBalance > r.totalContributed)
    assert.ok(r.finalRealBalance < r.finalBalance)
    assert.equal(r.yearly.length, 10)
  })
})

describe('computeHealthScore', () => {
  it('rates a strong profile highly', () => {
    const r = computeHealthScore({ monthlyIncome: 10_000_000, monthlyExpenses: 4_000_000, monthlyDebtPayments: 500_000, savingsBalance: 30_000_000, goalProgressPct: 90 })
    assert.ok(r.score >= 80, String(r.score))
    assert.equal(r.band, 'EXCELLENT')
  })
  it('rates an over-indebted profile low and explains why', () => {
    const r = computeHealthScore({ monthlyIncome: 5_000_000, monthlyExpenses: 3_500_000, monthlyDebtPayments: 2_500_000, savingsBalance: 0, goalProgressPct: 0 }, 'ru')
    assert.ok(r.score <= 35, String(r.score))
    assert.ok(r.score >= 1)
    assert.ok(r.recommendations.length > 0)
    assert.match(r.recommendations[0], /[а-я]/)
  })
})
