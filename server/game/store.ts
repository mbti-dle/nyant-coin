import { GameModel, PlayerIdType, SocketIdType } from '@/types/game'

export const gameRooms = new Map<string, GameModel & { readyPlayers: Set<string> }>()
export const playersMap = new Map<SocketIdType, PlayerIdType>()
export const gameTimers = new Map<string, NodeJS.Timeout>()
export const roundTimers = new Map<string, NodeJS.Timeout>()

export const getRoom = (gameId: string) => gameRooms.get(gameId)
export const addRoom = (gameId: string, game: GameModel & { readyPlayers: Set<string> }) =>
  gameRooms.set(gameId, game)
export const removeRoom = (gameId: string) => gameRooms.delete(gameId)

export const addPlayer = (socketId: SocketIdType, playerId: PlayerIdType) =>
  playersMap.set(socketId, playerId)
export const removePlayer = (socketId: SocketIdType) => playersMap.delete(socketId)
export const getPlayerId = (socketId: SocketIdType) => playersMap.get(socketId)
