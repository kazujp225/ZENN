import { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

interface ChipProps {
  children: ReactNode
  onClick?: () => void
  selected?: boolean
  size?: 'small' | 'medium'
  href?: string
}

export const Chip = ({ 
  children, 
  onClick,
  selected = false,
  size = 'medium',
  href
}: ChipProps) => {
  const className = clsx(
    'chip',
    {
      'chip--selected': selected,
      'chip--small': size === 'small',
      'chip--medium': size === 'medium',
      'cursor-pointer': onClick || href,
    }
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    )
  }

  return (
    <span className={className}>
      {children}
    </span>
  )
}