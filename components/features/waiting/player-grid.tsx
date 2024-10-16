import CatBox from '@/components/ui/cat-box'

const PlayerGrid = () => {
  const players = [
    { imageUrl: '/images/cat-1.png', nickName: '대장고양이', isLeader: true },
    { imageUrl: '/images/cat-2.png', nickName: '제임스' },
    { imageUrl: '/images/cat-3.png', nickName: '레드히어로' },
    { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요' },
    { imageUrl: '', nickName: '' },
    { imageUrl: '', nickName: '' },
  ]
  // mb-8
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-4">
      {players.map((player, index) => (
        <CatBox
          key={index}
          imageUrl={player.imageUrl}
          nickName={player.nickName}
          isLeader={player.isLeader}
        />
      ))}
    </div>
  )
}

export default PlayerGrid
