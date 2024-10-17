import CatBox from '@/components/ui/cat-box'

const PlayerGrid = () => {
  const players = [
    { imageUrl: '/images/cat-1.png', nickName: '대장고양이' },
    { imageUrl: '/images/cat-2.png', nickName: '제임스' },
    { imageUrl: '/images/cat-3.png', nickName: '레드히어로' },
    { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요' },
    { imageUrl: '', nickName: '' },
    { imageUrl: '', nickName: '' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {players.map((player, index) => (
        <div key={index} className="flex justify-center">
          <CatBox imageUrl={player.imageUrl} nickName={player.nickName} isLeader={index === 0} />
        </div>
      ))}
    </div>
  )
}
export default PlayerGrid