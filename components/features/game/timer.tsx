import { useState, useEffect, memo, useRef } from 'react'

import clsx from 'clsx'

import { useSocket } from '@/hooks/socket/core/use-socket'

/**
 * Timer Synchronization Policy
 *
 * 이 타이머는 서버 시간을 기준으로 동작합니다.
 * 네트워크 지연, 재접속, 기기 시간 차이로 인해
 * 타이머가 갑자기 늘어나거나 깜빡이는 현상을 방지하는 것이 목적입니다.
 *
 * 기본 원칙:
 * - 서버 시간을 단일 기준(Source of Truth)으로 사용합니다.
 * - 클라이언트와 서버 간 시간 차이를 여러 번 측정한 뒤,
 *   타이머가 빨라지는 것을 막기 위해 가장 보수적인 값을 사용합니다.
 *
 * 동작 규칙:
 * - 같은 라운드에서는 타이머가 뒤로 늘어나는 경우를 무시합니다.
 * - 200ms 이하의 작은 차이는 시각적 깜빡임 방지를 위해 무시합니다.
 * - 라운드가 변경되었을 때만 타이머를 다시 정확히 맞춥니다.
 *
 * 이벤트 처리:
 * - reconnect, sync_complete, timer_started, timer_update 등
 *   어떤 경로로 들어온 정보든 동일한 동기화 로직(handleSync)으로 처리합니다.
 *
 * 결과:
 * - 타이머 깜빡임(flickering) 방지
 * - 재접속이나 지연 상황에서도 일관되고 신뢰할 수 있는 UX 제공
 */

const Timer = memo(() => {
  const [timer, setTimer] = useState<number | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { socket } = useSocket()

  const clientGameEndAtRef = useRef<number | null>(null)
  const isSynchronizedRef = useRef<boolean>(false)
  const currentRoundRef = useRef<number | null>(null)
  const authOffsetRef = useRef<number | null>(null)

  const resetTimerState = () => {
    clientGameEndAtRef.current = null
    isSynchronizedRef.current = false
    setIsReady(false)
  }

  useEffect(() => {
    const handleSync = (serverNow: number, gameEndAt: number, currentRound?: number) => {
      if (!Number.isFinite(serverNow) || !Number.isFinite(gameEndAt)) return

      const clientNow = Date.now()
      const currentOffset = serverNow - clientNow

      const isNewRound =
        currentRound !== undefined &&
        currentRoundRef.current !== null &&
        currentRound > currentRoundRef.current

      const isBetterSample = authOffsetRef.current === null || currentOffset > authOffsetRef.current

      if (isBetterSample) {
        authOffsetRef.current = currentOffset
      }

      const stabilizedClientEndAt = gameEndAt - (authOffsetRef.current ?? currentOffset)

      if (clientGameEndAtRef.current !== null && !isNewRound) {
        const isSameRound = currentRound === undefined || currentRoundRef.current === currentRound

        if (isSameRound) {
          const remainingNow = clientGameEndAtRef.current - Date.now()
          const incomingRemaining = stabilizedClientEndAt - Date.now()

          if (incomingRemaining > remainingNow + 1000) {
            console.warn('[Timer Guard] Reject backward timer jump', {
              remainingNow,
              incomingRemaining,
            })
            return
          }
        }

        const drift = Math.abs(stabilizedClientEndAt - clientGameEndAtRef.current)
        if (drift < 200) return
      }

      if (clientGameEndAtRef.current === null || isNewRound) {
        clientGameEndAtRef.current = stabilizedClientEndAt
        if (currentRound !== undefined) currentRoundRef.current = currentRound

        const serverRemaining = gameEndAt - serverNow
        const initialRemaining = Math.max(0, Math.ceil(serverRemaining / 1000))
        setTimer(initialRemaining)
        setIsReady(true)
      } else {
        clientGameEndAtRef.current = stabilizedClientEndAt
      }

      isSynchronizedRef.current = true
    }

    const handleTimerPacket = (data: {
      serverNow: number
      gameEndAt: number
      currentRound?: number
    }) => {
      handleSync(data.serverNow, data.gameEndAt, data.currentRound)
    }

    const handleGameSync = (syncData: any) => {
      const serverStatus = syncData.serverStatus || syncData.gameState
      const gameEndAt = syncData.gameEndAt ?? syncData.timerState?.gameEndAt
      const serverNow = syncData.serverNow || syncData.timestamp || Date.now()
      const currentRound = syncData.currentRound ?? syncData.gameInfo?.currentDay
      const hasValidTimer = gameEndAt !== null && Number.isFinite(gameEndAt)

      if (hasValidTimer) {
        handleSync(serverNow, gameEndAt, currentRound)
      } else if ((serverStatus === 'ended' || serverStatus === 'waiting') && !hasValidTimer) {
        setTimer(0)
        resetTimerState()
        currentRoundRef.current = null
        setIsReady(true)
      }
    }

    const tickInterval = setInterval(() => {
      if (!isSynchronizedRef.current || clientGameEndAtRef.current === null) return

      const clientNow = Date.now()
      const remainingMs = clientGameEndAtRef.current - clientNow

      const currentSecond = Math.max(0, Math.ceil(remainingMs / 1000))

      setTimer(currentSecond)
      setIsReady(true)
    }, 100)

    socket.on('timer_update', handleTimerPacket)
    socket.on('timer_started', handleTimerPacket)
    socket.on('sync_complete', handleGameSync)
    socket.on('complete_round_sync', handleGameSync)

    return () => {
      clearInterval(tickInterval)
      socket.off('timer_update', handleTimerPacket)
      socket.off('timer_started', handleTimerPacket)
      socket.off('sync_complete', handleGameSync)
      socket.off('complete_round_sync', handleGameSync)
    }
  }, [socket])

  return (
    <div className="bg-red-100 min-w-[70px] rounded-full px-2 py-1 text-center text-sm text-black md:fixed md:right-6 md:top-6">
      <span
        className={clsx('text-[24px] font-bold text-[#E63946] transition-all duration-300', {
          'animate-pulse opacity-50': !isReady,
        })}
      >
        {isReady && timer !== null ? timer : '--'}
      </span>
      <span className="ml-1 text-xs font-semibold text-gray-600">초</span>
    </div>
  )
})

Timer.displayName = 'Timer'

export default Timer
