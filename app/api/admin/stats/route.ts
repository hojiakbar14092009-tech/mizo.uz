import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { getAge } from '@/lib/pnfl'
import { prisma } from '@/lib/prisma'
import { jsonError, unauthorized } from '@/lib/http'
import { currentMonth } from '@/lib/health-score'
import type { AdminStats } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked || user.role !== 'ADMIN') return unauthorized()
    const [users, queryGroups, savedSum, health, tipsCount] = await Promise.all([
      prisma.user.findMany({ select: { birthDate: true, isBlocked: true, createdAt: true } }),
      prisma.aiQuery.groupBy({ by: ['category'], _count: { id: true } }),
      prisma.savingsGoal.aggregate({ _sum: { savedAmount: true } }),
      prisma.healthSnapshot.aggregate({ where: { month: currentMonth() }, _avg: { score: true } }),
      prisma.communityTip.count(),
    ])
    const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const queryBreakdown: AdminStats['queryBreakdown'] = { CREDIT: 0, BUDGET: 0, FRAUD: 0, INVEST: 0, GOAL: 0 }
    for (const group of queryGroups) {
      if (Object.hasOwn(queryBreakdown, group.category)) {
        queryBreakdown[group.category as keyof typeof queryBreakdown] = group._count.id
      }
    }
    const result: AdminStats & { avgHealthScore: number; tipsCount: number } = {
      totalUsers: users.length,
      avgAge: users.length ? Math.round(users.reduce((s, u) => s + getAge(u.birthDate), 0) / users.length) : 0,
      blockedCount: users.filter(u => u.isBlocked).length,
      newThisWeek: users.filter(u => u.createdAt >= week).length,
      queryBreakdown,
      totalSavedAmount: savedSum._sum.savedAmount ?? 0,
      avgHealthScore: health._avg.score ?? 0,
      tipsCount,
    }
    return Response.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return jsonError('INTERNAL_ERROR', 'Statistikani yuklab bo‘lmadi.', 500)
  }
}
