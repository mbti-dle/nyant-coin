import { useRef } from 'react'

import { Socket } from 'socket.io-client'

import { appLogger } from '@/lib/utils/app-logger'

/**
 * [Core Layer] 재연결 이후의 '데이터 정합성(Synchronization)'을 책임지는 훅입니다.
 * 서버와 클라이언트 간의 게임 스냅샷을 동기화하고, 실패 시의 재시도 정책을 관리합니다.
 */
export const useSocketSync = <T>() => {
  const reconnectionInProgress = useRef(false)
  const lastSyncRequestTime = useRef(0)
  const gameRestoreToastShown = useRef(false)

  const handleGameStateSync = (
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null }
  ) => {
    const { gameId, playerId } = getGameData()

    if (reconnectionInProgress.current) return

    const now = Date.now()
    if (now - lastSyncRequestTime.current < 3000) return

    const hasValidGameData = gameId && playerId
    const isSocketConnected = socket.connected
    const canRequestSync = hasValidGameData && isSocketConnected

    if (canRequestSync) {
      appLogger.log('게임 상태 동기화 요청')

      reconnectionInProgress.current = true
      lastSyncRequestTime.current = now

      socket.emit('request_sync', { gameId, playerId, timestamp: now })

      setTimeout(() => {
        if (reconnectionInProgress.current) {
          appLogger.log('동기화 응답 타임아웃')

          reconnectionInProgress.current = false
        }
      }, 10000)
    }
  }

  const handleSyncComplete = (gameSnapshot: T) => {
    appLogger.log('게임 상태 동기화 완료')

    reconnectionInProgress.current = false

    window.dispatchEvent(
      new CustomEvent('gameStateRestored', {
        detail: gameSnapshot,
      })
    )
  }

  const handleSyncFailed = (
    { error }: { error: string },
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null },
    forceExitGame: (reason?: string) => void
  ) => {
    appLogger.warn('게임 상태 동기화 실패', { error })
    reconnectionInProgress.current = false
    gameRestoreToastShown.current = false

    if (error.includes('not found') || error.includes('찾을 수 없')) {
      forceExitGame()
      return
    }

    const { gameId, playerId } = getGameData()
    const hasValidGameData = gameId && playerId
    const isSocketConnected = socket.connected
    const canRetrySync = hasValidGameData && isSocketConnected

    if (canRetrySync) {
      setTimeout(() => {
        if (!reconnectionInProgress.current && socket.connected) {
          handleGameStateSync(socket, getGameData)
        }
      }, 3000)
    }
  }

  const clearReconnectionState = () => {
    reconnectionInProgress.current = false
    gameRestoreToastShown.current = false
  }

  return {
    handleGameStateSync,
    handleSyncComplete,
    handleSyncFailed,
    clearReconnectionState,
  }
}
