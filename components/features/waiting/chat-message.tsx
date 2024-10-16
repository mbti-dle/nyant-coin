import Image from 'next/image'

type ChatMessageType = {
  imageUrl: string
  nickName: string
  message: string
}

interface ChatMessageProps {
  chat: ChatMessageType
}

const ChatMessage = ({ chat }: ChatMessageProps) => {
  return (
    <div className="flex font-galmuri">
      {chat.imageUrl ? (
        <div className="relative mr-3 h-8 w-8 overflow-hidden rounded-full bg-white bg-opacity-40">
          <div className="absolute inset-0 h-[30px] w-8 translate-x-0.5">
            <Image src={chat.imageUrl} alt="프로필" layout="fill" objectFit="cover" />
          </div>
        </div>
      ) : (
        <div className="relative mr-3 h-[30px] w-8"></div>
      )}

      <div className="flex min-w-36 max-w-[280px] flex-col rounded-[6px] bg-white px-3 py-2">
        <div className="text-xs text-gray-300">{chat.nickName}</div>
        <div className="text-gray-black text-sm">{chat.message}</div>
      </div>
    </div>
  )
}

export default ChatMessage
