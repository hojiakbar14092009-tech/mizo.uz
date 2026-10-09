import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)

  const { id } = await params
  if (!id || typeof id !== 'string') return errorResponse(ApiErrors.BAD_REQUEST)

  const reminder = await prisma.paymentReminder.findUnique({ where: { id } })
  if (!reminder || reminder.userId !== user.id) return errorResponse(ApiErrors.NOT_FOUND)

  await prisma.paymentReminder.delete({ where: { id } })
  return Response.json({ success: true })
}
