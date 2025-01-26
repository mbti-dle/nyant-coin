import Image from 'next/image'
import { MdArrowLeft, MdArrowRight } from 'react-icons/md'

import IconButton from '@/components/ui/icon-button'

const AvatarSelector = ({ currentAvatarIndex, onPrevClick, onNextClick }) => {
  return (
    <div className="mb-10 flex items-center justify-center">
      <IconButton
        Icon={MdArrowLeft}
        label="왼쪽"
        className="text-gray-300 hover:text-gray-500"
        onClick={onPrevClick}
        size={48}
      />
      <div className="relative ml-1 h-[110px] w-[110px]">
        <Image fill src={`/images/cat-${currentAvatarIndex}.png`} alt="고양이" />
      </div>
      <IconButton
        Icon={MdArrowRight}
        label="오른쪽"
        className="text-gray-300 hover:text-gray-500"
        onClick={onNextClick}
        size={48}
      />
    </div>
  )
}

export default AvatarSelector
