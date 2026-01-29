'use client'

import { ReactNode } from 'react'

import clsx from 'clsx'
import { createPortal } from 'react-dom'

import { CloseIcon } from '@/components/icons'
import IconButton from '@/components/ui/icon-button'

interface ModalProps {
  title?: string
  children: ReactNode
  isShowCloseButton?: boolean
  onModalClose?: () => void
  isOpen: boolean
  shouldCloseOnBackgroundClick?: boolean
  zIndex?: number
}

const Modal = ({
  title = '',
  children,
  isShowCloseButton = false,
  onModalClose,
  isOpen,
  shouldCloseOnBackgroundClick = false,
  zIndex = 30,
}: ModalProps) => {
  if (!isOpen) return null

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/20"
        style={{ zIndex: zIndex - 1 }}
        onClick={shouldCloseOnBackgroundClick ? onModalClose : undefined}
      />
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
        style={{ zIndex }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="pointer-events-auto w-[300px] overflow-hidden rounded-lg bg-white shadow-md"
        >
          <div className="flex h-[60px] w-full items-center bg-primary">
            <div
              id="modal-title"
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
                className="mr-2 h-[40px] w-[40px] text-white"
                label="닫기"
                size={24}
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
