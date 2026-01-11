import { useState, useRef, useEffect, useCallback } from 'react'

import { appLogger } from '@/lib/utils/app-logger'

const ERROR_MODAL_TIMEOUT = 10000
const RECONNECT_NOTIFICATION_INTERVAL = 1000

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [isNetworkOffline, setIsNetworkOffline] = useState(false)

  const isOnlineRef = useRef(true)
  const errorModalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowErrorModal = useRef(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const status = navigator.onLine
      setIsOnline(status)
      isOnlineRef.current = status
    }
  }, [])

  const enterOfflineState = useCallback((onErrorModal?: () => void) => {
    setIsNetworkOffline(true)
    shouldShowErrorModal.current = true

    appLogger.warn('네트워크 오프라인 감지')

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
    }

    if (onErrorModal) {
      errorModalTimerRef.current = setTimeout(() => {
        if (shouldShowErrorModal.current) {
          appLogger.log('네트워크 불안정 지속 — 에러 모달 표시')
          onErrorModal()
        }
      }, ERROR_MODAL_TIMEOUT)
    }
  }, [])

  const enterOnlineState = useCallback(() => {
    setIsNetworkOffline(false)
    shouldShowErrorModal.current = false

    appLogger.log('네트워크 복구')

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }

    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
  }, [])

  const resetNetworkEffects = useCallback(() => {
    shouldShowErrorModal.current = false

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }

    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
  }, [])

  const startReconnectToasts = useCallback(
    (showToast: (msg: string, type: string) => void) => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current)
      }

      reconnectIntervalRef.current = setInterval(() => {
        if (isNetworkOffline && !shouldShowErrorModal.current) {
          showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')
        }
      }, RECONNECT_NOTIFICATION_INTERVAL)
    },
    [isNetworkOffline]
  )

  const stopReconnectToasts = useCallback(() => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
  }, [])

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const navOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    // navigator가 오프라인이라고 하면 이를 우선 신뢰합니다 (로컬 환경 네트워크 토글/시뮬레이션 대응)
    if (!navOnline) {
      if (isOnlineRef.current) {
        setIsOnline(false)
        isOnlineRef.current = false
      }
      return false
    }

    try {
      const response = await fetch('/?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      })

      const isActuallyOnline = response.ok

      if (isActuallyOnline !== isOnlineRef.current) {
        setIsOnline(isActuallyOnline)
        isOnlineRef.current = isActuallyOnline
      }

      return isActuallyOnline
    } catch {
      if (isOnlineRef.current) {
        setIsOnline(false)
        isOnlineRef.current = false
      }
      return false
    }
  }, [])

  const subscribeNetworkEvents = useCallback(
    (onOnline: () => void, onOffline: () => void) => {
      if (typeof window === 'undefined') {
        return () => {}
      }

      const handleOnline = () => {
        setIsOnline(true)
        isOnlineRef.current = true
        onOnline()
      }

      const handleOffline = () => {
        setIsOnline(false)
        isOnlineRef.current = false
        onOffline()
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Safari 등에서 '조용한 연결 끊김'이 발생할 수 있어, 저빈도로 생존 확인을 합니다.
      const heartbeatInterval = setInterval(() => {
        checkConnectivity()
      }, 30000)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        clearInterval(heartbeatInterval)
      }
    },
    [checkConnectivity]
  )

  useEffect(() => {
    return () => {
      resetNetworkEffects()
    }
  }, [resetNetworkEffects])

  return {
    isOnline,
    isNetworkOffline,
    shouldShowErrorModal: shouldShowErrorModal.current,
    enterOfflineState,
    enterOnlineState,
    resetNetworkEffects,
    startReconnectToasts,
    stopReconnectToasts,
    subscribeNetworkEvents,
    checkConnectivity,
  }
}
