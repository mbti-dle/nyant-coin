import { useCallback, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { useSocket } from './use-socket'

const AUTO_EXIT_TIMEOUT = 5000

/**
 * 게임 진행 중 "페이지 이탈"을 감지해 처리하는 훅입니다.
 *
 * [처리 대상]
 * - 뒤로가기(popstate): 사용자 확인 후 즉시 퇴장 처리 (leave_game)
 * - 새로고침/창닫기(beforeunload): 브라우저 기본 경고 표시.
 *   (실제 이탈 시 서버의 유예 기간 로직에 의해 60초간 세션 유지됨)
 */
export const useSocketNavigation = (gameId: string | null) => {
  const router = useRouter()
  const { socket } = useSocket()
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const cleanupAndRedirect = useCallback(() => {
    if (gameId && socket) {
      // 명시적 퇴장이므로 즉시 제거 요청
      socket.emit('leave_game', { gameId })
    }
    router.push('/')
  }, [gameId, socket, router])

  const startExitTimer = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }

    timeoutId.current = setTimeout(() => {
      cleanupAndRedirect()
    }, AUTO_EXIT_TIMEOUT)
  }, [cleanupAndRedirect])

  const stopExitTimer = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
      timeoutId.current = null
    }
  }, [])

  useEffect(() => {
    if (!gameId || !socket) {
      return
    }

    // 게임 중 뒤로가기 시 즉시 페이지가 이동되지 않도록,
    // popstate 이벤트를 가로채기 위해 현재 경로를 history에 한 번 더 추가
    window.history.pushState(null, '', window.location.pathname)

    const handlePopState = (event: PopStateEvent) => {
      // 탭이 전환되거나 숨겨진 상태에서 사파리가 popstate를 잘못 트리거하는 경우 무시
      if (document.visibilityState === 'hidden') {
        window.history.pushState(null, '', window.location.pathname)
        return
      }

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
      stopExitTimer()
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [gameId, socket, cleanupAndRedirect, stopExitTimer])

  useEffect(() => {
    return stopExitTimer
  }, [stopExitTimer])

  return {
    startExitTimer,
    stopExitTimer,
  }
}
