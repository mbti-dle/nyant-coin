import { createServer } from 'node:http'

import { instrument } from '@socket.io/admin-ui'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { ERROR_NOTICE } from './constants/chat.js'
import { gameConfig } from './constants/game.js'
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

  const gameRooms = new Map<string, GameModel>()
  const playersMap = new Map<SocketIdType, PlayerIdType>()

  const updateNextRoundGame = async (gameId: string) => {}

  io.on('connection', (socket) => {
    socket.on('check_game_availability', (gameId) => {
      const room = gameRooms.get(gameId)

      const gameAvailability = {
        isAvailable: false,
        message: '',
      }

      if (!room) {
        gameAvailability.message = '존재하지 않는 방 코드입니다.'
      } else if (room.state !== 'waiting') {
        gameAvailability.message = '이미 게임이 진행 중인 방입니다.'
      } else if (room.players.length >= 6) {
        gameAvailability.message = '방이 가득 찼습니다. (최대 6명)'
      } else {
        gameAvailability.isAvailable = true
      }

      socket.emit('is_available_game', gameAvailability)
    })

    socket.on('create_game', async (totalRounds, joinGame) => {
      const gameId = generateGameId(gameRooms)
      const hints = await loadGameHints(totalRounds)

      const newGame: GameModel = {
        gameId,
        totalRounds,
        state: 'waiting',
        hints,
        players: [],
        gameInfo: {
          currentDay: 1,
          currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
          lastRoundHintResult: '',
          nextRoundHint: hints[0]?.hint || '',
        },
      }

      gameRooms.set(gameId, newGame)
      io.to(gameId).emit('update_game_info', newGame.gameInfo)
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

    socket.on('start_game', ({ gameId }) => {
      try {
        const room = gameRooms.get(gameId)

        if (!room) {
          socket.emit('INITIALIZATION_ERROR', { notice: ERROR_NOTICE.initialization_error })
          return
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

        io.to(gameId).emit('game_started', { totalRounds: room.totalRounds })
      } catch (error) {
        console.error('Game start error:', error)
        socket.emit('SERVER_ERROR', { notice: ERROR_NOTICE.server_error })
      }
    })

    socket.on('request_first_round_hint', ({ gameId }) => {
      const room = gameRooms.get(gameId)

      if (room) {
        socket.emit('first_round_hint', room.gameInfo)
      }
    })

    socket.on('change_next_round', async (gameId) => {
      try {
        const room = gameRooms.get(gameId)
        const currentHint = room.hints[room.gameInfo.currentDay - 1]
        if (!room || !currentHint) return

        room.gameInfo.currentDay += 1

        const isHintMatched = shouldHintMatch()

        const prevHint = room.hints[room.gameInfo.currentDay - 2]
        const priceChangeDirection = isHintMatched
          ? prevHint.expectedChange
          : prevHint.expectedChange === 'up'
            ? 'down'
            : 'up'

        const oldPrice = room.gameInfo.currentFishPrice
        const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

        const isHighChange = isPriceChangeHigh(oldPrice, newPrice)
        let outcomeMessage = ''

        if (isHintMatched) {
          outcomeMessage = isHighChange ? prevHint.matchOutcomeHigh : prevHint.matchOutcomeLow
        } else {
          outcomeMessage = isHighChange ? prevHint.mismatchOutcomeHigh : prevHint.mismatchOutcomeLow
        }

        room.gameInfo = {
          ...room.gameInfo,
          currentFishPrice: newPrice,
          lastRoundHintResult: outcomeMessage,
          nextRoundHint: currentHint?.hint,
        }

        io.to(gameId).emit('update_game_info', room.gameInfo)
      } catch (error) {
        console.error('다음 라운드로 게임을 업데이트하는데 실패하였습니다.', error)
      }
    })

    socket.on('request_last_fish_price', (gameId) => {
      try {
        const room = gameRooms.get(gameId)
        if (!room) return

        const prevHint = room.hints[room.gameInfo.currentDay - 2]
        if (!prevHint) return

        const isHintMatched = shouldHintMatch()

        const priceChangeDirection = isHintMatched
          ? prevHint.expectedChange
          : prevHint.expectedChange === 'up'
            ? 'down'
            : 'up'

        const oldPrice = room.gameInfo.currentFishPrice
        const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

        io.to(gameId).emit('last_fish_price', newPrice)
      } catch (error) {
        console.error('마지막 라운드의 생선 가격을 갖고오는데 실패하였습니다.', error)
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

    socket.on('disconnect', () => {
      const playerId = playersMap.get(socket.id)

      if (playerId) {
        gameRooms.forEach((room) => {
          const playerIndex = room.players.findIndex((player) => player.id === playerId)
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1)
            socket.to(room.gameId).emit('update_players', room.players)

            if (room.players.length === 0) {
              gameRooms.delete(room.gameId)
            }
          }
        })

        playersMap.delete(socket.id)
      }
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
