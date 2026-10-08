import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth-helpers'
import { categorize, chatReply } from '@/lib/claude'
import { jsonError, rateLimit, readBody, unauthorized } from '@/lib/http'
import { prisma } from '@/lib/prisma'

const Body = z.object({
  lang: z.enum(['uz', 'ru']).default('uz'),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(30),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.isBlocked) return unauthorized()
  if (!rateLimit(`ai:${user.id}`, 8, 60_000)) {
    return jsonError('RATE_LIMITED', 'Juda koʻp soʻrov. Bir daqiqadan soʻng urinib koʻring.', 429)
  }

  const body = await readBody(req, Body)
  if (!body.ok) return body.response
  const { messages, lang } = body.data

  const result = await chatReply(messages, lang)
  const question = messages[messages.length - 1].content
  const category = categorize(question)
  await prisma.aiQuery.create({ data: { userId: user.id, category, questionText: question.slice(0, 500) } })

  return Response.json({ ...result, category })
}
