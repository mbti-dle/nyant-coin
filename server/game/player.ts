import { Server as SocketIOServer, Socket } from 'socket.io'

import { PlayerIdType, SocketIdType, SocketModel } from '../../types/game.js'

import { getRoom, removeRoom } from './room.js'
import {
  gameRooms,
  playersStatus,
  playersMap,
  roomCleanupTimers,
  playersReconnecting,
  playersReconnectingSet,
  playersGraceTimers,
} from './store.js'
import { clearAllGameTimers } from './timer.js'

export const addPlayer = (socketId: SocketIdType, playerId: PlayerIdType) =>
  playersMap.set(socketId, playerId)

export const removePlayer = (socketId: SocketIdType) => playersMap.delete(socketId)

export const getPlayer = (socketId: SocketIdType) => playersMap.get(socketId)

const removePlayerFromRoom = (
  socket: SocketModel,
  playerId: string,
  gameId: string,
  io?: SocketIOServer
) => {
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

  // io 객체가 있으면 전체 방송, 없으면 socket.broadcast.to 방송 (불필요한 자기 자신 수신 차단)
  if (io) {
    io.to(gameId).emit('update_players', room.players)
  } else {
    socket.broadcast.to(gameId).emit('update_players', room.players)
  }

  if (room.players.length === 0) {
    const cleanupTimer = setTimeout(() => {
      const currentRoom = getRoom(gameId)
      if (currentRoom && currentRoom.players.length === 0) {
        clearAllGameTimers(gameId)
        removeRoom(gameId)
      }
      roomCleanupTimers.delete(gameId)
    }, 5000)

    roomCleanupTimers.set(gameId, cleanupTimer)
  }

  return true
}

export const clearGraceTimer = (playerId: string) => {
  const timer = playersGraceTimers.get(playerId)
  if (timer && typeof timer !== 'boolean') {
    clearTimeout(timer)
  }
  playersGraceTimers.delete(playerId)
}

export const clearPlayerState = (playerId: string) => {
  playersStatus.delete(playerId)
  playersReconnecting.delete(playerId)
  playersReconnectingSet.delete(playerId)

  const timer = playersGraceTimers.get(playerId)
  if (timer && typeof timer !== 'boolean') {
    clearTimeout(timer)
  }
  playersGraceTimers.delete(playerId)
}

export const handlePlayerLeave = (
  socket: SocketModel,
  playerId: string,
  leaveGameId?: string,
  io?: SocketIOServer
) => {
  if (leaveGameId) {
    const isRemoved = removePlayerFromRoom(socket, playerId, leaveGameId, io)
    if (isRemoved) {
      const currentId = getPlayer(socket.id)
      if (currentId === playerId) {
        removePlayer(socket.id)
      }
      clearPlayerState(playerId)
    }
    return
  }

  gameRooms.forEach((room, gameId) => {
    if (room.state !== 'ended') {
      removePlayerFromRoom(socket, playerId, gameId, io)
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
