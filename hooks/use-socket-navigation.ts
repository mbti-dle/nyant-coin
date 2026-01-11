import { useCallback, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { useSocket } from './use-socket'

const AUTO_EXIT_TIMEOUT = 5000

/**
 * 게임 진행 중 "페이지 이탈"을 감지해 안전하게 퇴장 처리하는 훅입니다.
 *
 * [처리 대상]
 * - 뒤로가기(popstate): 사용자 확인 후 즉시 퇴장 처리
 * - 새로고침/창닫기(beforeunload): 서버에 '의도적 퇴장' 신호를 먼저 전달
 *
 * [의도적 퇴장 신호]
 * - beforeunload 발생 시 set_intent_to_leave 전송
 * - 사용자가 '페이지에 머물기'를 선택하면 1초 후 clear_intent_to_leave 전송
 */
export const useSocketNavigation = (gameId: string | null) => {
  const router = useRouter()
  const { socket } = useSocket()
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const cleanupAndRedirect = useCallback(() => {
    if (gameId && socket) {
      socket.emit('leave_game', { gameId })
      socket.emit('user_disconnect', { gameId })
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
      // 브라우저 종료/새로고침 시
      // 서버에 "의도적 퇴장 가능성"을 먼저 알립니다.
      // 실제로 페이지를 떠나면 이 상태가 유지되어 즉시 퇴장 처리되고,
      // '페이지에 머물기'를 선택하면 1초 후 퇴장 의사를 철회합니다.
      if (socket && socket.connected) {
        socket.emit('set_intent_to_leave')

        setTimeout(() => {
          socket.emit('clear_intent_to_leave')
        }, 1000)
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
  }, [gameId, socket, cleanupAndRedirect, stopExitTimer])

  useEffect(() => {
    return stopExitTimer
  }, [stopExitTimer])

  return {
    startExitTimer,
    stopExitTimer,
  }
}
