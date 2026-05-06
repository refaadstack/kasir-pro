import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

const ROLE_ROUTES: Record<string, string[]> = {
  '/dashboard/kasir':      ['KASIR', 'SUPERVISOR', 'MANAGER', 'SUPERADMIN'],
  '/dashboard/supervisor': ['SUPERVISOR', 'SUPERADMIN'],
  '/dashboard/manager':    ['MANAGER', 'SUPERADMIN'],
  '/dashboard/superadmin': ['SUPERADMIN'],
}

function roleToDashboard(role: string) {
  if (role === 'SUPERADMIN') return '/dashboard/superadmin'
  if (role === 'MANAGER') return '/dashboard/manager'
  if (role === 'SUPERVISOR') return '/dashboard/supervisor'
  return '/dashboard/kasir'
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('kasirpro_token')?.value

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname === '/login') {
    if (token) {
      const payload = await verifyToken(token)
      if (payload) return NextResponse.redirect(new URL(roleToDashboard(payload.role), req.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.redirect(new URL('/login', req.url))

    const matchedRoute = Object.keys(ROLE_ROUTES).find(r => pathname.startsWith(r))
    if (matchedRoute && !ROLE_ROUTES[matchedRoute].includes(payload.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    const res = NextResponse.next()
    res.headers.set('x-user-id',   payload.id)
    res.headers.set('x-user-role', payload.role)
    res.headers.set('x-user-name', payload.name)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}