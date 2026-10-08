'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface QAItem {
  icon: string
  question: string
  answer: string
}

interface InteractiveQAProps {
  items: QAItem[]
}

export function InteractiveQA({ items }: InteractiveQAProps) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
          <motion.button
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            className="w-full text-left p-4 rounded-lg border border-border/30 hover:border-accent/50 transition-all duration-300 hover:bg-accent/5"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <motion.div
                className="text-2xl mt-1"
                animate={{ rotate: expanded === idx ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {item.icon}
              </motion.div>

              {/* Question */}
              <div className="flex-1 min-w-0">
                <p className="text-fg font-medium text-sm leading-tight">{item.question}</p>
              </div>

              {/* Arrow indicator */}
              <motion.div
                className="text-accent text-xl mt-1 flex-shrink-0"
                animate={{ rotate: expanded === idx ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ▼
              </motion.div>
            </div>
          </motion.button>

          {/* Answer expansion */}
          <AnimatePresence>
            {expanded === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-accent text-lg mt-0.5 flex-shrink-0">✅</span>
                    <p className="text-fg/80 text-sm leading-relaxed">{item.answer}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
