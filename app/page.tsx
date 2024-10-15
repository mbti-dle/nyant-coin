import LinkButton from '@/components/ui/link-button'

const HomePage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <h1>Main Page</h1>
      <LinkButton href="/setup/select-days">방 만들기</LinkButton>
      <LinkButton href={`/setup/user-info/${gameId}`}>방 입장하기</LinkButton>
      <br />
    </>
  )
}

export default HomePage
