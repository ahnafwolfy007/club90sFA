// components/animations/GoldParticles.jsx
import React from 'react'
import { motion } from 'framer-motion'

export const GoldParticles = ({ count = 50, className = '' }) => {
  const particles = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-gold-500 rounded-full opacity-30"
      initial={{
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      }}
      animate={{
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  ))

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {particles}
    </div>
  )
}