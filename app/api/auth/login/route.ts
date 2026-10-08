import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sign } from '@/lib/jwt'
import { ApiErrors, errorResponse } from '@/lib/errors'
import { safeUserSelect, sessionCookie } from '@/lib/auth-helpers'
import { readBody, validEmail } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const body = await readBody(req)
  if (!body) return errorResponse(ApiErrors.BAD_REQUEST)
  const { method, password } = body
  if (typeof password !== 'string' || !password || bcrypt.truncates(password)) return errorResponse(ApiErrors.INVALID_CREDS)
  let where: { email: string } | { pnfl: string }
  if (method === 'pnfl' && typeof body.pnfl === 'string' && /^\d{14}$/.test(body.pnfl)) {
    where = { pnfl: body.pnfl }
  } else if (method === 'email' && validEmail(body.email)) {
    where = { email: body.email.trim().toLowerCase() }
  } else {
    return errorResponse(ApiErrors.INVALID_CREDS)
  }
  const user = await prisma.user.findUnique({ where })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return errorResponse(ApiErrors.INVALID_CREDS)
  if (user.isBlocked) return errorResponse(ApiErrors.BLOCKED)
  const safeUser = await prisma.user.update({
    where: { id: user.id }, data: { lastLoginAt: new Date() }, select: safeUserSelect,
  })
  const token = await sign({ sub: user.id, role: user.role })
  return Response.json({ user: safeUser }, { headers: { 'Set-Cookie': sessionCookie(token) } })
}
