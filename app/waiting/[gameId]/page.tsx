'use client'

import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import Button from '@/components/ui/button'
import CatBox from '@/components/ui/cat-box'

const WaitingPage = () => {
  const GAME_ID = 'DJ31DK' // 예시 게임ID

  const players = [
    { imageUrl: '/images/cat-1.png', nickName: '대장고양이', isLeader: true },
    { imageUrl: '/images/cat-2.png', nickName: '제임스' },
    { imageUrl: '/images/cat-3.png', nickName: '레드히어로' },
    { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요' },
    { imageUrl: '', nickName: '' },
    { imageUrl: '', nickName: '' },
  ]

  return (
    <main className="flex h-screen w-full flex-col items-center bg-sea-spaceship-mobile bg-cover bg-top md:bg-sea-spaceship-desktop">
      <div className="mb-8 mt-[180px] grid grid-cols-3 grid-rows-2 gap-4">
        {players.map((player, index) => (
          <CatBox
            key={index}
            imageUrl={player.imageUrl}
            nickName={player.nickName}
            isLeader={player.isLeader}
          />
        ))}
      </div>
      <GameIdCopyButton gameId={GAME_ID} />
      <Button
        onClick={() => {
          console.log('게임 시작')
        }}
      >
        게임 시작
      </Button>
    </main>
  )
}

export default WaitingPage
