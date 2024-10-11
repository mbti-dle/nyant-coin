import { FC } from 'react'

import HintItem from '@/components/hint-item'
import getHints from '@/lib/api/get-hints'

const HintList: FC = async () => {
  const hints = await getHints()

  return (
    <div>
      {hints.map((hint) => (
        <HintItem key={hint.id} hint={hint} />
      ))}
    </div>
  )
}

export default HintList
