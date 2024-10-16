'use client'

import { useEffect } from 'react'

import confetti, { Options as ConfettiOptions } from 'canvas-confetti'

const ConfettiComponent = () => {
  const confettiDuration = 1000
  const confettiAnimationEnd = Date.now() + confettiDuration

  const colorArray = ['#3369FF', '#FFB218', '#FF4040']

  const setting: ConfettiOptions = {
    particleCount: 10,
    spread: 100,
    origin: { y: 1.5 },
    colors: colorArray,
  }

  const getRandomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min
  }

  const handleConfetti = () => {
    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = confettiAnimationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 25 * (timeLeft / confettiDuration)
      confetti({
        ...setting,
        particleCount,
        origin: { x: getRandomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  useEffect(() => {
    handleConfetti()
  })

  return null
}

export default ConfettiComponent
