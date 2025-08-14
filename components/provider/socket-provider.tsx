'use client'

import { createContext, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { Socket } from 'socket.io-client'

import ErrorModal from '@/components/ui/error-modal'
import { SOCKET_ERROR_TYPES, SocketErrorType } from '@/constants/socket'
import { useGameState } from '@/hooks/game/use-game-state'
import { useNetworkStatus } from '@/hooks/socket/use-network-status'
import { useSocketConnection } from '@/hooks/socket/use-socket-connection'
import { useSocketReconnection } from '@/hooks/socket/use-socket-reconnection'
import { useTabVisibility } from '@/hooks/socket/use-tab-visibility'
import useToastStore from '@/store/toast'
import { GameSnapshotModel } from '@/types/game'

interface SocketContextModel {
  socket: Socket | null
  isSocketConnected: boolean
  isInGame: boolean
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { showToast } = useToastStore()
  const {
    socket,
    isSocketConnected,
    wasEverConnected,
    createSocket,
    handleConnect,
    handleDisconnect,
  } = useSocketConnection()

  const { isInGame, saveGameData, clearGameData, getGameData } = useGameState()

  const {
    setOffline,
    setOnline,
    clearTimers,
    registerNetworkListeners,
    startReconnectNotifications,
    stopReconnectNotifications,
  } = useNetworkStatus()

  const { handleGameStateSync, handleSyncComplete, handleSyncFailed, clearReconnectionState } =
    useSocketReconnection()

  const [tabSwitchCountdown, setTabSwitchCountdown] = useState<number>(0)

  const {
    isTabVisible,
    tabSwitchTimeLeft,
    isTabSwitchModalShown,
    startTabSwitchWarning,
    stopTabSwitchTimers,
    handleTabReturn,
    registerVisibilityListener,
  } = useTabVisibility()

  const [errorType, setErrorType] = useState<SocketErrorType | null>(null)
  const gameRestoreToastShown = useRef(false)

  const forceExitGame = (reason: string) => {
    clearGameData()
    clearReconnectionState()
    showToast(reason, 'warning')
    router.push('/')
  }

  const handleSocketConnect = (socketInstance: Socket) => {
    setOnline()
    setErrorType(null)

    if (wasEverConnected && !isSocketConnected) {
      showToast('서버에 다시 연결되었습니다', 'connection')
      gameRestoreToastShown.current = false

      const { gameId, playerId } = getGameData()
      if (gameId && playerId) {
        setTimeout(() => {
          handleGameStateSync(socketInstance, getGameData)
        }, 1000)
      }
    }

    handleConnect()
  }

  const handleSocketDisconnect = () => {
    handleDisconnect()
    clearReconnectionState()

    if (wasEverConnected) {
      setOffline(() => {
        setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)
        stopReconnectNotifications()
      })

      startReconnectNotifications(showToast)
    }
  }

  const handleConnectionError = () => {
    clearReconnectionState()

    if (wasEverConnected) {
      setOffline(() => {
        setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)
        stopReconnectNotifications()
      })

      startReconnectNotifications(showToast)
    }
  }

  const handleOnline = () => {
    setOnline()
    if (socket && !socket.connected) {
      console.log('네트워크 복구 - 소켓 재연결 시도')
      socket.connect()
    }
  }

  const handleOffline = () => {
    setOffline(() => {
      setErrorType(SOCKET_ERROR_TYPES.NETWORK_ERROR)
    })
  }

  const handleTabSwitchWarning = () => {
    setErrorType(SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING)
    showToast('탭을 전환하셨습니다. 게임으로 돌아와 주세요.', 'warning')
  }

  const handleTabSwitchExit = () => {
    const { gameId, playerId } = getGameData()
    if (gameId && playerId && socket) {
      socket.emit('leave_game', { gameId, playerId, reason: 'tab_switch' })
    }
    forceExitGame('탭 전환으로 인해 게임에서 퇴장되었습니다.')
  }

  const handleTabReturnWrapper = () => {
    handleTabReturn()
    setErrorType(null)
    setTabSwitchCountdown(0)
    showToast('게임으로 돌아오셨습니다.')
  }

  const enableTabSwitchDetection = () => {
    if (!isInGame) return

    const cleanup = registerVisibilityListener(
      () => {
        startTabSwitchWarning(handleTabSwitchWarning, handleTabSwitchExit)
      },
      () => {
        if (errorType === SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING) {
          handleTabReturnWrapper()
        }
      }
    )

    return cleanup
  }

  const disableTabSwitchDetection = () => {
    stopTabSwitchTimers()
    if (errorType === SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING) {
      setErrorType(null)
    }
  }

  const handleGameNotFound = ({ message }: { message: string }) => {
    console.log('🎮 게임을 찾을 수 없음:', message)
    forceExitGame(message || '게임을 찾을 수 없습니다.')
  }

  const handlePlayerKicked = ({ message }: { message: string }) => {
    console.log('👢 플레이어가 추방됨:', message)
    forceExitGame(message || '게임에서 추방되었습니다.')
  }

  const handleGameEnded = ({ message }: { message: string }) => {
    console.log('🏁 게임이 종료됨:', message)
    clearGameData()
    showToast(message || '게임이 종료되었습니다.', 'warning')
  }

  const handleJoinSuccess = ({ gameId, playerId }: { gameId: string; playerId: string }) => {
    saveGameData(gameId, playerId)
  }

  const handlePlayerNotFound = ({ message }: { message: string }) => {
    console.log('❌ 플레이어를 찾을 수 없음:', message)
    forceExitGame(message || '플레이어를 찾을 수 없습니다.')
  }

  const handleSyncCompleteWrapper = (gameSnapshot: GameSnapshotModel) => {
    handleSyncComplete(gameSnapshot, showToast)

    if (!gameRestoreToastShown.current) {
      gameRestoreToastShown.current = true
    }
  }

  const handleSyncFailedWrapper = (data: { error: string }) => {
    if (socket) {
      handleSyncFailed(data, socket, getGameData, showToast, forceExitGame)
    } else {
      console.error('Socket is not available to handle sync failure.')
    }
  }

  const handlePlayerReconnected = ({ nickname }: { nickname: string }) => {
    showToast(`${nickname}님이 재연결되었습니다`, 'connection')
  }

  useEffect(() => {
    const cleanupNetwork = registerNetworkListeners(handleOnline, handleOffline)
    return cleanupNetwork
  }, [registerNetworkListeners])

  useEffect(() => {
    if (errorType === SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING) {
      setTabSwitchCountdown(tabSwitchTimeLeft)
    }
  }, [tabSwitchTimeLeft, errorType])

  useEffect(() => {
    if (isInGame) {
      const cleanup = enableTabSwitchDetection()
      return cleanup
    } else {
      disableTabSwitchDetection()
    }
  }, [isInGame])

  useEffect(() => {
    const socketInstance = createSocket({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      forceNew: false,
    })

    socketInstance.on('connect', () => handleSocketConnect(socketInstance))
    socketInstance.on('disconnect', handleSocketDisconnect)
    socketInstance.on('connect_error', handleConnectionError)
    socketInstance.on('sync_complete', handleSyncCompleteWrapper)
    socketInstance.on('sync_failed', handleSyncFailedWrapper)
    socketInstance.on('join_success', handleJoinSuccess)
    socketInstance.on('player_not_found', handlePlayerNotFound)
    socketInstance.on('player_reconnected', handlePlayerReconnected)
    socketInstance.on('game_not_found', handleGameNotFound)
    socketInstance.on('player_kicked', handlePlayerKicked)
    socketInstance.on('game_ended', handleGameEnded)

    socketInstance.on('player_disconnected', ({ message }) => {
      showToast(message, 'warning')
    })

    socketInstance.on('player_removed', ({ message }) => {
      showToast(message, 'warning')
    })

    socketInstance.on('player_left', ({ message }) => {
      showToast(message, 'warning')
    })

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      clearTimers()
      clearReconnectionState()

      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('connect_error')
      socketInstance.off('sync_complete')
      socketInstance.off('sync_failed')
      socketInstance.off('player_reconnected')
      socketInstance.off('player_not_found')
      socketInstance.off('join_success')
      socketInstance.off('game_not_found')
      socketInstance.off('player_kicked')
      socketInstance.off('game_ended')
      socketInstance.off('player_disconnected')
      socketInstance.off('player_removed')
      socketInstance.off('player_left')

      socketInstance.disconnect()
    }
  }, [])

  const handleReconnect = () => {
    setErrorType(null)

    if (socket && !socket.connected) {
      console.log('🔄 수동 재연결 시도')
      socket.connect()
    }
  }

  const getErrorActions = (errorType: SocketErrorType) => {
    switch (errorType) {
      case SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING:
        return {
          onPrimaryAction: handleTabSwitchExit,
          onSecondaryAction: handleTabReturnWrapper,
        }
      case SOCKET_ERROR_TYPES.DISCONNECT:
      case SOCKET_ERROR_TYPES.NETWORK_ERROR:
        return {
          onPrimaryAction: handleReconnect,
          onSecondaryAction: () => setErrorType(null),
        }
      default:
        return {
          onPrimaryAction: () => router.push('/'),
          onSecondaryAction: undefined,
        }
    }
  }

  const getCountdownMessage = (errorType: SocketErrorType) => {
    if (errorType === SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING && tabSwitchCountdown > 0) {
      return `${tabSwitchCountdown}초 후 자동으로 게임에서 나가집니다.`
    }
    return undefined
  }

  return (
    <SocketContext.Provider value={{ socket, isSocketConnected, isInGame }}>
      {children}
      {errorType && (
        <ErrorModal
          isOpen={!!errorType}
          type={errorType}
          countdownMessage={getCountdownMessage(errorType)}
          {...getErrorActions(errorType)}
        />
      )}
    </SocketContext.Provider>
  )
}

export default SocketProvider
