// components/ui/Button.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { LoadingSpinner } from './LoadingSpinner'
import clsx from 'clsx'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  as: AsComponent = null,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gold-gradient text-dark-950 hover:shadow-gold-lg hover:-translate-y-1 btn-hover-effect',
    secondary: 'bg-transparent text-gold-500 border-2 border-gold-500 hover:bg-gold-500 hover:text-dark-950 btn-gold-outline',
    outline: 'bg-transparent text-gold-400 border border-gold-400 hover:bg-gold-400 hover:text-dark-950',
    ghost: 'bg-transparent text-gold-400 hover:bg-gold-400 hover:bg-opacity-10',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }

  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className,
    {
      'pointer-events-none': isLoading || disabled,
    }
  )

  // Support rendering as another component (e.g., React Router Link)
  if (AsComponent) {
    const MotionComp = motion(AsComponent)
    return (
      <MotionComp
        className={buttonClasses}
        onClick={onClick}
        aria-disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </MotionComp>
    )
  }

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}