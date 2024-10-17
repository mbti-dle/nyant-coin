import { useState, useEffect, memo, useRef } from 'react'

import { INITIAL_TIMER } from '@/constants/game-constant'

interface TimerProps {
  onTimerEnd: () => void
  isLastRound: boolean
  currentRound: number
}

const Timer: React.FC<TimerProps> = memo(({ onTimerEnd, isLastRound, currentRound }) => {
  const [timer, setTimer] = useState(INITIAL_TIMER)
  const timerEndedRef = useRef(false)

  useEffect(() => {
    setTimer(INITIAL_TIMER)
    timerEndedRef.current = false
  }, [currentRound])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (!timerEndedRef.current) {
      timerEndedRef.current = true
      onTimerEnd()
      if (!isLastRound) {
        setTimer(INITIAL_TIMER)
      }
    }

    return () => clearInterval(intervalId)
  }, [timer, onTimerEnd, isLastRound])

  return (
    <div className="bg-red-100 rounded-full px-2 py-1 text-sm text-black md:fixed md:right-6 md:top-6">
      <span className="text-[24px] text-red">{timer}</span> 초
    </div>
  )
})

Timer.displayName = 'Timer'

export default Timer
