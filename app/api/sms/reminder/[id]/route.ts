import type { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth-helpers'
import { jsonError, rateLimit, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { sendSms, SmsError, SmsInput } from '@/lib/sms'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser(req)
    if (!user || user.isBlocked) return unauthorized()
    const { id } = await params
    const reminder = await prisma.paymentReminder.findFirst({ where: { id, userId: user.id } })
    if (!reminder) return jsonError('NOT_FOUND', 'Eslatma topilmadi.', 404)
    const message = SmsInput.safeParse({
      userId: user.id, reminderId: reminder.id, phone: reminder.phone,
      body: `Mizo: ${reminder.name} bo'yicha ${reminder.amount} so'm to'lov muddati har oyning ${reminder.dayOfMonth}-sanasida. mizo.uz`,
    })
    if (!message.success) return jsonError('VALIDATION', message.error.issues[0].message, 400)
    if (!rateLimit(`sms:${user.id}`, 3, 60_000)) {
      const response = jsonError('RATE_LIMITED', 'Bir daqiqada 3 tagacha SMS yuborish mumkin.', 429)
      response.headers.set('Retry-After', '60')
      return response
    }
    const sms = await sendSms(message.data)
    return Response.json({ sms: { id: sms.id, phone: sms.phone, body: sms.body, createdAt: sms.createdAt }, demo: true })
  } catch (error) {
    if (error instanceof SmsError) return jsonError(error.code, error.message, error.status)
    return jsonError('INTERNAL_ERROR', 'SMSni saqlab bo‘lmadi.', 500)
  }
}
