import { ArrowLeft, ArrowRight } from '@mui/icons-material'
import Image from 'next/image'

import IconButton from '@/components/ui/icon-button'

const AvatarSelector = ({ currentAvatarIndex, onPrevClick, onNextClick }) => {
  return (
    <div className="mb-10 flex items-center justify-center">
      <IconButton
        Icon={ArrowLeft}
        label="왼쪽"
        className="h-[47px] w-[47px] text-gray-400 hover:text-gray-200"
        onClick={onPrevClick}
        sx={{ fontSize: 48 }}
      />
      <div className="relative ml-1 h-[110px] w-[110px]">
        <Image fill src={`/images/cat-${currentAvatarIndex}.png`} alt="고양이" />
      </div>
      <IconButton
        Icon={ArrowRight}
        label="오른쪽"
        className="h-[47px] w-[47px] text-gray-400 hover:text-gray-200"
        onClick={onNextClick}
        sx={{ fontSize: 48 }}
      />
    </div>
  )
}

export default AvatarSelector
