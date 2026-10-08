'use client'

import { motion } from 'framer-motion'

interface LanguageToggleProps {
  currentLang: 'uz' | 'ru'
  onChange: (lang: 'uz' | 'ru') => void
}

export function LanguageToggle({ currentLang, onChange }: LanguageToggleProps) {
  return (
    <motion.button
      onClick={() => onChange(currentLang === 'uz' ? 'ru' : 'uz')}
      className="relative inline-flex h-10 items-center rounded-full bg-slate-700 px-1 transition-colors duration-300 hover:bg-accent/30"
      whileHover={{ boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)' }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Languages text */}
      <div className="flex w-full items-center justify-between px-2 gap-1 relative z-10">
        <span className={`text-xs font-medium transition-colors ${currentLang === 'uz' ? 'text-white' : 'text-slate-400'}`}>
          Уз
        </span>
        <span className="text-xs text-slate-400">•</span>
        <span className={`text-xs font-medium transition-colors ${currentLang === 'ru' ? 'text-white' : 'text-slate-400'}`}>
          Ру
        </span>
      </div>

      {/* Sliding dot indicator */}
      <motion.div
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-accent shadow-lg"
        animate={{
          x: currentLang === 'uz' ? 0 : 34,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      />
    </motion.button>
  )
}
