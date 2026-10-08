import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked) return unauthorized()
    if (user.role !== 'ADMIN') return jsonError('FORBIDDEN', 'Admin ruxsati talab etiladi.', 403)
    const tips = await prisma.communityTip.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
    return Response.json({ tips }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return jsonError('INTERNAL_ERROR', 'Maslahatlarni yuklab bo‘lmadi.', 500)
  }
}
