/**
 * [UI Layer] 네트워크 상태에 따른 'UI 피드백(모달, 토스트)' 타이밍을 관리하는 훅입니다.
 * 연결이 끊겼을 때 즉시 경고를 띄울지, 일정 시간(10초) 대기 후 에러 모달을 띄울지 등의 UX 정책을 결정합니다.
 */
import { useState, useRef, useCallback, useEffect } from 'react'

import { appLogger } from '@/lib/utils/app-logger'

const ERROR_MODAL_TIMEOUT = 10000
const RECONNECT_NOTIFICATION_INTERVAL = 1000

export const useNetworkUI = () => {
  const [isInOfflineMode, setIsInOfflineMode] = useState(false)
  const [shouldShowErrorModal, setShouldShowErrorModal] = useState(false)
  const [isReconnectToastEnabled, setIsReconnectToastEnabled] = useState(false)

  const onErrorModalRef = useRef<(() => void) | undefined>()
  const showToastRef = useRef<((msg: string, type: string) => void) | undefined>()

  const enterOfflineState = useCallback((onErrorModal?: () => void) => {
    setIsInOfflineMode(true)
    setShouldShowErrorModal(false)
    onErrorModalRef.current = onErrorModal
    appLogger.warn('네트워크 오프라인 감지')
  }, [])

  const enterOnlineState = useCallback(() => {
    setIsInOfflineMode(false)
    setShouldShowErrorModal(false)
    setIsReconnectToastEnabled(false)
    appLogger.log('네트워크 복구')
  }, [])

  const startReconnectToasts = useCallback((showToast: (msg: string, type: string) => void) => {
    showToastRef.current = showToast
    setIsReconnectToastEnabled(true)
  }, [])

  const stopReconnectToasts = useCallback(() => {
    setIsReconnectToastEnabled(false)
  }, [])

  useEffect(() => {
    if (!isInOfflineMode) return

    let errorModalTimer: ReturnType<typeof setTimeout> | undefined
    let reconnectInterval: ReturnType<typeof setInterval> | undefined

    if (!shouldShowErrorModal && onErrorModalRef.current) {
      errorModalTimer = setTimeout(() => {
        appLogger.log('네트워크 불안정 지속 — 에러 모달 표시')
        setShouldShowErrorModal(true)
        onErrorModalRef.current?.()
      }, ERROR_MODAL_TIMEOUT)
    }

    if (!shouldShowErrorModal && isReconnectToastEnabled && showToastRef.current) {
      reconnectInterval = setInterval(() => {
        showToastRef.current?.('연결이 불안정합니다. 다시 연결 중...', 'warning')
      }, RECONNECT_NOTIFICATION_INTERVAL)
    }

    return () => {
      if (errorModalTimer) clearTimeout(errorModalTimer)
      if (reconnectInterval) clearInterval(reconnectInterval)
    }
  }, [isInOfflineMode, shouldShowErrorModal, isReconnectToastEnabled])

  return {
    isInOfflineMode,
    shouldShowErrorModal,
    enterOfflineState,
    enterOnlineState,
    startReconnectToasts,
    stopReconnectToasts,
  }
}
