import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'
import { readBody, nonemptyString, nonnegativeNumber } from '@/lib/validation'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const goals = await prisma.savingsGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return Response.json({ goals })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  const body = await readBody(req)
  if (!body) return errorResponse(ApiErrors.BAD_REQUEST)
  const { name, totalAmount } = body
  const savedAmount = body.savedAmount ?? 0
  const monthlyAmount = body.monthlyAmount ?? 0
  if (!nonemptyString(name) || !nonnegativeNumber(totalAmount) || totalAmount <= 0 ||
    !nonnegativeNumber(savedAmount) || !nonnegativeNumber(monthlyAmount)) return errorResponse(ApiErrors.BAD_REQUEST)
  const goal = await prisma.savingsGoal.create({
    data: { userId: user.id, name: name.trim(), totalAmount, savedAmount, monthlyAmount },
  })
  return Response.json({ goal }, { status: 201 })
}
