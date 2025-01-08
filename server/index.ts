import { createServer } from 'node:http'

import next from 'next'

import {
  handleBackToWaiting,
  handleCheckGameAvailability,
  handleCheckNotReturnedPlayers,
  handleCreateGame,
  handleDisconnect,
  handleEndGame,
  handleJoinGame,
  handleLeaveGame,
  handlePlayerReady,
  handleRequestFirstRoundHint,
  handleRequestPlayerInfo,
  handleSendMessage,
  handleSendNotice,
  handleStartGame,
  handleTradeFishes,
} from './game/handlers.js'
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
    socket.on('check_game_availability', (data) => handleCheckGameAvailability(socket, data))
    socket.on('create_game', handleCreateGame)
    socket.on('join_game', (data) => handleJoinGame(socket, data))
    socket.on('request_player_info', (data) => handleRequestPlayerInfo(socket, data))

    socket.on('send_message', (data) => handleSendMessage(io, socket, data))
    socket.on('send_notice', (data) => handleSendNotice(io, data))

    socket.on('start_game', (data) => handleStartGame(io, socket, data))
    socket.on('player_ready', (data) => handlePlayerReady(io, socket, data))
    socket.on('request_first_round_hint', (data) => handleRequestFirstRoundHint(socket, data))
    socket.on('trade_fishes', (data) => handleTradeFishes(io, socket, data))
    socket.on('end_game', (data) => handleEndGame(io, socket, data))

    socket.on('back_to_waiting', (data) => handleBackToWaiting(io, socket, data))
    socket.on('check_not_returned_players', (data) => handleCheckNotReturnedPlayers(socket, data))

    socket.on('leave_game', (data) => handleLeaveGame(socket, data))
    socket.on('disconnect', () => handleDisconnect(socket))
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
