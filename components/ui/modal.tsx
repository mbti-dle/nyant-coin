'use client'

import { ReactNode } from 'react'

import CloseIcon from '@mui/icons-material/CloseSharp'
import { createPortal } from 'react-dom'

import Button from '@/components/ui/button'
import IconButton from '@/components/ui/icon-button'

interface ModalProps {
  title?: string
  children: ReactNode
  hasButton?: boolean
  isShowCloseButton?: boolean
  onModalClose?: () => void
  isOpen: boolean
  shouldCloseOnBackgroundClick?: boolean
}

const Modal = ({
  title = '',
  children,
  hasButton = false,
  isShowCloseButton = false,
  onModalClose,
  isOpen,
  shouldCloseOnBackgroundClick = false,
}: ModalProps) => {
  if (!isOpen) return null

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <>
      <div
        role="presentation"
        className="pointer-events-auto fixed inset-0 z-20 flex items-center justify-center bg-black/20"
        onClick={shouldCloseOnBackgroundClick ? onModalClose : undefined}
      />

      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
        <div className="pointer-events-auto w-[300px] overflow-hidden rounded-lg bg-white shadow-md">
          <div className="flex h-[60px] w-full items-center bg-primary">
            <div className="ml-10 flex-grow text-center text-xl text-white">{title}</div>
            {isShowCloseButton && (
              <IconButton
                Icon={CloseIcon}
                onClick={onModalClose}
                className="mr-2 text-white"
                label="닫기"
              />
            )}
          </div>

          <div className="p-4 text-black">
            {children}
            {hasButton && (
              <div className="mt-4 flex justify-center text-xl">
                <Button className="mb-8">결과 보러가기</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    modalRoot
  )
}

export default Modal
