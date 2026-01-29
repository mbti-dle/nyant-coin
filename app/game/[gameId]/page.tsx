'use client'

import { useState, useEffect, useRef } from 'react'

import { useParams } from 'next/navigation'

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

const INITIAL_GAME_STATE: GameStateModel = {
  coins: gameConfig.INITIAL_COINS,
  fish: gameConfig.INITIAL_FISH,
  inputValue: '',
  prevFishPrice: gameConfig.INITIAL_FISH_PRICE,
  currentFishPrice: gameConfig.INITIAL_FISH_PRICE,
  currentRound: 1,
  isModalOpen: false,
}

const GamePage = () => {
  const params = useParams()
  const gameId = params.gameId as string
  const { socket } = useSocket()
  const { gameData, getGameData } = useGameState()
  const { startHeartbeat, stopHeartbeat } = useHeartbeat()
  const { showToast } = useToastStore()

  const playerId = useGameStore((state) => state.playerId)
  const setPlayerId = useGameStore((state) => state.setPlayerId)
  const totalRounds = useGameStore((state) => state.rounds)
  const setGameRounds = useGameStore((state) => state.setGameRounds)
  const gameResults = useGameStore((state) => state.results)
  const setGameResults = useGameStore((state) => state.setResults)
  const playerInventory = useGameStore((state) => state.gameState)
  const updatePlayerInventory = useGameStore((state) => state.updatePlayerInventory)
  const updateHintState = useGameStore((state) => state.updateHintState)
  const serverState = useGameStore((state) => state.hintState.serverState)
  const finalFishPrice = useGameStore((state) => state.hintState.finalFishPrice)
  const setFinalResultState = useGameStore((state) => state.setFinalResultState)
  const isResultModalOpen = useGameStore((state) => state.hintState.isResultModalOpen)
  const closeResultModal = useGameStore((state) => state.closeResultModal)
  const hardResetSession = useGameStore((state) => state.hardResetSession)

  const [gameState, setGameState] = useState<GameStateModel>(INITIAL_GAME_STATE)
  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [hints, setHints] = useState<HintContentModel>({
    nextRoundHint: '',
    lastRoundHintResult: '',
  })
  const [transactionResult, setTransactionResult] = useState<TransactionResultModel>({
    playerId: null,
    message: '',
  })

  const isResultsSubmitted = useRef(false)
  const totalCoin = playerInventory.fish * finalFishPrice + playerInventory.coins

  useSocketNavigation(gameId)

  useEffect(() => {
    const { gameId, playerId } = gameData
    const canStartHeartbeat = gameId && playerId && socket?.connected

    if (canStartHeartbeat) {
      startHeartbeat(socket, getGameData, () => {
        socket.emit('request_sync', { gameId, playerId })
      })
    }
    return () => stopHeartbeat()
  }, [gameData.gameId, gameData.playerId, socket, startHeartbeat, stopHeartbeat, getGameData])

  useEffect(() => {
    if (!socket) return

    socket.on('player_info', handlePlayerInitialize)
    socket.on('update_players', handlePlayersUpdate)
    socket.on('first_round_hint', handleFirstRoundHint)
    socket.on('last_fish_price', handleLastFishPrice)
    socket.on('trade_message', handleTradeMessage)
    socket.on('update_game_info', handleGameInfoUpdate)
    socket.on('round_sync', handleGameSync)
    socket.on('round_sync_required', handleGameSync)
    socket.on('game_started', handleGameStarted)
    socket.on('game_ended', handleGameEnded)
    socket.on('disconnect', handleDisconnect)
    socket.on('sync_complete', handleGameSync)
    socket.on('complete_round_sync', handleGameSync)
    socket.on('player_removed', handlePlayerRemoved)
    socket.on('player_left', handlePlayerLeft)
    socket.on('inventory_update', handleInventoryUpdate)

    socket.emit('request_player_info', { gameId, playerId })
    socket.emit('request_first_round_hint', { gameId })
    socket.emit('player_ready', { gameId })

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('first_round_hint')
      socket.off('last_fish_price')
      socket.off('trade_message')
      socket.off('round_sync')
      socket.off('round_sync_required')
      socket.off('game_started')
      socket.off('game_ended')
      socket.off('disconnect')
      socket.off('sync_complete')
      socket.off('complete_round_sync')
      socket.off('player_removed')
      socket.off('player_left')
      socket.off('inventory_update')
    }
  }, [gameId, socket])

  useEffect(() => {
    if (finalFishPrice > 0 && serverState === 'in_progress' && !isResultsSubmitted.current) {
      handleGameEnd()
      isResultsSubmitted.current = true
    }
    if (serverState === 'waiting') {
      isResultsSubmitted.current = false
    }
  }, [finalFishPrice, serverState, totalCoin])

  useEffect(() => {
    if (serverState === 'waiting') return

    const canShowModal = finalFishPrice > 0
    if (canShowModal && !isResultModalOpen) {
      setFinalResultState(finalFishPrice)
    }
  }, [serverState, gameResults, finalFishPrice, isResultModalOpen, setFinalResultState])

  const handlePlayerInitialize = ({
    players,
    playerId,
  }: {
    players: PlayerModel[]
    playerId: string
  }) => {
    setPlayers(players)
    setPlayerId(playerId)

    const me = players.find((p) => p.id === playerId)
    if (me && me.coins !== undefined && me.fish !== undefined) {
      updatePlayerInventory({ coins: me.coins, fish: me.fish })
    }

    if (gameId && playerId) {
      socket.emit('request_sync', { gameId, playerId })
    }
  }

  const handlePlayersUpdate = (updatedPlayers: PlayerModel[]) => {
    setPlayers(updatedPlayers)
  }

  const handleFirstRoundHint = (gameInfo) => {
    updateHintsAndGameState(gameInfo)
    if (gameInfo.currentDay === 1) {
      setHints({ nextRoundHint: gameInfo.nextRoundHint, lastRoundHintResult: '' })
    }
  }

  const handleLastFishPrice = (newPrice) => {
    updateHintState({ finalFishPrice: newPrice })
  }

  const handleTradeMessage = (result: TransactionResultModel) => {
    setTransactionResult(result)
  }

  const handleGameInfoUpdate = (gameInfo) => {
    updateHintsAndGameState(gameInfo)
  }

  const handleGameEnded = ({ results }: { results: GameResultModel[] }) => {
    updateHintState({ serverState: 'ended' })
    setGameResults(results)
    socket.emit('request_sync', { gameId, playerId })
  }

  const handleGameStarted = (syncData) => {
    hardResetSession()
    handleGameSync(syncData)
  }

  const handleGameSync = (syncData) => {
    const gameInfo = syncData.gameInfo || {}
    const newRound = syncData.currentRound ?? gameInfo.currentDay
    const serverStatus = syncData.serverStatus ?? syncData.gameState ?? undefined

    if (serverStatus === undefined) {
      appLogger.warn('[Sync Warning] serverStatus가 데이터에 포함되어 있지 않습니다!', syncData)
    }

    const isRoundDefined = newRound !== undefined
    const fishPriceFromPayload =
      syncData.fishPrice ?? syncData.currentFishPrice ?? gameInfo.currentFishPrice
    const currentTotalRounds = syncData.totalRounds ?? totalRounds
    const isGameEndedServer = syncData.serverStatus === 'ended'
    const isLastRound = currentTotalRounds > 0 && (newRound || 0) >= currentTotalRounds

    setGameState((prev) => ({
      ...prev,
      currentRound: isRoundDefined ? Math.max(newRound, prev.currentRound) : prev.currentRound,
      prevFishPrice:
        gameInfo.prevFishPrice !== undefined ? gameInfo.prevFishPrice : prev.prevFishPrice,
      currentFishPrice: fishPriceFromPayload ?? prev.currentFishPrice,
    }))

    useGameStore.getState().syncGameInfo({ ...syncData, serverStatus })

    if (!isGameEndedServer && !isLastRound) {
      updateHintState({ finalFishPrice: 0 })
    }

    if (isGameEndedServer && fishPriceFromPayload !== undefined && fishPriceFromPayload !== 0) {
      updateHintState({ finalFishPrice: fishPriceFromPayload })
    }

    const nextRoundHint = syncData.hint ?? gameInfo.nextRoundHint
    const lastRoundHintResult = syncData.lastRoundResult ?? gameInfo.lastRoundHintResult

    setHints((prev) => ({
      nextRoundHint: nextRoundHint || prev.nextRoundHint,
      lastRoundHintResult: lastRoundHintResult || prev.lastRoundHintResult,
    }))

    if (syncData.totalRounds !== undefined) {
      setGameRounds(syncData.totalRounds)
    }

    if (syncData.players) {
      setPlayers(syncData.players)
      const me = syncData.players.find((p) => p.id === playerId)
      if (me && me.coins !== undefined && me.fish !== undefined) {
        updatePlayerInventory({ coins: me.coins, fish: me.fish })
      }
    }

    if (syncData.results) {
      setGameResults(syncData.results)
    }
  }

  const handleInventoryUpdate = ({ coins, fish }: { coins: number; fish: number }) => {
    updatePlayerInventory({ coins, fish })
  }

  const handleTransaction = (action: TransactionType, amount: number) => {
    socket.emit('trade_fishes', { gameId, action, amount })
  }

  const handleGameEnd = () => {
    socket.emit('end_game', { gameId, result: { playerId, totalCoin } })
  }

  const handlePlayerRemoved = ({ message }) => showToast(message, 'warning')
  const handlePlayerLeft = ({ message }) => showToast(message, 'warning')
  const handleDisconnect = (reason) => {
    showToast('연결이 끊겼습니다. 재연결 중...', 'warning')
    appLogger.log('socket disconnected', { reason })
  }
  const handleModalClose = () => closeResultModal()

  const updateHintsAndGameState = (gameInfo: GameInfoModel) => {
    if (gameInfo.nextRoundHint !== undefined || gameInfo.lastRoundHintResult !== undefined) {
      setHints((prev) => ({
        nextRoundHint:
          gameInfo.nextRoundHint !== undefined ? gameInfo.nextRoundHint : prev.nextRoundHint,
        lastRoundHintResult:
          gameInfo.lastRoundHintResult !== undefined
            ? gameInfo.lastRoundHintResult
            : prev.lastRoundHintResult,
      }))
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
          isOpen={isResultModalOpen}
          onModalClose={handleModalClose}
          coin={finalFishPrice}
          totalCoin={totalCoin}
          gameId={gameId}
        />
        <div className="flex w-full justify-center">
          <GameFooter onTransaction={handleTransaction} />
        </div>
      </div>
    </main>
  )
}

export default GamePage
