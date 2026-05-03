import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware disabled until Supabase env configured
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Basic login redirect (add role logic after DB)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

