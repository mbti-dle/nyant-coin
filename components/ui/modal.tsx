'use client'

import { ReactNode } from 'react'

import CloseIcon from '@mui/icons-material/CloseSharp'
import { createPortal } from 'react-dom'

import IconButton from '@/components/ui/icon-button'
import clsx from 'clsx'

interface ModalProps {
  title?: string
  children: ReactNode
  isShowCloseButton?: boolean
  onModalClose?: () => void
  isOpen: boolean
  shouldCloseOnBackgroundClick?: boolean
}

const Modal = ({
  title = '',
  children,
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
            <div
              className={clsx('flex-grow text-center text-xl text-white', {
                'ml-10': isShowCloseButton,
              })}
            >
              {title}
            </div>
            {isShowCloseButton && (
              <IconButton
                Icon={CloseIcon}
                onClick={onModalClose}
                className="mr-2 text-white"
                label="닫기"
              />
            )}
          </div>

          <div className="p-4 text-black">{children}</div>
        </div>
      </div>
    </>,
    modalRoot
  )
}

export default Modal
