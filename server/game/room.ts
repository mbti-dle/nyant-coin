import { GameModel } from '../../types/game'

import { gameRooms } from './store.js'

export const getRoom = (gameId: string) => gameRooms.get(gameId)
export const addRoom = (gameId: string, game: GameModel & { readyPlayers: Set<string> }) =>
  gameRooms.set(gameId, game)
export const removeRoom = (gameId: string) => gameRooms.delete(gameId)
