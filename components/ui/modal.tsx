'use client'

import { ReactNode, useState } from 'react'

import CloseIcon from '@mui/icons-material/CloseSharp'

import Button from '../ui/button'
import ModalPortal from '../ui/modal-potal'

interface ModalProps {
  title?: ReactNode
  content?: ReactNode
  button?: boolean
  isShowCloseButton?: boolean
  onClose?: () => void
}

const Modal = ({
  title = '',
  content = '',
  button = false,
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

  return (
    <ModalPortal>
      <div className={`fixed inset-0 flex items-center justify-center bg-black/20`}>
        <div className="w-[300px] overflow-hidden rounded-lg shadow-md">
          <div className="flex h-[40px] w-[300px] items-center justify-between bg-primary px-4">
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
            <p className="mt-2 text-sm">{content}</p>
            {button && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleModalClose}>결과 보러가기</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export default Modal
