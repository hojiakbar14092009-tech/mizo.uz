'use client'

import { motion } from 'framer-motion'

interface MizoLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MizoLogo({ size = 'md', className = '' }: MizoLogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-2xl',
    lg: 'w-12 h-12 text-4xl',
  }

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
      whileHover={{
        scale: 1.1,
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Rotating gradient M icon */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        whileHover={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {/* SVG M icon */}
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="logoGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* M shape */}
          <path
            d="M 20 80 L 20 20 L 50 50 L 80 20 L 80 80 M 50 50 L 50 80"
            stroke="url(#logoGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#logoGlow)"
          />
        </svg>

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{
            opacity: 1,
            scale: 1.3,
          }}
        />
      </motion.div>
    </motion.div>
  )
}
