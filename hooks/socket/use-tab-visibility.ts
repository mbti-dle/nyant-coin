import { useState, useEffect, useRef } from 'react'

import { isMobile } from '@/lib/utils/device'

const TAB_SWITCH_WARNING_TIMEOUT = 10000
const TAB_SWITCH_FINAL_TIMEOUT = 60000

interface UseTabVisibilityReturn {
  isTabVisible: boolean
  tabSwitchTimeLeft: number
  isTabSwitchModalShown: boolean
  isTabReturning: boolean
  startTabSwitchWarning: (onWarning: () => void, onFinalExit: () => void) => void
  stopTabSwitchTimers: () => void
  handleTabReturn: () => void
  registerVisibilityListener: (onTabHidden: () => void, onTabVisible: () => void) => () => void
}

export const useTabVisibility = (): UseTabVisibilityReturn => {
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [tabSwitchTimeLeft, setTabSwitchTimeLeft] = useState(60)

  const tabSwitchWarningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchFinalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchCountdownRef = useRef<NodeJS.Timeout | null>(null)
  const isTabSwitchModalShown = useRef(false)
  const isTabReturning = useRef(false)

  const startTabSwitchWarning = (onWarning: () => void, onFinalExit: () => void) => {
    if (!isMobile()) {
      return
    }

    if (tabSwitchWarningTimerRef.current) {
      clearTimeout(tabSwitchWarningTimerRef.current)
    }

    tabSwitchWarningTimerRef.current = setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        isTabSwitchModalShown.current = true
        onWarning()
        setTabSwitchTimeLeft(60)

        startFinalExitTimer(onFinalExit)
        startCountdown()
      }
    }, TAB_SWITCH_WARNING_TIMEOUT)
  }

  const startFinalExitTimer = (onFinalExit: () => void) => {
    if (tabSwitchFinalTimerRef.current) {
      clearTimeout(tabSwitchFinalTimerRef.current)
    }

    tabSwitchFinalTimerRef.current = setTimeout(() => {
      const isModalShown = isTabSwitchModalShown.current
      const isDocumentAvailable = typeof document !== 'undefined'
      const isTabHidden = isDocumentAvailable && document.visibilityState === 'hidden'
      const shouldFinalExit = isModalShown && isTabHidden

      if (shouldFinalExit) {
        onFinalExit()
      }
    }, TAB_SWITCH_FINAL_TIMEOUT)
  }

  const startCountdown = () => {
    if (tabSwitchCountdownRef.current) {
      clearInterval(tabSwitchCountdownRef.current)
    }

    tabSwitchCountdownRef.current = setInterval(() => {
      setTabSwitchTimeLeft((prev) => {
        if (prev <= 1) {
          if (tabSwitchCountdownRef.current) {
            clearInterval(tabSwitchCountdownRef.current)
            tabSwitchCountdownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTabSwitchTimers = () => {
    if (tabSwitchWarningTimerRef.current) {
      clearTimeout(tabSwitchWarningTimerRef.current)
      tabSwitchWarningTimerRef.current = null
    }

    if (tabSwitchFinalTimerRef.current) {
      clearTimeout(tabSwitchFinalTimerRef.current)
      tabSwitchFinalTimerRef.current = null
    }

    if (tabSwitchCountdownRef.current) {
      clearInterval(tabSwitchCountdownRef.current)
      tabSwitchCountdownRef.current = null
    }

    isTabSwitchModalShown.current = false
    isTabReturning.current = false
    setTabSwitchTimeLeft(60)
  }

  const handleTabReturn = () => {
    stopTabSwitchTimers()
    isTabReturning.current = true

    setTimeout(() => {
      isTabReturning.current = false
    }, 0)
  }

  const registerVisibilityListener = (onTabHidden: () => void, onTabVisible: () => void) => {
    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return

      const visible = document.visibilityState === 'visible'
      setIsTabVisible(visible)

      if (visible) {
        onTabVisible()
      } else {
        onTabHidden()
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsTabVisible(!document.hidden)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopTabSwitchTimers()
    }
  }, [stopTabSwitchTimers])

  return {
    isTabVisible,
    tabSwitchTimeLeft,
    isTabSwitchModalShown: isTabSwitchModalShown.current,
    isTabReturning: isTabReturning.current,
    startTabSwitchWarning,
    stopTabSwitchTimers,
    handleTabReturn,
    registerVisibilityListener,
  }
}
