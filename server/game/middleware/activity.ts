import { Socket } from 'socket.io'

import { getPlayer, updatePlayerStatus } from '../player.js'

/**
 * 모든 소켓 이벤트 발생 시 플레이어의 활동 상태를 업데이트합니다.
 * 이 미들웨어는 플레이어가 살아있는지(lastSeen)를 최신화하여 비활성 정리에 사용됩니다.
 */
export const activityTracker = (socket: Socket) => {
  socket.use(([_], next) => {
    const playerId = getPlayer(socket.id)
    if (playerId) {
      updatePlayerStatus(playerId, true, socket.id)
    }
    next()
  })
}
