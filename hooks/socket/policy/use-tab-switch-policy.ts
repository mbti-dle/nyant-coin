import { useState, useEffect, useRef, useCallback } from 'react'

import { Socket } from 'socket.io-client'

import { SOCKET_ERROR_TYPES, SOCKET_TIMEOUTS } from '@/constants/socket'
import { isMobile } from '@/lib/utils/device'
import { useModalStore } from '@/store/modal'
import useToastStore from '@/store/toast'

/**
 * [Policy Layer] 게임 중 탭 전환(비활성화) 시 '유예 기간(Grace Period)' 정책을 관리하는 훅입니다.
 *
 * [정책]
 * 1. PC: 멀티태스킹 배려를 위해 탭 전환을 허용하며 제재하지 않습니다.
 * 2. 모바일: 탭 전환 시 총 60초의 유예 기간을 줍니다. (20초 경고모달 -> 40초후 자동퇴장)
 */
export const useTabSwitchPolicy = (socket: Socket | null) => {
  const { setModal, closeModal } = useModalStore()
  const { showToast } = useToastStore()

  const [isTabVisible, setIsTabVisible] = useState(true)
  const [tabSwitchTimeLeft, setTabSwitchTimeLeft] = useState(
    SOCKET_TIMEOUTS.TAB_SWITCH_FINAL / 1000
  )

  const tabSwitchWarningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchFinalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchCountdownRef = useRef<NodeJS.Timeout | null>(null)
  const hiddenTimestampRef = useRef<number | null>(null)
  const isTabSwitchModalShown = useRef(false)

  const stopCountdown = useCallback(() => {
    if (tabSwitchCountdownRef.current) {
      clearInterval(tabSwitchCountdownRef.current)
      tabSwitchCountdownRef.current = null
    }
  }, [])

  const startCountdown = useCallback(() => {
    stopCountdown()
    tabSwitchCountdownRef.current = setInterval(() => {
      setTabSwitchTimeLeft((prev) => {
        if (prev <= 1) {
          stopCountdown()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopCountdown])

  const stopTabSwitchTimers = useCallback(() => {
    if (tabSwitchWarningTimerRef.current) {
      clearTimeout(tabSwitchWarningTimerRef.current)
      tabSwitchWarningTimerRef.current = null
    }
    if (tabSwitchFinalTimerRef.current) {
      clearTimeout(tabSwitchFinalTimerRef.current)
      tabSwitchFinalTimerRef.current = null
    }
    stopCountdown()
    isTabSwitchModalShown.current = false
    setTabSwitchTimeLeft(SOCKET_TIMEOUTS.TAB_SWITCH_FINAL / 1000)
    closeModal()
  }, [stopCountdown, closeModal])

  const handleResumeFromTabSwitch = useCallback(() => {
    stopTabSwitchTimers()
    socket?.emit('tab_visible')
  }, [stopTabSwitchTimers, socket])

  const triggerWarning = useCallback(
    (onFinalExit: () => void, initialTime: number = SOCKET_TIMEOUTS.TAB_SWITCH_FINAL) => {
      isTabSwitchModalShown.current = true

      // 모달 표시
      setModal({
        isOpen: true,
        type: SOCKET_ERROR_TYPES.TAB_SWITCH_WARNING,
        onPrimaryAction: onFinalExit,
        onSecondaryAction: handleResumeFromTabSwitch,
      })

      showToast('탭을 전환하셨습니다. 게임으로 돌아와 주세요.', 'warning')

      const initialSeconds = Math.ceil(initialTime / 1000)
      setTabSwitchTimeLeft(initialSeconds)

      tabSwitchFinalTimerRef.current = setTimeout(() => {
        if (isTabSwitchModalShown.current) {
          onFinalExit()
        }
      }, initialTime)

      startCountdown()
    },
    [setModal, showToast, startCountdown, handleResumeFromTabSwitch]
  )

  const startTabSwitchWarning = useCallback(
    (onFinalExit: () => void) => {
      if (!isMobile()) return

      hiddenTimestampRef.current = Date.now()
      tabSwitchWarningTimerRef.current = setTimeout(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          triggerWarning(onFinalExit)
        }
      }, SOCKET_TIMEOUTS.TAB_SWITCH_WARNING)
    },
    [triggerWarning]
  )

  const handleTabReturn = useCallback(
    (onFinalExit: () => void) => {
      if (!hiddenTimestampRef.current) {
        stopTabSwitchTimers()
        return
      }

      const now = Date.now()
      const hiddenTime = now - hiddenTimestampRef.current
      const TOTAL_GRACE = SOCKET_TIMEOUTS.TAB_SWITCH_WARNING + SOCKET_TIMEOUTS.TAB_SWITCH_FINAL

      if (hiddenTime >= TOTAL_GRACE - 500) {
        onFinalExit()
        return
      }

      if (hiddenTime >= SOCKET_TIMEOUTS.TAB_SWITCH_WARNING) {
        if (!isTabSwitchModalShown.current) {
          const remainingTime = TOTAL_GRACE - hiddenTime
          triggerWarning(onFinalExit, remainingTime)
        }
      } else {
        stopTabSwitchTimers()
      }
    },
    [stopTabSwitchTimers, triggerWarning]
  )

  // 카운트다운 메시지 동기화
  useEffect(() => {
    if (isTabSwitchModalShown.current && tabSwitchTimeLeft > 0) {
      setModal({
        countdownMessage: `${tabSwitchTimeLeft}초 후 자동으로 게임에서 나가집니다.`,
      })
    }
  }, [tabSwitchTimeLeft, setModal])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    return () => stopTabSwitchTimers()
  }, [stopTabSwitchTimers])
  return {
    isTabVisible,
    startTabSwitchWarning,
    stopTabSwitchTimers,
    handleTabReturn,
  }
}
