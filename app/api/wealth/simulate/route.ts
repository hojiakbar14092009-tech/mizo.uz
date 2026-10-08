import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { readBody, unauthorized } from '@/lib/http'
import { simulateWealth } from '@/lib/wealth'

const money = z.number().finite().min(0).max(1e13)
const pct = z.number().finite().min(0).max(100)

const Body = z.object({
  initialAmount: money.default(0),
  monthlyContribution: money,
  annualRatePct: pct,
  years: z.number().int().min(1).max(40),
  annualContributionGrowthPct: pct.default(0),
  inflationPct: pct.default(0),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()

  const body = await readBody(req, Body)
  if (!body.ok) return body.response
  return Response.json(simulateWealth(body.data))
}
