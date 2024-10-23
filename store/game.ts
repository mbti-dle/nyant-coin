import { create } from 'zustand'

interface GameStoreModel {
  isLeader: boolean
  gameId: string | null
  rounds: number
  setGameId: (id: string) => void
  setIsLeader: (isLeader: boolean) => void
}

const useGameStore = create<GameStoreModel>((set) => ({
  isLeader: false,
  gameId: null,
  rounds: 0,
  setGameId: (id) => set({ gameId: id }),
  setIsLeader: (isLeader) => set({ isLeader }),
}))

export default useGameStore
