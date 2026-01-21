import { create } from 'zustand'

import { SnackBarType } from '@/types/ui-types'

interface SnackBarStateModel {
  isVisible: boolean
  message: string
  type: SnackBarType | null
}

interface SnackBarStoreModel {
  snackBar: SnackBarStateModel
  setSnackBar: (snackBar: Partial<SnackBarStateModel>) => void
}

export const useSnackBarStore = create<SnackBarStoreModel>((set) => ({
  snackBar: {
    isVisible: false,
    message: '',
    type: null,
  },
  setSnackBar: (snackBar) =>
    set((state) => ({
      snackBar: { ...state.snackBar, ...snackBar },
    })),
}))
