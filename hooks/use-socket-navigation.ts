import { useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { socket } from '@/lib/socket'

export const useSocketNavigation = (gameId) => {
  const timeoutId = useRef(null)
  const router = useRouter()

  const cleanupAndRedirect = () => {
    if (gameId) {
      socket.emit('leave_game', { gameId })
    }

    socket.removeAllListeners()
    socket.disconnect()
    router.push('/')
  }

  const startExitTimer = () => {
    timeoutId.current = setTimeout(() => {
      cleanupAndRedirect()
    }, 5000)
  }

  const stopExitTimer = () => {
    clearTimeout(timeoutId.current)
  }

  useEffect(() => {
    if (!gameId) {
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
      event.preventDefault()
      event.returnValue = ''
      return ''
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (!socket.connected) {
          cleanupAndRedirect()
        } else {
          startExitTimer()
        }
      } else if (document.visibilityState === 'visible') {
        stopExitTimer()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [gameId])
}
