import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()
  const { id } = await params

  const tip = await prisma.communityTip.findUnique({ where: { id }, select: { id: true, isHidden: true } })
  if (!tip || tip.isHidden) return jsonError('NOT_FOUND', 'Maslahat topilmadi.', 404)

  const key = { userId_tipId: { userId: user.id, tipId: id } }
  const existing = await prisma.tipLike.findUnique({ where: key })

  const updated = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.tipLike.delete({ where: key })
      return tx.communityTip.update({ where: { id }, data: { likesCount: { decrement: 1 } } })
    }
    await tx.tipLike.create({ data: { userId: user.id, tipId: id } })
    return tx.communityTip.update({ where: { id }, data: { likesCount: { increment: 1 } } })
  })

  return Response.json({ liked: !existing, likesCount: updated.likesCount })
}
