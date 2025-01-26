'use client'

import { createContext, useEffect, useState } from 'react'

import { Socket, io } from 'socket.io-client'

interface SocketContextModel {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextModel | null>(null)

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io()

    const handleSocketConnect = () => {
      setIsConnected(true)
    }

    const handleSocketDisconnect = () => {
      setIsConnected(false)
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

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export default SocketProvider
