import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked) return unauthorized()
    const logs = await prisma.smsLog.findMany({
      where: { userId: user.id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20,
    })
    return Response.json({ logs }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return jsonError('INTERNAL_ERROR', 'SMS tarixini yuklab bo‘lmadi.', 500)
  }
}
