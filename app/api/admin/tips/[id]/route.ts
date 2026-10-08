import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, readBody, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

const Body = z.object({ isHidden: z.boolean() }).strict()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked) return unauthorized()
    if (user.role !== 'ADMIN') return jsonError('FORBIDDEN', 'Admin ruxsati talab etiladi.', 403)
    const body = await readBody(req, Body)
    if (!body.ok) return body.response
    const { id } = await params
    const tip = await prisma.communityTip.update({ where: { id }, data: { isHidden: body.data.isHidden } })
    return Response.json({ tip })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError('NOT_FOUND', 'Maslahat topilmadi.', 404)
    }
    return jsonError('INTERNAL_ERROR', 'Maslahatni yangilab bo‘lmadi.', 500)
  }
}
