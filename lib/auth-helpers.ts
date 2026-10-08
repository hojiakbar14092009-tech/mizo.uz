import type { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { verify } from './jwt'

export const safeUserSelect = {
  id: true, email: true, pnfl: true, role: true, birthDate: true,
  createdAt: true, isBlocked: true, lastLoginAt: true,
} as const

export async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get('mz_token')?.value
  if (!token) return null
  const payload = await verify(token)
  if (typeof payload?.sub !== 'string' || !payload.sub) return null
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: safeUserSelect })
  // A previously issued JWT must not keep working after the account is blocked.
  return user && !user.isBlocked ? user : null
}

export function sessionCookie(token: string, maxAge = 604800) {
  return `mz_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}
