import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.next()
  }

  const referer = request.headers.get('referer')
  const hasSession = request.cookies.has('nyant_session')

  const isInternalNavigation = referer?.includes(request.nextUrl.hostname)

  if (isInternalNavigation || hasSession) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/waiting/:path*', '/game/:path*', '/result/:path*', '/setup/:path*'],
}
