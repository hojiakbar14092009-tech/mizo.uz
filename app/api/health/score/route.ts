import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { computeHealthScore, currentMonth } from '@/lib/health-score'
import { readBody, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import type { HealthHistoryPoint } from '@/types'

const money = z.number().finite().min(0).max(1e12)

const Body = z.object({
  lang: z.enum(['uz', 'ru']).default('uz'),
  monthlyIncome: money,
  monthlyExpenses: money,
  monthlyDebtPayments: money.default(0),
  savingsBalance: money.default(0),
  goalProgressPct: z.number().min(0).max(100).optional(),
})

async function history(userId: string): Promise<HealthHistoryPoint[]> {
  const rows = await prisma.healthSnapshot.findMany({
    where: { userId },
    orderBy: { month: 'desc' },
    take: 12,
    select: { month: true, score: true },
  })
  return rows.reverse()
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()
  const latest = await prisma.healthSnapshot.findFirst({ where: { userId: user.id }, orderBy: { month: 'desc' } })
  return Response.json({
    history: await history(user.id),
    latest: latest ? { month: latest.month, score: latest.score, ...JSON.parse(latest.breakdown) } : null,
    lastInputs: latest ? JSON.parse(latest.inputs) : null,
  })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()

  const body = await readBody(req, Body)
  if (!body.ok) return body.response
  const { lang, ...input } = body.data

  if (input.goalProgressPct === undefined) {
    const goals = await prisma.savingsGoal.aggregate({
      where: { userId: user.id },
      _sum: { savedAmount: true, totalAmount: true },
    })
    const total = goals._sum.totalAmount ?? 0
    if (total > 0) input.goalProgressPct = Math.min(100, ((goals._sum.savedAmount ?? 0) / total) * 100)
  }

  const result = computeHealthScore(input, lang)
  const month = currentMonth()
  const breakdown = JSON.stringify({
    band: result.band,
    components: result.components,
    weakest: result.weakest,
    recommendations: result.recommendations,
  })
  await prisma.healthSnapshot.upsert({
    where: { userId_month: { userId: user.id, month } },
    create: { userId: user.id, month, score: result.score, breakdown, inputs: JSON.stringify(input) },
    update: { score: result.score, breakdown, inputs: JSON.stringify(input) },
  })

  return Response.json({ month, result, history: await history(user.id) })
}
