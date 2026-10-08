import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, unauthorized } from '@/lib/http'
import { rankLoanOffers } from '@/lib/loans'
import { prisma } from '@/lib/prisma'

const Query = z.object({
  amount: z.coerce.number().finite().min(100_000).max(1e12),
  termMonths: z.coerce.number().int().min(1).max(360),
  // Ranking across loan types mixes unrelated products, so a type is always applied.
  type: z.enum(['CONSUMER', 'MORTGAGE', 'AUTO', 'MICRO', 'EDUCATION', 'REFINANCE']).default('CONSUMER'),
  noCollateral: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  currentRatePct: z.coerce.number().min(0).max(200).optional(),
})

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()

  const params = Object.fromEntries([...req.nextUrl.searchParams].filter(([, v]) => v !== ''))
  const parsed = Query.safeParse(params)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError('VALIDATION', `${issue.path.join('.')}: ${issue.message}`, 400)
  }

  const offers = await prisma.loanOffer.findMany()
  const ranked = rankLoanOffers(offers, parsed.data)
  const updatedAt = offers.reduce<Date | null>((max, o) => (!max || o.updatedAt > max ? o.updatedAt : max), null)
  return Response.json({ offers: ranked, total: ranked.length, updatedAt })
}
