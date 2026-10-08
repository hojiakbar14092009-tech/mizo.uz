import type { DebtComparison, DebtInput, DebtPayoff, DebtPlanResult, DebtStrategy } from '@/types'

const MAX_MONTHS = 600

export class BudgetTooLowError extends Error {
  constructor(public readonly required: number) {
    super('BUDGET_TOO_LOW')
  }
}

export function minimumBudget(debts: DebtInput[]): number {
  return debts.reduce((s, d) => s + d.minPayment, 0)
}

export function simulatePayoff(debts: DebtInput[], monthlyBudget: number, strategy: DebtStrategy): DebtPlanResult {
  const required = minimumBudget(debts)
  if (monthlyBudget + 1e-6 < required) throw new BudgetTooLowError(required)

  const state = debts.map((d) => ({ ...d, balance: d.balance, interest: 0, paidOffMonth: 0 }))
  let month = 0
  let totalInterest = 0
  let totalPaid = 0

  const target = () => {
    const open = state.filter((d) => d.balance > 0.5)
    if (strategy === 'SNOWBALL') return open.sort((a, b) => a.balance - b.balance)[0]
    return open.sort((a, b) => b.ratePct - a.ratePct)[0]
  }

  while (state.some((d) => d.balance > 0.5) && month < MAX_MONTHS) {
    month++
    for (const d of state) {
      if (d.balance <= 0.5) continue
      const interest = (d.balance * d.ratePct) / 100 / 12
      d.balance += interest
      d.interest += interest
      totalInterest += interest
    }

    let available = strategy === 'MINIMUM' ? Infinity : monthlyBudget
    for (const d of state) {
      if (d.balance <= 0.5) continue
      const pay = Math.min(d.minPayment, d.balance, available)
      d.balance -= pay
      available -= pay
      totalPaid += pay
    }

    if (strategy !== 'MINIMUM') {
      // Freed minimums of closed debts stay in the budget and roll onto the target debt.
      while (available > 0.5) {
        const t = target()
        if (!t) break
        const pay = Math.min(available, t.balance)
        t.balance -= pay
        available -= pay
        totalPaid += pay
      }
    }

    for (const d of state) {
      if (d.balance <= 0.5 && d.paidOffMonth === 0) {
        d.balance = 0
        d.paidOffMonth = month
      }
    }
  }

  const order: DebtPayoff[] = state
    .filter((d) => d.paidOffMonth > 0)
    .sort((a, b) => a.paidOffMonth - b.paidOffMonth)
    .map((d) => ({ name: d.name, month: d.paidOffMonth, interestPaid: Math.round(d.interest) }))

  return {
    strategy,
    months: month,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    order,
    firstWinMonth: order[0]?.month ?? month,
    finished: state.every((d) => d.balance === 0),
  }
}

export function compareStrategies(debts: DebtInput[], monthlyBudget: number): DebtComparison {
  const avalanche = simulatePayoff(debts, monthlyBudget, 'AVALANCHE')
  const snowball = simulatePayoff(debts, monthlyBudget, 'SNOWBALL')
  const minimum = simulatePayoff(debts, minimumBudget(debts), 'MINIMUM')

  // Snowball wins only when it costs almost nothing extra and gives an earlier first payoff.
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0)
  const extraCost = snowball.totalInterest - avalanche.totalInterest
  const recommended =
    extraCost <= Math.max(totalBalance * 0.01, 100_000) && snowball.firstWinMonth < avalanche.firstWinMonth
      ? 'SNOWBALL'
      : 'AVALANCHE'
  const best = recommended === 'SNOWBALL' ? snowball : avalanche

  const extra = Math.max(50_000, Math.round((monthlyBudget * 0.1) / 50_000) * 50_000)
  const boosted = simulatePayoff(debts, monthlyBudget + extra, recommended)
  const extraPaymentTip =
    boosted.months < best.months
      ? { extra, monthsSaved: best.months - boosted.months, interestSaved: best.totalInterest - boosted.totalInterest }
      : null

  return {
    avalanche,
    snowball,
    minimum,
    recommended,
    interestSavedVsMinimum: minimum.totalInterest - best.totalInterest,
    monthsSavedVsMinimum: minimum.months - best.months,
    extraPaymentTip,
  }
}
