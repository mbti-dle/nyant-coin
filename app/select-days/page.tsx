import React from 'react'

import Button from '@/components/ui/button'
import LinkButton from '@/components/ui/link-button'

const SelectDaysPage = () => {
  return (
    <>
      <h2>일수선책</h2>
      <Button>
        <LinkButton href="/nickname">다음</LinkButton>
      </Button>
    </>
  )
}

export default SelectDaysPage
