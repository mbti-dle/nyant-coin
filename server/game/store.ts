import { GameHistoryModel, GameModel, PlayerIdType, SocketIdType } from '../../types/game.js'

export const gameRooms = new Map<string, GameModel & { readyPlayers: Set<string> }>()
export const gameHistory = new Map<string, GameHistoryModel>()

export const playersMap = new Map<SocketIdType, PlayerIdType>()
export const playersStatus = new Map<
  PlayerIdType,
  {
    isOnline: boolean
    lastSeen: number
    socketId?: SocketIdType
  }
>()

export const playersReconnecting = new Map<PlayerIdType, number>()
export const playersReconnectingSet = new Set<string>()
export const playersGraceTimers = new Map<PlayerIdType, NodeJS.Timeout | boolean>()
export const roomCleanupTimers = new Map<string, NodeJS.Timeout>()

export const gameTimers = new Map<string, NodeJS.Timeout>()
export const roundTimers = new Map<string, NodeJS.Timeout>()
export const gameTimersState = new Map<
  string,
  {
    startTime: number
    duration: number
    isRunning: boolean
    round: number
  }
>()

export const roundProgress = new Map<
  string,
  {
    gameId: string
    currentRound: number
    isTransitioning: boolean
    lastUpdateTime: number
    lastValidatedRound: number
  }
>()
