import { useState, useRef } from 'react'

interface GameDataModel {
  gameId: string | null
  playerId: string | null
}

interface UseGameStateReturn {
  isInGame: boolean
  gameData: GameDataModel
  saveGameData: (gameId: string, playerId: string) => void
  clearGameData: () => void
  getGameData: () => GameDataModel
  updateGameId: (gameId: string) => void
  updatePlayerId: (playerId: string) => void
}

export const useGameState = (): UseGameStateReturn => {
  const [isInGame, setIsInGame] = useState(false)
  const gameDataRef = useRef<GameDataModel>({
    gameId: null,
    playerId: null,
  })

  const saveGameData = (gameId: string, playerId: string) => {
    gameDataRef.current = { gameId, playerId }
    setIsInGame(true)
  }

  const clearGameData = () => {
    gameDataRef.current = { gameId: null, playerId: null }
    setIsInGame(false)
  }

  const getGameData = (): GameDataModel => {
    return { ...gameDataRef.current }
  }

  const updateGameId = (gameId: string) => {
    gameDataRef.current.gameId = gameId
  }

  const updatePlayerId = (playerId: string) => {
    gameDataRef.current.playerId = playerId
  }

  return {
    isInGame,
    gameData: gameDataRef.current,
    saveGameData,
    clearGameData,
    getGameData,
    updateGameId,
    updatePlayerId,
  }
}
