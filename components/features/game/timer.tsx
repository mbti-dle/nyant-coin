import { useState, useEffect, memo } from 'react'

import { useSocket } from '@/hooks/use-socket'

const Timer = memo(() => {
  const [timer, setTimer] = useState(20)

  const { socket } = useSocket()

  useEffect(() => {
    const handleTimerUpdate = (newTime: number) => {
      setTimer(newTime)
    }

    socket.on('timer_update', handleTimerUpdate)

    return () => {
      socket.off('timer_update')
    }
  }, [])

  return (
    <div className="bg-red-100 rounded-full px-2 py-1 text-sm text-black md:fixed md:right-6 md:top-6">
      <span className="text-[24px] text-red">{timer}</span> 초
    </div>
  )
})

Timer.displayName = 'Timer'

export default Timer
