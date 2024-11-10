import { ReactNode } from 'react'

import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface LinkButtonProps {
  href: string
  children: ReactNode
  onClick?: () => void
  className?: string
}

const LinkButton = ({ href, children, onClick, className }: LinkButtonProps) => {
  return (
    <button onClick={onClick}>
      <Link
        href={href}
        className={twMerge(
          'flex h-[54px] w-[300px] items-center justify-center rounded-xl bg-primary text-lg text-white hover:bg-navy',
          className
        )}
      >
        {children}
      </Link>
    </button>
  )
}

export default LinkButton
