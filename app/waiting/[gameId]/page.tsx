import LinkButton from '@/components/ui/link-button'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <h2 className="text-blue">대기 페이지</h2>
      <LinkButton href={`/game/${gameId}`}>게임 시작</LinkButton>
    </>
  )
}

export default WaitingPage
