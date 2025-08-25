import { act, useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { io } from 'socket.io-client'

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

describe('📡 Socket.IO - Disconnect Handling', () => {
  const DISCONNECT_ERROR = {
    title: '연결이 끊어졌습니다',
    message: '서버와의 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.',
  }

  const mockOn = jest.fn()
  ;(io as jest.Mock).mockReturnValue({
    on: mockOn,
    emit: jest.fn(),
    disconnect: jest.fn(),
  })

  const TestComponent = () => {
    io().on('disconnect', () => {})

    return <></>
  }

  beforeEach(() => {
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', 'modal-root')
    document.body.appendChild(modalRoot)
  })

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root')
    if (modalRoot) document.body.removeChild(modalRoot)
  })

  test('✅ disconnect 이벤트 발생 시 모달이 표시되는지 확인', async () => {
    render(<TestComponent />)

    await act(async () => {
      const disconnectHandler = mockOn.mock.calls.find(([event]) => event === 'disconnect')?.[1]
      if (disconnectHandler) {
        console.log('✅ disconnect 이벤트 실행됨')
        disconnectHandler()
      } else {
        console.error('❌ disconnect 이벤트 핸들러가 등록되지 않음')
      }
    })

    const matches = await screen.findAllByText(/연결이 끊어졌습니다/)
    expect(matches.length).toBeGreaterThan(0)

    await userEvent.click(screen.getByText('홈으로 이동'))

    expect(screen.queryByText(/연결이 끊어졌습니다/)).not.toBeInTheDocument()
  })
})
