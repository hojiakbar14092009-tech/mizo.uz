import type { WealthInput, WealthResult, WealthYear } from '@/types'

export const WEALTH_MILESTONES = [10_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000]

export function simulateWealth(input: WealthInput): WealthResult {
  const years = Math.min(40, Math.max(1, Math.round(input.years)))
  const monthlyRate = Math.max(0, input.annualRatePct) / 100 / 12
  const growth = Math.max(0, input.annualContributionGrowthPct ?? 0) / 100
  const inflation = Math.max(0, input.inflationPct ?? 0) / 100

  let balance = Math.max(0, input.initialAmount)
  let contribution = Math.max(0, input.monthlyContribution)
  let totalContributed = balance
  let totalInterest = 0

  const yearly: WealthYear[] = []
  const milestones: WealthResult['milestones'] = []
  const pending = WEALTH_MILESTONES.filter((m) => m > balance)

  for (let year = 1; year <= years; year++) {
    let yearContributed = 0
    let yearInterest = 0
    for (let month = 1; month <= 12; month++) {
      const interest = balance * monthlyRate
      balance += interest + contribution
      yearInterest += interest
      yearContributed += contribution
      while (pending.length > 0 && balance >= pending[0]) {
        milestones.push({ amount: pending.shift() as number, year, month })
      }
    }
    totalContributed += yearContributed
    totalInterest += yearInterest
    yearly.push({
      year,
      contributed: Math.round(totalContributed),
      interest: Math.round(totalInterest),
      balance: Math.round(balance),
      realBalance: Math.round(balance / Math.pow(1 + inflation, year)),
    })
    contribution *= 1 + growth
  }

  const last = yearly[yearly.length - 1]
  return {
    yearly,
    totalContributed: last.contributed,
    totalInterest: last.interest,
    finalBalance: last.balance,
    finalRealBalance: last.realBalance,
    milestones,
  }
}
