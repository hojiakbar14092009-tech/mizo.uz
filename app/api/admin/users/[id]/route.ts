import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { getSessionUser, safeUserSelect } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'
import { readBody } from '@/lib/validation'
import type { AdminUserDetail, AiCategory, HealthBand, HealthComponentKey } from '@/types'

function parseJson(text: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(text)
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v: unknown) => (typeof v === 'string' ? v : null)

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSessionUser(req)
  if (!admin || admin.role !== 'ADMIN') return errorResponse(ApiErrors.UNAUTHORIZED)
  const { id } = await params

  const [user, problems] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        goals: { select: { id: true, name: true, totalAmount: true, savedAmount: true, monthlyAmount: true }, orderBy: { createdAt: 'asc' } },
        reminders: { select: { id: true, name: true, amount: true, dayOfMonth: true }, orderBy: { dayOfMonth: 'asc' } },
        queries: { select: { id: true, category: true, questionText: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 8 },
        health: { select: { month: true, score: true, breakdown: true, inputs: true }, orderBy: { month: 'desc' }, take: 12 },
      },
    }),
    prisma.aiQuery.groupBy({ by: ['category'], where: { userId: id }, _count: { _all: true } }),
  ])
  if (!user) return errorResponse(ApiErrors.NOT_FOUND)

  const { goals, reminders, queries, health, ...profile } = user
  const latest = health[0]
  const breakdown = latest ? parseJson(latest.breakdown) : {}
  const inputs = latest ? parseJson(latest.inputs) : {}

  const detail: AdminUserDetail = {
    user: { ...profile, role: profile.role === 'ADMIN' ? 'ADMIN' : 'USER' },
    goals,
    totalSaved: goals.reduce((sum, g) => sum + g.savedAmount, 0),
    totalTarget: goals.reduce((sum, g) => sum + g.totalAmount, 0),
    reminders,
    monthlyPayments: reminders.reduce((sum, r) => sum + r.amount, 0),
    health: latest
      ? {
          month: latest.month,
          score: latest.score,
          band: str(breakdown.band) as HealthBand | null,
          weakest: str(breakdown.weakest) as HealthComponentKey | null,
          monthlyIncome: num(inputs.monthlyIncome),
          monthlyExpenses: num(inputs.monthlyExpenses),
          monthlyDebtPayments: num(inputs.monthlyDebtPayments),
          savingsBalance: num(inputs.savingsBalance),
        }
      : null,
    healthHistory: health.map(({ month, score }) => ({ month, score })).reverse(),
    problems: problems
      .map((p) => ({ category: p.category as AiCategory, count: p._count._all }))
      .sort((a, b) => b.count - a.count),
    recentQuestions: queries.map((q) => ({ ...q, category: q.category as AiCategory })),
  }
  return Response.json(detail)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req)
  if (!user || user.role !== 'ADMIN') return errorResponse(ApiErrors.UNAUTHORIZED)
  const body = await readBody(req)
  if (!body || typeof body.isBlocked !== 'boolean') return errorResponse(ApiErrors.BAD_REQUEST)
  const { id } = await params
  try {
    const updated = await prisma.user.update({
      where: { id }, data: { isBlocked: body.isBlocked }, select: { id: true, email: true, isBlocked: true },
    })
    return Response.json({ user: updated })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(ApiErrors.NOT_FOUND)
    }
    throw error
  }
}
