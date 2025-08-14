import { useState, useRef, useEffect } from 'react'

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

    console.log('🔴 네트워크 오프라인 상태로 변경')

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
    }

    if (onErrorModal) {
      errorModalTimerRef.current = setTimeout(() => {
        if (shouldShowErrorModal.current) {
          console.log('🚨 에러 모달 표시 시간 도달')
          onErrorModal()
        }
      }, ERROR_MODAL_TIMEOUT)
    }
  }

  const setOnline = () => {
    setIsNetworkOffline(false)
    shouldShowErrorModal.current = false

    console.log('🟢 네트워크 온라인 상태로 변경')

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }

    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }
  }

  const clearTimers = () => {
    shouldShowErrorModal.current = false

    if (errorModalTimerRef.current) {
      clearTimeout(errorModalTimerRef.current)
      errorModalTimerRef.current = null
    }

    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
      reconnectIntervalRef.current = null
    }

    console.log('네트워크 상태 타이머 모두 정리됨')
  }

  const startReconnectNotifications = (showToast: (msg: string, type: string) => void) => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current)
    }

    console.log('재연결 알림 시작')

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
      console.log('재연결 알림 중지')
    }
  }

  const registerNetworkListeners = (onOnline: () => void, onOffline: () => void) => {
    if (typeof window === 'undefined') {
      console.log('서버 환경: 네트워크 이벤트 리스너 등록 불가')
      return () => {}
    }

    const handleOnline = () => {
      setIsOnline(true)
      console.log('브라우저: 온라인 이벤트')
      onOnline()
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('브라우저: 오프라인 이벤트')
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
