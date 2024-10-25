export interface AvatarModel {
  imageUrl: string
  nickName: string
  isLeader?: boolean
  id: string
}

export interface TransactionResultModel {
  message: string
  key: number
}

export interface GameStateModel {
  coins: number
  fish: number
  inputValue: string
  fishPrice: number
  currentRound: number
  isModalOpen: boolean
}

export interface GameModel {
  gameId: string
  totalRounds: number
  state: 'waiting' | 'in_progress' | 'ended'
  hints: HintModel[]
  gameInfo: {
    currentDay: number
    currentFishPrice: number
    lastRoundHintResult: string
    nextRoundHint: string
  }
  players: PlayerModel[]
}

export interface PlayerModel {
  id: string
  nickname: string
  character: string
  score: number
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

export type SocketIdType = string
export type PlayerIdType = string
