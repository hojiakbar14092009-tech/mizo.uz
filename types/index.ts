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
