'use client'

import { createContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { Socket, io } from 'socket.io-client'

import ErrorModal from '@/components/ui/error-modal'
import { SOCKET_ERROR_MESSAGES, SOCKET_ERROR_TYPES, SocketErrorType } from '@/constants/socket'

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
      setErrorType(SOCKET_ERROR_TYPES.DISCONNECT)
    }

    socketInstance.on('connect', handleSocketConnect)
    socketInstance.on('disconnect', handleSocketDisconnect)

    setSocket(socketInstance)
    setIsConnected(socketInstance.connected)

    if (!socketInstance.connected) {
      socketInstance.connect()
    }

    return () => {
      socketInstance.off('connect', handleSocketConnect)
      socketInstance.off('disconnect', handleSocketDisconnect)
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
