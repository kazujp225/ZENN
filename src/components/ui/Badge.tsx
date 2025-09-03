import { ReactNode } from 'react'
import clsx from 'clsx'
import '@/styles/components/ui.css'

interface BadgeProps {
  children: ReactNode
  variant?: 'open' | 'closed' | 'primary' | 'secondary' | 'default' | 'success' | 'danger'
  size?: 'small' | 'medium'
  className?: string
}

export const Badge = ({ 
  children, 
  variant = 'secondary',
  size = 'small',
  className: additionalClassName
}: BadgeProps) => {
  const className = clsx(
    'badge',
    {
      'badge--open': variant === 'open',
      'badge--closed': variant === 'closed',
      'badge--primary': variant === 'primary',
      'badge--secondary': variant === 'secondary',
      'badge--default': variant === 'default',
      'badge--success': variant === 'success',
      'badge--danger': variant === 'danger',
      'badge--small': size === 'small',
      'badge--medium': size === 'medium',
    },
    additionalClassName
  )

  return (
    <span className={className}>
      {children}
    </span>
  )
}