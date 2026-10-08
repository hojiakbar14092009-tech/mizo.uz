export type Role = 'USER' | 'ADMIN'
export type AiCategory = 'CREDIT' | 'BUDGET' | 'FRAUD' | 'INVEST' | 'GOAL'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type AuthMethod = 'email' | 'pnfl'

export interface User {
  id: string
  email?: string | null
  pnfl?: string | null
  role: Role
  birthDate: Date
  createdAt: Date
  isBlocked: boolean
  lastLoginAt?: Date | null
}

export interface AiResult {
  category: AiCategory
  riskLevel: RiskLevel
  riskScore: number
  title: string
  steps: string[]
  flags: string[]
  suggestedTab?: 'kredit' | 'tejash' | 'eslatma'
  creditData?: {
    sum: number
    rate: number
    months: number
    monthlyPayment: number
    refiSaving: number
  }
}

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  totalAmount: number
  savedAmount: number
  monthlyAmount: number
  createdAt: Date
}

export interface PaymentReminder {
  id: string
  userId: string
  name: string
  amount: number
  dayOfMonth: number
  phone: string
  createdAt: Date
}

export interface AdminStats {
  totalUsers: number
  avgAge: number
  blockedCount: number
  newThisWeek: number
  queryBreakdown: Record<AiCategory, number>
  totalSavedAmount: number
}

export interface ApiError {
  code: string
  message: string
}

// ---- Premium v3 ----

export type Lang = 'uz' | 'ru'

export type HealthBand = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'CRITICAL'
export type HealthComponentKey = 'savingsRate' | 'debtToIncome' | 'emergencyFund' | 'expenseRatio' | 'goalProgress'

export interface HealthInput {
  monthlyIncome: number
  monthlyExpenses: number
  monthlyDebtPayments: number
  savingsBalance: number
  goalProgressPct?: number
}

export interface HealthComponent {
  key: HealthComponentKey
  weight: number
  points: number
  value: number
}

export interface HealthScoreResult {
  score: number
  band: HealthBand
  components: HealthComponent[]
  weakest: HealthComponentKey
  recommendations: string[]
}

export interface HealthHistoryPoint {
  month: string
  score: number
}

export interface WealthInput {
  initialAmount: number
  monthlyContribution: number
  annualRatePct: number
  years: number
  annualContributionGrowthPct?: number
  inflationPct?: number
}

export interface WealthYear {
  year: number
  contributed: number
  interest: number
  balance: number
  realBalance: number
}

export interface WealthResult {
  yearly: WealthYear[]
  totalContributed: number
  totalInterest: number
  finalBalance: number
  finalRealBalance: number
  milestones: { amount: number; year: number; month: number }[]
}

export type LoanType = 'CONSUMER' | 'MORTGAGE' | 'AUTO' | 'MICRO' | 'EDUCATION' | 'REFINANCE'
export type LoanBadge = 'BEST_VALUE' | 'LOWEST_RATE' | 'FASTEST' | 'NO_COLLATERAL' | 'ONLINE'

export interface RankedLoanOffer {
  id: string
  bank: string
  product: string
  type: LoanType
  rateMin: number
  rateMax: number
  approvalDays: number
  collateralRequired: boolean
  onlineApply: boolean
  note: string
  monthlyPaymentMin: number
  monthlyPaymentMax: number
  overpaymentMin: number
  savingVsCurrent: number | null
  score: number
  badges: LoanBadge[]
}

export type DebtStrategy = 'AVALANCHE' | 'SNOWBALL' | 'MINIMUM'

export interface DebtInput {
  name: string
  balance: number
  ratePct: number
  minPayment: number
}

export interface DebtPayoff {
  name: string
  month: number
  interestPaid: number
}

export interface DebtPlanResult {
  strategy: DebtStrategy
  months: number
  totalInterest: number
  totalPaid: number
  order: DebtPayoff[]
  firstWinMonth: number
  finished: boolean
}

export interface DebtComparison {
  avalanche: DebtPlanResult
  snowball: DebtPlanResult
  minimum: DebtPlanResult
  recommended: Exclude<DebtStrategy, 'MINIMUM'>
  interestSavedVsMinimum: number
  monthsSavedVsMinimum: number
  extraPaymentTip: { extra: number; monthsSaved: number; interestSaved: number } | null
}

export interface CommunityTipView {
  id: string
  category: AiCategory
  title: string
  content: string
  savedAmount: number | null
  likesCount: number
  likedByMe: boolean
  author: string
  createdAt: string
}

export interface SavingsAction {
  title: string
  detail: string
  monthlySaving: number
}

export interface SavingsAdvice {
  summary: string
  budget: { needsPct: number; wantsPct: number; savingsPct: number }
  actions: SavingsAction[]
  quickWins: string[]
  warnings: string[]
  estimatedMonthlySaving: number
  source: 'claude' | 'fallback'
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}
