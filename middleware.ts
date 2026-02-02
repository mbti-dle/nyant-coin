import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // 홈은 항상 허용
  if (pathname === '/') {
    return NextResponse.next()
  }

  const hasSetupSession = request.cookies.has('nyant_setup_session')
  const gameSessionId = request.cookies.get('nyant_game_session')?.value

  /**
   * setup 단계
   * - 새로고침 ❌ / 직접 접근 ❌
   * - setup_session 필수
   */
  if (pathname.startsWith('/setup')) {
    if (!hasSetupSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  /**
   * waiting / game / result
   * - 새로고침 ⭕ / 직접 접근 ❌
   * - gameSessionId === pathGameId 필수
   */
  if (
    pathname.startsWith('/waiting') ||
    pathname.startsWith('/game') ||
    pathname.startsWith('/result')
  ) {
    const pathGameId = pathname.split('/')[2]

    if (gameSessionId && gameSessionId === pathGameId) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/setup/:path*', '/waiting/:path*', '/game/:path*', '/result/:path*'],
}
