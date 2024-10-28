import { ReactNode } from 'react'

import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface LinkButtonProps {
  href: string
  children: ReactNode
  className?: string
}

const LinkButton = ({ href, children, className }: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={twMerge(
        'hover:bg-navy flex h-[54px] w-[300px] items-center justify-center rounded-xl bg-primary text-lg text-white',
        className
      )}
    >
      {children}
    </Link>
  )
}

export default LinkButton
