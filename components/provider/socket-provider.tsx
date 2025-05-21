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
  const disconnectedAtRef = useRef<number | null>(null)
  const errorModalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowErrorModal = useRef(false)

  const handleSocketConnect = () => {
    disconnectedAtRef.current = null
    setIsNetworkOffline(false)
    shouldShowErrorModal.current = false

    clearTimers()
    setErrorType(null)

    if (wasEverConnected.current && !isSocketConnected) {
      showToast('서버에 다시 연결되었습니다', 'connection')
    }

    setIsSocketConnected(true)
    wasEverConnected.current = true
  }

  const handleSocketDisconnect = () => {
    setIsSocketConnected(false)

    if (disconnectedAtRef.current === null) {
      disconnectedAtRef.current = Date.now()
    }

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

  // 네트워크 상태 관리
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOffline(false)
      shouldShowErrorModal.current = false

      if (errorModalTimerRef.current) {
        clearTimeout(errorModalTimerRef.current)
        errorModalTimerRef.current = null
      }

      if (socket && !socket.connected && wasEverConnected.current) {
        socket.connect()
      }
    }

    const handleOffline = () => {
      setIsNetworkOffline(true)
      shouldShowErrorModal.current = true

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

  // 재연결 알람 관리
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

  // Socket 초기화
  useEffect(() => {
    const socketInstance = io({
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 5000,
    })

    socketInstance.on('connect', handleSocketConnect)
    socketInstance.on('disconnect', handleSocketDisconnect)
    socketInstance.on('connect_error', handleConnectionError)

    setSocket(socketInstance)
    setIsSocketConnected(socketInstance.connected)

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      clearTimers()

      socketInstance.off('connect', handleSocketConnect)
      socketInstance.off('disconnect', handleSocketDisconnect)
      socketInstance.off('connect_error')
      socketInstance.disconnect()
    }
  }, [showToast])

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
