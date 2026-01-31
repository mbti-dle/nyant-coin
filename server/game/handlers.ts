import { Server as SocketIOServer, Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { ERROR_NOTICE } from '../../constants/chat.js'
import { gameConfig } from '../../constants/game.js'
import { TOTAL_GRACE_PERIOD } from '../../constants/socket.js'
import { loadGameHints } from '../../lib/api/hints.js'
import { appLogger } from '../../lib/utils/app-logger.js'
import { generateGameId } from '../../lib/utils/generate-game-id.js'
import {
  GameHistoryModel,
  GameModel,
  PeerConnectionStateModel,
  PlayerModel,
  RoundRecordModel,
} from '../../types/game.js'

import { finalizeGameResults, createCompleteGameSnapshot } from './ending.js'
import { getGameHistory } from './history.js'
import {
  addPlayer,
  clearGraceTimer,
  getPlayer,
  getPlayerStatus,
  handlePlayerLeave,
  updatePlayerStatus,
} from './player.js'
import { addRoom, getRoom, cancelRoomCleanup } from './room.js'
import {
  gameRooms,
  gameTimers,
  gameTimersState,
  playersMap,
  playersReconnecting,
  playersReconnectingSet,
  playersGraceTimers,
} from './store.js'
import { startRoundTimer } from './timer.js'

const startGraceTimer = (
  io: SocketIOServer,
  socket: Socket,
  playerId: string,
  gameId: string,
  reason: 'tab_hidden' | 'disconnect' = 'disconnect'
) => {
  if (playersGraceTimers.has(playerId)) return

  const room = getRoom(gameId)
  const player = room?.players.find((p) => p.id === playerId)
  if (player && room) {
    player.connectionStatus = PeerConnectionStateModel.RECONNECTING
    io.to(gameId).emit('update_players', room.players)
  }

  const timer = setTimeout(() => {
    if (!playersGraceTimers.has(playerId)) return

    handlePlayerLeave(socket, playerId, gameId, io)

    if (socket.connected) {
      socket.emit('player_not_found', {
        gameId,
        message: '유예 시간이 초과되어 게임에서 제거되었습니다.',
        errorCode: 'PLAYER_NOT_FOUND',
      })
    }

    io.to(gameId).emit('player_left', {
      playerId,
      nickname: player?.nickname,
      message:
        reason === 'tab_hidden'
          ? `${player?.nickname || '플레이어'}님이 유예 시간 초과로 퇴장했습니다.`
          : `${player?.nickname || '플레이어'}님의 연결이 끊겨 퇴장했습니다.`,
    })

    playersGraceTimers.delete(playerId)
  }, TOTAL_GRACE_PERIOD)

  playersGraceTimers.set(playerId, timer)
}

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
      prevFishPrice: gameConfig.INITIAL_FISH_PRICE,
      currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
      lastRoundHintResult: '',
      nextRoundHint: '',
    },
    gameResults: [],
    chatLogs: [],
    gameStartTime: 0,
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
  io: SocketIOServer,
  socket: Socket,
  { gameId, nickname, character }: { gameId: string; nickname: string; character: string }
) => {
  cancelRoomCleanup(gameId)
  const room = getRoom(gameId)

  if (!room) {
    socket.emit('join_failure', { message: '존재하지 않는 게임입니다.' })
    return
  }

  if (room.state === 'in_progress') {
    socket.emit('join_failure', { message: '이미 게임이 진행 중입니다.' })
    return
  }

  const existingPlayer = room.players.find((player) => player.nickname === nickname)
  if (existingPlayer) {
    const isOnline = getPlayerStatus(existingPlayer.id)
    const isConnected = existingPlayer.connectionStatus === PeerConnectionStateModel.CONNECTED

    if (isOnline || isConnected) {
      socket.emit('join_failure', { message: '이미 사용 중인 닉네임입니다.' })
      return
    }

    handlePlayerLeave(socket, existingPlayer.id, gameId, io)
  }

  if (room.players.length >= 6) {
    socket.emit('join_failure', { message: '방이 가득 찼습니다.' })
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
      coins: gameConfig.INITIAL_COINS,
      fish: gameConfig.INITIAL_FISH,
      isInWaitingRoom: true,
      connectionStatus: PeerConnectionStateModel.CONNECTED,
    }

    room.players.push(newPlayer)
    room.readyPlayers.add(playerId)
    socket.join(gameId)

    socket.to(gameId).emit('update_players', room.players)
    socket.to(gameId).emit('player_joined', {
      nickname,
      message: `${nickname}님이 입장했습니다.`,
    })
    socket.emit('join_success', {
      gameId,
      playerId,
      setSession: true,
    })
  } catch {
    socket.emit('join_failure', { message: '게임 참가 중 오류가 발생했습니다.' })
  }
}

