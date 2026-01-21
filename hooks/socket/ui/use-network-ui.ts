/**
 * [UI Layer] 네트워크 상태에 따른 'UI 피드백(스낵바)'을 직접 관리하는 훅입니다.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

import { useSnackBarStore } from '@/store/snack-bar'
import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

const BANNER_RECONNECT_DELAY = 60000

export const useNetworkUI = (status: PeerConnectionStateType, hasNetworkConnection: boolean) => {
  const setSnackBar = useSnackBarStore((state) => state.setSnackBar)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  // UI 레벨의 오프라인 모드 상태
  const [isInOfflineMode, setIsInOfflineMode] = useState(false)

  // 물리적 네트워크 상태에 따른 오프라인 모드 동기화
  useEffect(() => {
    setIsInOfflineMode(!hasNetworkConnection)
  }, [hasNetworkConnection])

  const clearTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const handleNetworkUI = useCallback(
    (currentStatus: PeerConnectionStateType) => {
      clearTimer()

      // 1. 상태에 따른 스낵바 타입 및 노출 즉시성 결정
      const isHealthy =
        currentStatus === PeerConnectionStateModel.CONNECTED ||
        currentStatus === PeerConnectionStateModel.CONNECTING

      if (isHealthy) {
        setSnackBar({ isVisible: false })
        return
      }

      const isDegraded =
        currentStatus === PeerConnectionStateModel.DEGRADED ||
        currentStatus === PeerConnectionStateModel.LOST

      if (isDegraded) {
        setSnackBar({
          isVisible: true,
          message: '인터넷 연결이 불안정합니다',
          type: 'error',
        })
        return
      }

      // 2. RECONNECTING 상태: 60초 지연 노출 정책 적용
      if (currentStatus === PeerConnectionStateModel.RECONNECTING) {
        reconnectTimerRef.current = setTimeout(() => {
          setSnackBar({
            isVisible: true,
            message: '연결 재시도 중...',
            type: 'reconnecting',
          })
        }, BANNER_RECONNECT_DELAY)
      }
    },
    [setSnackBar, clearTimer]
  )

  useEffect(() => {
    handleNetworkUI(status)
  }, [status, handleNetworkUI])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return { isInOfflineMode }
}
