// components/ui/Card.jsx
import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'card-gold',
    glass: 'glass-dark',
    solid: 'bg-dark-card border border-dark-border',
    gradient: 'bg-gradient-to-br from-dark-card to-dark-900 border border-gold-500 border-opacity-20'
  }

  const cardClasses = clsx(
    'rounded-xl transition-all duration-300',
    variants[variant],
    {
      'hover-lift': hover,
      'hover-glow': glow,
    },
    className
  )

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Card header component
export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gold-500 border-opacity-20 ${className}`}>
      {children}
    </div>
  )
}

// Card body component
export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

// Card footer component
export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gold-500 border-opacity-20 ${className}`}>
      {children}
    </div>
  )
}