import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { ChatType } from '@/types/chat'

interface ChatStoreModel {
  chats: Record<string, ChatType[]>
  addMessage: (gameId: string, message: ChatType) => void
  setMessages: (gameId: string, messages: ChatType[]) => void
  clearChats: (gameId: string) => void
}

const MAX_CHAT_HISTORY = 50

const useChatStore = create<ChatStoreModel>()(
  persist(
    (set) => ({
      chats: {},
      addMessage: (gameId, message) =>
        set((state) => {
          const currentChats = state.chats[gameId] || []
          const updatedChats = [...currentChats, message].slice(-MAX_CHAT_HISTORY)
          return {
            chats: {
              ...state.chats,
              [gameId]: updatedChats,
            },
          }
        }),
      setMessages: (gameId, messages) =>
        set((state) => ({
          chats: {
            ...state.chats,
            [gameId]: messages.slice(-MAX_CHAT_HISTORY),
          },
        })),
      clearChats: (gameId) =>
        set((state) => {
          const newChats = { ...state.chats }
          delete newChats[gameId]
          return { chats: newChats }
        }),
    }),
    {
      name: 'nyant-coin-chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useChatStore
