import { useEffect } from 'react'

/**
 * [Policy Layer] 게임 세션 인증을 위한 쿠키(nyant_session)의 생명주기를 관리하는 훅입니다.
 */
export const useSocketSession = (gameId: string | null, playerId: string | null) => {
  useEffect(() => {
    if (gameId && playerId) {
      document.cookie = 'nyant_session=true; path=/; max-age=86400; SameSite=Lax'
    } else {
      document.cookie = 'nyant_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }, [gameId, playerId])
}
