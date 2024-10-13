'use client'

import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Button from '../ui/button'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ModalProps {
  title?: string
  content?: string
  buttonText?: string
  showButton?: boolean
}

const Modal = ({ title = '', content = '', buttonText = '', showButton = false }: ModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  if (!isModalOpen) return null

  return (
    <div
      className={twMerge(
        clsx('fixed inset-0 flex items-center justify-center bg-black bg-opacity-50')
      )}
      onClick={handleModalClose}
    >
      <div
        className={twMerge(clsx('w-[300px] overflow-hidden rounded-lg shadow-md'))}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={twMerge(clsx('flex h-[40px] items-center justify-between bg-primary px-4'))}
        >
          <h2 className="w-full text-center text-lg text-white">{title}</h2>
          <CloseIcon onClick={handleModalClose} className="cursor-pointer text-white" />
        </div>

        <div className="bg-white p-4">
          <p className="mt-2 text-sm">{content}</p>
          {showButton && <Button>{buttonText}</Button>}
        </div>
      </div>
    </div>
  )
}

export default Modal
