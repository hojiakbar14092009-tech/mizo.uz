'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="w-full relative z-10"
    >
      {children}
    </motion.div>
  )
}

