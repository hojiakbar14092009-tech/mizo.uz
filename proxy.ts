import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'mizo-super-secret-key-change-in-production'
)

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('mz_token')?.value

  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth')

  if (isPublic) return NextResponse.next()

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Kirish talab etiladi.' } },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: { code: 'FORBIDDEN', message: "Ruxsat yo'q." } },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token yaroqsiz.' } },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/user/:path*',
    '/api/admin/:path*',
    '/api/ai/:path*',
    '/api/health/:path*',
    '/api/wealth/:path*',
    '/api/loans/:path*',
    '/api/community/:path*',
    '/api/debts/:path*',
    '/api/sms/:path*',
  ],
}
