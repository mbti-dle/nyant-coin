import { Server as SocketIOServer } from 'socket.io'

import { gameConfig, PRICE_THRESHOLD } from '../../constants/game'
import { generateNewFishPrice, isPriceChangeHigh, shouldHintMatch } from '../../lib/utils/game'
import { GameModel } from '../../types/game'

import { gameTimers, getRoom, roundTimers } from './store'

export const startGameTimer = (
  io: SocketIOServer,
  gameId: string,
  room: GameModel & { readyPlayers: Set<string> }
) => {
  if (!room || room.state !== 'in_progress') {
    console.error('게임을 시작할 수 없는 상태입니다')
    return
  }

  if (room.gameInfo.currentDay < 1 || room.gameInfo.currentDay > room.totalRounds) {
    console.error('유효하지 않은 라운드입니다')
    room.gameInfo.currentDay = Math.max(1, Math.min(room.totalRounds, room.gameInfo.currentDay))
  }

  const existingTimer = roundTimers.get(gameId)
  if (existingTimer) {
    clearInterval(existingTimer)
    roundTimers.delete(gameId)
  }

  let timer = gameConfig.INITIAL_TIMER
  const intervalId = setInterval(() => {
    const currentRoom = getRoom(gameId)
    if (!currentRoom || currentRoom.state !== 'in_progress') {
      clearInterval(intervalId)
      roundTimers.delete(gameId)
      return
    }

    timer -= 1
    io.to(gameId).emit('timer_update', timer)

    if (timer === 0) {
      handleTimerEnd(io, gameId, currentRoom)
      clearInterval(intervalId)
      roundTimers.delete(gameId)
    }
  }, 1000)

  roundTimers.set(gameId, intervalId)
}

const handleTimerEnd = (
  io: SocketIOServer,
  gameId: string,
  currentRoom: GameModel & { readyPlayers: Set<string> }
) => {
  const isLastRound = currentRoom.gameInfo.currentDay === currentRoom.totalRounds

  if (isLastRound) {
    handleLastRound(io, gameId, currentRoom)
  } else {
    handleNextRound(io, gameId, currentRoom)
  }
}

const handleLastRound = (
  io: SocketIOServer,
  gameId: string,
  currentRoom: GameModel & { readyPlayers: Set<string> }
) => {
  try {
    const prevHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 2]
    if (!prevHint) return

    const isHintMatched = shouldHintMatch()
    const priceChangeDirection = isHintMatched
      ? prevHint.expectedChange
      : prevHint.expectedChange === 'up'
        ? 'down'
        : 'up'

    const oldPrice = currentRoom.gameInfo.currentFishPrice
    const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

    io.to(gameId).emit('last_fish_price', newPrice)
  } catch (error) {
    console.error('마지막 라운드의 생선 가격을 계산하는데 실패하였습니다.', error)
  }
}

const handleNextRound = (
  io: SocketIOServer,
  gameId: string,
  currentRoom: GameModel & { readyPlayers: Set<string> }
) => {
  try {
    if (currentRoom.gameInfo.currentDay >= currentRoom.totalRounds) {
      console.error('현재 라운드가 전체 라운드 수를 초과하였습니다.')
      return
    }

    currentRoom.gameInfo.currentDay += 1

    if (currentRoom.gameInfo.currentDay > currentRoom.totalRounds) {
      console.error('라운드 수가 전체 라운드 수를 초과하였습니다.')
      currentRoom.gameInfo.currentDay = currentRoom.totalRounds
    }

    updateGameInfo(io, gameId, currentRoom)
    startGameTimer(io, gameId, currentRoom)
  } catch (error) {
    console.error('다음 라운드로 게임을 업데이트하는데 실패하였습니다.', error)
    io.to(gameId).emit('update_game_info', currentRoom.gameInfo)
  }
}

const updateGameInfo = (
  io: SocketIOServer,
  gameId: string,
  currentRoom: GameModel & { readyPlayers: Set<string> }
) => {
  const currentPrice = currentRoom.gameInfo.currentFishPrice
  const currentHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 1]
  const prevHint = currentRoom.hints[currentRoom.gameInfo.currentDay - 2]

  let isHintMatched = shouldHintMatch()

  if (currentPrice <= PRICE_THRESHOLD.MIN_SAFE_PRICE && prevHint?.expectedChange === 'down') {
    isHintMatched = false
  } else if (currentPrice >= PRICE_THRESHOLD.MAX_SAFE_PRICE && prevHint?.expectedChange === 'up') {
    isHintMatched = false
  }

  const priceChangeDirection = isHintMatched
    ? prevHint.expectedChange
    : prevHint.expectedChange === 'up'
      ? 'down'
      : 'up'

  const oldPrice = currentRoom.gameInfo.currentFishPrice
  const newPrice = generateNewFishPrice(oldPrice, priceChangeDirection)

  const isHighChange = isPriceChangeHigh(oldPrice, newPrice)
  const outcomeMessage = isHintMatched
    ? isHighChange
      ? prevHint.matchOutcomeHigh
      : prevHint.matchOutcomeLow
    : isHighChange
      ? prevHint.mismatchOutcomeHigh
      : prevHint.mismatchOutcomeLow

  currentRoom.gameInfo = {
    ...currentRoom.gameInfo,
    currentFishPrice: newPrice,
    lastRoundHintResult: outcomeMessage,
    nextRoundHint: currentHint?.hint || '',
  }

  io.to(gameId).emit('update_game_info', currentRoom.gameInfo)
}

export const clearGameTimers = (gameId: string) => {
  const gameTimer = gameTimers.get(gameId)
  if (gameTimer) {
    clearTimeout(gameTimer)
    gameTimers.delete(gameId)
  }

  const roundTimer = roundTimers.get(gameId)
  if (roundTimer) {
    clearInterval(roundTimer)
    roundTimers.delete(gameId)
  }
}
