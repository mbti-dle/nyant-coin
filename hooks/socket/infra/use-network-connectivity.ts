import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * [Infra Layer] 기기의 물리적인 네트워크 연결 상태를 감지하는 훅입니다.
 * navigator.onLine 이벤트와 실제 fetch 요청(Heartbeat)을 결합하여 가짜 온라인 상태를 구분합니다.
 */
export const useNetworkConnectivity = () => {
  const [hasNetworkConnection, setHasNetworkConnection] = useState(true)
  const hasNetworkConnectionRef = useRef(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const status = navigator.onLine
      setHasNetworkConnection(status)
      hasNetworkConnectionRef.current = status
    }
  }, [])

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const navOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    if (!navOnline) {
      if (hasNetworkConnectionRef.current) {
        setHasNetworkConnection(false)
        hasNetworkConnectionRef.current = false
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

      if (isActuallyOnline !== hasNetworkConnectionRef.current) {
        setHasNetworkConnection(isActuallyOnline)
        hasNetworkConnectionRef.current = isActuallyOnline
      }

      return isActuallyOnline
    } catch {
      if (hasNetworkConnectionRef.current) {
        setHasNetworkConnection(false)
        hasNetworkConnectionRef.current = false
      }
      return false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setHasNetworkConnection(true)
      hasNetworkConnectionRef.current = true
    }

    const handleOffline = () => {
      setHasNetworkConnection(false)
      hasNetworkConnectionRef.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const heartbeatInterval = setInterval(() => {
      checkConnectivity()
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(heartbeatInterval)
    }
  }, [checkConnectivity])

  return {
    hasNetworkConnection,
  }
}
