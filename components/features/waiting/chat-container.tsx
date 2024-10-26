'use client'

import { useState, useRef, useEffect } from 'react'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import clsx from 'clsx'

import ChatInput from '@/components/features/waiting/chat-input'
import ChatMessage from '@/components/features/waiting/chat-message'
import { socket } from '@/lib/socket'
import { ChatMessageModel } from '@/types/chat'
import { PlayerModel } from '@/types/game'
// import useChatStore from '@/store/chat'

interface ChatContainerProps {
  gameId: string
  player: PlayerModel
}

const ChatContainer = ({ gameId, player }: ChatContainerProps) => {
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessageModel[]>([])

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    socket.on('new_chat_message', (chatMessage) => {
      setChatMessages((prevChat) => [...prevChat, chatMessage])
    })

    return () => {
      socket.off('new_chat_message')
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // 해석
  // const messages = useChatStore((state) => state.messages)
  // const messagesEndRef = useRef<HTMLDivElement>(null)

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  const toggleChatExpansion = () => {
    setIsChatExpanded(!isChatExpanded)
  }

  return (
    <div className="fixed bottom-1 w-full p-3 md:bottom-11 md:left-8 md:max-w-[358px]">
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
          {chatMessages.map((chat, index) => (
            // {messages.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
          {/* <div ref={messagesEndRef} /> */}
        </div>
      </div>
      <ChatInput gameId={gameId} player={player} />
    </div>
  )
}

export default ChatContainer
