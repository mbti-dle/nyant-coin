import { PRICE_THRESHOLD } from '../../constants/game.js'

export const generateNewFishPrice = (currentPrice: number, expectedChange: 'up' | 'down') => {
  const newPrice =
    expectedChange === 'up'
      ? Math.floor(Math.random() * (PRICE_THRESHOLD.MAX - currentPrice)) + currentPrice
      : Math.floor(Math.random() * (currentPrice - PRICE_THRESHOLD.MIN)) + PRICE_THRESHOLD.MIN

  return Math.min(Math.max(newPrice, PRICE_THRESHOLD.MIN), PRICE_THRESHOLD.MAX)
}

export const shouldHintMatch = () => {
  return Math.random() < 0.6
}

export const isPriceChangeHigh = (oldPrice: number, newPrice: number): boolean => {
  const changeAmount = Math.abs(newPrice - oldPrice)
  const changePercent = (changeAmount / oldPrice) * 100
  return changePercent > 30
}
