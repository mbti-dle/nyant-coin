'use client'

import { ReactNode, useState } from 'react'

import CloseIcon from '@mui/icons-material/CloseSharp'

import Button from '../ui/button'

import { createPortal } from 'react-dom'

interface ModalProps {
  title?: string
  children: ReactNode
  hasButton?: boolean
  isShowCloseButton?: boolean
  onClose?: () => void
}

const Modal = ({
  title = '',
  children = '',
  hasButton = false,
  isShowCloseButton = false,
  onClose,
}: ModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleModalClose = () => {
    setIsModalOpen(false)
    if (onClose) {
      onClose()
    }
  }

  if (!isModalOpen) return null

  const modalRoot = document.getElementById('modal-root')

  if (!modalRoot) return null

  return createPortal(
    <>
      <div className={`fixed inset-0 flex items-center justify-center bg-black/20`}>
        <div className="w-[300px] overflow-hidden rounded-lg shadow-md">
          <div className="flex h-[60px] w-[300px] items-center justify-between bg-primary px-4">
            <h2 className="w-full text-center text-lg text-white">{title}</h2>
            {isShowCloseButton && (
              <CloseIcon
                onClick={handleModalClose}
                className="cursor-pointer text-white"
                aria-label="닫기"
              />
            )}
          </div>

          <div className="bg-white p-4">
            {children}
            {hasButton && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleModalClose}>결과 보러가기</Button>
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
