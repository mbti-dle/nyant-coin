import { Server as HttpServer } from 'node:http'

import { instrument } from '@socket.io/admin-ui'
import { Server as SocketIOServer } from 'socket.io'

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    connectTimeout: 45000,
  })

  instrument(io, {
    auth: false,
  })

  return io
}
