import { useCallback, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { socket } from '@/lib/socket'

export const useSocketNavigation = (gameId) => {
  const router = useRouter()

  const cleanupAndRedirect = useCallback(() => {
    if (gameId) {
      socket.emit('leave_game', { gameId })
    }

    socket.removeAllListeners()
    socket.disconnect()
    router.push('/')
  }, [gameId, router])

  useEffect(() => {
    if (!gameId) {
      return
    }

    window.history.pushState(null, '', window.location.pathname)

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      cleanupAndRedirect()
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [gameId, cleanupAndRedirect])
}
