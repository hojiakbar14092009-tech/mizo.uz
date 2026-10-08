'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedCardProps {
  icon: string
  title: string
  solution: string
  delay?: number
}

export function AnimatedCard({ icon, title, solution, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="group relative p-5 rounded-lg border border-border/30 hover:border-accent/50 transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent/5" />

      {/* Content */}
      <div className="relative space-y-3">
        {/* Icon with bounce animation */}
        <motion.div
          className="text-3xl"
          whileHover={{ scale: 1.28, rotate: 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-fg group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>

        {/* Solution with checkmark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-xs text-fg/60 flex items-start gap-2"
        >
          <span className="text-accent mt-0.5">✅</span>
          <span>{solution}</span>
        </motion.div>
      </div>

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: '0 0 0 1px rgba(96, 165, 250, 0)',
        }}
        whileHover={{
          boxShadow: '0 0 16px rgba(96, 165, 250, 0.5)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
