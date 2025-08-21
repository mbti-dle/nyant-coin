'use client'

import { useState, useEffect } from 'react'

import ChatContainer from '@/components/features/chat/chat-container'
import FishCoinsAssets from '@/components/features/game/fish-coins-assets'
import GameFooter from '@/components/features/game/game-footer'
import Hints from '@/components/features/game/hints'
import Timer from '@/components/features/game/timer'
import ResultModal from '@/components/features/result-modal'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Background from '@/components/ui/background'
import Toast from '@/components/ui/toast'
import { gameConfig } from '@/constants/game'
import { useGameState } from '@/hooks/game/use-game-state'
import { useHeartbeat } from '@/hooks/game/use-heartbeat'
import { useNetworkStatus } from '@/hooks/socket/use-network-status'
import { useSocket } from '@/hooks/use-socket'
import { useSocketNavigation } from '@/hooks/use-socket-navigation'
import backgroundDesktopImage from '@/public/images/background-desktop-3.png'
import backgroundMobileImage from '@/public/images/background-mobile-3.png'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'
import {
  GameStateModel,
  TransactionResultModel,
  PlayerModel,
  TransactionType,
  HintContentModel,
  GameResultModel,
  GameInfoModel,
} from '@/types/game'

const GamePage = ({ params }) => {
  const { gameId } = params

  const INITIAL_GAME_STATE: GameStateModel = {
    coins: gameConfig.INITIAL_COINS,
    fish: gameConfig.INITIAL_FISH,
    inputValue: '',
    fishPrice: gameConfig.INITIAL_FISH_PRICE,
    currentRound: 1,
    isModalOpen: false,
  }
  const INITIAL_PLAYER_STATE: PlayerModel[] = []
  const INITIAL_HINTS: HintContentModel = { nextRoundHint: '', lastRoundHintResult: '' }

  const [gameState, setGameState] = useState<GameStateModel>(INITIAL_GAME_STATE)
  const [players, setPlayers] = useState<PlayerModel[]>(INITIAL_PLAYER_STATE)
  const [hints, setHints] = useState<HintContentModel>(INITIAL_HINTS)
  const [transactionResult, setTransactionResult] = useState<TransactionResultModel>({
    playerId: null,
    message: '',
  })
  const [prevFishPrice, setPrevFishPrice] = useState(gameConfig.INITIAL_FISH_PRICE)
  const [lastFishCoin, setLastFishCoin] = useState(0)

  const {
    rounds: totalRounds,
    playerId,
    setPlayerId,
    results: gameResults,
    setResults: setGameResults,
    resetResults,
  } = useGameStore()
  const { showToast } = useToastStore()
  const { socket } = useSocket()
  const { isOnline, isNetworkOffline } = useNetworkStatus()
  const { gameData, saveGameData, getGameData } = useGameState()
  const { startHeartbeat, stopHeartbeat, isHeartbeatActive, getLastHeartbeatTime } = useHeartbeat()

  useSocketNavigation(gameId)

  useEffect(() => {
    const gameId = gameData.gameId
    const playerId = gameData.playerId
    const isSocketConnected = socket && socket.connected

    const hasValidGameData = gameId && playerId
    const canStartHeartbeat = hasValidGameData && isSocketConnected

    if (canStartHeartbeat) {
      startHeartbeat(socket, getGameData, () => {
        console.log('💔 하트비트 실패 - 동기화 요청')
        socket.emit('request_sync', {
          gameId,
          playerId,
        })
      })
    }

    return () => {
      stopHeartbeat()
    }
  }, [gameData.gameId, gameData.playerId, socket, startHeartbeat, stopHeartbeat, getGameData])

  useEffect(() => {
    socket.on('player_info', handlePlayerInitialize)
    socket.on('update_players', handlePlayersUpdate)
    socket.on('first_round_hint', handleFirstRoundHint)
    socket.on('last_fish_price', handleLastFishPrice)
    socket.on('trade_message', handleTradeMessage)
    socket.on('update_game_info', handleGameInfoUpdate)
    socket.on('game_ended', handleGameEnded)
    socket.on('round_sync', handleRoundSync)
    socket.on('reconnect', handleReconnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('sync_complete', handleGameSync)
    socket.on('complete_round_sync', handleGameSync)
    socket.on('player_disconnected', handlePlayerDisconnected)
    socket.on('player_removed', handlePlayerRemoved)
    socket.on('player_left', handlePlayerLeft)
    socket.on('player_reconnected', handlePlayerReconnected)

    console.log('🚀 초기 게임 정보 요청:', { gameId })
    socket.emit('request_player_info', { gameId })
    socket.emit('request_first_round_hint', { gameId })
    socket.emit('player_ready', { gameId })

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('first_round_hint')
      socket.off('last_fish_price')
      socket.off('trade_message')
      socket.off('update_game_info')
      socket.off('game_ended')
      socket.off('round_sync')
      socket.off('reconnect')
      socket.off('disconnect')
      socket.off('sync_complete')
      socket.off('complete_round_sync')
      socket.off('player_disconnected')
      socket.off('player_removed')
      socket.off('player_left')
      socket.off('player_reconnected')
    }
  }, [gameId])

  useEffect(() => {
    resetResults()
  }, [])

  const handlePlayerDisconnected = ({ playerId, message }) => {
    showToast(message, 'warning')

    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, isOnline: false } : player))
    )
  }

  const handlePlayerRemoved = ({ message }) => {
    showToast(message, 'warning')
  }

  const handlePlayerLeft = ({ message }) => {
    showToast(message, 'warning')
  }

  const handlePlayerReconnected = ({ playerId, nickname }) => {
    showToast(`${nickname}님이 재연결되었습니다`, 'connection')

    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, isOnline: true } : player))
    )
  }

  const updateHintsAndGameState = (gameInfo: GameInfoModel, source: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 힌트 및 게임 상태 업데이트 (${source}):`, gameInfo)
    }

    if (gameInfo.currentFishPrice && gameInfo.currentFishPrice !== gameState.fishPrice) {
      setPrevFishPrice(gameState.fishPrice)
    }

    if (gameInfo.nextRoundHint !== undefined || gameInfo.lastRoundHintResult !== undefined) {
      setHints((prev) => {
        const newHints = {
          nextRoundHint:
            gameInfo.nextRoundHint !== undefined ? gameInfo.nextRoundHint : prev.nextRoundHint,
          lastRoundHintResult:
            gameInfo.lastRoundHintResult !== undefined
              ? gameInfo.lastRoundHintResult
              : prev.lastRoundHintResult,
        }
        return newHints
      })
    }

    if (gameInfo.currentFishPrice !== undefined || gameInfo.currentDay !== undefined) {
      setGameState((prev) => ({
        ...prev,
        ...(gameInfo.currentFishPrice !== undefined && { fishPrice: gameInfo.currentFishPrice }),
        ...(gameInfo.currentDay !== undefined && { currentRound: gameInfo.currentDay }),
      }))
    }
  }

  const handleTransaction = (action: TransactionType, amount: number) => {
    setGameState((prevState) => {
      const totalValue = amount * prevState.fishPrice

      socket.emit('trade_fishes', { gameId, action, amount })

      if (action === 'buy' && totalValue > prevState.coins) {
        showToast('보유 코인이 부족합니다', 'check')
        return prevState
      } else if (action === 'sell' && amount > prevState.fish) {
        showToast('보유 생선이 부족합니다', 'check')
        return prevState
      }

      return {
        ...prevState,
        coins: action === 'buy' ? prevState.coins - totalValue : prevState.coins + totalValue,
        fish: action === 'buy' ? prevState.fish + amount : prevState.fish - amount,
      }
    })
  }

  const handleModalClose = () => {
    setGameState((prev) => ({ ...prev, isModalOpen: false }))
  }

  const handleGameEnd = () => {
    const finalScore = {
      playerId,
      totalCoin,
    }

    socket.emit('end_game', { gameId, result: finalScore })
  }

  const handlePlayerInitialize = ({
    players,
    playerId,
  }: {
    players: PlayerModel[]
    playerId: string
  }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎮 플레이어 초기화:', { players, playerId })
    }
    setPlayers(players)
    setPlayerId(playerId)

    if (gameId && playerId) {
      console.log('🔄 동기화 요청 (playerId 설정 후):', { gameId, playerId })
      socket.emit('request_sync', {
        gameId,
        playerId,
      })
    }
  }

  const handlePlayersUpdate = (updatedPlayers: PlayerModel[]) => {
    setPlayers(updatedPlayers)
  }

  const handleFirstRoundHint = (gameInfo) => {
    console.log('🎯 첫 라운드 힌트 수신:', gameInfo)
    updateHintsAndGameState(gameInfo, 'firstRoundHint')

    if (gameInfo.currentDay === 1) {
      setHints({
        nextRoundHint: gameInfo.nextRoundHint,
        lastRoundHintResult: '',
      })
    }
  }

  const handleLastFishPrice = (newPrice) => {
    setLastFishCoin(newPrice)
    setGameState((prev) => ({ ...prev, isModalOpen: true }))
  }

  const handleTradeMessage = (result: TransactionResultModel) => {
    setTransactionResult(result)
  }

  const handleGameInfoUpdate = (gameInfo) => {
    updateHintsAndGameState(gameInfo, 'updateGameInfo')
  }

  const handleGameEnded = ({ results }: { results: GameResultModel[] }) => {
    setGameResults(results)
  }

  const handleRoundSync = (roundData) => {
    updateHintsAndGameState(
      {
        currentDay: roundData.currentRound,
        currentFishPrice: roundData.fishPrice,
        nextRoundHint: roundData.hint,
        lastRoundHintResult: roundData.lastRoundResult,
      },
      'roundSync'
    )
  }

  const handleGameSync = (syncData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 게임 상태 동기화 수신:', syncData)
    }
    if (syncData.gameInfo) {
      const { currentDay, currentFishPrice, nextRoundHint, lastRoundHintResult } = syncData.gameInfo

      if (currentFishPrice !== undefined && currentFishPrice !== gameState.fishPrice) {
        setPrevFishPrice(gameState.fishPrice)
      }

      setGameState((prev) => ({
        ...prev,
        currentRound: currentDay || prev.currentRound,
        fishPrice: currentFishPrice !== undefined ? currentFishPrice : prev.fishPrice,
      }))

      setHints({
        nextRoundHint: nextRoundHint || '',
        lastRoundHintResult: lastRoundHintResult || '',
      })
    }

    if (syncData.currentRound !== undefined) {
      if (syncData.fishPrice !== undefined && syncData.fishPrice !== gameState.fishPrice) {
        setPrevFishPrice(gameState.fishPrice)
      }

      setGameState((prev) => ({
        ...prev,
        currentRound: syncData.currentRound,
        fishPrice: syncData.fishPrice !== undefined ? syncData.fishPrice : prev.fishPrice,
      }))

      setHints((prev) => ({
        nextRoundHint:
          syncData.hint !== undefined && syncData.hint !== '' ? syncData.hint : prev.nextRoundHint, // 기존 값 유지
        lastRoundHintResult:
          syncData.lastRoundResult !== undefined && syncData.lastRoundResult !== ''
            ? syncData.lastRoundResult
            : prev.lastRoundHintResult,
      }))
    }

    if (syncData.players) {
      setPlayers(syncData.players)
    }
  }

  const handleReconnect = () => {
    console.log('🔄 소켓 재연결됨')
    socket.emit('request_player_info', { gameId })
    socket.emit('request_first_round_hint', { gameId })
    socket.emit('player_ready', { gameId })
  }

  const handleDisconnect = (reason) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 소켓 연결 끊김:', reason)
    }
  }

  const totalCoin = gameState.fish * lastFishCoin + gameState.coins
  const lastHeartbeatTime = getLastHeartbeatTime()
  const shouldShowHeartbeat = isHeartbeatActive && lastHeartbeatTime > 0

  return (
    <main className="relative h-screen min-h-screen w-full flex-col p-3 pt-[0px]">
      <Background desktopImage={backgroundDesktopImage} mobileImage={backgroundMobileImage} />
      {/* 🌐 연결 상태 표시 */}
      <div className="fixed right-4 top-4 z-50 flex gap-2">
        {!isOnline && (
          <div className="bg-red-500 rounded px-2 py-1 text-xs text-white">오프라인</div>
        )}
        {isNetworkOffline && (
          <div className="rounded bg-yellow-500 px-2 py-1 text-xs text-white">재연결 중...</div>
        )}
        {shouldShowHeartbeat && (
          <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">
            💓 {Math.floor((Date.now() - lastHeartbeatTime) / 1000)}s
          </div>
        )}
      </div>
      <div className="mx-auto max-w-[420px] flex-col items-center justify-center p-3 md:pt-[50px]">
        <div className="my-4 flex justify-between">
          <div className="flex justify-start">
            <FishCoinsAssets coins={gameState.coins} fish={gameState.fish} />
          </div>
          <div className="ml-auto mt-2">
            <Timer />
          </div>
        </div>
        <Hints
          fishPrice={gameState.fishPrice}
          prevFishPrice={prevFishPrice}
          currentRound={gameState.currentRound}
          totalRounds={totalRounds}
          hint={hints?.nextRoundHint}
          hintResult={hints?.lastRoundHintResult}
        />

        <PlayerGrid players={players} transactionResult={transactionResult} />

        <div className="hidden md:block">
          <ChatContainer
            gameId={gameId}
            player={players.find((player) => player.id === playerId)}
            setIsPreparingGame={() => {}}
            className="md:bottom-20"
          />
        </div>
        <Toast />
        <ResultModal
          isOpen={gameState.isModalOpen}
          onModalClose={handleModalClose}
          coin={lastFishCoin}
          totalCoin={totalCoin}
          onGameEnd={handleGameEnd}
          gameId={gameId}
          gameResults={gameResults}
        />
        <div className="flex w-full justify-center">
          <GameFooter onTransaction={handleTransaction} />
        </div>
      </div>
    </main>
  )
}

export default GamePage
