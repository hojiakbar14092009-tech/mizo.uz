import { z } from 'zod'
import { prisma } from './prisma'

export const SmsInput = z.object({
  userId: z.string().min(1).max(200),
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Telefonni xalqaro formatda kiriting: +998901234567.'),
  body: z.string().trim().min(1).max(2000),
  reminderId: z.string().min(1).max(200).optional(),
})

export interface SmsProvider {
  readonly name: string
  send(message: { phone: string; body: string }): Promise<{ status: 'SENT' }>
}

export class SmsError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message)
  }
}

const mockProvider: SmsProvider = {
  name: 'mock',
  async send() { return { status: 'SENT' } },
}

function provider(): SmsProvider {
  if ((process.env.SMS_PROVIDER ?? 'mock') !== 'mock') {
    throw new SmsError('SMS_PROVIDER_UNAVAILABLE', 'Faqat mock SMS provayderi qo‘llab-quvvatlanadi.', 503)
  }
  return mockProvider
}

export async function sendSms(input: z.infer<typeof SmsInput>) {
  const parsed = SmsInput.safeParse(input)
  if (!parsed.success) throw new SmsError('VALIDATION', parsed.error.issues[0].message, 400)
  const selected = provider()
  const { userId, phone, body, reminderId } = parsed.data
  const result = await selected.send({ phone, body })
  return prisma.smsLog.create({
    data: { userId, phone, body, reminderId, status: result.status, provider: selected.name },
  })
}
