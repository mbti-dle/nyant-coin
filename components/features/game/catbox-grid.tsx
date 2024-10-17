import { memo } from 'react'

import CatBox from '@/components/ui/cat-box'
import { Avatar, TransactionResult } from '@/types/game'

export interface CatBoxGridProps {
  avatars: Avatar[]
  transactionResult: TransactionResult
}

const CatBoxGrid: React.FC<CatBoxGridProps> = memo(({ avatars, transactionResult }) => (
  <div className="grid grid-cols-3 grid-rows-2 gap-2">
    {avatars.map((avatar, index) => (
      <CatBox
        key={index}
        {...avatar}
        transactionResult={avatar.nickName === '대장고양이' ? transactionResult : undefined}
      />
    ))}
  </div>
))

CatBoxGrid.displayName = 'CatBoxGrid'

export default CatBoxGrid
