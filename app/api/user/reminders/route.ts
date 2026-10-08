import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'
import { readBody, nonemptyString, nonnegativeNumber } from '@/lib/validation'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const reminders = await prisma.paymentReminder.findMany({ where: { userId: user.id }, orderBy: { dayOfMonth: 'asc' } })
  return Response.json({ reminders })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const body = await readBody(req)
  if (!body) return errorResponse(ApiErrors.BAD_REQUEST)
  const { name, amount, dayOfMonth } = body
  const phone = body.phone ?? ''
  if (!nonemptyString(name) || !nonnegativeNumber(amount) ||
    typeof dayOfMonth !== 'number' || !Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31 ||
    typeof phone !== 'string' || phone.length > 32) return errorResponse(ApiErrors.BAD_REQUEST)
  const reminder = await prisma.paymentReminder.create({
    data: { userId: user.id, name: name.trim(), amount, dayOfMonth, phone },
  })
  return Response.json({ reminder }, { status: 201 })
}