export const handleLeaveGame = (
  io: SocketIOServer,
  socket: Socket,
  { gameId }: { gameId: string }
) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  const room = getRoom(gameId)
  const player = room?.players.find((p) => p.id === playerId)
  const nickname = player?.nickname

  handlePlayerLeave(socket, playerId, gameId, io)

  io.to(gameId).emit('player_left', {
    playerId,
    nickname,
    message: `${nickname || '플레이어'}님이 게임에서 나갔습니다.`,
  })
}

export const handleTabHidden = (io: SocketIOServer, socket: Socket, data?: { gameId?: string }) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  let gameId = data?.gameId
  if (!gameId) {
    gameId = Array.from(socket.rooms).find((room) => {
      if (room === socket.id) return false
      return getRoom(room) !== undefined
    })
  }

  if (!gameId) return
  startGraceTimer(io, socket, playerId, gameId, 'tab_hidden')
}

export const handleTabVisible = (_io: SocketIOServer, socket: Socket) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return
  clearGraceTimer(playerId)
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
        if (!socketId) return

        const playerSocket = io.sockets.sockets.get(socketId)
        if (playerSocket) {
          handlePlayerLeave(playerSocket, player.id, gameId)
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
      prevFishPrice: gameConfig.INITIAL_FISH_PRICE,
      currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
      lastRoundHintResult: '',
      nextRoundHint: hints[0]?.hint || '',
    }

    room.state = 'in_progress'
    room.gameStartTime = Date.now()

    room.gameResults = []
    room.readyPlayers.clear()

    room.players.forEach((player) => {
      delete player.score
      player.isInWaitingRoom = false
      player.coins = gameConfig.INITIAL_COINS
      player.fish = gameConfig.INITIAL_FISH

      if (getPlayerStatus(player.id)) {
        player.connectionStatus = PeerConnectionStateModel.CONNECTED
      }
    })

    io.to(gameId).emit('game_started', {
      totalRounds: room.totalRounds,
      serverStatus: room.state,
      gameStartTime: room.gameStartTime,
      players: room.players.map((player) => ({
        ...player,
        isOnline: getPlayerStatus(player.id),
      })),
      results: [],
    })
  } catch {
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
    const timerState = gameTimersState.get(gameId)
    if (!timerState?.isRunning) {
      startRoundTimer(io, gameId, room)
      io.to(gameId).emit('all_players_ready')
    }
  }
}

export const handleEndGame = (
  io: SocketIOServer,
  socket: Socket,
  { gameId, result }: { gameId: string; result: { playerId: string; totalCoin: number } }
) => {
  try {
    const room = getRoom(gameId)
    if (!room) return

    const isActuallyEndable = room.gameInfo.currentDay >= room.totalRounds || room.state === 'ended'
    if (!isActuallyEndable) {
      appLogger.warn('[EndGame] invalid end signal ignored', {
        gameId,
        currentDay: room.gameInfo.currentDay,
        totalRounds: room.totalRounds,
        state: room.state,
      })
      return
    }
    room.readyPlayers.clear()
    room.players.forEach((player) => (player.isInWaitingRoom = false))

    const playerIndex = room.players.findIndex((player) => player.id === result.playerId)
    if (playerIndex !== -1) {
      room.players[playerIndex].score = result.totalCoin
    }

    const updateGameResults = () => {
      finalizeGameResults(io, gameId, room)
    }

    if (!gameTimers.has(gameId)) {
      const timer = setTimeout(() => {
        const currentRoom = getRoom(gameId)
        if (currentRoom && currentRoom.state !== 'ended') updateGameResults()
        gameTimers.delete(gameId)
      }, 5000)

      gameTimers.set(gameId, timer)
    }

    const onlinePlayers = room.players.filter((player) => getPlayerStatus(player.id))
    const allPlayersSubmitted =
      onlinePlayers.length > 0 &&
      onlinePlayers.every((player) => typeof player.score === 'number' && player.score >= 0)

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
  } catch {
    socket.emit('error', { message: '게임 결과 제출 중 오류가 발생했습니다.' })
  }
}

