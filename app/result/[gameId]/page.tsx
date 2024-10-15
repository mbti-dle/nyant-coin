import LinkButton from '@/components/ui/link-button'

const ResultPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <div className="text-gold">결과페이지</div>
      <LinkButton href={`/waiting/${gameId}`}>대기실 이동하기</LinkButton>
    </>
  )
}

export default ResultPage
