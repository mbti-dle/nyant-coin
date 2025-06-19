import { Server as SocketIOServer, Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { ERROR_NOTICE } from '../../constants/chat.js'
import { gameConfig } from '../../constants/game.js'
import { loadGameHints } from '../../lib/api/hints.js'
import { generateGameId } from '../../lib/utils/generate-game-id.js'
import { GameHistoryModel, GameModel, PlayerModel, RoundRecordModel } from '../../types/game.js'

import { getGameHistory } from './history.js'
import {
  addPlayer,
  getPlayer,
  getPlayerStatus,
  handlePlayerLeave,
  updatePlayerStatus,
} from './player.js'
import { addRoom, getRoom } from './room.js'
import {
  playersDisconnected,
  gameRooms,
  gameTimers,
  gameTimersState,
  playersMap,
  playersReconnecting,
  playersReconnectingSet,
} from './store.js'
import { startRoundTimer } from './timer.js'

export const handleCreateGame = async (totalRounds: number, joinGame: (gameId: string) => void) => {
  const gameId = generateGameId(gameRooms)

  const newGame: GameModel & { readyPlayers: Set<string> } = {
    gameId,
    totalRounds,
    state: 'waiting',
    hints: [],
    players: [],
    gameInfo: {
      currentDay: 1,
      currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
      lastRoundHintResult: '',
      nextRoundHint: '',
    },
    gameResults: [],
    readyPlayers: new Set(),
  }

  addRoom(gameId, newGame)
  joinGame(gameId)
}

export const handleCheckGameAvailability = (
  socket: Socket,
  { inputGameId: gameId }: { inputGameId: string }
) => {
  const room = getRoom(gameId)
  const gameAvailability = { isAvailable: false, message: '' }

  if (!room) {
    gameAvailability.message = '존재하지 않는 방 코드입니다.'
  } else if (room.state === 'in_progress' || room.state === 'ended') {
    gameAvailability.message = '이미 게임이 진행 중인 방입니다.'
  } else if (room.players.length >= 6) {
    gameAvailability.message = '방이 가득 찼습니다. (최대 6명)'
  } else {
    gameAvailability.isAvailable = true
  }

  socket.emit('is_available_game', gameAvailability)
}

export const handleJoinGame = (
  socket: Socket,
  { gameId, nickname, character }: { gameId: string; nickname: string; character: string }
) => {
  const room = getRoom(gameId)

  if (!room) {
    socket.emit('join_failure', { message: '존재하지 않는 게임입니다.' })
    return
  }

  if (room.state === 'in_progress') {
    socket.emit('join_failure', { message: '이미 게임이 진행 중입니다.' })
    return
  }

  if (room.players.length >= 6) {
    socket.emit('join_failure', { message: '방이 가득 찼습니다.' })
    return
  }

  const existingPlayer = room.players.find((p) => p.nickname === nickname)
  if (existingPlayer) {
    socket.emit('join_failure', { message: '이미 사용 중인 닉네임입니다.' })
    return
  }

  const playerId = uuid()

  try {
    addPlayer(socket.id, playerId)
    updatePlayerStatus(playerId, true, socket.id)

    const newPlayer: PlayerModel = {
      id: playerId,
      nickname,
      character,
      score: 0,
      isInWaitingRoom: true,
    }

    room.players.push(newPlayer)
    room.readyPlayers.add(playerId)
    socket.join(gameId)

    socket.to(gameId).emit('update_players', room.players)
    socket.emit('join_success', { gameId, playerId })
  } catch (error) {
    console.error('플레이어 참가 중 오류:', error)
    socket.emit('join_failure', { message: '게임 참가 중 오류가 발생했습니다.' })
  }
}

export const handleLeaveGame = (socket: Socket, { gameId }: { gameId: string }) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  handlePlayerLeave(socket, playerId, gameId)
}

