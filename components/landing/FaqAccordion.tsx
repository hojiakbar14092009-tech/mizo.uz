'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface/80 backdrop-blur-sm">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              type="button"
              id={`faq-q-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent rounded-2xl"
            >
              <span className="font-mono text-xs text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className={`flex-1 text-[15px] font-semibold transition-colors ${isOpen ? 'text-accent' : 'text-fg group-hover:text-accent'}`}>
                {item.q}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                  isOpen ? 'rotate-45 border-accent bg-accent text-surface' : 'border-border text-muted group-hover:border-accent group-hover:text-accent'
                }`}
              >
                <PlusIcon className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <motion.p
                    initial={{ y: -6 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[62ch] px-5 pb-6 pl-[3.25rem] text-[15px] leading-relaxed text-muted sm:px-6 sm:pl-[3.6rem]"
                  >
                    {item.a}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
