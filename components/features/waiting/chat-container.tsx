import ChatInput from '@/components/features/waiting/chat-input'
import ChatMessage from '@/components/features/waiting/chat-message'

const ChatContainer = () => {
  const chats = [
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

  return (
    <div className="fixed bottom-4">
      <div className="scrollbar-custom flex h-[194px] w-[358px] flex-col gap-2 overflow-auto rounded-[15px] bg-white bg-opacity-10 p-2.5">
        {chats.map((chat, index) => {
          return <ChatMessage key={index} chat={chat} />
        })}
      </div>
      <ChatInput />
    </div>
  )
}

export default ChatContainer
