import { ToastIconType } from '@/types/ui-types'
import { create } from 'zustand'

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
  showToast: (message, icon) => {
    set({ isVisible: true, message, icon })

    setTimeout(() => set({ isVisible: false, icon: null }), TOAST_DISPLAY_DURATION)
  },
  hideToast: () => set({ isVisible: false, icon: null }),
}))

export default useToastStore
