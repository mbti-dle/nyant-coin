import { useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { useSocket } from './use-socket'

const AUTO_EXIT_TIMEOUT = 5000

interface UseSocketNavigationReturn {
  startExitTimer: () => void
  stopExitTimer: () => void
}

export const useSocketNavigation = (gameId: string | null): UseSocketNavigationReturn => {
  const router = useRouter()
  const { socket } = useSocket()
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const cleanupAndRedirect = () => {
    if (gameId && socket) {
      socket.emit('leave_game', { gameId })
      socket.emit('user_disconnect', { gameId })
    }
    router.push('/')
  }

  const startExitTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }

    timeoutId.current = setTimeout(() => {
      cleanupAndRedirect()
    }, AUTO_EXIT_TIMEOUT)
  }

  const stopExitTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
      timeoutId.current = null
    }
  }

  useEffect(() => {
    if (!gameId || !socket) {
      return
    }

    window.history.pushState(null, '', window.location.pathname)

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      if (window.confirm('뒤로가기 시, 게임에 다시 입장할 수 없습니다.')) {
        cleanupAndRedirect()
      } else {
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasGameId = gameId
      const isSocketConnected = socket && socket.connected

      if (hasGameId && isSocketConnected) {
        socket.emit('user_disconnect', { gameId })
      }

      event.preventDefault()
      event.returnValue = ''
      return ''
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      stopExitTimer()
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [gameId, socket])

  useEffect(() => {
    return stopExitTimer
  }, [stopExitTimer])

  return {
    startExitTimer,
    stopExitTimer,
  }
}
