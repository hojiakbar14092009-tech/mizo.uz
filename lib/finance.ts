export const MARKET_RATE_PCT = 22

export function calcRefi(sum: number, rate: number, months: number) {
  const annuity = (p: number, r: number, n: number) => {
    if (n <= 0 || r <= 0) return p * 0.025
    const mr = r / 100 / 12
    return p * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1)
  }
  const currentMonthly = Math.round(annuity(sum, rate, months))
  const refiMonthly = Math.round(annuity(sum, MARKET_RATE_PCT, months))
  const monthlySaving = currentMonthly - refiMonthly
  const totalSaving = Math.round(monthlySaving * (months || 36))
  return { currentMonthly, refiMonthly, monthlySaving, totalSaving, beneficial: monthlySaving > 0, marketRate: MARKET_RATE_PCT }
}

export function sortAvalanche(debts: { name: string; sum: number; rate: number }[]) {
  return [...debts].sort((a, b) => b.rate - a.rate)
    .map((d, i) => ({ ...d, priority: i + 1, urgency: (['HIGH', 'MEDIUM', 'LOW'] as const)[Math.min(i, 2)] }))
}
