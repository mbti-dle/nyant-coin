'use client'

import ChatContainer from '@/components/features/waiting/chat-container'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Button from '@/components/ui/button'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <main className="relative flex h-screen min-h-dvh w-full items-center justify-center bg-sea-spaceship-mobile bg-cover bg-fixed bg-top md:bg-sea-spaceship-desktop">
      <div className="absolute bottom-[284px] flex flex-col items-center justify-center gap-4 pt-6 md:static md:h-auto md:min-h-0 md:justify-center md:pt-0">
        <PlayerGrid />
        <GameIdCopyButton gameId={gameId} />
        <Button
          onClick={() => {
            console.log('게임 시작')
          }}
        >
          게임 시작
        </Button>
      </div>

      <ChatContainer />
    </main>
  )
}

export default WaitingPage
