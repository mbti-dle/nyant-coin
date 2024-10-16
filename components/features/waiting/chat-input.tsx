'use client'

import { useState } from 'react'

import SendIcon from '@mui/icons-material/Send'

import IconButton from '@/components/ui/icon-button'

const ChatInput = () => {
  const [message, setMessage] = useState('')

  const handleInputChange = (event) => {
    const input = event.target.value
    setMessage(input)
  }

  const handleSubmitMessage = () => {
    if (message.trim()) {
      // 공백만 있을 경우, 전송 로직 동작 X

      // 메세지 전송 로직
      console.log(message.trim())
      setMessage('')
    }
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // 줄바꿈 기본 동작 막음
      handleSubmitMessage()
    }
  }

  return (
    <div className="mt-4 flex h-[48px] w-[358px] items-center overflow-hidden rounded-[30px] shadow-md">
      <textarea
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyDown}
        placeholder="채팅을 입력해 주세요."
        className="h-12 flex-grow resize-none px-4 py-3 font-galmuri text-sm focus:outline-none"
        maxLength={100}
      />
      <IconButton
        Icon={SendIcon}
        label="전송"
        className="bg-blue-500 bg-white py-3 text-blue"
        onClick={handleSubmitMessage}
      />
    </div>
  )
}

export default ChatInput
