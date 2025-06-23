import { Socket } from 'socket.io'

import { PlayerIdType, SocketIdType } from '../../types/game'

import { getRoom, removeRoom } from './room.js'
import { gameRooms, playersStatus, playersMap } from './store.js'
import { clearAllGameTimers } from './timer.js'

export const addPlayer = (socketId: SocketIdType, playerId: PlayerIdType) =>
  playersMap.set(socketId, playerId)

export const removePlayer = (socketId: SocketIdType) => playersMap.delete(socketId)

export const getPlayer = (socketId: SocketIdType) => playersMap.get(socketId)

const removePlayerFromRoom = (socket: Socket, playerId: string, gameId: string) => {
  const room = getRoom(gameId)
  if (!room) {
    return false
  }

  const playerIndex = room.players.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    return false
  }

  room.players.splice(playerIndex, 1)
  room.readyPlayers.delete(playerId)
  socket.to(gameId).emit('update_players', room.players)

  if (room.players.length === 0) {
    clearAllGameTimers(gameId)
    removeRoom(gameId)
  }

  return true
}

export const handlePlayerLeave = (socket: Socket, playerId: string, leaveGameId?: string) => {
  if (leaveGameId) {
    const isRemoved = removePlayerFromRoom(socket, playerId, leaveGameId)
    if (isRemoved) {
      removePlayer(socket.id)
    }
    return
  }

  gameRooms.forEach((room, gameId) => {
    if (room.state !== 'ended') {
      removePlayerFromRoom(socket, playerId, gameId)
    }
  })
  removePlayer(socket.id)
}

export const updatePlayerStatus = (
  playerId: PlayerIdType,
  isOnline: boolean,
  socketId?: SocketIdType
) => {
  playersStatus.set(playerId, {
    isOnline,
    lastSeen: Date.now(),
    socketId: isOnline ? socketId : undefined,
  })
}

export const getPlayerStatus = (playerId: PlayerIdType): boolean => {
  return playersStatus.get(playerId)?.isOnline ?? false
}

export const clearPlayerStatus = (playerId: PlayerIdType) => {
  playersStatus.delete(playerId)
}

export const getOnlinePlayers = (gameId: string): PlayerIdType[] => {
  const room = gameRooms.get(gameId)
  if (!room) return []

  return room.players.filter((player) => getPlayerStatus(player.id)).map((player) => player.id)
}