export const handleBackToWaiting = (
  io: SocketIOServer,
  socket: Socket,
  { gameId, playerId: providedPlayerId }: { gameId: string; playerId?: string }
) => {
  const room = getRoom(gameId)
  const playerId = providedPlayerId || getPlayer(socket.id)

  if (!room || !playerId) {
    return
  }

  if (room.state === 'ended') {
    room.state = 'waiting'
    room.gameStartTime = 0
  }

  const player = room.players.find((p) => p.id === playerId)
  if (player) {
    player.isInWaitingRoom = true
    room.readyPlayers.add(playerId)
  }

  io.to(gameId).emit('update_players', room.players)

  const gameHistory = getGameHistory(gameId)
  const snapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
  socket.emit('sync_complete', snapshot)
}

export const handleRequestPlayerInfo = (
  socket: Socket,
  { gameId, playerId: clientPlayerId }: { gameId: string; playerId?: string }
) => {
  const room = getRoom(gameId)
  let playerIdFromSocket = getPlayer(socket.id)

  if (room && clientPlayerId && !playerIdFromSocket) {
    const player = room.players.find((p) => p.id === clientPlayerId)
    if (player) {
      playerIdFromSocket = clientPlayerId
      clearGraceTimer(playerIdFromSocket)
      addPlayer(socket.id, playerIdFromSocket)
      updatePlayerStatus(playerIdFromSocket, true, socket.id)
      socket.join(gameId)

      player.connectionStatus = PeerConnectionStateModel.CONNECTED

      if (room.state === 'waiting') {
        player.isInWaitingRoom = true
        room.readyPlayers.add(playerIdFromSocket)
      }

      socket.to(gameId).emit('update_players', room.players)
    }
  }

  if (room && room.state === 'waiting' && playerIdFromSocket) {
    const player = room.players.find((p) => p.id === playerIdFromSocket)
    if (player && !player.isInWaitingRoom) {
      player.isInWaitingRoom = true
      room.readyPlayers.add(playerIdFromSocket)
      socket.to(gameId).emit('update_players', room.players)
    }
  }

  if (room) {
    socket.emit('player_info', {
      players: room.players.map((player) => ({
        ...player,
        isOnline: getPlayerStatus(player.id),
      })),
      playerId: playerIdFromSocket,
      playerInfo: room.players.find((p) => p.id === playerIdFromSocket),
      serverStatus: room.state,
      chatLogs: room.chatLogs,
    })
  }
}

export const handleRequestFirstRoundHint = (socket: Socket, { gameId }: { gameId: string }) => {
  const room = getRoom(gameId)
  if (room) {
    socket.emit('first_round_hint', {
      ...room.gameInfo,
      serverStatus: room.state,
    })
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
    socket.emit('sync_failed', { error: 'gameId가 필요합니다.', errorCode: 'INVALID_GAME_ID' })
    return
  }

  if (playerId) clearGraceTimer(playerId)

  if (!playerId || typeof playerId !== 'string') {
    socket.emit('sync_failed', {
      error: '플레이어 정보가 없습니다. 다시 로그인해주세요.',
      errorCode: 'INVALID_PLAYER_ID',
      requireLogin: true,
    })
    return
  }

  if (gameId) cancelRoomCleanup(gameId)

  const room = getRoom(gameId)
  if (!room) {
    socket.emit('sync_failed', { error: '게임을 찾을 수 없습니다.', errorCode: 'GAME_NOT_FOUND' })
    return
  }

  const player = room.players.find((player) => player.id === playerId)
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
  } catch {
    socket.emit('sync_failed', {
      error: '재연결 처리 중 오류가 발생했습니다.',
      errorCode: 'RECONNECTION_ERROR',
    })
  } finally {
    setTimeout(() => playersReconnectingSet.delete(reconnectKey), 2000)
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

export const handleDisconnecting = (io: SocketIOServer, socket: Socket) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  const rooms = Array.from(socket.rooms)

  let gameId = rooms.find((room) => {
    if (room === socket.id) return false
    return getRoom(room) !== undefined
  })

  if (!gameId && playerId) {
    gameId = Array.from(gameRooms.entries()).find(([_id, room]) =>
      room.players.some((p) => p.id === playerId)
    )?.[0]
  }

  if (!gameId) return

  startGraceTimer(io, socket, playerId, gameId, 'disconnect')
}

export const handleUserDisconnect = (
  io: SocketIOServer,
  socket: Socket,
  { gameId }: { gameId: string }
) => {
  const playerId = getPlayer(socket.id)
  if (!playerId) return

  startGraceTimer(io, socket, playerId, gameId, 'disconnect')
}

