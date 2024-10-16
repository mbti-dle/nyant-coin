import LinkButton from '@/components/ui/link-button'

const UserInfoPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <h2>유저 설정페이지</h2>
      <LinkButton href={`/waiting/${gameId}`}>입장하기</LinkButton>
    </>
  )
}
export default UserInfoPage
