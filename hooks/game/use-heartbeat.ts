import { useRef } from 'react'

import { Socket } from 'socket.io-client'

const HEARTBEAT_INTERVAL = 30000
const HEARTBEAT_TIMEOUT = 10000

interface HeartbeatDataModel {
  gameId: string
  playerId: string
  timestamp: number
}

interface UseHeartbeatReturn {
  isHeartbeatActive: boolean
  startHeartbeat: (
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null },
    onSyncRequired?: () => void
  ) => void
  stopHeartbeat: () => void
  handleHeartbeatResponse: (data: { timestamp: number }) => void
  getLastHeartbeatTime: () => number
}

export const useHeartbeat = (): UseHeartbeatReturn => {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastHeartbeatTime = useRef(0)
  const isHeartbeatActive = useRef(false)

  const startHeartbeat = (
    socket: Socket,
    getGameData: () => { gameId: string | null; playerId: string | null },
    onSyncRequired?: () => void
  ) => {
    stopHeartbeat()

    isHeartbeatActive.current = true

    heartbeatIntervalRef.current = setInterval(() => {
      const { gameId, playerId } = getGameData()

      // 조건을 명확하게 분리
      const hasValidGameData = gameId && playerId
      const isSocketConnected = socket.connected
      const canSendHeartbeat = hasValidGameData && isSocketConnected

      if (canSendHeartbeat) {
        const now = Date.now()
        lastHeartbeatTime.current = now

        const heartbeatData: HeartbeatDataModel = {
          gameId,
          playerId,
          timestamp: now,
        }

        socket.emit('heartbeat', heartbeatData)

        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current)
        }

        heartbeatTimeoutRef.current = setTimeout(() => {
          const isStillConnected = socket.connected
          if (isStillConnected && onSyncRequired) {
            onSyncRequired()
          }
        }, HEARTBEAT_TIMEOUT)
      } else {
        console.log('💔 Heartbeat 조건 불충족:', {
          gameId,
          playerId,
          connected: socket.connected,
        })
      }
    }, HEARTBEAT_INTERVAL)
  }

  const stopHeartbeat = () => {
    isHeartbeatActive.current = false

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }

  const handleHeartbeatResponse = ({ timestamp }: { timestamp: number }) => {
    const now = Date.now()
    const latency = now - timestamp
    console.log('💚 Heartbeat 응답 수신 (지연시간:', latency, 'ms)')

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }

  const getLastHeartbeatTime = () => {
    return lastHeartbeatTime.current
  }

  return {
    isHeartbeatActive: isHeartbeatActive.current,
    startHeartbeat,
    stopHeartbeat,
    handleHeartbeatResponse,
    getLastHeartbeatTime,
  }
}
