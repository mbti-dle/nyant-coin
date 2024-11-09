import { createServer } from 'node:http'

import { instrument } from '@socket.io/admin-ui'
import next from 'next'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { ERROR_NOTICE } from './constants/chat.js'
import { gameConfig, PRICE_THRESHOLD } from './constants/game.js'
import { loadGameHints } from './lib/api/hints.js'
import { generateNewFishPrice, isPriceChangeHigh, shouldHintMatch } from './lib/utils/game.js'
import { generateGameId } from './lib/utils/generate-game-id.js'
import { GameModel, PlayerIdType, PlayerModel, SocketIdType } from './types/game.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true,
    },
  })
  instrument(io, {
    auth: false,
  })

  const gameRooms = new Map<string, GameModel & { readyPlayers: Set<string> }>()
  const playersMap = new Map<SocketIdType, PlayerIdType>()
  const gameTimers = new Map<string, NodeJS.Timeout>()
  const roundTimers = new Map<string, NodeJS.Timeout>()

  const startGameTimer = (gameId: string, room: GameModel & { readyPlayers: Set<string> }) => {
    if (!room || room.state !== 'in_progress') {
      console.error('게임을 시작할 수 없는 상태입니다')
      return
    }

    if (room.gameInfo.currentDay < 1 || room.gameInfo.currentDay > room.totalRounds) {
      console.error('유효하지 않은 라운드입니다')
      room.gameInfo.currentDay = Math.max(1, Math.min(room.totalRounds, room.gameInfo.currentDay))
    }

    const existingTimer = roundTimers.get(gameId)
    if (existingTimer) {
      clearInterval(existingTimer)
      roundTimers.delete(gameId)
    }

    let timer = gameConfig.INITIAL_TIMER
    const intervalId = setInterval(() => {
      const currentRoom = gameRooms.get(gameId)
      if (!currentRoom || currentRoom.state !== 'in_progress') {
        clearInterval(intervalId)
        roundTimers.delete(gameId)
        return
      }

      timer -= 1
      io.to(gameId).emit('timer_update', timer)

      if (timer === 0) {
        clearInterval(intervalId)
        roundTimers.delete(gameId)

        try {
          const isLastRound = currentRoom.gameInfo.currentDay === currentRoom.totalRounds

          if (isLastRound) {
            try {
              const prevHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 2]
              if (!prevHint) return

              const isHintMatched = shouldHintMatch()
              const priceChangeDirection = isHintMatched
                ? prevHint.expectedChange
                : prevHint.expectedChange === 'up'
                  ? 'down'
                  : 'up'

              const oldPrice = currentRoom.gameInfo.currentFishPrice
              const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

              io.to(gameId).emit('last_fish_price', newPrice)
            } catch (error) {
              console.error('마지막 라운드의 생선 가격을 계산하는데 실패하였습니다.', error)
            }
          } else {
            try {
              if (currentRoom.gameInfo.currentDay >= currentRoom.totalRounds) {
                console.error('현재 라운드가 전체 라운드 수를 초과하였습니다.')
                return
              }

              currentRoom.gameInfo.currentDay += 1

              if (currentRoom.gameInfo.currentDay > currentRoom.totalRounds) {
                console.error('라운드 수가 전체 라운드 수를 초과하였습니다.')
                currentRoom.gameInfo.currentDay = currentRoom.totalRounds
              }

              const currentPrice = currentRoom.gameInfo.currentFishPrice

              let isHintMatched = shouldHintMatch()
              const currentHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 1]
              const prevHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 2]

              if (
                currentPrice <= PRICE_THRESHOLD.MIN_SAFE_PRICE &&
                prevHint?.expectedChange === 'down'
              ) {
                isHintMatched = false
              } else if (
                currentPrice >= PRICE_THRESHOLD.MAX_SAFE_PRICE &&
                prevHint?.expectedChange === 'up'
              ) {
                isHintMatched = false
              }

              const priceChangeDirection = isHintMatched
                ? prevHint.expectedChange
                : prevHint.expectedChange === 'up'
                  ? 'down'
                  : 'up'

              const oldPrice = currentRoom.gameInfo.currentFishPrice
              const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

              const isHighChange = isPriceChangeHigh(oldPrice, newPrice)
              let outcomeMessage = ''

              if (isHintMatched) {
                outcomeMessage = isHighChange ? prevHint.matchOutcomeHigh : prevHint.matchOutcomeLow
              } else {
                outcomeMessage = isHighChange
                  ? prevHint.mismatchOutcomeHigh
                  : prevHint.mismatchOutcomeLow
              }

              currentRoom.gameInfo = {
                ...currentRoom.gameInfo,
                currentFishPrice: newPrice,
                lastRoundHintResult: outcomeMessage,
                nextRoundHint: currentHint?.hint || '',
              }

              io.to(gameId).emit('update_game_info', currentRoom.gameInfo)

              startGameTimer(gameId, currentRoom)
            } catch (error) {
              console.error('다음 라운드로 게임을 업데이트하는데 실패하였습니다.', error)
              if (currentRoom) {
                io.to(gameId).emit('update_game_info', currentRoom.gameInfo)
              }
            }
          }
        } catch (error) {
          console.error('Round update error:', error)
          if (currentRoom) {
            io.to(gameId).emit('update_game_info', currentRoom.gameInfo)
          }
        }
      }
    }, 1000)

    roundTimers.set(gameId, intervalId)
  }

  const clearGameTimers = (gameId: string) => {
    const gameTimer = gameTimers.get(gameId)
    if (gameTimer) {
      clearTimeout(gameTimer)
      gameTimers.delete(gameId)
    }

    const roundTimer = roundTimers.get(gameId)
    if (roundTimer) {
      clearInterval(roundTimer)
      roundTimers.delete(gameId)
    }
  }

  const removePlayerFromRoom = (
    socket: Socket,
    playerId: string,
    room: GameModel & { readyPlayers: Set<string> },
    gameId: string
  ) => {
    const playerIndex = room.players.findIndex((player) => player.id === playerId)
    if (playerIndex === -1) {
      return false
    }

    room.players.splice(playerIndex, 1)
    room.readyPlayers.delete(playerId)
    socket.to(gameId).emit('update_players', room.players)

    if (room.players.length === 0) {
      clearGameTimers(gameId)
      gameRooms.delete(gameId)
    }

    return true
  }

  const handlePlayerLeave = (socket: Socket, playerId: string, leaveGameId?: string) => {
    if (leaveGameId) {
      const room = gameRooms.get(leaveGameId)
      if (!room || room.state === 'ended') {
        return
      }

      if (removePlayerFromRoom(socket, playerId, room, leaveGameId)) {
        playersMap.delete(socket.id)
      }
      return
    }

    gameRooms.forEach((room, gameId) => {
      if (room.state !== 'ended') {
        removePlayerFromRoom(socket, playerId, room, gameId)
      }
    })
    playersMap.delete(socket.id)
  }

  io.on('connection', (socket) => {
    socket.on('check_game_availability', (gameId) => {
      const room = gameRooms.get(gameId)

      const gameAvailability = {
        isAvailable: false,
        message: '',
      }

      if (!room) {
        gameAvailability.message = '존재하지 않는 방 코드입니다.'
      } else if (room.state === 'in_progress') {
        gameAvailability.message = '이미 게임이 진행 중인 방입니다.'
      } else if (room.players.length >= 6) {
        gameAvailability.message = '방이 가득 찼습니다. (최대 6명)'
      } else {
        if (room.state === 'ended') {
          room.state = 'waiting'
          room.readyPlayers.clear()
        }
        gameAvailability.isAvailable = true
      }

      socket.emit('is_available_game', gameAvailability)
    })

    socket.on('create_game', async (totalRounds, joinGame) => {
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

      gameRooms.set(gameId, newGame)
      joinGame(gameId)
    })

    socket.on('join_game', ({ gameId, nickname, character }) => {
      const room = gameRooms.get(gameId)

      if (room) {
        const playerId = uuid()
        playersMap.set(socket.id, playerId)

        const newPlayer: PlayerModel = {
          id: playerId,
          nickname,
          character,
          score: 0,
        }

        room.players.push(newPlayer)
        socket.join(gameId)
        socket.to(gameId).emit('update_players', room.players)

        socket.emit('join_success', gameId)
      }
    })

    socket.on('request_player_info', (gameId) => {
      const room = gameRooms.get(gameId)
      const playerId = playersMap.get(socket.id)

      if (room) {
        socket.emit('player_info', { players: room.players, playerId })
      }
    })

    socket.on('send_message', ({ gameId, playerId, nickname, character, message }) => {
      const senderId = playersMap.get(socket.id)
      const room = gameRooms.get(gameId)

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
    })

    socket.on('send_notice', ({ gameId, notice }) => {
      const room = gameRooms.get(gameId)
      if (!room) return

      io.to(gameId).emit('new_chat_notice', { notice })
    })

    socket.on('start_game', async ({ gameId }) => {
      try {
        const room = gameRooms.get(gameId)

        if (!room) {
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

        if (!room.hints || room.hints.length === 0) {
          socket.emit('HINTS_NOT_LOADED', { notice: ERROR_NOTICE.hints_not_loaded })
          return
        }

        const connectedSockets = io.sockets.adapter.rooms.get(gameId)

        if (!connectedSockets || connectedSockets.size !== room.players.length) {
          io.to(gameId).emit('NETWORK_ERROR', { notice: ERROR_NOTICE.network_error })
          return
        }

        room.state = 'in_progress'
        room.readyPlayers.clear()

        io.to(gameId).emit('game_started', { totalRounds: room.totalRounds })
      } catch (error) {
        console.error('Game start error:', error)
        socket.emit('SERVER_ERROR', { notice: ERROR_NOTICE.server_error })
      }
    })

    socket.on('player_ready', ({ gameId }) => {
      const room = gameRooms.get(gameId)
      if (!room || room.state !== 'in_progress') return

      const playerId = playersMap.get(socket.id)
      if (!playerId) return

      room.readyPlayers.add(playerId)

      if (room.readyPlayers.size === room.players.length) {
        startGameTimer(gameId, room)
        io.to(gameId).emit('all_players_ready')
      }
    })

    socket.on('request_first_round_hint', ({ gameId }) => {
      const room = gameRooms.get(gameId)

      if (room) {
        socket.emit('first_round_hint', room.gameInfo)
      }
    })

    socket.on('trade_fishes', ({ gameId, action, amount }) => {
      const playerId = playersMap.get(socket.id)
      const message = `${amount}마리 ${action === 'buy' ? '사요!' : '팔아요!'}`

      io.to(gameId).emit('trade_message', {
        playerId,
        message,
      })
    })

    socket.on('request_game_results', ({ gameId }) => {
      const room = gameRooms.get(gameId)

      const playerId = playersMap.get(socket.id)
      socket.emit('game_results', {
        results: room.gameResults,
        currentPlayerId: playerId,
      })
    })

    socket.on('end_game', ({ gameId, result }) => {
      try {
        const room = gameRooms.get(gameId)
        if (!room) {
          console.error('게임룸을 찾을 수 없습니다:', gameId)
          return
        }

        const playerIndex = room.players.findIndex((p) => p.id === result.playerId)
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

            io.to(gameId).emit('game_ended', {
              results: room.gameResults,
            })
          }
        }

        if (!gameTimers.has(gameId)) {
          const timer = setTimeout(() => {
            const currentRoom = gameRooms.get(gameId)
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
    })

    socket.on('leave_game', ({ gameId }) => {
      const playerId = playersMap.get(socket.id)
      if (!playerId) return

      handlePlayerLeave(socket, playerId, gameId)
    })

    socket.on('disconnect', () => {
      const playerId = playersMap.get(socket.id)
      if (!playerId) return

      handlePlayerLeave(socket, playerId)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
