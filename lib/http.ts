import type { z } from 'zod'

export function jsonError(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error: { code, message, ...extra } }, { status })
}

export const unauthorized = () => jsonError('UNAUTHORIZED', 'Kirish talab etiladi.', 401)

export async function readBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return { ok: false, response: jsonError('VALIDATION', 'JSON notoʻgʻri.', 400) }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      response: jsonError('VALIDATION', `${issue.path.join('.') || 'body'}: ${issue.message}`, 400),
    }
  }
  return { ok: true, data: parsed.data }
}

const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}
