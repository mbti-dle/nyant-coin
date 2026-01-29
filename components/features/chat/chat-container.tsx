'use client'

import { useState, useRef, useEffect } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

import ChatInput from '@/components/features/chat/chat-input'
import ChatMessage from '@/components/features/chat/chat-message'
import ChatNotice from '@/components/features/chat/chat-notice'
import { ExpandLessIcon, ExpandMoreIcon } from '@/components/icons'
import { STARTING_NOTICE, ERROR_NOTICE } from '@/constants/chat'
import { useSocket } from '@/hooks/socket/core/use-socket'
import useChatStore from '@/store/chat'
import { ChatType, ChatNoticeModel, ChatSyncModel } from '@/types/chat'
import { PlayerModel } from '@/types/game'

interface ChatContainerProps {
  gameId: string
  player: PlayerModel
  setIsPreparingGame: (isPreparingGame: boolean) => void
  className?: string
}

const EMPTY_CHATS: ChatType[] = []

const ChatContainer = ({ gameId, player, setIsPreparingGame, className }: ChatContainerProps) => {
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const { socket } = useSocket()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const chats = useChatStore((state) => state.chats[gameId]) || EMPTY_CHATS
  const addMessage = useChatStore((state) => state.addMessage)
  const { setMessages } = useChatStore.getState()

  const handleNewChatMessage = (newChatMessage: ChatType) => {
    addMessage(gameId, newChatMessage)
  }

  const handleNewChatNotice = (newChatNotice: ChatNoticeModel & Record<string, unknown>) => {
    const isStartingNotice = newChatNotice.notice === STARTING_NOTICE

    addMessage(gameId, {
      type: 'notice',
      notice: newChatNotice.notice || '',
      ...newChatNotice,
    })

    setIsPreparingGame(isStartingNotice)
  }

  const handleSyncHistory = (data: ChatSyncModel) => {
    if (data.chatLogs) {
      setMessages(gameId, data.chatLogs)
    }
  }

  const handleServerError = (data: unknown) =>
    handleNewChatNotice({
      type: 'notice',
      notice: ERROR_NOTICE.server_error,
      ...((data as object) || {}),
    })
  const handleHintsError = (data: unknown) =>
    handleNewChatNotice({
      type: 'notice',
      notice: ERROR_NOTICE.hints_not_loaded,
      ...((data as object) || {}),
    })
  const handleInitError = (data: unknown) =>
    handleNewChatNotice({
      type: 'notice',
      notice: ERROR_NOTICE.initialization_error,
      ...((data as object) || {}),
    })
  const handleNetworkError = (data: unknown) =>
    handleNewChatNotice({
      type: 'notice',
      notice: ERROR_NOTICE.network_error,
      ...((data as object) || {}),
    })

  useEffect(() => {
    if (!socket) return

    socket.on('new_chat_message', handleNewChatMessage)
    socket.on('new_chat_notice', handleNewChatNotice)
    socket.on('player_info', handleSyncHistory)
    socket.on('sync_complete', handleSyncHistory)
    socket.on('complete_round_sync', handleSyncHistory)
    socket.on('SERVER_ERROR', handleServerError)
    socket.on('HINTS_NOT_LOADED', handleHintsError)
    socket.on('INITIALIZATION_ERROR', handleInitError)
    socket.on('NETWORK_ERROR', handleNetworkError)

    return () => {
      socket.off('new_chat_message', handleNewChatMessage)
      socket.off('new_chat_notice', handleNewChatNotice)
      socket.off('player_info', handleSyncHistory)
      socket.off('sync_complete', handleSyncHistory)
      socket.off('complete_round_sync', handleSyncHistory)
      socket.off('SERVER_ERROR', handleServerError)
      socket.off('HINTS_NOT_LOADED', handleHintsError)
      socket.off('INITIALIZATION_ERROR', handleInitError)
      socket.off('NETWORK_ERROR', handleNetworkError)
    }
  }, [socket, gameId])

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
            <ExpandMoreIcon className="text-[#626262]" size={24} />
          ) : (
            <ExpandLessIcon className="text-[#626262]" size={24} />
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
              <ChatMessage key={`${gameId}-${index}`} chat={chat} />
            ) : (
              <ChatNotice key={`${gameId}-${index}`} chat={chat} />
            )
          })}
        </div>
      </div>
      <ChatInput gameId={gameId} player={player} />
    </div>
  )
}

export default ChatContainer
