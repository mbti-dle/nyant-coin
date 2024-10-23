import { createServer } from 'node:http'

import { instrument } from '@socket.io/admin-ui'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { gameConfig } from './constants/game.js'
import { generateGameId } from './lib/utils/generate-game-id.js'
import { GameModel, PlayerIdType, PlayerModel, SocketIdType } from './types/game.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

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

    // 게임 만들기
    socket.on('create_game', (totalRounds, joinGame) => {
      const gameId = generateGameId(gameRooms)
      const newGame: GameModel = {
        gameId,
        totalRounds,
        state: 'waiting',
        hints: [], // TODO: 데이터베이스에서 힌트 불러오기
        players: [],
        gameInfo: {
          currentDay: 1,
          currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
          lastRoundHintResult: '',
          nextRoundHint: '',
        },
      }

      gameRooms.set(gameId, newGame)
      joinGame(gameId)
    })

    // 대기실 입장하기
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

    // 대기실 정보 가져오기
    socket.on('request_players_info', (gameId) => {
      const room = gameRooms.get(gameId)

      if (room) {
        socket.emit('players_info', room.players)
      }
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
