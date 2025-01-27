import { ErrorIcon } from '@/components/icons'
import { ChatNoticeModel } from '@/types/chat'

interface ChatNoticeProps {
  chat: ChatNoticeModel
}

const ChatNotice = ({ chat }: ChatNoticeProps) => {
  return (
    <div className="ml-12 mr-4 flex min-w-36 items-center rounded-[6px] bg-gray-100 px-3.5 py-2 font-galmuri text-xs text-gray-400 md:max-w-[250px]">
      <ErrorIcon className="mr-2 text-sm" size={24} />
      {chat.notice}
    </div>
  )
}

export default ChatNotice
