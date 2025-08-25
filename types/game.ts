export interface PlayerModel {
  id: string
  nickname: string
  character: string
  score?: number
  isInWaitingRoom: boolean
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
  gameStartTime?: number
}

export interface GameSnapshotModel {
  gameId: string
  players: PlayerModel[]
  gameInfo: GameInfoModel
  gameState: GameStateModel
  gameHistory: GameHistoryModel
  gameResults: GameResultModel[]
  currentPlayerId: string
}

export type SocketIdType = string
export type PlayerIdType = string
export type TransactionType = 'buy' | 'sell'
