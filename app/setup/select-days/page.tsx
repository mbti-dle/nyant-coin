import React from 'react'

import LinkButton from '@/components/ui/link-button'

const SelectDaysPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <h2>일수선책</h2>
      <LinkButton href={`/setup/user-info/${gameId}`}>다음</LinkButton>
    </>
  )
}

export default SelectDaysPage
