import { Server as SocketIOServer } from 'socket.io'

import { INACTIVITY_TIMEOUT } from '../../constants/socket.js'
import { SocketModel } from '../../types/game.js'

import { handlePlayerLeave } from './player.js'
import { gameRooms, playersStatus } from './store.js'

/**
 * 비활성 시간이 3시간을 초과한 플레이어와 방을
 * 5분마다 주기적으로 검사하여 정리합니다.
 */
export const startInactivityMonitor = (io: SocketIOServer) => {
  const CHECK_INTERVAL = 5 * 60 * 1000 // 5분마다 확인

  setInterval(() => {
    const now = Date.now()
    console.log(`[Cleanup] Starting inactivity check at ${new Date(now).toISOString()}`)

    playersStatus.forEach((status, playerId) => {
      if (now - status.lastSeen > INACTIVITY_TIMEOUT) {
        let isInActiveGame = false
        gameRooms.forEach((room) => {
          if (room.state === 'in_progress' && room.players.some((p) => p.id === playerId)) {
            isInActiveGame = true
          }
        })

        if (isInActiveGame) return

        console.log(`[Cleanup] Removing inactive player: ${playerId}`)

        gameRooms.forEach((room, gameId) => {
          const playerExists = room.players.some((p) => p.id === playerId)
          if (playerExists) {
            const socket = io.sockets.sockets.get(status.socketId || '')
            const socketToUse: SocketModel = socket || { id: status.socketId || '' }
            handlePlayerLeave(socketToUse, playerId, gameId, io)
          }
        })

        playersStatus.delete(playerId)
      }
    })

    gameRooms.forEach((room, gameId) => {
      const isRoomEmpty = room.players.length === 0

      const lastActivity = room.players.reduce((max, p) => {
        const pStatus = playersStatus.get(p.id)
        return pStatus ? Math.max(max, pStatus.lastSeen) : max
      }, 0)

      const isInactive = lastActivity > 0 && now - lastActivity > INACTIVITY_TIMEOUT
      const shouldCleanup = isRoomEmpty || (isInactive && room.state !== 'in_progress')

      if (shouldCleanup) {
        console.log(
          `[Cleanup] Removing ${isRoomEmpty ? 'empty' : 'inactive'} room: ${gameId} (State: ${room.state})`
        )
        gameRooms.delete(gameId)
      }
    })
  }, CHECK_INTERVAL)
}
