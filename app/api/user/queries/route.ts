import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { analyzeText } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'
import { readBody, nonemptyString } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const body = await readBody(req)
  if (!body || !nonemptyString(body.text, 10000) ||
    (body.lang !== undefined && body.lang !== 'uz' && body.lang !== 'ru')) {
    return errorResponse(ApiErrors.BAD_REQUEST)
  }
  const lang = body.lang ?? (req.cookies.get('mz_lang')?.value === 'ru' ? 'ru' : 'uz')
  const result = analyzeText(body.text, lang)
  await prisma.aiQuery.create({ data: { userId: user.id, category: result.category, questionText: body.text } })
  return Response.json(result)
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const items = await prisma.aiQuery.findMany({
    where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30,
  })
  const counts: Record<string, number> = {}
  items.forEach(q => { counts[q.category] = (counts[q.category] ?? 0) + 1 })
  return Response.json({ items, categoryCounts: counts })
}
