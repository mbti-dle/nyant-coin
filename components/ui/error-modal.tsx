import { ErrorOutlineIcon } from '@/components/icons'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'

interface ErrorModalProps {
  isOpen: boolean
  title: string
  message: string
  buttonText: string
  onClick: () => void
}

const ErrorModal = ({ isOpen, title, message, buttonText, onClick }: ErrorModalProps) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="my-3 flex flex-col items-center">
        <ErrorOutlineIcon size={59} className="mb-4 text-red" />
        <p className="mb-4 text-xl">{title}</p>
        <p className="mb-7 text-center font-galmuri text-sm text-gray-400">
          {message.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <Button onClick={onClick} className="w-[240px]">
          {buttonText}
        </Button>
      </div>
    </Modal>
  )
}

export default ErrorModal
