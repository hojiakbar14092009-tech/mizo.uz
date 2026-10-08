import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { errorResponse, ApiErrors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return errorResponse(ApiErrors.UNAUTHORIZED)
  return Response.json({ user })
}
