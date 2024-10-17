'use client'

import { useState } from 'react'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import clsx from 'clsx'

import ChatInput from '@/components/features/waiting/chat-input'
import ChatMessage from '@/components/features/waiting/chat-message'
const mockChatsData = [
  {
    imageUrl: '/images/cat-1.png',
    nickName: '대장고양이',
    message:
      '준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.',
  },
  { imageUrl: '', nickName: '', message: '준비됐나요?' },
  { imageUrl: '', nickName: '', message: '일단은 그냥 시작!' },
  { imageUrl: '/images/cat-2.png', nickName: '알엘린', message: '아직 준비 안 됐어요!' },
  { imageUrl: '', nickName: '', message: '잠시만요!' },
  {
    imageUrl: '/images/cat-4.png',
    nickName: '마크정식주세요제발요',
    message: '마크정식주세요제발요',
  },
]

const ChatContainer = () => {
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  const toggleChatExpansion = () => {
    setIsChatExpanded(!isChatExpanded)
  }
  return (
    <div className="fixed bottom-1 w-full max-w-[358px] p-3 md:bottom-11 md:left-8">
      <div
        className={clsx(
          'relative overflow-hidden rounded-[15px] bg-white bg-opacity-10 pr-3 transition-all duration-300 ease-in-out',
          {
            'h-[194px]': isChatExpanded,
            'h-[97px]': !isChatExpanded,
          }
        )}
      >
        <button
          className="z-1000 absolute right-1 top-1 cursor-pointer"
          onClick={toggleChatExpansion}
        >
          {isChatExpanded ? (
            <ExpandMoreIcon className="text-[#626262]" fontSize="medium" />
          ) : (
            <ExpandLessIcon className="text-[#626262]" fontSize="medium" />
          )}
        </button>
        <div
          className={clsx(
            'scrollbar-custom flex flex-col gap-2 overflow-auto py-2.5 pl-1 transition-all duration-300 ease-in-out',
            {
              'h-[194px]': isChatExpanded,
              'h-[97px]': !isChatExpanded,
            }
          )}
        >
          {mockChatsData.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
      </div>
      <ChatInput />
    </div>
  )
}

export default ChatContainer
