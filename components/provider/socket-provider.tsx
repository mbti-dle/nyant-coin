'use client'

import { createContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { Socket, io } from 'socket.io-client'

import ErrorModal from '@/components/ui/error-modal'
import { SOCKET_ERROR_MESSAGES, SocketErrorType } from '@/constants/socket'

interface SocketContextModel {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [errorType, setErrorType] = useState<SocketErrorType | null>(null)

  useEffect(() => {
    const socketInstance = io()

    const handleSocketConnect = () => {
      setIsConnected(true)
      setErrorType(null)
    }

    const handleSocketDisconnect = () => {
      setIsConnected(false)
      setErrorType('DISCONNECT')
    }

    const handleReconnectFailed = () => {
      setErrorType('RECONNECT_FAILED')
    }

    const handleConnectTimeout = () => {
      setErrorType('CONNECT_TIMEOUT')
    }

    const handleServerUnreachable = () => {
      setErrorType('SERVER_UNREACHABLE')
    }

    const handleBadRequest = () => {
      setErrorType('BAD_REQUEST')
    }

    socketInstance.on('connect', handleSocketConnect)
    socketInstance.on('disconnect', handleSocketDisconnect)
    socketInstance.on('reconnect_failed', handleReconnectFailed)
    socketInstance.on('connect_timeout', handleConnectTimeout)
    socketInstance.on('server_unreachable', handleServerUnreachable)
    socketInstance.on('bad_request', handleBadRequest)

    setSocket(socketInstance)
    setIsConnected(socketInstance.connected)

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      socketInstance.off('connect', handleSocketConnect)
      socketInstance.off('disconnect', handleSocketDisconnect)
      socketInstance.off('reconnect_failed', handleReconnectFailed)
      socketInstance.off('connect_timeout', handleConnectTimeout)
      socketInstance.off('server_unreachable', handleServerUnreachable)
      socketInstance.off('bad_request', handleBadRequest)
      socketInstance.disconnect()
    }
  }, [])

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
