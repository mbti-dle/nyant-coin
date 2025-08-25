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
    console.log('💾 게임 데이터 저장됨:', { gameId, playerId })
  }

  const clearGameData = () => {
    gameDataRef.current = { gameId: null, playerId: null }
    setIsInGame(false)
    console.log('🗑️ 게임 데이터 초기화됨')
  }

  const getGameData = (): GameDataModel => {
    return { ...gameDataRef.current }
  }

  const updateGameId = (gameId: string) => {
    gameDataRef.current.gameId = gameId
    console.log('🆔 게임 ID 업데이트됨:', gameId)
  }

  const updatePlayerId = (playerId: string) => {
    gameDataRef.current.playerId = playerId
    console.log('👤 플레이어 ID 업데이트됨:', playerId)
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
