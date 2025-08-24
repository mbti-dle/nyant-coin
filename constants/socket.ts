export const SOCKET_ERROR_TYPES = {
  DISCONNECT: 'disconnect',
  TAB_SWITCH_WARNING: 'tab_switch_warning',
  NETWORK_ERROR: 'network_error',
} as const

export type SocketErrorType = (typeof SOCKET_ERROR_TYPES)[keyof typeof SOCKET_ERROR_TYPES]

export const SOCKET_ERROR_MESSAGES: Record<SocketErrorType, { title: string; message: string }> = {
  disconnect: {
    title: '연결이 끊어졌습니다',
    message: '서버와의 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.',
  },
  tab_switch_warning: {
    title: '잠시 자리를 비우셨네요',
    message: '계속 사용하시겠습니까?',
  },
  network_error: {
    title: '네트워크 오류',
    message: '인터넷 연결을 확인해주세요.',
  },
}

export const SOCKET_ERROR_BUTTONS: Record<
  SocketErrorType,
  {
    primary: string
    secondary?: string
    showTwoButtons: boolean
  }
> = {
  disconnect: {
    primary: '재연결',
    secondary: '나중에',
    showTwoButtons: true,
  },
  tab_switch_warning: {
    primary: '나가기',
    secondary: '계속하기',
    showTwoButtons: true,
  },
  network_error: {
    primary: '재시도',
    secondary: '확인',
    showTwoButtons: true,
  },
}
