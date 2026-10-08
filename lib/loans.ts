import type { LoanBadge, LoanType, RankedLoanOffer } from '@/types'

export interface LoanOfferRow {
  id: string
  bank: string
  product: string
  type: string
  rateMin: number
  rateMax: number
  minAmount: number
  maxAmount: number
  minTermMonths: number
  maxTermMonths: number
  collateralRequired: boolean
  approvalDays: number
  onlineApply: boolean
  note: string
}

export interface LoanQuery {
  amount: number
  termMonths: number
  type?: LoanType
  noCollateral?: boolean
  currentRatePct?: number
}

export function annuityPayment(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return principal
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / months
  const f = Math.pow(1 + r, months)
  return (principal * r * f) / (f - 1)
}

export function rankLoanOffers(offers: LoanOfferRow[], q: LoanQuery): RankedLoanOffer[] {
  const eligible = offers.filter(
    (o) =>
      q.amount >= o.minAmount &&
      q.amount <= o.maxAmount &&
      q.termMonths >= o.minTermMonths &&
      q.termMonths <= o.maxTermMonths &&
      (!q.type || o.type === q.type) &&
      (!q.noCollateral || !o.collateralRequired),
  )
  if (eligible.length === 0) return []

  const rates = eligible.map((o) => o.rateMin)
  const days = eligible.map((o) => o.approvalDays)
  const [minRate, maxRate] = [Math.min(...rates), Math.max(...rates)]
  const [minDays, maxDays] = [Math.min(...days), Math.max(...days)]

  const ranked = eligible.map((o) => {
    const paymentMin = annuityPayment(q.amount, o.rateMin, q.termMonths)
    const paymentMax = annuityPayment(q.amount, o.rateMax, q.termMonths)
    const rateScore = maxRate === minRate ? 1 : (maxRate - o.rateMin) / (maxRate - minRate)
    const speedScore = maxDays === minDays ? 1 : (maxDays - o.approvalDays) / (maxDays - minDays)
    const score = Math.round(
      100 * (0.6 * rateScore + 0.15 * speedScore + 0.15 * (o.collateralRequired ? 0 : 1) + 0.1 * (o.onlineApply ? 1 : 0)),
    )
    const badges: LoanBadge[] = []
    if (o.rateMin === minRate) badges.push('LOWEST_RATE')
    if (o.approvalDays === minDays) badges.push('FASTEST')
    if (!o.collateralRequired) badges.push('NO_COLLATERAL')
    if (o.onlineApply) badges.push('ONLINE')
    const savingVsCurrent =
      q.currentRatePct === undefined
        ? null
        : Math.round((annuityPayment(q.amount, q.currentRatePct, q.termMonths) - paymentMin) * q.termMonths)

    return {
      id: o.id,
      bank: o.bank,
      product: o.product,
      type: o.type as LoanType,
      rateMin: o.rateMin,
      rateMax: o.rateMax,
      approvalDays: o.approvalDays,
      collateralRequired: o.collateralRequired,
      onlineApply: o.onlineApply,
      note: o.note,
      monthlyPaymentMin: Math.round(paymentMin),
      monthlyPaymentMax: Math.round(paymentMax),
      overpaymentMin: Math.round(paymentMin * q.termMonths - q.amount),
      savingVsCurrent,
      score,
      badges,
    }
  })

  ranked.sort((a, b) => b.score - a.score || a.rateMin - b.rateMin)
  ranked[0].badges.unshift('BEST_VALUE')
  return ranked
}
