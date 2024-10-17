import Image from 'next/image'

import { ChatMessageModel } from '@/types/chat'

interface ChatMessageProps {
  chat: ChatMessageModel
}

const ChatMessage = ({ chat }: ChatMessageProps) => {
  return (
    <div className="flex font-galmuri">
      {chat.imageUrl ? (
        <div className="relative mr-1 h-8 w-8 overflow-hidden rounded-full bg-white bg-opacity-40 p-5">
          <div className="absolute inset-0 h-[30px] w-8 translate-x-1.5 translate-y-1.5">
            <Image src={chat.imageUrl} alt="프로필" layout="fill" objectFit="cover" />
          </div>
        </div>
      ) : (
        <div className="relative mr-3 h-[30px] w-8"></div>
      )}

      <div className="flex min-w-36 max-w-[270px] flex-col rounded-[6px] bg-white px-3.5 py-2">
        {chat.nickName && <div className="mb-1 text-xs text-gray-300">{chat.nickName}</div>}
        <div className="text-sm text-black">{chat.message}</div>
      </div>
    </div>
  )
}

export default ChatMessage
