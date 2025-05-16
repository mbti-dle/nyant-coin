'use client'

import { createContext, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { Socket, io } from 'socket.io-client'

import ErrorModal from '@/components/ui/error-modal'
import { SOCKET_ERROR_MESSAGES, SOCKET_ERROR_TYPES, SocketErrorType } from '@/constants/socket'
import useToastStore from '@/store/toast'

interface SocketContextModel {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { showToast } = useToastStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [errorType, setErrorType] = useState<SocketErrorType | null>(null)
  const wasEverConnected = useRef(false)

  const disconnectedAtRef = useRef<number | null>(null)

  const errorModalTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSocketConnect = () => {
    disconnectedAtRef.current = null

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }

    setErrorType(null)

    if (wasEverConnected.current && !isConnected) {
      showToast('서버에 다시 연결되었습니다', 'connection')
    }

    setIsConnected(true)
    wasEverConnected.current = true
  }

  const handleSocketDisconnect = () => {
    setIsConnected(false)

    if (disconnectedAtRef.current === null) {
      disconnectedAtRef.current = Date.now()
    }

    if (wasEverConnected.current) {
      showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')

      errorModalTimerRef.current = setTimeout(() => {
        if (!isConnected) {
          setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)
        }
      }, 10000)
    }
  }

  useEffect(() => {
    const socketInstance = io()

    socketInstance.on('connect', handleSocketConnect)
    socketInstance.on('disconnect', handleSocketDisconnect)

    setSocket(socketInstance)
    setIsConnected(socketInstance.connected)

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      if (errorModalTimerRef.current) {
        clearTimeout(errorModalTimerRef.current)
      }

      socketInstance.off('connect', handleSocketConnect)
      socketInstance.off('disconnect', handleSocketDisconnect)
      socketInstance.disconnect()
    }
  }, [showToast])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      {errorType && (
        <ErrorModal
          isOpen={!!errorType}
          title={SOCKET_ERROR_MESSAGES[errorType].title}
          message={SOCKET_ERROR_MESSAGES[errorType].message}
          buttonText="홈으로 이동"
          onClick={() => {
            setErrorType(null)
            router.push('/')
          }}
        />
      )}
    </SocketContext.Provider>
  )
}

export default SocketProvider
