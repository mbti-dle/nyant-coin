import { useCallback, useMemo } from 'react'

import useGameStore from '@/store/game'

interface GameDataModel {
  gameId: string | null
  playerId: string | null
}

/**
 * 사용자의 현재 게임 세션 정보(방 번호, 플레이어 ID)를 관리하는 훅입니다.
 * zustand 스토어의 데이터를 컴포넌트나 다른 훅에서 쉽게 접근하고 수정할 수 있는 인터페이스를 제공합니다.
 */
export const useGameState = () => {
  const gameId = useGameStore((state) => state.gameId)
  const playerId = useGameStore((state) => state.playerId)
  const isLeader = useGameStore((state) => state.isLeader)
  const rounds = useGameStore((state) => state.rounds)
  const playerInventory = useGameStore((state) => state.gameState)

  const setGameId = useGameStore((state) => state.setGameId)
  const setPlayerId = useGameStore((state) => state.setPlayerId)
  const resetGameState = useGameStore((state) => state.resetGameState)
  const updatePlayerInventory = useGameStore((state) => state.updatePlayerInventory)
  const getGameInfoFromStore = useGameStore((state) => state.hintState)
  const isInGame = useMemo(() => gameId !== null && playerId !== null, [gameId, playerId])

  const saveGameData = useCallback(
    (newGameId: string, newPlayerId: string) => {
      setGameId(newGameId)
      setPlayerId(newPlayerId)
    },
    [setGameId, setPlayerId]
  )

  const clearGameData = useCallback(() => {
    setGameId(null)
    setPlayerId(null)
  }, [setGameId, setPlayerId])

  const getGameData = useCallback((): GameDataModel => ({ gameId, playerId }), [gameId, playerId])

  const updateGameId = useCallback((newGameId: string) => setGameId(newGameId), [setGameId])
  const updatePlayerId = useCallback(
    (newPlayerId: string) => setPlayerId(newPlayerId),
    [setPlayerId]
  )

  return {
    isInGame,
    gameData: useMemo(() => ({ gameId, playerId }), [gameId, playerId]),
    gameId,
    playerId,
    isLeader,
    rounds,
    saveGameData,
    clearGameData,
    getGameData,
    updateGameId,
    updatePlayerId,
    resetGameState,
    playerInventory,
    updatePlayerInventory,
  }
}
