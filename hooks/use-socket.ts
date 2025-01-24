import { useContext } from 'react'

import { SocketContext } from '@/components/provider/socket-provider'

export const useSocket = () => {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('SocketProvider로 감싸진 곳에서만 useSocket을 사용할 수 있습니다.')
  }

  return context
}
