import { useCallback, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSocket } from '../core/use-socket'

/**
 * [Policy Layer] 페이지 이탈(뒤로가기, 새로고침 등) 시의 대응 정책을 관리하는 훅입니다.
 *
 * [정책]
 * - 뒤로가기(popstate): 사용자 확인 후 즉시 퇴장 처리 (leave_game)
 */
export const useSocketNavigation = (gameId: string | null) => {
  const router = useRouter()
  const { socket } = useSocket()

  const leaveAndRedirect = useCallback(
    (to: string = '/') => {
      if (gameId && socket) {
        socket.emit('leave_game', { gameId })
      }
      router.push(to)
    },
    [gameId, socket, router]
  )

  useEffect(() => {
    if (!gameId || !socket) {
      return
    }

    // 게임 중 뒤로가기 시 즉시 페이지가 이동되지 않도록,
    // popstate 이벤트를 가로채기 위해 현재 경로를 history에 한 번 더 추가
    window.history.pushState(null, '', window.location.pathname)

    const handlePopState = () => {
      // 탭이 전환되거나 숨겨진 상태에서 사파리가 popstate를 잘못 트리거하는 경우 무시
      if (document.visibilityState === 'hidden') {
        window.history.pushState(null, '', window.location.pathname)
        return
      }
      const isConfirmed = window.confirm('정말로 게임에서 나가시겠습니까?')

      if (isConfirmed) {
        leaveAndRedirect()
      } else {
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [gameId, socket, leaveAndRedirect])
}