export const handleStartGame = async (
  io: SocketIOServer,
  socket: Socket,
  { gameId, removePlayers = false }: { gameId: string; removePlayers?: boolean }
) => {
  try {
    const room = getRoom(gameId)

    if (!room) {
      socket.emit('INITIALIZATION_ERROR', { notice: ERROR_NOTICE.initialization_error })
      return
    }

    if (removePlayers) {
      const inactivePlayers = room.players.filter((player) => !room.readyPlayers.has(player.id))

      inactivePlayers.forEach((player) => {
        const socketId = Array.from(playersMap.entries()).find(
          ([_, playerId]) => playerId === player.id
        )?.[0]
        if (socketId) {
          const playerSocket = io.sockets.sockets.get(socketId)
          if (playerSocket) {
            handlePlayerLeave(playerSocket, player.id, gameId)
          }
        }
      })

      room.players = room.players.filter((player) => room.readyPlayers.has(player.id))
      io.to(gameId).emit('update_players', room.players)
    }

    const connectedSockets = io.sockets.adapter.rooms.get(gameId)
    if (!connectedSockets) {
      socket.emit('INITIALIZATION_ERROR', { notice: ERROR_NOTICE.initialization_error })
      return
    }

    const hints = await loadGameHints(room.totalRounds)
    room.hints = hints
    room.gameInfo = {
      currentDay: 1,
      currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
      lastRoundHintResult: '',
      nextRoundHint: hints[0]?.hint || '',
    }

    room.state = 'in_progress'
    io.to(gameId).emit('game_started', { totalRounds: room.totalRounds })
  } catch (error) {
    console.error('Game start error:', error)
    socket.emit('SERVER_ERROR', { notice: ERROR_NOTICE.server_error })
  }
}

export const handlePlayerReady = (
  io: SocketIOServer,
  socket: Socket,
  { gameId }: { gameId: string }
) => {
  const room = getRoom(gameId)
  if (!room || room.state !== 'in_progress') return

  const playerId = getPlayer(socket.id)
  if (!playerId) return

  room.readyPlayers.add(playerId)

  if (room.readyPlayers.size === room.players.length) {
    startRoundTimer(io, gameId, room)
    io.to(gameId).emit('all_players_ready')
  }
}

export const handleEndGame = (
  io: SocketIOServer,
  socket: Socket,
  { gameId, result }: { gameId: string; result: { playerId: string; totalCoin: number } }
) => {
  try {
    const room = getRoom(gameId)
    if (!room) {
      console.error('게임룸을 찾을 수 없습니다:', gameId)
      return
    }

    room.readyPlayers.clear()
    room.players.forEach((player) => (player.isInWaitingRoom = false))

    const playerIndex = room.players.findIndex((player) => player.id === result.playerId)
    if (playerIndex !== -1) {
      room.players[playerIndex].score = result.totalCoin
    }

    const updateGameResults = () => {
      const submittedPlayers = room.players.filter(
        (player) => typeof player.score === 'number' && player.score >= 0
      )

      if (submittedPlayers.length > 0) {
        room.gameResults = submittedPlayers
          .map((player) => ({
            id: player.id,
            nickname: player.nickname,
            character: player.character,
            score: player.score || 0,
          }))
          .sort((a, b) => b.score - a.score)

        room.state = 'ended'
        io.to(gameId).emit('game_ended', { results: room.gameResults })
      }
    }

    if (!gameTimers.has(gameId)) {
      const timer = setTimeout(() => {
        const currentRoom = getRoom(gameId)
        if (currentRoom && currentRoom.state !== 'ended') {
          updateGameResults()
        }
        gameTimers.delete(gameId)
      }, 5000)

      gameTimers.set(gameId, timer)
    }

    const allPlayersSubmitted =
      room.players.length > 0 &&
      room.players.every((player) => typeof player.score === 'number' && player.score >= 0)

    if (allPlayersSubmitted) {
      const timer = gameTimers.get(gameId)
      if (timer) {
        clearTimeout(timer)
        gameTimers.delete(gameId)
      }
      updateGameResults()
    } else if (room.state === 'ended') {
      updateGameResults()
    }
  } catch (error) {
    console.error('게임 결과 제출 중 오류 발생:', error)
    socket.emit('error', { message: '게임 결과 제출 중 오류가 발생했습니다.' })
  }
}

