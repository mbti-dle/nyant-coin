'use client'

import { createContext, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { Socket, io } from 'socket.io-client'

import ErrorModal from '@/components/ui/error-modal'
import { SOCKET_ERROR_MESSAGES, SOCKET_ERROR_TYPES, SocketErrorType } from '@/constants/socket'
import useToastStore from '@/store/toast'

const RECONNECT_NOTIFICATION_INTERVAL = 1000
const ERROR_MODAL_TIMEOUT = 10000

interface SocketContextModel {
  socket: Socket | null
  isSocketConnected: boolean
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { showToast } = useToastStore()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isNetworkOffline, setIsNetworkOffline] = useState(false)
  const [errorType, setErrorType] = useState<SocketErrorType | null>(null)

  const wasEverConnected = useRef(false)
  const errorModalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowErrorModal = useRef(false)

  const reconnectionInProgress = useRef(false)
  const lastSyncRequestTime = useRef(0)
  const gameRestoreToastShown = useRef(false)

  const gameDataRef = useRef<{
    gameId: string | null
    playerId: string | null
  }>({
    gameId: null,
    playerId: null,
  })

  const saveGameData = (gameId: string, playerId: string) => {
    gameDataRef.current = {
      gameId,
      playerId,
    }
    console.log('💾 게임 데이터 저장됨:', { gameId, playerId })
  }

  const getGameData = () => {
    return {
      gameId: gameDataRef.current.gameId,
      playerId: gameDataRef.current.playerId,
    }
  }

  const handleGameStateSync = (socketInstance: Socket) => {
    const { gameId, playerId } = getGameData()

    if (reconnectionInProgress.current) {
      return
    }

    const now = Date.now()
    if (now - lastSyncRequestTime.current < 3000) {
      return
    }

    if (gameId && playerId && socketInstance.connected) {
      console.log('📡 게임 상태 동기화 요청 전송됨')

      reconnectionInProgress.current = true
      lastSyncRequestTime.current = now

      socketInstance.emit('request_sync', {
        gameId,
        playerId,
        timestamp: now,
      })

      setTimeout(() => {
        if (reconnectionInProgress.current) {
          console.log('⏰ 동기화 타임아웃')
          reconnectionInProgress.current = false
        }
      }, 10000)
    }
  }

  const handleSocketConnect = (socketInstance: Socket) => {
    setIsNetworkOffline(false)
    shouldShowErrorModal.current = false

    clearTimers()
    setErrorType(null)

    if (wasEverConnected.current && !isSocketConnected) {
      showToast('서버에 다시 연결되었습니다', 'connection')

      const { gameId, playerId } = getGameData()
      if (gameId && playerId) {
        setTimeout(() => {
          handleGameStateSync(socketInstance)
        }, 1000)
      }
    }

    setIsSocketConnected(true)
    wasEverConnected.current = true
  }

  const handleSocketDisconnect = () => {
    setIsSocketConnected(false)
    reconnectionInProgress.current = false
    gameRestoreToastShown.current = false

    if (wasEverConnected.current) {
      showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')
      setIsNetworkOffline(true)
      shouldShowErrorModal.current = true

      if (errorModalTimerRef.current) {
        clearTimeout(errorModalTimerRef.current)
      }

      errorModalTimerRef.current = setTimeout(() => {
        if (shouldShowErrorModal.current) {
          setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)

          if (reconnectIntervalRef.current) {
            clearInterval(reconnectIntervalRef.current)
            reconnectIntervalRef.current = null
          }
        }
      }, ERROR_MODAL_TIMEOUT)
    }
  }

  const handleConnectionError = () => {
    reconnectionInProgress.current = false

    if (wasEverConnected.current) {
      setIsNetworkOffline(true)
      shouldShowErrorModal.current = true
      showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')

      if (errorModalTimerRef.current) {
        clearTimeout(errorModalTimerRef.current)
      }

      errorModalTimerRef.current = setTimeout(() => {
        if (shouldShowErrorModal.current) {
          setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)

          if (reconnectIntervalRef.current) {
            clearInterval(reconnectIntervalRef.current)
            reconnectIntervalRef.current = null
          }
        }
      }, ERROR_MODAL_TIMEOUT)
    }
  }

  const clearTimers = () => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }
  }

  const handleSocketReconnectAttempt = () => {
    reconnectionInProgress.current = false
  }

  const handleSocketReconnectSuccess = () => {
    reconnectionInProgress.current = false
  }

  const handleSocketReconnectFailed = () => {
    console.log('❌ 재연결 실패')
    reconnectionInProgress.current = false
    if (confirm('재연결에 실패했습니다. 페이지를 새로고침하시겠습니까?')) {
      window.location.reload()
    }
  }

  const handleSyncComplete = (gameSnapshot: any) => {
    console.log('✅ 게임 상태 동기화 완료')

    reconnectionInProgress.current = false
    setIsNetworkOffline(false)

    if (!gameRestoreToastShown.current) {
      showToast('게임 상태가 복원되었습니다', 'connection')
      gameRestoreToastShown.current = true
    }

    const { gameId, playerId } = getGameData()
    if (gameSnapshot.gameId && gameId !== gameSnapshot.gameId) {
      saveGameData(gameSnapshot.gameId, playerId || '')
    }

    window.dispatchEvent(
      new CustomEvent('gameStateRestored', {
        detail: gameSnapshot,
      })
    )
  }

  const handleSyncFailed = ({ error }: { error: string }, socketInstance: Socket) => {
    console.log('❌ 동기화 실패:', error)
    reconnectionInProgress.current = false
    showToast('게임 상태 복원에 실패했습니다', 'warning')

    const { gameId, playerId } = getGameData()
    if (gameId && playerId && socketInstance.connected) {
      setTimeout(() => {
        if (!reconnectionInProgress.current && socketInstance.connected) {
          handleGameStateSync(socketInstance)
        }
      }, 3000)
    }
  }

  const handleJoinSuccess = ({ gameId, playerId }: { gameId: string; playerId: string }) => {
    saveGameData(gameId, playerId)
  }

  const handlePlayerNotFound = ({ message }: { message: string }) => {
    console.log('❌ 플레이어를 찾을 수 없음:', message)

    reconnectionInProgress.current = false

    setTimeout(() => {
      if (!reconnectionInProgress.current) {
        gameDataRef.current = {
          gameId: null,
          playerId: null,
        }

        showToast(message, 'warning')

        if (
          window.location.pathname.includes('/game/') ||
          window.location.pathname.includes('/waiting/')
        ) {
          router.push('/')
        }
      }
    }, 1000)
  }

  const handleGameStateRestored = (gameState: any) => {
    reconnectionInProgress.current = false
    setIsNetworkOffline(false)

    window.dispatchEvent(
      new CustomEvent('gameStateRestored', {
        detail: gameState,
      })
    )
  }

  const handlePlayerReconnected = ({ nickname }: { nickname: string }) => {
    showToast(`${nickname}님이 재연결되었습니다`, 'connection')
  }

  const setupDebugFunctions = (socketInstance: Socket) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      window.debugSocket = {
        status: () => {
          const { gameId, playerId } = getGameData()
          console.log('🔍 소켓 상태:', {
            connected: socketInstance.connected,
            gameId: gameId ? `${gameId.slice(0, 4)}***` : null,
            playerId: playerId ? `${playerId.slice(0, 8)}***` : null,
            reconnecting: reconnectionInProgress.current,
          })
        },
        reconnect: () => {
          console.log('🔧 수동 게임 상태 동기화 시도')
          if (socketInstance.connected) {
            reconnectionInProgress.current = false
            handleGameStateSync(socketInstance)
          } else {
            console.log('❌ 소켓이 연결되지 않음')
          }
        },
      }
    }
  }

  const cleanupDebugFunctions = () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      delete window.debugSocket
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOffline(false)
      shouldShowErrorModal.current = false
      reconnectionInProgress.current = false

      if (errorModalTimerRef.current) {
        clearTimeout(errorModalTimerRef.current)
        errorModalTimerRef.current = null
      }

      if (socket && !socket.connected && wasEverConnected.current) {
        socket.connect()

        const { gameId, playerId } = getGameData()
        if (gameId && playerId) {
          setTimeout(() => {
            if (socket.connected) {
              handleGameStateSync(socket)
            }
          }, 1500)
        }
      }
    }

    const handleOffline = () => {
      setIsNetworkOffline(true)
      shouldShowErrorModal.current = true
      reconnectionInProgress.current = false

      if (wasEverConnected.current) {
        showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')

        if (errorModalTimerRef.current) {
          clearTimeout(errorModalTimerRef.current)
        }

        errorModalTimerRef.current = setTimeout(() => {
          if (shouldShowErrorModal.current) {
            setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)

            if (reconnectIntervalRef.current) {
              clearInterval(reconnectIntervalRef.current)
              reconnectIntervalRef.current = null
            }
          }
        }, ERROR_MODAL_TIMEOUT)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [socket, showToast])

  useEffect(() => {
    if (isNetworkOffline && wasEverConnected.current && !errorType) {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current)
      }

      reconnectIntervalRef.current = setInterval(() => {
        if (!errorType) {
          showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')
        }
      }, RECONNECT_NOTIFICATION_INTERVAL)
    } else if ((!isNetworkOffline || errorType) && reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }

    return () => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current)
      }
    }
  }, [isNetworkOffline, showToast, errorType])

  useEffect(() => {
    const socketInstance = io({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      forceNew: false,
    })

    socketInstance.on('connect', () => {
      handleSocketConnect(socketInstance)
    })
    socketInstance.on('disconnect', (reason) => {
      console.log('💔 소켓 연결 끊김:', reason)
      handleSocketDisconnect()
    })
    socketInstance.on('connect_error', (error) => {
      console.log('❌ 연결 에러:', error)
      handleConnectionError()
    })
    socketInstance.on('reconnect_attempt', handleSocketReconnectAttempt)
    socketInstance.on('reconnect', handleSocketReconnectSuccess)
    socketInstance.on('reconnect_failed', handleSocketReconnectFailed)
    socketInstance.on('sync_complete', handleSyncComplete)
    socketInstance.on('sync_failed', (data) => handleSyncFailed(data, socketInstance))
    socketInstance.on('join_success', handleJoinSuccess)
    socketInstance.on('player_not_found', handlePlayerNotFound)
    socketInstance.on('game_state_restored', handleGameStateRestored)
    socketInstance.on('player_reconnected', handlePlayerReconnected)

    setSocket(socketInstance)
    setIsSocketConnected(socketInstance.connected)

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    setupDebugFunctions(socketInstance)

    return () => {
      clearTimers()

      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('connect_error')
      socketInstance.off('reconnect_attempt')
      socketInstance.off('reconnect')
      socketInstance.off('reconnect_failed')
      socketInstance.off('sync_complete')
      socketInstance.off('sync_failed')
      socketInstance.off('game_state_restored')
      socketInstance.off('player_reconnected')
      socketInstance.off('player_not_found')
      socketInstance.off('join_success')
      socketInstance.disconnect()

      cleanupDebugFunctions()
    }
  }, [showToast, router])

  const handleErrorModalClose = () => {
    setErrorType(null)
    shouldShowErrorModal.current = false
    router.push('/')
  }

  return (
    <SocketContext.Provider value={{ socket, isSocketConnected }}>
      {children}
      {errorType && (
        <ErrorModal
          isOpen={!!errorType}
          title={SOCKET_ERROR_MESSAGES[errorType].title}
          message={SOCKET_ERROR_MESSAGES[errorType].message}
          buttonText="홈으로 이동"
          onClick={handleErrorModalClose}
        />
      )}
    </SocketContext.Provider>
  )
}

export default SocketProvider
