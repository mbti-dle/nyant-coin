import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'

interface BackgroundProps {
  desktopImage: StaticImport
  mobileImage: StaticImport
}

const Background = ({ desktopImage, mobileImage }: BackgroundProps) => {
  return (
    <>
      <Image
        alt="배경"
        src={desktopImage}
        fill
        sizes="(max-width: 768px) 0px, 100vw"
        className="-z-10 hidden object-cover md:block"
        priority
      />
      <Image
        alt="배경"
        src={mobileImage}
        fill
        sizes="(min-width: 768px) 0px, 100vw"
        className="-z-10 block object-cover md:hidden"
        priority
      />
    </>
  )
}

export default Background
