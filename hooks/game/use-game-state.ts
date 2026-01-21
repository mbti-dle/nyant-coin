/**
 * 사용자의 현재 게임 세션 정보(방 번호, 플레이어 ID)를 관리하는 훅입니다.
 * zustand 스토어의 데이터를 컴포넌트나 다른 훅에서 쉽게 접근하고 수정할 수 있는 인터페이스를 제공합니다.
 */
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
