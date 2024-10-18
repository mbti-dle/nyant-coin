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
