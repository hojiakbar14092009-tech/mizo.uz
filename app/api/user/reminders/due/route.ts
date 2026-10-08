import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { reminderDaysLeft } from '@/lib/reminder-dates'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked) return unauthorized()
    const reminders = await prisma.paymentReminder.findMany({ where: { userId: user.id } })
    const now = new Date()
    const due = reminders.map(reminder => ({ ...reminder, daysLeft: reminderDaysLeft(reminder.dayOfMonth, now) }))
      .filter(reminder => reminder.daysLeft <= 3)
      .sort((a, b) => a.daysLeft - b.daysLeft || a.id.localeCompare(b.id))
    return Response.json(due, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return jsonError('INTERNAL_ERROR', 'Eslatmalarni yuklab bo‘lmadi.', 500)
  }
}
