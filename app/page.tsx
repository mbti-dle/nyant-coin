import LinkButton from '@/components/ui/link-button'

const HomePage = () => {
  return (
    <>
      <h1>Main Page</h1>
      <LinkButton href="/select-days">방 만들기</LinkButton>
      <LinkButton href="/nickname">방 입장하기</LinkButton>
      <br />
    </>
  )
}

export default HomePage
