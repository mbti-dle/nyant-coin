export const SOCKET_ERROR_TYPES = {
  DISCONNECT: 'disconnect',
} as const

export type SocketErrorType = (typeof SOCKET_ERROR_TYPES)[keyof typeof SOCKET_ERROR_TYPES]

export const SOCKET_ERROR_MESSAGES: Record<SocketErrorType, { title: string; message: string }> = {
  disconnect: {
    title: '연결이 끊어졌습니다',
    message: '서버와의 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.',
  },
}
