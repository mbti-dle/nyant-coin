import Image from 'next/image'

import { ChatMessageModel } from '@/types/chat'

interface ChatMessageProps {
  chat: ChatMessageModel
}

const ChatMessage = ({ chat }: ChatMessageProps) => {
  return (
    <div className="flex font-galmuri">
      {chat.imageUrl ? (
        <div className="relative mx-1 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white bg-opacity-40 p-5">
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

      <div className="mr-4 flex min-w-36 flex-col rounded-[6px] bg-white px-3.5 py-2 md:max-w-[250px]">
        {chat.nickname && <div className="mb-1 text-xs text-gray-300">{chat.nickname}</div>}
        <div className="text-sm text-black">{chat.message}</div>
      </div>
    </div>
  )
}

export default ChatMessage
