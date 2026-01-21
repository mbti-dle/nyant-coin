'use client'

import { ErrorOutlineIcon } from '@/components/icons'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { SOCKET_ERROR_MESSAGES, SOCKET_ERROR_BUTTONS } from '@/constants/socket'
import { useModalStore } from '@/store/modal'

/**
 * [Global UI Component] 소켓 관련 에러/경고 모달입니다.
 * useModalStore에서 상태를 직접 구독하여 렌더링합니다.
 */
const ErrorModal = () => {
  const { modal, closeModal } = useModalStore()
  const { isOpen, type, countdownMessage, onPrimaryAction, onSecondaryAction } = modal

  if (!isOpen || !type) return null

  const messageConfig = SOCKET_ERROR_MESSAGES[type]
  const buttonConfig = SOCKET_ERROR_BUTTONS[type]

  const finalMessage = countdownMessage
    ? `${messageConfig.message}\n${countdownMessage}`
    : messageConfig.message

  const handlePrimaryClick = () => {
    onPrimaryAction?.()
    closeModal()
  }

  const handleSecondaryClick = () => {
    onSecondaryAction?.()
    closeModal()
  }

  return (
    <Modal isOpen={isOpen} zIndex={100}>
      <div className="my-3 flex flex-col items-center">
        <ErrorOutlineIcon size={59} className="mb-4 text-red" />
        <p className="mb-4 text-xl">{messageConfig.title}</p>
        <p className="mb-7 text-center font-galmuri text-sm text-gray-400">
          {finalMessage.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </p>

        {buttonConfig.showTwoButtons ? (
          <div className="flex w-full max-w-[240px] gap-3">
            <Button onClick={handleSecondaryClick} variant="white" className="flex-1">
              {buttonConfig.secondary}
            </Button>
            <Button onClick={handlePrimaryClick} className="flex-1">
              {buttonConfig.primary}
            </Button>
          </div>
        ) : (
          <Button onClick={handlePrimaryClick} className="w-[240px]">
            {buttonConfig.primary}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default ErrorModal
