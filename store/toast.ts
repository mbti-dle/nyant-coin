import { create } from 'zustand'

import { ToastIconType } from '@/types/ui-types'

interface ToastStoreModel {
  isVisible: boolean
  message: string
  icon?: ToastIconType
  showToast: (message: string, icon?: ToastIconType) => void
  hideToast: () => void
}

const TOAST_DISPLAY_DURATION = 1500 // 토스트 출력 시간 (ms)

const useToastStore = create<ToastStoreModel>((set) => ({
  isVisible: false,
  message: '',
  icon: null,
  showToast: (message, icon, duration = TOAST_DISPLAY_DURATION) => {
    requestAnimationFrame(() => {
      set({ isVisible: true, message, icon })

      setTimeout(() => {
        requestAnimationFrame(() => {
          set({ isVisible: false, icon: null })
        })
      }, duration)
    })
  },
  hideToast: () => set({ isVisible: false, icon: null }),
}))

export default useToastStore
