import { useCallback } from 'react'

import { useRouter } from 'next/navigation'
import { Socket } from 'socket.io-client'

import { useGameState } from '@/hooks/game/use-game-state'

/**
 * [Policy Layer] 게임의 '정상/강제 퇴장' 조건과 절차를 정의하는 훅입니다.
 * 탭 전환으로 인한 자동 퇴장, 데이터 동기화 실패 시의 강제 종료 등
 * 비즈니스 로직에 기반한 퇴장 흐름을 관리합니다.
 */
export const useGameExitPolicy = (socket: Socket | null) => {
  const router = useRouter()
  const { clearGameData, getGameData } = useGameState()

  const exitGame = useCallback(
    (clearReconnectionState: () => void) => {
      clearGameData()
      clearReconnectionState()
      router.push('/')
    },
    [clearGameData, router]
  )

  const handleTabSwitchExit = useCallback(
    (forceExit: (reason: string) => void) => {
      const { gameId, playerId } = getGameData()

      const canLeaveGame = !!gameId && !!playerId && !!socket
      if (canLeaveGame) {
        socket.emit('leave_game', { gameId, playerId, reason: 'tab_switch' })
      }

      forceExit('게임에서 퇴장되었습니다.')
    },
    [getGameData, socket]
  )

  return {
    exitGame,
    handleTabSwitchExit,
  }
}
