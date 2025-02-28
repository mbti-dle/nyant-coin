export const SOCKET_ERROR_TYPES = {
  DISCONNECT: 'disconnect',
  RECONNECT_FAILED: 'reconnect_failed',
  CONNECT_TIMEOUT: 'connect_timeout',
  SERVER_UNREACHABLE: 'server_unreachable',
  BAD_REQUEST: 'bad_request',
} as const

export type SocketErrorType = keyof typeof SOCKET_ERROR_TYPES

export const SOCKET_ERROR_MESSAGES: Record<SocketErrorType, { title: string; message: string }> = {
  DISCONNECT: {
    title: '연결이 끊어졌습니다',
    message: '서버와의 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.',
  },
  RECONNECT_FAILED: {
    title: '재연결 실패',
    message: '서버에 다시 연결하려 했으나 실패했습니다. 잠시 후 다시 시도해주세요.',
  },
  CONNECT_TIMEOUT: {
    title: '연결 시간 초과',
    message: '서버와의 연결 시도가 시간 초과되었습니다. 네트워크 상태를 확인해주세요.',
  },
  SERVER_UNREACHABLE: {
    title: '서버 응답 없음',
    message: '서버가 다운되었거나 응답하지 않습니다. 잠시 후 다시 시도해주세요.',
  },
  BAD_REQUEST: {
    title: '잘못된 요청',
    message: '요청이 올바르지 않습니다. 다시 시도해주세요.',
  },
}
