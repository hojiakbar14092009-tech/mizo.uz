import type { HealthBand, HealthComponent, HealthComponentKey, HealthInput, HealthScoreResult, Lang } from '@/types'

const WEIGHTS: Record<HealthComponentKey, number> = {
  savingsRate: 25,
  debtToIncome: 25,
  emergencyFund: 20,
  expenseRatio: 15,
  goalProgress: 15,
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
// 1 at `good`, 0 at `bad`, linear in between (works for either direction).
const scale = (value: number, bad: number, good: number) => clamp01((value - bad) / (good - bad))

const ADVICE: Record<HealthComponentKey, Record<Lang, string>> = {
  savingsRate: {
    uz: 'Daromadning kamida 20% ini maosh kelgan kuniyoq alohida hisobga oʻtkazing.',
    ru: 'Откладывайте минимум 20% дохода в день зарплаты на отдельный счёт.',
  },
  debtToIncome: {
    uz: 'Qarz toʻlovlari daromadning 30% idan oshmasin: eng yuqori foizli qarzni birinchi yoping yoki refinansirovka qiling.',
    ru: 'Платежи по долгам не должны превышать 30% дохода: гасите сначала самый дорогой долг или рефинансируйте.',
  },
  emergencyFund: {
    uz: '3–6 oylik xarajatga teng favqulodda jamgʻarma yigʻing — bu yangi qarzdan saqlaydi.',
    ru: 'Создайте резервный фонд на 3–6 месяцев расходов — он защитит от новых долгов.',
  },
  expenseRatio: {
    uz: 'Xarajatlarni toifalarga ajrating va eng kattasini 10–15% ga qisqartiring.',
    ru: 'Разбейте расходы по категориям и сократите самую крупную на 10–15%.',
  },
  goalProgress: {
    uz: 'Har bir maqsad uchun oylik avtomatik toʻlov belgilang — kichik, lekin muntazam.',
    ru: 'Настройте ежемесячный автоплатёж на каждую цель — небольшой, но регулярный.',
  },
}

function band(score: number): HealthBand {
  if (score >= 80) return 'EXCELLENT'
  if (score >= 65) return 'GOOD'
  if (score >= 50) return 'FAIR'
  if (score >= 35) return 'WEAK'
  return 'CRITICAL'
}

export function computeHealthScore(input: HealthInput, lang: Lang = 'uz'): HealthScoreResult {
  const income = Math.max(0, input.monthlyIncome)
  const expenses = Math.max(0, input.monthlyExpenses)
  const debt = Math.max(0, input.monthlyDebtPayments)
  const outflow = Math.max(1, expenses + debt)

  const savingsRate = income > 0 ? (income - expenses - debt) / income : -1
  const debtToIncome = income > 0 ? debt / income : 1
  const expenseRatio = income > 0 ? expenses / income : 1
  const emergencyMonths = Math.max(0, input.savingsBalance) / outflow
  const goal = input.goalProgressPct === undefined ? 0.5 : clamp01(input.goalProgressPct / 100)

  const raw: Record<HealthComponentKey, { points: number; value: number }> = {
    savingsRate: { points: scale(savingsRate, 0, 0.2), value: savingsRate },
    debtToIncome: { points: scale(debtToIncome, 0.5, 0.1), value: debtToIncome },
    emergencyFund: { points: scale(emergencyMonths, 0, 6), value: emergencyMonths },
    expenseRatio: { points: scale(expenseRatio, 1, 0.5), value: expenseRatio },
    goalProgress: { points: goal, value: goal },
  }

  const components: HealthComponent[] = (Object.keys(WEIGHTS) as HealthComponentKey[]).map((key) => ({
    key,
    weight: WEIGHTS[key],
    points: Math.round(WEIGHTS[key] * raw[key].points * 10) / 10,
    value: Math.round(raw[key].value * 1000) / 1000,
  }))

  const total = components.reduce((s, c) => s + c.points, 0)
  const score = Math.min(100, Math.max(1, Math.round(total)))

  const byLoss = [...components].sort((a, b) => b.weight - b.points - (a.weight - a.points))
  const recommendations = byLoss
    .filter((c) => c.weight - c.points >= 2)
    .slice(0, 3)
    .map((c) => ADVICE[c.key][lang])

  return { score, band: band(score), components, weakest: byLoss[0].key, recommendations }
}

export function currentMonth(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
