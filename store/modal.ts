import { create } from 'zustand'

import { SocketErrorType } from '@/constants/socket'

interface ModalStateModel {
  isOpen: boolean
  type: SocketErrorType | null
  countdownMessage?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

interface ModalStoreModel {
  modal: ModalStateModel
  setModal: (modal: Partial<ModalStateModel>) => void
  closeModal: () => void
}

export const useModalStore = create<ModalStoreModel>((set) => ({
  modal: {
    isOpen: false,
    type: null,
  },
  setModal: (modal) =>
    set((state) => ({
      modal: { ...state.modal, ...modal },
    })),
  closeModal: () =>
    set((state) => ({
      modal: { ...state.modal, isOpen: false, type: null },
    })),
}))
