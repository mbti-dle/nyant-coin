import { GameResultModel } from '@/types/game'
import { create } from 'zustand'

interface GameStoreModel {
  gameId: string | null
  playerId: string | null
  rounds: number
  isLeader: boolean
  results: GameResultModel[] | null
  setGameId: (id: string) => void
  setPlayerId: (playerId: string) => void
  setGameRounds: (rounds: number) => void
  setIsLeader: (isLeader: boolean) => void
  setResults: (results: GameResultModel[]) => void
}

const useGameStore = create<GameStoreModel>((set) => ({
  gameId: null,
  playerId: null,
  rounds: 10,
  isLeader: false,
  results: null,
  setGameId: (id) => set({ gameId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  setGameRounds: (rounds) => set({ rounds }),
  setIsLeader: (isLeader) => set({ isLeader }),
  setResults: (results) => set({ results }),
}))

export default useGameStore
