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

/**
 * [Core Layer] Socket.io 인스턴스의 '생성' 및 '물리적 연결 상태'를 관리하는 훅입니다.
 * 소켓 객체 생성(io) 및 연결 상태(connected)를 실시간으로 추적하며,
 * 인스턴스 자체의 생명주기와 기본적인 연결 플래그 관리에 집중합니다.
 */
export const useSocketConnection = () => {
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
  }

  const handleDisconnect = () => {
    setIsSocketConnected(false)
  }

  return {
    socket,
    isSocketConnected,
    wasEverConnected: wasEverConnected.current,
    createSocket,
    handleConnect,
    handleDisconnect,
  }
}
