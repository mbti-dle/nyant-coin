import { create } from 'zustand'

import { gameConfig } from '@/constants/game'
import { GameResultModel, GameStateModel } from '@/types/game'

interface GameSessionModel {
  fishPrice: number
  prevFishPrice: number
  currentRound: number
  totalRounds: number
  hint: string
  hintResult: string
  lastUpdated: number
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
  gameState?: GameStateModel
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
  resetGameState: () => void
  syncGameInfo: (gameInfo: GameSyncPayloadModel) => void
  updatePlayerInventory: (update: Partial<PlayerInventoryModel>) => void
}

const createInitialHintState = (): GameSessionModel => ({
  fishPrice: 100,
  prevFishPrice: 100,
  currentRound: 1,
  totalRounds: 10,
  hint: '',
  hintResult: '',
  lastUpdated: Date.now(),
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
  results: null,
  hintState: createInitialHintState(),
  gameState: createInitialLocalState(),
})

const useGameStore = create<GameStoreModel>((set, get) => ({
  ...getInitialState(),
  setGameId: (id) => {
    set({ gameId: id })
  },
  setPlayerId: (id) => {
    set({ playerId: id })
  },
  setGameRounds: (rounds) => set({ rounds }),
  setIsLeader: (isLeader) => set({ isLeader }),
  setResults: (results) => set({ results }),
  resetResults: () => set({ results: null }),
  updateHintState: (update) => {
    if (Object.keys(update).length === 0) return
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
    if (gameInfo.totalRounds !== undefined) updates.totalRounds = gameInfo.totalRounds

    get().updateHintState(updates)
  },
  resetGameState: () => {
    set({
      gameId: null,
      playerId: null,
      rounds: 10,
      isLeader: false,
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
}))

export default useGameStore
