import { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import '@/styles/components/ui.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className,
  ...props 
}: ButtonProps) => {
  const buttonClass = clsx(
    'btn',
    {
      'btn--primary': variant === 'primary',
      'btn--secondary': variant === 'secondary',
      'btn--ghost': variant === 'ghost',
      'btn--small': size === 'small',
      'btn--medium': size === 'medium',
      'btn--large': size === 'large',
      'w-full': fullWidth,
    },
    className
  )

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  )
}