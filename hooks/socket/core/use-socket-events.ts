import { useEffect } from 'react'

import { Socket } from 'socket.io-client'

import useGameStore from '@/store/game'
import { GameSyncPayloadModel } from '@/types/game'

interface UseSocketEventsProps {
  socket: Socket | null
  wasEverConnected: boolean
  getGameData: () => { gameId: string | null; playerId: string | null }
  handleConnect: () => void
  handleDisconnect: () => void
  handleGameStateSync: (
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null }
  ) => void
  handleSyncComplete: (snapshot: GameSyncPayloadModel) => void
  handleSyncFailed: (
    data: { error: string },
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null },
    forceExitGame: (reason?: string) => void
  ) => void
  saveGameData: (gid: string, pid: string) => void
  clearGameData: () => void
  clearReconnectionState: () => void
  setReconnectionAttempts: (val: number | ((prev: number) => number)) => void
  forceExitGame: (reason?: string) => void
  showToast: (message: string, type: string) => void
}

/**
 * [Core Layer] 소켓 이벤트 리스너(on/off)의 등록 및 해제를 관리하는 훅입니다.
 */
export const useSocketEvents = ({
  socket,
  wasEverConnected,
  getGameData,
  handleConnect,
  handleDisconnect,
  handleGameStateSync,
  handleSyncComplete,
  handleSyncFailed,
  saveGameData,
  clearGameData,
  clearReconnectionState,
  setReconnectionAttempts,
  forceExitGame,
  showToast,
}: UseSocketEventsProps) => {
  useEffect(() => {
    if (!socket) return

    const handleSocketConnect = () => {
      setReconnectionAttempts(0)
      if (wasEverConnected && !socket.connected) {
        showToast('서버에 다시 연결되었습니다', 'connection')
        const { gameId, playerId } = getGameData()
        if (gameId && playerId) {
          setTimeout(() => handleGameStateSync(socket, getGameData), 1000)
        }
      }
      handleConnect()
    }

    const handlePlayerNotifications = ({
      nickname,
      message,
    }: {
      nickname?: string
      message?: string
    }) => {
      if (nickname) showToast(`${nickname}님이 재연결되었습니다`, 'connection')
      else if (message) showToast(message, 'warning')
    }

    const handleSyncFailedWrapper = (data: { error: string }) => {
      handleSyncFailed(data, socket, getGameData, forceExitGame)
    }

    socket.on('connect', handleSocketConnect)
    socket.on('reconnect', handleSocketConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', clearReconnectionState)
    socket.on('reconnect_attempt', (count) => setReconnectionAttempts(count))
    socket.on('sync_complete', (snapshot) => {
      handleSyncComplete(snapshot)
      useGameStore.getState().syncGameInfo(snapshot)
    })
    socket.on('sync_failed', handleSyncFailedWrapper)
    socket.on('join_success', ({ gameId, playerId }) => saveGameData(gameId, playerId))
    socket.on('player_not_found', ({ message }) =>
      forceExitGame(message || '플레이어를 찾을 수 없습니다.')
    )
    socket.on('game_not_found', ({ message }) =>
      forceExitGame(message || '게임을 찾을 수 없습니다.')
    )
    socket.on('player_kicked', ({ message }) =>
      forceExitGame(message || '게임에서 추방되었습니다.')
    )
    socket.on('game_ended', (data) => {
      if (data?.results) {
        useGameStore.getState().setResults(data.results)
        useGameStore.getState().updateHintState({ serverState: 'ended' })
        return
      }

      clearGameData()
      showToast(data?.message || '게임이 종료되었습니다.', 'warning')
    })
    socket.on('player_reconnected', handlePlayerNotifications)
    socket.on('player_disconnected', handlePlayerNotifications)
    socket.on('player_removed', handlePlayerNotifications)
    socket.on('player_left', handlePlayerNotifications)
    socket.on('error', ({ message }: { message: string }) => {
      if (message) showToast(message, 'warning')
    })

    return () => {
      socket.off('connect', handleSocketConnect)
      socket.off('reconnect', handleSocketConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', clearReconnectionState)
      socket.off('reconnect_attempt')
      socket.off('sync_complete')
      socket.off('sync_failed', handleSyncFailedWrapper)
      socket.off('join_success')
      socket.off('player_not_found')
      socket.off('game_not_found')
      socket.off('player_kicked')
      socket.off('game_ended')
      socket.off('player_reconnected', handlePlayerNotifications)
      socket.off('player_disconnected', handlePlayerNotifications)
      socket.off('player_removed', handlePlayerNotifications)
      socket.off('player_left', handlePlayerNotifications)
      socket.off('error')
    }
  }, [
    socket,
    wasEverConnected,
    getGameData,
    handleGameStateSync,
    handleConnect,
    handleDisconnect,
    clearReconnectionState,
    handleSyncComplete,
    handleSyncFailed,
    saveGameData,
    forceExitGame,
    clearGameData,
    showToast,
    setReconnectionAttempts,
  ])
}
