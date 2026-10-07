import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('calo_session')?.value
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/register']
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  if (!token || !verifyToken(token)) {
    if (!isPublic) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
