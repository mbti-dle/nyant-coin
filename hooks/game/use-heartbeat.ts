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

  const handleHeartbeatResponse = () => {
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
