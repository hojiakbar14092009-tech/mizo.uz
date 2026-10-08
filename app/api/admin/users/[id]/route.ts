import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { getSessionUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'
import { readBody } from '@/lib/validation'

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
