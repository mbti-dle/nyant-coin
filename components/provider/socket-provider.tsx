'use client'

import { createContext, useEffect, useState, useCallback } from 'react'

import { Socket } from 'socket.io-client'

import { useSocketConnection } from '@/hooks/socket/core/use-socket-connection'
import { useSocketEvents } from '@/hooks/socket/core/use-socket-events'
import { useSocketSync } from '@/hooks/socket/core/use-socket-sync'
import { useNetworkStatus } from '@/hooks/socket/facade/use-network-status'
import { useGameExitPolicy } from '@/hooks/socket/policy/use-game-exit-policy'
import { useSocketSession } from '@/hooks/socket/policy/use-socket-session'
import { useTabSwitchPolicy } from '@/hooks/socket/policy/use-tab-switch-policy'
import { appLogger } from '@/lib/utils/app-logger'
import useGameStore from '@/store/game'
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
  const gameId = useGameStore((state) => state.gameId)
  const playerId = useGameStore((state) => state.playerId)
  const setGameId = useGameStore((state) => state.setGameId)
  const setPlayerId = useGameStore((state) => state.setPlayerId)
  const resetGameState = useGameStore((state) => state.resetGameState)

  const isInGame = gameId !== null && playerId !== null
  const getGameData = useCallback(() => ({ gameId, playerId }), [gameId, playerId])

  const saveGameData = useCallback(
    (gid: string, pid: string) => {
      setGameId(gid)
      setPlayerId(pid)
    },
    [setGameId, setPlayerId]
  )

  const clearGameData = useCallback(() => {
    resetGameState()
  }, [resetGameState])

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

  // 5-0. 세션 및 이벤트 통합 관리 (추출된 훅 활용)
  useSocketSession(gameId, playerId)

  useSocketEvents({
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
  })

  // 5-1. 연결성 응답 (명시적 UI/로직)
  useEffect(() => {
    if (hasNetworkConnection && socket && !socket.connected) {
      appLogger.log('네트워크 복구로 소켓 재연결 시도')
      socket.connect()
    }
  }, [hasNetworkConnection, socket])

  // 5-2. 게임 정책 (탭 전환)
  useEffect(() => {
    if (!isInGame) {
      stopTabSwitchTimers()
      return
    }

    if (!isTabVisible) {
      startTabSwitchWarning(() => {
        handleTabSwitchExit(forceExitGame)
      })
    } else {
      const exited = handleTabReturn(() => {
        handleTabSwitchExit(forceExitGame)
      })
      if (!exited && socket && socket.connected) {
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
  }, [])

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
