'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const STATIC_PARTICLES = Array.from({ length: 36 }).map((_, i) => {
  const colors = ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6']
  const pseudoX = ((i * 73 + 17) % 450) - 225
  const pseudoY = -(((i * 59 + 29) % 350) + 20)
  const pseudoR = ((i * 13) % 8) + 4
  const pseudoScale = 0.6 + ((i * 7) % 8) * 0.1
  const pseudoRot = (i * 97) % 360
  return {
    id: i,
    x: pseudoX,
    y: pseudoY,
    r: pseudoR,
    color: colors[i % colors.length],
    scale: pseudoScale,
    rot: pseudoRot,
  }
})

// Konfetti zarrachalar (Framer Motion bilan, qo'shimcha kutubxonasiz)
export function ConfettiParticles({ active = true }: { active?: boolean }) {
  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-50">
      {STATIC_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotate: p.rot + 360,
          }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{
            width: `${p.r}px`,
            height: `${p.r * 1.5}px`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

// Chizilib chiquvchi ✓ belgisi (Animated draw SVG path)
export function DrawCheckmark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-accent"
      >
        <motion.circle
          cx="26"
          cy="26"
          r="23"
          stroke="currentColor"
          strokeWidth="3.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M15 27L22 34L37 19"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
        />
      </motion.svg>
    </div>
  )
}

// Raqamlar 0 dan count-up
export function CountUpNumber({
  value,
  duration = 1.2,
  formatNumber = true,
  suffix = '',
}: {
  value: number
  duration?: number
  formatNumber?: boolean
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState<number>(0)

  useEffect(() => {
    let startTime: number | null = null
    let frameId: number

    const step = (now: number) => {
      if (!startTime) startTime = now
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const current = Math.round(progress * value)
      setDisplayValue(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return (
    <span>
      {formatNumber ? displayValue.toLocaleString('uz-UZ') : displayValue}
      {suffix}
    </span>
  )
}

// Muvaffaqiyat halqasi (Success expanding ripple)
export function SuccessRing({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: [0.8, 1.8], opacity: [0.8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        className="absolute w-12 h-12 rounded-full border-2 border-accent"
      />
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
        <DrawCheckmark size={28} />
      </div>
    </div>
  )
}
