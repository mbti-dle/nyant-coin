/**
 * [Core Layer] SocketContext를 안전하게 사용하기 위한 커스텀 훅입니다.
 * SocketProvider 하위에서 socket 인스턴스와 공통 상태에 접근할 수 있게 합니다.
 */
import { useContext } from 'react'

import { SocketContext } from '@/components/provider/socket-provider'

export const useSocket = () => {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('SocketProvider로 감싸진 곳에서만 useSocket을 사용할 수 있습니다.')
  }

  return context
}
