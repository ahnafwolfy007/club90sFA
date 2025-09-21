// components/ui/Input.jsx
import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'input-gold w-full',
    {
      'pl-10': leftIcon,
      'pr-10': rightIcon,
      'border-red-500 focus:border-red-500': error,
    },
    className
  )

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gold-400">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={inputClasses}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Textarea component
export const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const textareaClasses = clsx(
    'input-gold w-full resize-vertical',
    {
      'border-red-500 focus:border-red-500': error,
    },
    className
  )

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gold-400">
          {label}
        </label>
      )}
      
      <motion.textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={textareaClasses}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

// Select component
export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const selectClasses = clsx(
    'input-gold w-full',
    {
      'border-red-500 focus:border-red-500': error,
    },
    className
  )

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gold-400">
          {label}
        </label>
      )}
      
      <motion.select
        ref={ref}
        className={selectClasses}
        whileFocus={{ scale: 1.01 }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-dark-card text-text-primary"
          >
            {option.label}
          </option>
        ))}
      </motion.select>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Select.displayName = 'Select'