export const handleTradeFishes = (
  io: SocketIOServer,
  socket: Socket,
  { gameId, action, amount }: { gameId: string; action: 'buy' | 'sell'; amount: number }
) => {
  const room = getRoom(gameId)
  if (!room) return

  const playerId = getPlayer(socket.id)
  if (!playerId) return

  const player = room.players.find((p) => p.id === playerId)
  if (!player) return

  const message = `${amount}마리 ${action === 'buy' ? '사요!' : '팔아요!'}`
  io.to(gameId).emit('trade_message', { playerId, message })

  const currentPrice = room.gameInfo.currentFishPrice
  const totalValue = amount * currentPrice

  if (action === 'buy') {
    if ((player.coins || 0) < totalValue) {
      socket.emit('error', { message: '보유 코인이 부족합니다.' })
      return
    }
    player.coins = (player.coins || 0) - totalValue
    player.fish = (player.fish || 0) + amount
  } else {
    if ((player.fish || 0) < amount) {
      socket.emit('error', { message: '보유 생선이 부족합니다.' })
      return
    }
    player.fish = (player.fish || 0) - amount
    player.coins = (player.coins || 0) + totalValue
  }

  socket.emit('inventory_update', {
    coins: player.coins,
    fish: player.fish,
    action,
    amount,
    totalValue,
  })

  socket.broadcast.to(gameId).emit('update_players', room.players)
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

  const chatData = {
    type: 'message' as const,
    nickname,
    imageUrl: `/images/cat-${character}.png`,
    message,
  }

  room.chatLogs.push(chatData)
  if (room.chatLogs.length > 50) {
    room.chatLogs.shift()
  }

  io.to(gameId).emit('new_chat_message', chatData)
}

export const handleSendNotice = (
  io: SocketIOServer,
  { gameId, notice }: { gameId: string; notice: string }
) => {
  const room = getRoom(gameId)
  if (!room) return
  const chatData = {
    type: 'notice' as const,
    notice,
  }

  room.chatLogs.push(chatData)
  if (room.chatLogs.length > 50) {
    room.chatLogs.shift()
  }

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
  addPlayer(socket.id, playerId)
  socket.join(gameId)
  updatePlayerStatus(playerId, true, socket.id)
  room.readyPlayers.add(playerId)

  player.connectionStatus = PeerConnectionStateModel.CONNECTED
  socket.broadcast.to(gameId).emit('update_players', room.players)
  socket.broadcast.to(gameId).emit('player_reconnected', {
    nickname: player.nickname,
  })

  const gameHistory = getGameHistory(gameId)
  syncGameState(room, gameHistory)

  if (gameHistory && room.gameInfo.currentDay !== gameHistory.currentRound) {
    const safeRound = Math.min(
      Math.max(room.gameInfo.currentDay, gameHistory.currentRound),
      room.totalRounds
    )
    room.gameInfo.currentDay = safeRound
    gameHistory.currentRound = safeRound
  }

  const completeGameSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
  socket.emit('sync_complete', completeGameSnapshot)

  sendStateSpecificUpdates(io, socket, room, gameId, gameHistory)
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
    room.gameInfo.currentDay =
      safeCurrentRound > expectedNextRound && safeCurrentRound - expectedNextRound > 1
        ? Math.min(expectedNextRound, room.totalRounds)
        : safeCurrentRound

    const currentRoundData = gameHistory.rounds.find(
      (round: RoundRecordModel) => round.roundNumber === room.gameInfo.currentDay
    )

    if (currentRoundData) {
      room.gameInfo.prevFishPrice = room.gameInfo.currentFishPrice
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
    return
  }

  const timerState = gameTimersState.get(gameId)

  const payload = {
    currentRound: actualCurrentRound,
    prevFishPrice: room.gameInfo.prevFishPrice,
    currentFishPrice: room.gameInfo.currentFishPrice,
    hint: room.gameInfo.nextRoundHint,
    lastRoundResult: room.gameInfo.lastRoundHintResult,
    roundHistory: gameHistory?.rounds || [],
    totalRounds: room.totalRounds,
    serverStatus: room.state,
    players: room.players.map((player) => ({
      ...player,
      isOnline: getPlayerStatus(player.id),
    })),
    serverNow: Date.now(),
    gameEndAt: timerState?.isRunning ? timerState.startTime + timerState.duration : null,
    results: room.gameResults,
  }

  socket.emit('complete_round_sync', payload)

  if (timerState?.isRunning) {
    socket.emit('timer_started', {
      serverNow: Date.now(),
      gameEndAt: timerState.startTime + timerState.duration,
    })
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

  const player = room.players.find((player) => player.id === playerId)
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
  if (!history) return expectedRound

  const { currentRound } = history
  return expectedRound > currentRound + 1 ? currentRound + 1 : expectedRound
}
