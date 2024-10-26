import { create } from 'zustand'

import { ChatMessageType, UserMessageModel } from '@/types/chat'

interface ChatStoreModel {
  messages: ChatMessageType[]
  addSystemMessage: (message: string) => void
  addMessage: (message: Omit<UserMessageModel, 'type'>) => void
}

const useChatStore = create<ChatStoreModel>((set) => ({
  messages: [
    {
      type: 'user',
      imageUrl: '/images/cat-1.png',
      nickName: '대장고양이',
      message:
        '준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.준비되면 시작합니다.',
    },
    { type: 'user', message: '준비됐나요?' },
    { type: 'user', message: '일단은 그냥 시작!' },
    {
      type: 'user',
      imageUrl: '/images/cat-2.png',
      nickName: '알엘린',
      message: '아직 준비 안 됐어요!',
    },
    { type: 'user', message: '잠시만요!' },
    {
      type: 'user',
      imageUrl: '/images/cat-4.png',
      nickName: '마크정식주세요제발요',
      message: '마크정식주세요제발요',
    },
  ],
  addSystemMessage: (message: string) =>
    set((state) => ({
      messages: [...state.messages, { type: 'system', message }],
    })),

  addMessage: ({ imageUrl, nickName, message }) =>
    set((state) => ({
      messages: [...state.messages, { type: 'user', imageUrl, nickName, message }],
    })),
}))

export default useChatStore
