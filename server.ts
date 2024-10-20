import { createServer } from 'node:http'

import next from 'next'
import { Server as SocketIOServer } from 'socket.io'

import { INITIAL_FISH_PRICE } from './constants/game.js'
import { generateUniqueGameId } from './lib/utils/game.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new SocketIOServer(httpServer)
  const gameRooms = new Map()

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

    socket.on('create_game', (totalRounds) => {
      const gameId = generateUniqueGameId()
      const newGame = {
        gameId,
        totalRounds,
        state: 'waiting',
        hints: [], // TODO: 데이터베이스에서 힌트 불러오기
        players: [],
        gameInfo: {
          currentDay: 1,
          currentFishPrice: INITIAL_FISH_PRICE,
          lastRoundHintResult: '',
          nextRoundHint: '',
        },
      }

      gameRooms.set(gameId, newGame)
    })

    socket.on('join_game', ({ gameId, nickname, character }) => {
      const room = gameRooms.get(gameId)

      if (room) {
        const newPlayer = {
          id: socket.id, // TODO: 보안을 위해 새로 만들기
          nickname,
          character,
          score: 0,
        }
        room.players.push(newPlayer)
        socket.join(gameId)
        socket.to(gameId).emit('update_players', room.players)
      }
    })

    socket.on('disconnect', () => {
      gameRooms.forEach((room) => {
        const playerIndex = room.players.findIndex((player) => player.id === socket.id)
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1)
          socket.to(room.gameId).emit('update_players', room.players)

          if (room.players.length === 0) {
            gameRooms.delete(room.gameId)
          }
        }
      })
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
