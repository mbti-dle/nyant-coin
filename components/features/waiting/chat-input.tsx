'use client'

import { useState } from 'react'

import SendIcon from '@mui/icons-material/Send'

import IconButton from '@/components/ui/icon-button'

const ChatInput = () => {
  const [message, setMessage] = useState('')

  const handleInputChange = (event) => {
    const input = event.target.value
    if (input.length <= 100) {
      setMessage(input)
    }
  }

  const handleSubmit = () => {
    // 메세지 전송 로직
    console.log(message)
    setMessage('')
  }

  return (
    <div className="mt-2 flex h-[48px] w-[358px] items-center overflow-hidden rounded-[30px] shadow-md">
      <textarea
        value={message}
        onChange={handleInputChange}
        placeholder="채팅을 입력해 주세요."
        className="h-12 flex-grow resize-none px-4 py-3 font-galmuri text-sm focus:outline-none"
        maxLength={100}
      />
      <IconButton
        Icon={SendIcon}
        label="전송"
        className="bg-blue-500 bg-white py-3 text-blue"
        onClick={handleSubmit}
      />
    </div>
  )
}

export default ChatInput
