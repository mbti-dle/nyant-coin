import { Server as SocketIOServer } from 'socket.io'

import { GameModel, GameHistoryModel } from '../../types/game.js'

import { getGameHistory } from './history.js'
import { getPlayerStatus } from './player.js'
import { gameTimersState } from './store.js'

/**
 * 게임 종료 시점의 전체 상태를 클라이언트와 동기화하기 위한
 * 스냅샷 객체를 생성합니다.
 */
export const createCompleteGameSnapshot = (
  room: GameModel & { readyPlayers: Set<string> },
  _gameId: string,
  gameHistory: GameHistoryModel
) => {
  const timerState = gameTimersState.get(room.gameId)
  const actualCurrentRound = gameHistory?.currentRound || room.gameInfo.currentDay

  const snapshot = {
    gameId: room.gameId,
    serverStatus: room.state,
    gameStartTime: room.gameStartTime,
    results: room.gameResults,
    players: room.players.map((player) => ({
      ...player,
      isOnline: getPlayerStatus(player.id),
    })),
    chatLogs: room.chatLogs,
    gameInfo: {
      ...room.gameInfo,
      currentDay: actualCurrentRound,
    },
    totalRounds: room.totalRounds,
    currentRound: actualCurrentRound,
    prevFishPrice: room.gameInfo.prevFishPrice,
    currentFishPrice: room.gameInfo.currentFishPrice,
    readyPlayersCount: room.readyPlayers.size,
    roundHistory: gameHistory?.rounds || [],
    serverNow: Date.now(),
    gameEndAt: timerState?.isRunning ? timerState.startTime + timerState.duration : null,
    timestamp: Date.now(),
    debugInfo: {
      serverTime: new Date().toISOString(),
      gameStartTime: room.gameStartTime || null,
    },
  }

  return snapshot
}

/**
 * 점수가 제출된 플레이어가 존재할 경우
 * 게임 결과를 확정하고 종료 이벤트 및 최종 상태를 전송합니다.
 *
 * @returns 게임이 정상적으로 종료되었는지 여부
 */
export const finalizeGameResults = (
  io: SocketIOServer,
  gameId: string,
  room: GameModel & { readyPlayers: Set<string> }
) => {
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
    const results = room.gameResults || []
    io.to(gameId).emit('game_ended', { results })

    const gameHistory = getGameHistory(gameId)
    const completeSnapshot = createCompleteGameSnapshot(room, gameId, gameHistory)
    io.to(gameId).emit('sync_complete', completeSnapshot)

    console.log('[GameEnd] Game finalized successfully', { gameId, resultsCount: results.length })
    return true
  }

  return false
}
