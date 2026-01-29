import 'dotenv/config'
import { createServer } from 'node:http'

import next from 'next'

import { isDev } from '../constants/env.js'

import { startInactivityMonitor } from './game/cleanup.js'
import {
  handleBackToWaiting,
  handleCheckGameAvailability,
  handleCheckNotReturnedPlayers,
  handleCreateGame,
  handleDisconnecting,
  handleTabHidden,
  handleTabVisible,
  handleEndGame,
  handleJoinGame,
  handleLeaveGame,
  handlePlayerReady,
  handleRequestFirstRoundHint,
  handleRequestPlayerInfo,
  handleRequestSync,
  handleSendMessage,
  handleSendNotice,
  handleStartGame,
  handleTradeFishes,
  handleUserDisconnect,
} from './game/handlers.js'
import { activityTracker } from './game/middleware/activity.js'
import { createSocketServer } from './socket/config.js'

const hostname = 'localhost'
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

const app = next({ dev: isDev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = createSocketServer(httpServer)

  startInactivityMonitor(io)

  io.on('connection', (socket) => {
    activityTracker(socket)

    socket.on('check_game_availability', (data) => handleCheckGameAvailability(socket, data))
    socket.on('create_game', handleCreateGame)
    socket.on('join_game', (data) => handleJoinGame(io, socket, data))
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

    socket.on('leave_game', (data) => handleLeaveGame(io, socket, data))
    socket.on('disconnecting', () => handleDisconnecting(io, socket))
    socket.on('user_disconnect', (data) => handleUserDisconnect(io, socket, data))

    socket.on('request_sync', (data) => handleRequestSync(io, socket, data))

    socket.on('tab_hidden', (data) => handleTabHidden(io, socket, data))
    socket.on('tab_visible', () => handleTabVisible(io, socket))
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
