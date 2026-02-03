'use server'

import { cookies } from 'next/headers'

/**
 * 방 설정(Setup) 단계를 위한 세션을 시작합니다.
 * '방 만들기' 버튼 클릭 시 호출되며, /setup/* 경로에 대한 접근 권한을 부여합니다.
 * 보안을 위해 5분 후 만료되도록 설정되어 있습니다.
 */
export async function startSetupSession() {
  const cookieStore = await cookies()

  cookieStore.set('nyant_setup_session', '1', {
    path: '/',
    maxAge: 300,
    sameSite: 'lax',
    httpOnly: false,
  })
}

/**
 * 실제 게임 진행을 위한 세션을 시작합니다.
 * 닉네임과 캐릭터 설정을 마치고 게임방 입장이 확정되었을 때 호출됩니다.
 * 브라우저를 닫으면 세션이 만료되도록 만료 시간(maxAge)을 설정하지 않은 세션 쿠키입니다.
 *
 * @param gameId 세션에 연결할 게임 고유 ID
 */
export async function startGameSession(gameId: string) {
  if (!gameId) throw new Error('gameId is required')

  const cookieStore = await cookies()

  cookieStore.set('nyant_game_session', gameId, {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  })
}
