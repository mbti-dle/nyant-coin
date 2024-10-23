import { create } from 'zustand'

interface PlayerStoreModel {
  playerId: string
  nickname: string | null
  cat: number
  setPlayerId: (playerId: string) => void
  setNickname: (nickname: string) => void
  setCat: (cat: number) => void
}

const usePlayerStore = create<PlayerStoreModel>((set) => ({
  playerId: null,
  nickname: '',
  cat: 0,
  setPlayerId: (id) => set({ playerId: id }),
  setNickname: (nickname) => set({ nickname }),
  setCat: (cat) => set({ cat }),
}))

export default usePlayerStore
