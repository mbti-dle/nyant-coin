import LinkButton from '@/components/ui/link-button'

const GamePage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <div className="text-red">게임페이지</div>
      <LinkButton href={`/result/${gameId}`}>결과 보러가기</LinkButton>
    </>
  )
}

export default GamePage
