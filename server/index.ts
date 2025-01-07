import { createServer } from 'node:http'

import next from 'next'
import { v4 as uuid } from 'uuid'

import { ERROR_NOTICE } from '../constants/chat.js'
import { gameConfig } from '../constants/game.js'
import { loadGameHints } from '../lib/api/hints.js'
import { generateGameId } from '../lib/utils/generate-game-id.js'
import { GameModel, PlayerModel } from '../types/game.js'

import { handlePlayerLeave } from './game/player.js'
import {
  gameRooms,
  playersMap,
  gameTimers,
  getRoom,
  addRoom,
  addPlayer,
  getPlayerId,
} from './game/store.js'
import { startGameTimer } from './game/timer.js'
import { createSocketServer } from './socket/config.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = createSocketServer(httpServer)

  io.on('connection', (socket) => {
    socket.on('check_game_availability', ({ inputGameId: gameId }) => {
      const room = getRoom(gameId)

      const gameAvailability = {
        isAvailable: false,
        message: '',
      }

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

      addRoom(gameId, newGame)
      joinGame(gameId)
    })

    socket.on('join_game', ({ gameId, nickname, character }) => {
      const room = getRoom(gameId)

      if (room) {
        if (room.state === 'in_progress') {
          socket.emit('join_failure')
          return
        }
        const playerId = uuid()
        addPlayer(socket.id, playerId)

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

        socket.emit('join_success', gameId)
      }
    })

    socket.on('request_player_info', ({ gameId }) => {
      const room = getRoom(gameId)
      const playerId = getPlayerId(socket.id)

      if (room) {
        socket.emit('player_info', { players: room.players, playerId })
      }
    })

    socket.on('send_message', ({ gameId, playerId, nickname, character, message }) => {
      const senderId = getPlayerId(socket.id)
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
    })

    socket.on('send_notice', ({ gameId, notice }) => {
      const room = getRoom(gameId)
      if (!room) return

      io.to(gameId).emit('new_chat_notice', { notice })
    })

    socket.on('start_game', async ({ gameId, removePlayers = false }) => {
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
    })

    socket.on('player_ready', ({ gameId }) => {
      const room = getRoom(gameId)
      if (!room || room.state !== 'in_progress') return

      const playerId = getPlayerId(socket.id)
      if (!playerId) return

      room.readyPlayers.add(playerId)

      if (room.readyPlayers.size === room.players.length) {
        startGameTimer(io, gameId, room)
        io.to(gameId).emit('all_players_ready')
      }
    })

    socket.on('end_game', ({ gameId, result }) => {
      try {
        const room = getRoom(gameId)
        room.readyPlayers.clear()

        if (!room) {
          console.error('게임룸을 찾을 수 없습니다:', gameId)
          return
        }

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

            io.to(gameId).emit('game_ended', {
              results: room.gameResults,
            })
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
    })

    socket.on('request_first_round_hint', ({ gameId }) => {
      const room = getRoom(gameId)

      if (room) {
        socket.emit('first_round_hint', room.gameInfo)
      }
    })

    socket.on('trade_fishes', ({ gameId, action, amount }) => {
      const playerId = getPlayerId(socket.id)
      const message = `${amount}마리 ${action === 'buy' ? '사요!' : '팔아요!'}`

      io.to(gameId).emit('trade_message', {
        playerId,
        message,
      })
    })

    socket.on('back_to_waiting', ({ gameId }) => {
      const room = getRoom(gameId)
      const playerId = getPlayerId(socket.id)

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
    })

    socket.on('check_not_returned_players', ({ gameId }) => {
      const room = getRoom(gameId)
      if (room) {
        const notReturnedCount = room.players.length - room.readyPlayers.size
        socket.emit('not_returned_players_count', { count: notReturnedCount })
      }
    })

    socket.on('leave_game', ({ gameId }) => {
      const playerId = getPlayerId(socket.id)
      if (!playerId) return

      handlePlayerLeave(socket, playerId, gameId)
    })

    socket.on('disconnect', () => {
      const playerId = getPlayerId(socket.id)
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
