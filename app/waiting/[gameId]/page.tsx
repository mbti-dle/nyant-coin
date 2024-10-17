'use client'

import ChatContainer from '@/components/features/waiting/chat-container'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import LinkButton from '@/components/ui/link-button'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-sea-spaceship-mobile bg-cover bg-fixed bg-top p-3 md:bg-sea-spaceship-desktop">
      <div className="flex flex-col items-center justify-center gap-4 pb-44 md:static md:h-auto md:min-h-0 md:justify-center md:pt-0">
        <PlayerGrid />
        <GameIdCopyButton gameId={gameId} />
        <LinkButton href={`/game/${gameId}`}>게임 시작</LinkButton>
      </div>

      <ChatContainer />
    </main>
  )
}

export default WaitingPage