export const handleBackToWaiting = (
  io: SocketIOServer,
  socket: Socket,
  { gameId }: { gameId: string }
) => {
  const room = getRoom(gameId)
  const playerId = getPlayer(socket.id)

  if (!room || !playerId) {
    return
  }

  room.state = 'waiting'
  room.readyPlayers.add(playerId)

  const playerIndex = room.players.findIndex((player) => player.id === playerId)
  if (playerIndex !== -1) {
    room.players[playerIndex] = {
      ...room.players[playerIndex],
      isInWaitingRoom: true,
    }
  }

  io.to(gameId).emit('update_players', room.players)
}

export const handleRequestPlayerInfo = (socket: Socket, { gameId }: { gameId: string }) => {
  const room = getRoom(gameId)
  const playerId = getPlayer(socket.id)

  if (room) {
    socket.emit('player_info', { players: room.players, playerId })
  }
}

export const handleRequestFirstRoundHint = (socket: Socket, { gameId }: { gameId: string }) => {
  const room = getRoom(gameId)
  if (room) {
    socket.emit('first_round_hint', room.gameInfo)
  }
}

export const handleCheckNotReturnedPlayers = (socket: Socket, { gameId }: { gameId: string }) => {
  const room = getRoom(gameId)
  if (room) {
    const notReturnedCount = room.players.length - room.readyPlayers.size
    socket.emit('not_returned_players_count', { count: notReturnedCount })
  }
}

export const handleRequestSync = (
  io: SocketIOServer,
  socket: Socket,
  data: { gameId?: string; playerId?: string; timestamp?: number }
) => {
  const { gameId, playerId } = data

  if (!gameId || typeof gameId !== 'string') {
    socket.emit('sync_failed', {
      error: 'gameId가 필요합니다.',
      errorCode: 'INVALID_GAME_ID',
    })
    return
  }

  if (!playerId || typeof playerId !== 'string') {
    socket.emit('sync_failed', {
      error: '플레이어 정보가 없습니다. 다시 로그인해주세요.',
      errorCode: 'INVALID_PLAYER_ID',
      requireLogin: true,
    })
    return
  }

  const room = getRoom(gameId)
  if (!room) {
    socket.emit('sync_failed', {
      error: '게임을 찾을 수 없습니다.',
      errorCode: 'GAME_NOT_FOUND',
    })
    return
  }

  const player = room.players.find((p) => p.id === playerId)
  if (!player) {
    socket.emit('player_not_found', {
      gameId,
      message: '게임에서 제거되었습니다. 다시 참가해주세요.',
      errorCode: 'PLAYER_NOT_FOUND',
    })
    return
  }

  const reconnectKey = `${gameId}-${playerId}`

  if (playersReconnectingSet.has(reconnectKey)) {
    const gameHistory = getGameHistory(gameId)
    const completeGameSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
    socket.emit('sync_complete', completeGameSnapshot)
    return
  }

  playersReconnectingSet.add(reconnectKey)

  try {
    performPlayerReconnection(io, socket, room, gameId, playerId, player)
  } catch (error) {
    console.error('재연결 처리 중 오류:', error)
    socket.emit('sync_failed', {
      error: '재연결 처리 중 오류가 발생했습니다.',
      errorCode: 'RECONNECTION_ERROR',
    })
  } finally {
    setTimeout(() => {
      playersReconnectingSet.delete(reconnectKey)
    }, 2000)
  }
}

export const handleRoundValidationRequest = (
  socket: Socket,
  { gameId, clientCurrentRound }: { gameId: string; clientCurrentRound: number }
) => {
  const room = getRoom(gameId)
  const gameHistory = getGameHistory(gameId)

  if (!room || !gameHistory) {
    socket.emit('round_validation_failed', { error: '게임을 찾을 수 없습니다.' })
    return
  }

  const serverCurrentRound = room.gameInfo.currentDay

  if (clientCurrentRound !== serverCurrentRound) {
    const gameSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
    socket.emit('round_sync_required', gameSnapshot)
  } else {
    socket.emit('round_validation_success', { currentRound: serverCurrentRound })
  }
}

