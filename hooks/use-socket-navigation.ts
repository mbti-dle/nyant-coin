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

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [gameId, cleanupAndRedirect])
}
