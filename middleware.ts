import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // 홈은 항상 허용
  if (pathname === '/') {
    return NextResponse.next()
  }

  const hasNavPass = request.cookies.has('nav_pass')
  const sessionGameId = request.cookies.get('nyant_session')?.value

  /**
   * setup 단계
   * - 새로고침 ❌ / 직접 접근 ❌
   * - nav_pass 필수
   */
  if (pathname.startsWith('/setup')) {
    if (!hasNavPass) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  /**
   * waiting / game / result
   * - 새로고침 ⭕ / 직접 접근 ❌
   * - sessionGameId === pathGameId 필수
   */
  if (
    pathname.startsWith('/waiting') ||
    pathname.startsWith('/game') ||
    pathname.startsWith('/result')
  ) {
    const pathGameId = pathname.split('/')[2]

    if (sessionGameId && sessionGameId === pathGameId) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/setup/:path*', '/waiting/:path*', '/game/:path*', '/result/:path*'],
}