export const handleDisconnect = (socket: Socket) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  if (playersDisconnected.has(playerId)) {
    const existingTimeout = playersDisconnected.get(playerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
  }

  const timeoutId = setTimeout(() => {
    handlePlayerLeave(socket, playerId)
    playersDisconnected.delete(playerId)
  }, 60000)

  playersDisconnected.set(playerId, timeoutId)
}

export const handleTradeFishes = (
  io: SocketIOServer,
  socket: Socket,
  { gameId, action, amount }: { gameId: string; action: 'buy' | 'sell'; amount: number }
) => {
  const playerId = getPlayer(socket.id)
  const message = `${amount}마리 ${action === 'buy' ? '사요!' : '팔아요!'}`

  io.to(gameId).emit('trade_message', {
    playerId,
    message,
  })
}

export const handleSendMessage = (
  io: SocketIOServer,
  socket: Socket,
  {
    gameId,
    playerId,
    nickname,
    character,
    message,
  }: {
    gameId: string
    playerId: string
    nickname: string
    character: string
    message: string
  }
) => {
  const senderId = getPlayer(socket.id)
  const room = getRoom(gameId)

  if (!senderId || !room) return

  const player = room.players.find((player) => player.id === playerId)
  if (!player) return

  const chatMessage = {
    type: 'message',
    nickname,
    imageUrl: `/images/cat-${character}.png`,
    message,
  }

  io.to(gameId).emit('new_chat_message', chatMessage)
}

export const handleSendNotice = (
  io: SocketIOServer,
  { gameId, notice }: { gameId: string; notice: string }
) => {
  const room = getRoom(gameId)
  if (!room) return

  io.to(gameId).emit('new_chat_notice', { notice })
}

