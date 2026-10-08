import { sessionCookie } from '@/lib/auth-helpers'

export async function POST() {
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie('', 0) } })
}
