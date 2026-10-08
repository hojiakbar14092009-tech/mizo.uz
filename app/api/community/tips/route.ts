import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, rateLimit, readBody, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import type { AiCategory, CommunityTipView } from '@/types'

const Category = z.enum(['CREDIT', 'BUDGET', 'FRAUD', 'INVEST', 'GOAL'])

const Query = z.object({
  category: Category.optional(),
  sort: z.enum(['top', 'new']).default('top'),
  cursor: z.string().optional(),
})

const Body = z.object({
  category: Category,
  title: z.string().trim().min(5).max(80),
  content: z.string().trim().min(20).max(600),
  savedAmount: z.number().finite().min(0).max(1e12).optional(),
})

const PAGE = 20

function authorName(email: string | null, pnfl: string | null): string {
  if (email) return `${email.split('@')[0].slice(0, 2)}***`
  if (pnfl) return `JShShIR ···${pnfl.slice(-3)}`
  return 'Mizo'
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()

  const parsed = Query.safeParse(Object.fromEntries([...req.nextUrl.searchParams].filter(([, v]) => v !== '')))
  if (!parsed.success) return jsonError('VALIDATION', parsed.error.issues[0].message, 400)
  const { category, sort, cursor } = parsed.data

  const rows = await prisma.communityTip.findMany({
    where: { isHidden: false, ...(category ? { category } : {}) },
    orderBy: sort === 'top' ? [{ likesCount: 'desc' }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }],
    take: PAGE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { email: true, pnfl: true } },
      likes: { where: { userId: user.id }, select: { userId: true } },
    },
  })

  const tips: CommunityTipView[] = rows.slice(0, PAGE).map((t) => ({
    id: t.id,
    category: t.category as AiCategory,
    title: t.title,
    content: t.content,
    savedAmount: t.savedAmount,
    likesCount: t.likesCount,
    likedByMe: t.likes.length > 0,
    author: authorName(t.user.email, t.user.pnfl),
    createdAt: t.createdAt.toISOString(),
  }))

  return Response.json({ tips, nextCursor: rows.length > PAGE ? rows[PAGE - 1].id : null })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()
  if (!rateLimit(`tip:${user.id}`, 3, 10 * 60_000)) {
    return jsonError('RATE_LIMITED', 'Maslahatlarni 10 daqiqada 3 tadan koʻp joylab boʻlmaydi.', 429)
  }

  const body = await readBody(req, Body)
  if (!body.ok) return body.response

  const tip = await prisma.communityTip.create({ data: { userId: user.id, ...body.data } })
  const view: CommunityTipView = {
    id: tip.id,
    category: tip.category as AiCategory,
    title: tip.title,
    content: tip.content,
    savedAmount: tip.savedAmount,
    likesCount: 0,
    likedByMe: false,
    author: authorName(user.email, user.pnfl),
    createdAt: tip.createdAt.toISOString(),
  }
  return Response.json({ tip: view }, { status: 201 })
}
