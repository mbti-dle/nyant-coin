import { useState, useRef, useEffect, useCallback } from 'react'

import { appLogger } from '@/lib/utils/app-logger'

const ERROR_MODAL_TIMEOUT = 10000
const RECONNECT_NOTIFICATION_INTERVAL = 1000

interface UseNetworkStatusReturn {
  isOnline: boolean
  isNetworkOffline: boolean
  shouldShowErrorModal: boolean
  setOffline: (onErrorModal?: () => void) => void
  setOnline: () => void
  clearTimers: () => void
  startReconnectNotifications: (showToast: (msg: string, type: string) => void) => void
  stopReconnectNotifications: () => void
  registerNetworkListeners: (onOnline: () => void, onOffline: () => void) => () => void
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isOnline, setIsOnline] = useState(true)
  const [isNetworkOffline, setIsNetworkOffline] = useState(false)

  const errorModalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowErrorModal = useRef(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
    }
  }, [])

  const setOffline = (onErrorModal?: () => void) => {
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
  }

  const setOnline = () => {
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
  }

  const clearTimers = useCallback(() => {
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

  const startReconnectNotifications = (showToast: (msg: string, type: string) => void) => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
    }

    reconnectIntervalRef.current = setInterval(() => {
      if (isNetworkOffline && !shouldShowErrorModal.current) {
        showToast('연결이 불안정합니다. 다시 연결 중...', 'warning')
      }
    }, RECONNECT_NOTIFICATION_INTERVAL)
  }

  const stopReconnectNotifications = () => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
  }

  const registerNetworkListeners = (onOnline: () => void, onOffline: () => void) => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const handleOnline = () => {
      setIsOnline(true)
      onOnline()
    }

    const handleOffline = () => {
      setIsOnline(false)
      onOffline()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    isOnline,
    isNetworkOffline,
    shouldShowErrorModal: shouldShowErrorModal.current,
    setOffline,
    setOnline,
    clearTimers,
    startReconnectNotifications,
    stopReconnectNotifications,
    registerNetworkListeners,
  }
}
