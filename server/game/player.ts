import { Socket } from 'socket.io'

import { gameRooms, getRoom, removePlayer, removeRoom } from './store'
import { clearGameTimers } from './timer'

export const removePlayerFromRoom = (socket: Socket, playerId: string, gameId: string) => {
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
    clearGameTimers(gameId)
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
