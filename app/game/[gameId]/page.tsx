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
import { useSocket } from '@/hooks/socket/core/use-socket'
import { useSocketNavigation } from '@/hooks/socket/policy/use-socket-navigation'
import { appLogger } from '@/lib/utils/app-logger'
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
    prevFishPrice: gameConfig.INITIAL_FISH_PRICE,
    currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
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
  const [lastFishCoin, setLastFishCoin] = useState(0)

  const {
    rounds: totalRounds,
    playerId,
    setPlayerId,
    results: gameResults,
    setResults: setGameResults,
    resetResults,
    gameState: playerInventory,
    updatePlayerInventory,
  } = useGameStore()
  const { showToast } = useToastStore()
  const { socket } = useSocket()
  const { gameData, getGameData } = useGameState()
  const { startHeartbeat, stopHeartbeat, isHeartbeatActive, getLastHeartbeatTime } = useHeartbeat()

  useSocketNavigation(gameId)

  useEffect(() => {
    const { gameId, playerId } = gameData
    const isSocketConnected = socket && socket.connected

    const hasValidGameData = gameId && playerId
    const canStartHeartbeat = hasValidGameData && isSocketConnected

    if (canStartHeartbeat) {
      startHeartbeat(socket, getGameData, () => {
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
    socket.on('disconnect', handleDisconnect)
    socket.on('sync_complete', handleGameSync)
    socket.on('complete_round_sync', handleGameSync)
    socket.on('player_removed', handlePlayerRemoved)
    socket.on('player_left', handlePlayerLeft)

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
      socket.off('disconnect')
      socket.off('sync_complete')
      socket.off('complete_round_sync')
      socket.off('player_removed')
      socket.off('player_left')
    }
  }, [gameId])

  useEffect(() => {
    resetResults()
  }, [])

  const handlePlayerRemoved = ({ message }) => {
    showToast(message, 'warning')
  }

  const handlePlayerLeft = ({ message }) => {
    showToast(message, 'warning')
  }

  const updateHintsAndGameState = (gameInfo: GameInfoModel) => {
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
        ...(gameInfo.prevFishPrice !== undefined && { prevFishPrice: gameInfo.prevFishPrice }),
        ...(gameInfo.currentFishPrice !== undefined && {
          currentFishPrice: gameInfo.currentFishPrice,
        }),
        ...(gameInfo.currentDay !== undefined && { currentRound: gameInfo.currentDay }),
      }))
    }
  }

  const handleTransaction = (action: TransactionType, amount: number) => {
    const totalValue = amount * gameState.currentFishPrice

    socket.emit('trade_fishes', { gameId, action, amount })

    if (action === 'buy' && totalValue > playerInventory.coins) {
      showToast('보유 코인이 부족합니다', 'check')
      return
    } else if (action === 'sell' && amount > playerInventory.fish) {
      showToast('보유 생선이 부족합니다', 'check')
      return
    }

    updatePlayerInventory({
      coins:
        action === 'buy' ? playerInventory.coins - totalValue : playerInventory.coins + totalValue,
      fish: action === 'buy' ? playerInventory.fish + amount : playerInventory.fish - amount,
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
    setPlayers(players)
    setPlayerId(playerId)

    if (gameId && playerId) {
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
    updateHintsAndGameState(gameInfo)

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
    updateHintsAndGameState(gameInfo)
  }

  const handleGameEnded = ({ results }: { results: GameResultModel[] }) => {
    setGameResults(results)
  }

  const handleRoundSync = (roundData) => {
    updateHintsAndGameState({
      currentDay: roundData.currentRound,
      prevFishPrice: roundData.prevFishPrice,
      currentFishPrice: roundData.currentFishPrice,
      nextRoundHint: roundData.hint,
      lastRoundHintResult: roundData.lastRoundResult,
    })
  }

  const handleGameSync = (syncData) => {
    if (syncData.gameInfo) {
      const { currentDay, prevFishPrice, currentFishPrice, nextRoundHint, lastRoundHintResult } =
        syncData.gameInfo

      setGameState((prev) => ({
        ...prev,
        currentRound: currentDay || prev.currentRound,
        prevFishPrice: prevFishPrice !== undefined ? prevFishPrice : prev.prevFishPrice,
        fishPrice: currentFishPrice !== undefined ? currentFishPrice : prev.currentFishPrice,
      }))

      setHints({
        nextRoundHint: nextRoundHint || '',
        lastRoundHintResult: lastRoundHintResult || '',
      })
    }

    if (syncData.currentRound !== undefined) {
      setGameState((prev) => ({
        ...prev,
        currentRound: syncData.currentRound,
        prevFishPrice:
          syncData.prevFishPrice !== undefined ? syncData.prevFishPrice : prev.prevFishPrice,
        currentFishPrice:
          syncData.fishPrice !== undefined ? syncData.fishPrice : prev.currentFishPrice,
      }))

      setHints((prev) => ({
        nextRoundHint:
          syncData.hint !== undefined && syncData.hint !== '' ? syncData.hint : prev.nextRoundHint,
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

  const handleDisconnect = (reason) => {
    showToast('연결이 끊겼습니다. 재연결 중...', 'warning')
    appLogger.log('socket disconnected', { reason })
  }

  const totalCoin = playerInventory.fish * lastFishCoin + playerInventory.coins

  return (
    <main className="relative h-screen min-h-screen w-full flex-col p-3 pt-[0px]">
      <Background desktopImage={backgroundDesktopImage} mobileImage={backgroundMobileImage} />
      <div className="mx-auto max-w-[420px] flex-col items-center justify-center p-3 md:pt-[50px]">
        <div className="my-4 flex justify-between">
          <div className="flex justify-start">
            <FishCoinsAssets coins={playerInventory.coins} fish={playerInventory.fish} />
          </div>
          <div className="ml-auto mt-2">
            <Timer />
          </div>
        </div>
        <Hints
          prevFishPrice={gameState.prevFishPrice}
          currentFishPrice={gameState.currentFishPrice}
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
