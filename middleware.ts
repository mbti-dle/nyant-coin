import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has('nyant_session')
  const hasNavPass = request.cookies.has('nav_pass')

  if (hasSession || hasNavPass) {
    const res = NextResponse.next()

    // 일회용 → 즉시 제거
    if (hasNavPass) {
      res.cookies.delete('nav_pass')
    }

    return res
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/waiting/:path*', '/game/:path*', '/result/:path*', '/setup/:path*'],
}
