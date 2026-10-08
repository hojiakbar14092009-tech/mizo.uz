import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { BudgetTooLowError, compareStrategies } from '@/lib/debt-plan'
import { jsonError, readBody, unauthorized } from '@/lib/http'

const money = z.number().finite().min(0).max(1e12)

const Body = z.object({
  monthlyBudget: money,
  debts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        balance: money.min(1),
        ratePct: z.number().finite().min(0).max(200),
        minPayment: money,
      }),
    )
    .min(1)
    .max(15),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()

  const body = await readBody(req, Body)
  if (!body.ok) return body.response

  try {
    return Response.json(compareStrategies(body.data.debts, body.data.monthlyBudget))
  } catch (error) {
    if (error instanceof BudgetTooLowError) {
      return jsonError('BUDGET_TOO_LOW', 'Oylik byudjet minimal toʻlovlar yigʻindisidan kam.', 400, {
        required: Math.ceil(error.required),
      })
    }
    throw error
  }
}
