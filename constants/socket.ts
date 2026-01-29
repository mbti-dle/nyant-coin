export const SOCKET_ERROR_TYPES = {
  TAB_SWITCH_WARNING: 'tab_switch_warning',
} as const

export type SocketErrorType = (typeof SOCKET_ERROR_TYPES)[keyof typeof SOCKET_ERROR_TYPES]

export const SOCKET_ERROR_MESSAGES: Record<SocketErrorType, { title: string; message: string }> = {
  tab_switch_warning: {
    title: '잠시 자리를 비우셨네요',
    message: '계속 사용하시겠습니까?',
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
  tab_switch_warning: {
    primary: '나가기',
    secondary: '계속하기',
    showTwoButtons: true,
  },
}

export const SOCKET_TIMEOUTS = {
  TAB_SWITCH_WARNING: 20000,
  TAB_SWITCH_FINAL: 40000,
} as const

export const TOTAL_GRACE_PERIOD =
  SOCKET_TIMEOUTS.TAB_SWITCH_WARNING + SOCKET_TIMEOUTS.TAB_SWITCH_FINAL

export const INACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000 // 3시간 (밀리초)
