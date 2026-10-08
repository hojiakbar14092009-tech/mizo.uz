import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sign } from '@/lib/jwt'
import { parsePNFL, getAge } from '@/lib/pnfl'
import { ApiErrors, errorResponse } from '@/lib/errors'
import { safeUserSelect, sessionCookie } from '@/lib/auth-helpers'
import { readBody, parseBirthDate, validEmail } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const body = await readBody(req)
  if (!body) return errorResponse(ApiErrors.BAD_REQUEST)
  const { method, password, confirmPassword } = body
  if (typeof password !== 'string' || password !== confirmPassword || password.length < 8 ||
    !/[A-Z]/.test(password) || !/[a-z]/.test(password) || bcrypt.truncates(password)) {
    return errorResponse(ApiErrors.WEAK_PASSWORD)
  }

  let birth: Date
  let email: string | null = null
  let pnfl: string | null = null
  if (method === 'pnfl') {
    if (typeof body.pnfl !== 'string') return errorResponse(ApiErrors.PNFL_INVALID)
    const parsed = parsePNFL(body.pnfl)
    if (!parsed) return errorResponse(ApiErrors.PNFL_INVALID)
    birth = parsed.birthDate
    pnfl = body.pnfl
  } else if (method === 'email') {
    if (!validEmail(body.email)) return errorResponse(ApiErrors.BAD_REQUEST)
    const parsed = parseBirthDate(body.birthDate)
    if (!parsed) return errorResponse(ApiErrors.BAD_REQUEST)
    birth = parsed
    email = body.email.trim().toLowerCase()
  } else {
    return errorResponse(ApiErrors.BAD_REQUEST)
  }
  if (getAge(birth) < 18) return errorResponse(ApiErrors.AGE_RESTRICTION)

  const exists = await prisma.user.findFirst({ where: email ? { email } : { pnfl } })
  if (exists) return errorResponse(ApiErrors.DUPLICATE_USER)
  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const user = await prisma.user.create({
      data: { email, pnfl, passwordHash, birthDate: birth }, select: safeUserSelect,
    })
    const token = await sign({ sub: user.id, role: user.role })
    return Response.json({ user }, { status: 201, headers: { 'Set-Cookie': sessionCookie(token) } })
  } catch (error) {
    // The unique constraint also handles simultaneous registration requests.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse(ApiErrors.DUPLICATE_USER)
    }
    throw error
  }
}
