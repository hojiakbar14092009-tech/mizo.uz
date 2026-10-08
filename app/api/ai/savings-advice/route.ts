import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { savingsAdvice } from '@/lib/claude'
import { jsonError, rateLimit, readBody, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

const money = z.number().finite().min(0).max(1e12)

const Body = z.object({
  lang: z.enum(['uz', 'ru']).default('uz'),
  monthlyIncome: money,
  expenses: z.array(z.object({ category: z.string().trim().min(1).max(60), amount: money })).min(1).max(20),
  monthlyDebtPayments: money.default(0),
  goal: z.object({ name: z.string().trim().min(1).max(80), amount: money, months: z.number().int().min(1).max(600) }).optional(),
  note: z.string().trim().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()
  if (!rateLimit(`ai:${user.id}`, 8, 60_000)) {
    return jsonError('RATE_LIMITED', 'Juda koʻp soʻrov. Bir daqiqadan soʻng urinib koʻring.', 429)
  }

  const body = await readBody(req, Body)
  if (!body.ok) return body.response
  const { lang, ...input } = body.data

  const advice = await savingsAdvice(input, lang)
  await prisma.aiQuery.create({
    data: { userId: user.id, category: 'BUDGET', questionText: `Tejash rejasi: daromad ${input.monthlyIncome}` },
  })
  return Response.json(advice)
}
