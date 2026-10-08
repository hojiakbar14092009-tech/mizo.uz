'use client'

import React, { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('mz_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('mz_theme', 'light')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Rang rejimini almashtirish"
      className={`p-2 rounded-xl border border-border bg-surface text-muted hover:text-fg hover:border-accent/40 transition-all duration-150 active:scale-95 ${className}`}
    >
      {isDark ? (
        <SunIcon className="w-4 h-4 text-warning stroke-[2]" />
      ) : (
        <MoonIcon className="w-4 h-4 text-muted stroke-[2]" />
      )}
    </button>
  )
}
export default ThemeToggle

