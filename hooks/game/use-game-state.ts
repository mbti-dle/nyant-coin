import useGameStore from '@/store/game'

interface GameDataModel {
  gameId: string | null
  playerId: string | null
}

export const useGameState = () => {
  const { gameId, playerId, setGameId, setPlayerId } = useGameStore()
  const isInGame = gameId !== null && playerId !== null

  const saveGameData = (newGameId: string, newPlayerId: string) => {
    setGameId(newGameId)
    setPlayerId(newPlayerId)
  }

  const clearGameData = () => {
    setGameId(null)
    setPlayerId(null)
  }

  const getGameData = (): GameDataModel => ({ gameId, playerId })

  const updateGameId = (newGameId: string) => setGameId(newGameId)
  const updatePlayerId = (newPlayerId: string) => setPlayerId(newPlayerId)

  return {
    isInGame,
    gameData: { gameId, playerId },
    saveGameData,
    clearGameData,
    getGameData,
    updateGameId,
    updatePlayerId,
  }
}
