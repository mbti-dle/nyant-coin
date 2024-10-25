import ErrorIcon from '@mui/icons-material/Error'
import Image from 'next/image'

import IconButton from '@/components/ui/icon-button'
import { ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
  chat: ChatMessageType
}

const ChatMessage = ({ chat }: ChatMessageProps) => {
  if (chat.type === 'system') {
    return (
      <div className="flex font-galmuri">
        <div className="ml-[45px] mr-3 flex min-w-36 flex-col rounded-[6px] bg-gray-100 px-3.5 py-2 md:max-w-[250px]">
          <div className="text-sm text-gray-400">
            <IconButton
              Icon={ErrorIcon}
              label="에러 아이콘"
              sx={{ fontSize: 16 }}
              className="ml-[-4px] mr-1 h-3 w-3 translate-y-[1px]"
            />
            {chat.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex font-galmuri">
      {chat.imageUrl ? (
        <div className="relative mr-1 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white bg-opacity-40 p-5">
          <Image
            src={chat.imageUrl}
            alt="프로필"
            width={32}
            height={30}
            className="absolute left-[5px] top-[4px]"
          />
        </div>
      ) : (
        <div className="mr-3 w-8"></div>
      )}

      <div className="mr-3 flex min-w-36 flex-col rounded-[6px] bg-white px-3.5 py-2 md:max-w-[250px]">
        {chat.nickName && <div className="mb-1 text-xs text-gray-300">{chat.nickName}</div>}
        <div className="text-sm text-black">{chat.message}</div>
      </div>
    </div>
  )
}

export default ChatMessage
