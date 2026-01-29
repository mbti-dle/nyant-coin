import { GameModel } from '../../types/game.js'

import { gameRooms, roomCleanupTimers } from './store.js'

export const getRoom = (gameId: string) => gameRooms.get(gameId)

export const addRoom = (gameId: string, game: GameModel & { readyPlayers: Set<string> }) =>
  gameRooms.set(gameId, game)

export const removeRoom = (gameId: string) => gameRooms.delete(gameId)

export const cancelRoomCleanup = (gameId: string) => {
  const cleanupTimer = roomCleanupTimers.get(gameId)
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
    roomCleanupTimers.delete(gameId)
    return true
  }
  return false
}
