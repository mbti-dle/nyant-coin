import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  const referer = request.headers.get('referer')

  if (!referer) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/waiting/:path*', '/game/:path*', '/results/:path*', '/setup/:path*'],
}
