'use client'

import { createContext, useEffect, useState, useCallback } from 'react'

import { Socket } from 'socket.io-client'

import { useGameState } from '@/hooks/game/use-game-state'
import { useSocketConnection } from '@/hooks/socket/core/use-socket-connection'
import { useSocketSync } from '@/hooks/socket/core/use-socket-sync'
import { useNetworkStatus } from '@/hooks/socket/facade/use-network-status'
import { useGameExitPolicy } from '@/hooks/socket/policy/use-game-exit-policy'
import { useTabSwitchPolicy } from '@/hooks/socket/policy/use-tab-switch-policy'
import { appLogger } from '@/lib/utils/app-logger'
import useToastStore from '@/store/toast'
import { PeerConnectionStateType } from '@/types/game'

interface SocketContextModel {
  socket: Socket | null // 소켓 인스턴스
  isSocketConnected: boolean // 소켓 연결 완료 여부
  isInGame: boolean // 현재 게임 세션 참여 여부
  connectionStatus: PeerConnectionStateType // 상세 연결 상태 (CONNECTED, RECONNECTING 등)
  hasNetworkConnection: boolean // 물리적 네트워크 연결 여부
  isInOfflineMode: boolean // UI 레벨의 오프라인 상태
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. 외부 훅 및 스토어 액션
  const { showToast } = useToastStore()
  const { isInGame, saveGameData, clearGameData, getGameData } = useGameState()
  const { handleGameStateSync, handleSyncComplete, handleSyncFailed, clearReconnectionState } =
    useSocketSync()
  const {
    socket,
    isSocketConnected,
    wasEverConnected,
    createSocket,
    handleConnect,
    handleDisconnect,
  } = useSocketConnection()
  const { isTabVisible, startTabSwitchWarning, stopTabSwitchTimers, handleTabReturn } =
    useTabSwitchPolicy(socket)
  const { exitGame, handleTabSwitchExit } = useGameExitPolicy(socket)

  // 2. 상태 및 Ref
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0)

  // 3. 파생 상태 및 계산 로직
  const { hasNetworkConnection, connectionStatus, isInOfflineMode } = useNetworkStatus({
    isSocketConnected,
    reconnectionAttempts,
  })

  // 4. 핸들러 및 콜백
  const forceExitGame = useCallback(
    (reason?: string) => {
      stopTabSwitchTimers()
      exitGame(clearReconnectionState)
      if (reason) {
        showToast(reason, 'warning')
      }
    },
    [stopTabSwitchTimers, exitGame, clearReconnectionState, showToast]
  )

  // 5. 이펙트 (핵심 엔진)

  // 5-1. 연결성 응답 (명시적 UI/로직)
  useEffect(() => {
    if (hasNetworkConnection && socket && !socket.connected) {
      appLogger.log('네트워크 복구로 소켓 재연결 시도')
      socket.connect()
    }
  }, [hasNetworkConnection, socket])

  // 5-2. 게임 정책 (탭 전환)
  useEffect(() => {
    if (!isInGame) return

    if (!isTabVisible) {
      startTabSwitchWarning(() => {
        handleTabSwitchExit(forceExitGame)
      })
    } else {
      handleTabReturn(() => {
        handleTabSwitchExit(forceExitGame)
      })
      if (socket && socket.connected) {
        handleGameStateSync(socket, getGameData)
      }
    }
  }, [
    isInGame,
    isTabVisible,
    startTabSwitchWarning,
    handleTabReturn,
    handleTabSwitchExit,
    forceExitGame,
    socket,
    handleGameStateSync,
    getGameData,
  ])

  // 5-3. 소켓 생명주기 (인스턴스 생성)
  useEffect(() => {
    const socketInstance = createSocket({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      forceNew: false,
    })

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      clearReconnectionState()
      socketInstance.disconnect()
    }
  }, []) // 마운트/언마운트 시에만

  // 5-4. 소켓 이벤트 핸들러
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
    socket.on('reconnect_attempt', setReconnectionAttempts)
    socket.on('sync_complete', (snapshot) => handleSyncComplete(snapshot))
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
    socket.on('game_ended', ({ message }) => {
      clearGameData()
      showToast(message || '게임이 종료되었습니다.', 'warning')
    })
    socket.on('player_reconnected', handlePlayerNotifications)
    socket.on('player_disconnected', handlePlayerNotifications)
    socket.on('player_removed', handlePlayerNotifications)
    socket.on('player_left', handlePlayerNotifications)

    return () => {
      socket.off('connect', handleSocketConnect)
      socket.off('reconnect', handleSocketConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', clearReconnectionState)
      socket.off('reconnect_attempt', setReconnectionAttempts)
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
  ])

  return (
    <SocketContext.Provider
      value={{
        socket,
        isSocketConnected,
        isInGame,
        connectionStatus,
        hasNetworkConnection,
        isInOfflineMode,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
