/**
 * 클라이언트와 서버 간의 연결 상태를 주기적으로 체크하는 '생존 신호(Heartbeat)' 관리 훅입니다.
 * 30초마다 신호를 발송하며, 10초 내 응답이 없을 경우 동기화(Sync)를 트리거하여 연결 안전성을 보장합니다.
 */
import { useRef } from 'react'

import { Socket } from 'socket.io-client'

const HEARTBEAT_INTERVAL = 30000
const HEARTBEAT_TIMEOUT = 10000

interface HeartbeatDataModel {
  gameId: string
  playerId: string
  timestamp: number
}

export const useHeartbeat = () => {
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
