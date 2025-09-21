// components/ui/LoadingSpinner.jsx
import React from 'react'
import { motion } from 'framer-motion'

export const LoadingSpinner = ({ size = 'md', className = '', color = 'gold' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    gold: 'border-gold-200 border-t-gold-500',
    white: 'border-gray-200 border-t-white',
    dark: 'border-dark-300 border-t-dark-800'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 ${colors[color]} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

// Skeleton loader component
export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div 
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
    />
  )
}

// Full page loading component
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-dark-950 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gold-400 text-lg font-medium">{message}</p>
      </div>
    </div>
  )
}