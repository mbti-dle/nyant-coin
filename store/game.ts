import { create } from 'zustand'

interface GameStoreModel {
  isLeader: boolean
  gameId: string | null
  rounds: number
  setGameId: (id: string) => void
  setGameRounds: (rounds: number) => void
  setIsLeader: (isLeader: boolean) => void
}

const useGameStore = create<GameStoreModel>((set) => ({
  isLeader: false,
  gameId: null,
  rounds: 10,
  setGameId: (id) => set({ gameId: id }),
  setGameRounds: (rounds) => set({ rounds }),
  setIsLeader: (isLeader) => set({ isLeader }),
}))

export default useGameStore
