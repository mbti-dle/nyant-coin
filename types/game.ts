import { ChatType } from './chat'

export const PeerConnectionStateModel = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DEGRADED: 'degraded',
  LOST: 'lost',
} as const

export type PeerConnectionStateType =
  (typeof PeerConnectionStateModel)[keyof typeof PeerConnectionStateModel]

export interface PlayerModel {
  id: string
  nickname: string
  character: string
  score?: number
  coins?: number
  fish?: number
  isInWaitingRoom: boolean
  connectionStatus?: PeerConnectionStateType
}

export interface AvatarModel extends Pick<PlayerModel, 'id' | 'nickname'> {
  imageUrl: string
  isLeader?: boolean
}

export interface GameResultModel extends Pick<PlayerModel, 'id' | 'nickname' | 'character'> {
  score: number
}

export interface GameStateModel {
  coins: number
  fish: number
  inputValue: string
  prevFishPrice: number
  currentFishPrice: number
  currentRound: number
  isModalOpen: boolean
}

export interface TransactionResultModel {
  playerId: string
  message: string
}

export interface HintModel {
  id: number
  hint: string
  expectedChange: 'up' | 'down'
  matchOutcomeHigh: string
  matchOutcomeLow: string
  mismatchOutcomeHigh: string
  mismatchOutcomeLow: string
}

export interface HintContentModel {
  nextRoundHint: string
  lastRoundHintResult: string
}

export interface RoundRecordModel {
  roundNumber: number
  fishPrice: number
  hint: string
  hintResult: string
  timestamp: number
}

export interface GameHistoryModel {
  rounds: RoundRecordModel[]
  currentRound: number
}

export interface GameInfoModel {
  currentDay: number
  prevFishPrice: number
  currentFishPrice: number
  lastRoundHintResult: string
  nextRoundHint: string
}

export interface GameModel {
  gameId: string
  totalRounds: number
  state: 'waiting' | 'in_progress' | 'ended'
  hints: HintModel[]
  gameInfo: GameInfoModel
  players: PlayerModel[]
  gameResults: GameResultModel[]
  chatLogs: ChatType[]
  gameStartTime?: number
}

export type SocketIdType = string
export type PlayerIdType = string
export type TransactionType = 'buy' | 'sell'

export interface SocketModel {
  id: string
  broadcast?: {
    to: (room: string) => {
      emit: (event: string, ...args: unknown[]) => void
    }
  }
}

// Store State Models
export interface GameSessionModel {
  fishPrice: number
  prevFishPrice: number
  currentRound: number
  totalRounds: number
  hint: string
  hintResult: string
  lastRemainingMs: number | null
  savedAtClientTime: number
  lastUpdated: number
  isResultModalOpen: boolean
  finalFishPrice: number
  serverState: 'waiting' | 'in_progress' | 'ended'
}

export interface PlayerInventoryModel {
  coins: number
  fish: number
}

export interface GameStoreStateModel {
  gameId: string | null
  playerId: string | null
  rounds: number
  isLeader: boolean
  gameStartTime: number
  results: GameResultModel[] | null
  hintState: GameSessionModel
  gameState: PlayerInventoryModel
}

export interface GameSyncPayloadModel {
  currentDay?: number
  currentRound?: number
  currentFishPrice?: number
  fishPrice?: number
  nextRoundHint?: string
  hint?: string
  lastRoundHintResult?: string
  lastRoundResult?: string
  hintResult?: string
  totalRounds?: number
  results?: GameResultModel[]
  playerInventory?: PlayerInventoryModel
  serverStatus?: 'waiting' | 'in_progress' | 'ended'
  gameState?: 'waiting' | 'in_progress' | 'ended'
  gameStartTime?: number
  gameEndAt?: number
  timerState?: {
    gameEndAt: number
  }
  serverNow?: number
  gameInfo?: {
    currentDay: number
  } & Record<string, unknown>
  timestamp?: number
  forceUpdate?: boolean
  forceHintUpdate?: boolean
  syncVersion?: string
}

// Page Validation Types
export type PageValidationType = 'setup-rounds' | 'setup-info' | 'waiting' | 'game' | 'result'

export interface PageValidationModel {
  requiredFields: (keyof GameStoreStateModel)[]
  redirectPath: string
}
