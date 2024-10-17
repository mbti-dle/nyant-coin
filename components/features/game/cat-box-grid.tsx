import { memo } from 'react'

import CatBox from '@/components/ui/cat-box'
import { AvatarModel, TransactionResultModel } from '@/types/game'

export interface CatBoxGridProps {
  avatars: AvatarModel[]
  transactionResult: TransactionResultModel
}

const CatBoxGrid = memo(({ avatars, transactionResult }: CatBoxGridProps) => (
  <div className="grid grid-cols-3 grid-rows-2 gap-2">
    {avatars.map((avatar) => (
      <CatBox
        key={avatar.id}
        {...avatar}
        transactionResult={avatar.nickName === '대장고양이' ? transactionResult : undefined}
      />
    ))}
  </div>
))

CatBoxGrid.displayName = 'CatBoxGrid'

export default CatBoxGrid
