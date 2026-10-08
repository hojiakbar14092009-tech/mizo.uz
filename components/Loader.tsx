'use client'

import React, { useEffect, useState } from 'react'
import { Logo } from './Logo'

const DEFAULT_MESSAGES = [
  'AI tahlil qilmoqda...',
  'Kredit stavkalari solishtirilmoqda...',
  'Natijalar tayyorlanmoqda...',
]

interface LoaderProps {
  messages?: string[]
  className?: string
}

export function Loader({
  messages = DEFAULT_MESSAGES,
  className = '',
}: LoaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [messages])

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}
    >
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Aylanuvchi tashqi halqa */}
        <div className="absolute inset-0 rounded-full border-4 border-border border-t-accent animate-spin" />
        {/* Markazdagi pulsirlovchi logo */}
        <div className="animate-pulse">
          <Logo size="sm" showText={false} />
        </div>
      </div>

      <div className="h-6 flex items-center justify-center">
        <p className="text-sm font-medium text-muted transition-all duration-300 animate-pulse">
          {messages[currentIndex]}
        </p>
      </div>
    </div>
  )
}
export default Loader

