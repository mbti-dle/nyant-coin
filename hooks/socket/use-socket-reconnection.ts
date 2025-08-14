import { useRef } from 'react'

import { Socket } from 'socket.io-client'

export const useSocketReconnection = <T>() => {
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

    if (gameId && playerId && socket.connected) {
      console.log('📡 게임 상태 동기화 요청 전송됨')

      reconnectionInProgress.current = true
      lastSyncRequestTime.current = now

      socket.emit('request_sync', { gameId, playerId, timestamp: now })

      setTimeout(() => {
        if (reconnectionInProgress.current) {
          console.log('⏰ 동기화 타임아웃')
          reconnectionInProgress.current = false
        }
      }, 10000)
    }
  }

  const handleSyncComplete = (gameSnapshot: T, showToast: (msg: string, type: string) => void) => {
    console.log('✅ 게임 상태 동기화 완료')

    reconnectionInProgress.current = false

    if (!gameRestoreToastShown.current) {
      showToast('게임 상태가 복원되었습니다', 'connection')
      gameRestoreToastShown.current = true
    }

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
    showToast: (msg: string, type: string) => void,
    forceExitGame: (reason: string) => void
  ) => {
    console.log('❌ 동기화 실패:', error)
    reconnectionInProgress.current = false

    if (error.includes('not found') || error.includes('찾을 수 없')) {
      forceExitGame('게임 상태를 복원할 수 없습니다.')
      return
    }

    showToast('게임 상태 복원에 실패했습니다', 'warning')

    const { gameId, playerId } = getGameData()
    if (gameId && playerId && socket.connected) {
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
    reconnectionInProgress: reconnectionInProgress.current,
    handleGameStateSync,
    handleSyncComplete,
    handleSyncFailed,
    clearReconnectionState,
  }
}
