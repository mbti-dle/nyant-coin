import { ErrorOutlineIcon } from '@/components/icons'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { SOCKET_ERROR_MESSAGES, SOCKET_ERROR_BUTTONS, SocketErrorType } from '@/constants/socket'

interface ErrorModalProps {
  isOpen: boolean
  type: SocketErrorType
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
  countdownMessage?: string
}

const ErrorModal = ({
  isOpen,
  type,
  onPrimaryAction,
  onSecondaryAction,
  countdownMessage,
}: ErrorModalProps) => {
  const messageConfig = SOCKET_ERROR_MESSAGES[type]
  const buttonConfig = SOCKET_ERROR_BUTTONS[type]

  const finalMessage = countdownMessage
    ? `${messageConfig.message}\n${countdownMessage}`
    : messageConfig.message

  return (
    <Modal isOpen={isOpen}>
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
            <Button onClick={onSecondaryAction} variant="white" className="flex-1">
              {buttonConfig.secondary}
            </Button>
            <Button onClick={onPrimaryAction} className="flex-1">
              {buttonConfig.primary}
            </Button>
          </div>
        ) : (
          <Button onClick={onPrimaryAction} className="w-[240px]">
            {buttonConfig.primary}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default ErrorModal
