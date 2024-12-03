'use client'

import { useState, useRef, useEffect } from 'react'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

import ChatInput from '@/components/features/chat/chat-input'
import ChatMessage from '@/components/features/chat/chat-message'
import ChatNotice from '@/components/features/chat/chat-notice'
import { socket } from '@/lib/socket'
import { ChatType } from '@/types/chat'
import { PlayerModel } from '@/types/game'

interface ChatContainerProps {
  gameId: string
  player: PlayerModel
  setIsPreparingGame: (isPreparingGame: boolean) => void
  className?: string
}

const ChatContainer = ({ gameId, player, setIsPreparingGame, className }: ChatContainerProps) => {
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const [chats, setChats] = useState<ChatType[]>([])

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleNewChatMessage = (newChatMessage) => {
      setChats((prevChat) => [...prevChat, newChatMessage])
    }

    const handleNewChatNotice = (newChatNotice) => {
      setChats((prevChat) => [...prevChat, { type: 'notice', ...newChatNotice }])
      if (newChatNotice.notice !== '잠시 후 게임이 시작됩니다') {
        setIsPreparingGame(false)
      }
    }

    socket.on('new_chat_message', handleNewChatMessage)
    socket.on('new_chat_notice', handleNewChatNotice)
    socket.on('SERVER_ERROR', handleNewChatNotice)
    socket.on('HINTS_NOT_LOADED', handleNewChatNotice)
    socket.on('INITIALIZATION_ERROR', handleNewChatNotice)
    socket.on('NETWORK_ERROR', handleNewChatNotice)

    return () => {
      socket.off('new_chat_message')
      socket.off('new_chat_notice')
      socket.off('SERVER_ERROR')
      socket.off('HINTS_NOT_LOADED')
      socket.off('INITIALIZATION_ERROR')
      socket.off('NETWORK_ERROR')
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chats])

  const toggleChatExpansion = () => {
    setIsChatExpanded(!isChatExpanded)
  }

  return (
    <div className={twMerge('fixed bottom-1 w-full p-3 md:left-8 md:max-w-[358px]', className)}>
      <div
        className={clsx(
          'relative overflow-hidden rounded-[15px] bg-white bg-opacity-15 pr-3 transition-all duration-300 ease-in-out hover:bg-opacity-30',
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
          ref={chatContainerRef}
          className={clsx(
            'scrollbar-custom flex flex-col gap-2 overflow-auto py-2.5 pl-1 transition-all duration-300 ease-in-out',
            {
              'h-[194px]': isChatExpanded,
              'h-[97px]': !isChatExpanded,
            }
          )}
        >
          {chats.map((chat, index) => {
            return chat.type === 'message' ? (
              <ChatMessage key={index} chat={chat} />
            ) : (
              <ChatNotice key={index} chat={chat} />
            )
          })}
        </div>
      </div>
      <ChatInput gameId={gameId} player={player} />
    </div>
  )
}

export default ChatContainer
