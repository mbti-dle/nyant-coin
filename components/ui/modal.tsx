'use client'

import { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/CloseSharp'
import Button from '@/components/ui/button'
import { createPortal } from 'react-dom'
import IconButton from '@/components/ui/icon-button'

interface ModalProps {
  title?: string
  children: ReactNode
  hasButton?: boolean
  isShowCloseButton?: boolean
  onModalClose?: () => void
  isOpen: boolean
}

const Modal = ({
  title = '',
  children = '',
  hasButton = false,
  isShowCloseButton = false,
  onModalClose,
  isOpen,
}: ModalProps) => {
  if (!isOpen) return null

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <>
      <div className={`fixed inset-0 flex items-center justify-center bg-black/20`}>
        <div className="w-[300px] overflow-hidden rounded-lg shadow-md">
          <div className="flex h-[60px] w-[300px] items-center bg-primary">
            <div className="ml-10 flex-grow text-center text-xl text-white">{title} </div>
            {isShowCloseButton && (
              <IconButton
                Icon={CloseIcon}
                onClick={onModalClose}
                className="mr-2 text-white"
                label="닫기"
              />
            )}
          </div>

          <div className="bg-white p-4 text-black">
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
