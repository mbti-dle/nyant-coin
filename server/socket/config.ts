import { Server as HttpServer } from 'node:http'

import { instrument } from '@socket.io/admin-ui'
import { Server as SocketIOServer } from 'socket.io'

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true,
    },
  })
  instrument(io, {
    auth: false,
  })

  return io
}
