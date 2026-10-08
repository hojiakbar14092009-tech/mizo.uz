import type { NextRequest } from 'next/server'
import { getSessionUser, safeUserSelect } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { errorResponse, ApiErrors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.role !== 'ADMIN') return errorResponse(ApiErrors.UNAUTHORIZED)
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1')
  const pageSize = Number(req.nextUrl.searchParams.get('pageSize') ?? '20')
  const skip = (page - 1) * pageSize
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) ||
    pageSize < 1 || pageSize > 100 || !Number.isSafeInteger(skip) || skip > 2147483647) {
    return errorResponse(ApiErrors.BAD_REQUEST)
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' }, select: safeUserSelect }),
    prisma.user.count(),
  ])
  return Response.json({ items, total, page, pageSize })
}
