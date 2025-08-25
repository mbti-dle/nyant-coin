import { useState, useRef } from 'react'

import { Socket, io } from 'socket.io-client'

interface SocketConnectionOptionsModel {
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
  reconnectionDelayMax?: number
  timeout?: number
  forceNew?: boolean
}

interface UseSocketConnectionReturn {
  socket: Socket | null
  isSocketConnected: boolean
  wasEverConnected: boolean
  createSocket: (options?: SocketConnectionOptionsModel) => Socket
  handleConnect: () => void
  handleDisconnect: () => void
  disconnect: () => void
  reconnect: () => void
}

export const useSocketConnection = (): UseSocketConnectionReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const wasEverConnected = useRef(false)

  const createSocket = (options?: SocketConnectionOptionsModel): Socket => {
    if (socket) {
      socket.disconnect()
    }

    const defaultOptions: SocketConnectionOptionsModel = {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      forceNew: false,
    }

    const socketInstance = io({
      ...defaultOptions,
      ...options,
    })

    setSocket(socketInstance)
    setIsSocketConnected(socketInstance.connected)

    return socketInstance
  }

  const handleConnect = () => {
    setIsSocketConnected(true)
    wasEverConnected.current = true
    console.log('🔌 Socket 연결됨')
  }

  const handleDisconnect = () => {
    setIsSocketConnected(false)
    console.log('🔌 Socket 연결 해제됨')
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsSocketConnected(false)
      console.log('🔌 Socket 수동 연결 해제')
    }
  }

  const reconnect = () => {
    if (socket && !socket.connected) {
      console.log('🔄 Socket 재연결 시도')
      socket.connect()
    }
  }

  return {
    socket,
    isSocketConnected,
    wasEverConnected: wasEverConnected.current,
    createSocket,
    handleConnect,
    handleDisconnect,
    disconnect,
    reconnect,
  }
}
