'use client'

import { useState } from 'react'

import { SendIcon } from '@/components/icons'
import IconButton from '@/components/ui/icon-button'
import { useSocket } from '@/hooks/use-socket'

const ChatInput = ({ gameId, player }) => {
  const [message, setMessage] = useState('')

  const { socket } = useSocket()

  const handleInputChange = (event) => {
    const input = event.target.value
    setMessage(input)
  }

  const handleMessageSubmit = () => {
    if (message.trim()) {
      event.preventDefault()

      socket.emit('send_message', {
        gameId,
        playerId: player.id,
        nickname: player.nickname,
        character: player.character,
        message,
      })

      setMessage('')
    }
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleMessageSubmit()
    }
  }

  return (
    <div className="mt-2 flex h-[48px] items-center overflow-hidden rounded-[30px] shadow-md">
      <textarea
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyDown}
        placeholder="채팅을 입력해 주세요."
        className="h-12 flex-grow resize-none rounded-[0px] px-5 py-3 font-galmuri text-base text-black placeholder-gray-200 focus:outline-none"
        maxLength={100}
      />
      <IconButton
        Icon={SendIcon}
        label="전송"
        className="bg-blue-500 bg-white px-4 py-3 text-blue"
        onClick={handleMessageSubmit}
        size={24}
      />
    </div>
  )
}

export default ChatInput