const performPlayerReconnection = (
  io: SocketIOServer,
  socket: Socket,
  room: GameModel & { readyPlayers: Set<string> },
  gameId: string,
  playerId: string,
  player: PlayerModel
) => {
  if (playersDisconnected.has(playerId)) {
    const existingTimeout = playersDisconnected.get(playerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    playersDisconnected.delete(playerId)
  }

  addPlayer(socket.id, playerId)
  socket.join(gameId)
  updatePlayerStatus(playerId, true, socket.id)
  room.readyPlayers.add(playerId)

  const gameHistory = getGameHistory(gameId)
  syncGameState(room, gameHistory)

  if (gameHistory && room.gameInfo.currentDay !== gameHistory.currentRound) {
    const safeRound = Math.min(
      Math.max(room.gameInfo.currentDay, gameHistory.currentRound),
      room.totalRounds
    )
    room.gameInfo.currentDay = safeRound

    if (gameHistory) {
      gameHistory.currentRound = safeRound
    }
  }

  const completeGameSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
  socket.emit('sync_complete', completeGameSnapshot)

  sendStateSpecificUpdates(io, socket, room, gameId, gameHistory)

  socket.to(gameId).emit('player_reconnected', {
    playerId,
    nickname: player.nickname,
  })
}

const syncGameState = (
  room: GameModel & { readyPlayers: Set<string> },
  gameHistory: GameHistoryModel
) => {
  if (!gameHistory) return

  const actualCurrentRound = gameHistory.currentRound || room.gameInfo.currentDay
  const maxValidRound = Math.min(actualCurrentRound, room.totalRounds)
  const safeCurrentRound = Math.max(1, maxValidRound)

  if (room.gameInfo.currentDay !== safeCurrentRound) {
    const expectedNextRound = room.gameInfo.currentDay + 1
    if (safeCurrentRound > expectedNextRound && safeCurrentRound - expectedNextRound > 1) {
      room.gameInfo.currentDay = Math.min(expectedNextRound, room.totalRounds)
    } else {
      room.gameInfo.currentDay = safeCurrentRound
    }

    const currentRoundData = gameHistory.rounds.find(
      (round: RoundRecordModel) => round.roundNumber === room.gameInfo.currentDay
    )

    if (currentRoundData) {
      room.gameInfo.currentFishPrice = currentRoundData.fishPrice
      room.gameInfo.nextRoundHint = currentRoundData.hint
    }
  }
}

const sendStateSpecificUpdates = (
  io: SocketIOServer,
  socket: Socket,
  room: GameModel & { readyPlayers: Set<string> },
  gameId: string,
  gameHistory: GameHistoryModel
) => {
  const actualCurrentRound = gameHistory?.currentRound || room.gameInfo.currentDay

  if (room.state === 'waiting') {
    io.to(gameId).emit('update_players', room.players)
  } else if (room.state === 'in_progress') {
    socket.emit('complete_round_sync', {
      currentRound: actualCurrentRound,
      fishPrice: room.gameInfo.currentFishPrice,
      hint: room.gameInfo.nextRoundHint,
      lastRoundResult: room.gameInfo.lastRoundHintResult,
      roundHistory: gameHistory?.rounds || [],
      totalRounds: room.totalRounds,
      gameState: room.state,
    })

    const timerState = gameTimersState.get(gameId)
    if (timerState?.isRunning) {
      const remainingTime = Math.max(0, timerState.duration - (Date.now() - timerState.startTime))
      socket.emit('timer_started', {
        startTime: timerState.startTime,
        duration: timerState.duration,
        remainingTime,
      })
    }
  }
}

const createCompleteGameSnapshot = (
  room: GameModel & { readyPlayers: Set<string> },
  gameId: string,
  gameHistory: GameHistoryModel
) => {
  const timerState = gameTimersState.get(gameId)
  const actualCurrentRound = gameHistory?.currentRound || room.gameInfo.currentDay

  return {
    gameId: room.gameId,
    gameState: room.state,
    players: room.players.map((player) => ({
      ...player,
      isOnline: getPlayerStatus(player.id),
    })),
    gameInfo: {
      ...room.gameInfo,
      currentDay: actualCurrentRound,
    },
    totalRounds: room.totalRounds,
    currentRound: actualCurrentRound,
    fishPrice: room.gameInfo.currentFishPrice,
    readyPlayersCount: room.readyPlayers.size,
    roundHistory: gameHistory?.rounds || [],
    timerState: timerState
      ? {
          startTime: timerState.startTime,
          duration: timerState.duration,
          isRunning: timerState.isRunning,
          remainingTime: timerState.isRunning
            ? Math.max(0, timerState.duration - (Date.now() - timerState.startTime))
            : 0,
        }
      : null,
    timestamp: Date.now(),
    debugInfo: {
      serverTime: new Date().toISOString(),
      gameStartTime: room.gameStartTime || null,
    },
  }
}

// ========================= 유틸리티 함수들 =========================

export const getReconnectionStatus = (playerId: string) => {
  return {
    isReconnecting: playersReconnecting.has(playerId),
    lastReconnectTime: playersReconnecting.get(playerId),
  }
}

export const validateGameState = (gameId: string) => {
  const room = getRoom(gameId)
  if (!room) return null

  const gameHistory = getGameHistory(gameId)
  const onlinePlayers = room.players.filter((player) => getPlayerStatus(player.id))

  return {
    gameId,
    state: room.state,
    totalPlayers: room.players.length,
    onlinePlayers: onlinePlayers.length,
    readyPlayers: room.readyPlayers.size,
    currentRound: room.gameInfo.currentDay,
    historyRound: gameHistory?.currentRound,
    isStateSynced: !gameHistory || room.gameInfo.currentDay === gameHistory.currentRound,
  }
}

export const forceSync = (io: SocketIOServer, gameId: string, playerId: string) => {
  const room = getRoom(gameId)
  if (!room) return false

  const player = room.players.find((p) => p.id === playerId)
  if (!player) return false

  const socketId = Array.from(playersMap.entries()).find(([_, id]) => id === playerId)?.[0]
  if (!socketId) return false

  const socket = io.sockets.sockets.get(socketId)
  if (!socket) return false

  const gameHistory = getGameHistory(gameId)
  const completeGameSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)

  socket.emit('sync_complete', completeGameSnapshot)
  return true
}

export const validateRoundBeforeTimerStart = (gameId: string, expectedRound: number) => {
  const history = getGameHistory(gameId)

  if (!history) {
    return expectedRound
  }

  const { currentRound } = history

  if (expectedRound > currentRound + 1) {
    return currentRound + 1
  }

  return expectedRound
}
