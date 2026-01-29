import { GameHistoryModel, RoundRecordModel } from '../../types/game.js'

import { gameHistory } from './store.js'

export const getGameHistory = (gameId: string): GameHistoryModel | undefined => {
  return gameHistory.get(gameId)
}

export const updateRoundHistory = (
  gameId: string,
  roundNumber: number,
  fishPrice: number,
  hint: string,
  hintResult: string = ''
) => {
  let history = gameHistory.get(gameId)

  if (!history) {
    history = {
      rounds: [],
      currentRound: 1,
    }
    gameHistory.set(gameId, history)
  }

  if (roundNumber <= 0) {
    return history
  }

  const lastRound = Math.max(...history.rounds.map((r) => r.roundNumber), 0)
  if (roundNumber > lastRound + 1) {
    for (let i = lastRound + 1; i < roundNumber; i++) {
      const missingRoundData: RoundRecordModel = {
        roundNumber: i,
        fishPrice: 0,
        hint: '',
        hintResult: '',
        timestamp: Date.now(),
      }

      const existingIndex = history.rounds.findIndex((r) => r.roundNumber === i)
      if (existingIndex === -1) {
        history.rounds.push(missingRoundData)
      }
    }
  }

  const existingRoundIndex = history.rounds.findIndex((r) => r.roundNumber === roundNumber)
  const roundData: RoundRecordModel = {
    roundNumber,
    fishPrice,
    hint,
    hintResult,
    timestamp: Date.now(),
  }

  if (existingRoundIndex >= 0) {
    history.rounds[existingRoundIndex] = roundData
  } else {
    history.rounds.push(roundData)
  }

  const newCurrentRound = Math.max(history.currentRound, roundNumber)
  if (newCurrentRound - history.currentRound > 1) {
    history.currentRound = history.currentRound + 1
  } else {
    history.currentRound = newCurrentRound
  }

  history.rounds.sort((a, b) => a.roundNumber - b.roundNumber)

  return history
}

export const cleanupGameHistory = (gameId: string) => {
  gameHistory.delete(gameId)
}
