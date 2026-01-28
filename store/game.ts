import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { gameConfig } from '@/constants/game'
import { GameResultModel, GameStateModel } from '@/types/game'

interface GameSessionModel {
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

interface PlayerInventoryModel {
  coins: number
  fish: number
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
  gameStartTime?: number
  timestamp?: number
  forceUpdate?: boolean
  forceHintUpdate?: boolean
  syncVersion?: string
}

interface GameStoreModel {
  gameId: string | null
  playerId: string | null
  rounds: number
  isLeader: boolean
  gameStartTime: number
  results: GameResultModel[] | null
  hintState: GameSessionModel
  gameState: PlayerInventoryModel
  setGameId: (id: string | null) => void
  setPlayerId: (id: string | null) => void
  setGameRounds: (rounds: number) => void
  setIsLeader: (isLeader: boolean) => void
  setResults: (results: GameResultModel[]) => void
  resetResults: () => void
  updateHintState: (update: Partial<GameSessionModel>) => void
  setFishPrice: (price: number, prevPrice?: number) => void
  setCurrentRound: (round: number) => void
  setHint: (hint: string) => void
  setHintResult: (result: string) => void
  setTimerPersistence: (remainingMs: number | null) => void
  resetGameState: () => void
  syncGameInfo: (gameInfo: GameSyncPayloadModel) => void
  updatePlayerInventory: (update: Partial<PlayerInventoryModel>) => void
  setFinalResultState: (price: number) => void
  closeResultModal: () => void
  hardResetSession: () => void
  isHydrated: boolean
}

const createInitialHintState = (): GameSessionModel => ({
  fishPrice: 100,
  prevFishPrice: 100,
  currentRound: 1,
  totalRounds: 10,
  hint: '',
  hintResult: '',
  lastRemainingMs: null,
  savedAtClientTime: Date.now(),
  lastUpdated: Date.now(),
  isResultModalOpen: false,
  finalFishPrice: 0,
  serverState: 'waiting',
})

const createInitialLocalState = (): PlayerInventoryModel => ({
  coins: gameConfig.INITIAL_COINS,
  fish: gameConfig.INITIAL_FISH,
})

const getInitialState = () => ({
  gameId: null,
  playerId: null,
  rounds: 10,
  isLeader: false,
  gameStartTime: 0,
  results: null,
  hintState: createInitialHintState(),
  gameState: createInitialLocalState(),
  isHydrated: false,
})

const useGameStore = create<GameStoreModel>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      setGameId: (id) => set({ gameId: id }),
      setPlayerId: (id) => set({ playerId: id }),
      setGameRounds: (rounds) => set({ rounds }),
      setIsLeader: (isLeader) => set({ isLeader }),
      setResults: (results) => set({ results }),
      resetResults: () => set({ results: null }),
      updateHintState: (update) => {
        const currentState = get().hintState
        const hasChanges = Object.entries(update).some(([key, value]) => {
          return currentState[key as keyof GameSessionModel] !== value
        })

        if (!hasChanges) return

        set((state) => ({
          hintState: {
            ...state.hintState,
            ...update,
            lastUpdated: Date.now(),
          },
        }))
      },
      setFishPrice: (price, prevPrice) => {
        const currentState = get().hintState
        get().updateHintState({
          fishPrice: price,
          prevFishPrice: prevPrice ?? currentState.fishPrice,
        })
      },
      setCurrentRound: (round) => {
        get().updateHintState({ currentRound: round })
      },
      setHint: (hint) => {
        get().updateHintState({ hint })
      },
      setHintResult: (result) => {
        get().updateHintState({ hintResult: result })
      },
      setTimerPersistence: (remainingMs) => {
        get().updateHintState({
          lastRemainingMs: remainingMs,
          savedAtClientTime: Date.now(),
        })
      },
      syncGameInfo: (gameInfo) => {
        const currentState = get().hintState
        const updates: Partial<GameSessionModel> = {}

        const currentRound = gameInfo.currentRound ?? gameInfo.currentDay
        const fishPrice = gameInfo.fishPrice ?? gameInfo.currentFishPrice
        const hint = gameInfo.hint ?? gameInfo.nextRoundHint
        const hintResult = gameInfo.hintResult ?? gameInfo.lastRoundHintResult

        if (currentRound !== undefined) updates.currentRound = currentRound
        if (fishPrice !== undefined) {
          updates.prevFishPrice = currentState.fishPrice
          updates.fishPrice = fishPrice
        }
        if (hint !== undefined) updates.hint = hint
        if (hintResult !== undefined) updates.hintResult = hintResult
        if (gameInfo.totalRounds !== undefined) {
          updates.totalRounds = gameInfo.totalRounds
          set({ rounds: gameInfo.totalRounds })
        }
        if (gameInfo.results !== undefined) {
          set({ results: gameInfo.results })
        }

        if (gameInfo.gameStartTime && gameInfo.gameStartTime !== get().gameStartTime) {
          get().hardResetSession()
          set({ gameStartTime: gameInfo.gameStartTime })
        }

        if (gameInfo.serverStatus !== undefined) {
          updates.serverState = gameInfo.serverStatus
        }

        get().updateHintState(updates)
      },
      resetGameState: () => {
        set({
          gameId: null,
          playerId: null,
          rounds: 10,
          isLeader: false,
          gameStartTime: 0,
          results: null,
          hintState: createInitialHintState(),
          gameState: createInitialLocalState(),
        })
      },
      updatePlayerInventory: (update) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            ...update,
          },
        }))
      },
      setFinalResultState: (price) => {
        get().updateHintState({
          finalFishPrice: price,
          isResultModalOpen: true,
        })
      },
      closeResultModal: () => {
        get().updateHintState({
          isResultModalOpen: false,
        })
      },
      hardResetSession: () => {
        set({ results: null })
        get().updateHintState({
          isResultModalOpen: false,
          finalFishPrice: 0,
          currentRound: 1,
          hint: '',
          hintResult: '',
          serverState: 'waiting',
        })
      },
    }),
    {
      name: 'nyant-coin-game-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true
      },
    }
  )
)

export default useGameStore
