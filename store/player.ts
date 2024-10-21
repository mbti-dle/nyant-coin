import { create } from 'zustand'

interface PlayerStoreModel {
  isLeader: boolean
  gameId: string | null
  rounds: number
  setGameId: (id: string) => void
  setIsLeader: (isLeader: boolean) => void
}

const usePlayerStore = create<PlayerStoreModel>((set) => ({
  isLeader: false,
  gameId: null,
  rounds: 0,
  setGameId: (id) => set({ gameId: id }),
  setIsLeader: (isLeader) => set({ isLeader }),
}))

export default usePlayerStore
