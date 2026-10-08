'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function LangToggle({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')

  useEffect(() => {
    // Check cookie first, then localStorage
    const match = document.cookie.match(/(?:^|; )mz_lang=([^;]*)/)
    const cookieLang = match ? decodeURIComponent(match[1]) : null
    const storedLang = (localStorage.getItem('mz_lang') || cookieLang || 'uz') as 'uz' | 'ru'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(storedLang === 'ru' ? 'ru' : 'uz')
  }, [])

  const switchLang = (newLang: 'uz' | 'ru') => {
    if (newLang === lang) return
    setLang(newLang)
    localStorage.setItem('mz_lang', newLang)
    document.cookie = `mz_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
    document.documentElement.lang = newLang
    router.refresh()
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-surface border border-border text-xs font-semibold select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => switchLang('uz')}
        className={`px-2.5 py-1 rounded-lg transition-all duration-150 active:scale-95 ${
          lang === 'uz'
            ? 'bg-accent text-white shadow-xs font-bold'
            : 'text-muted hover:text-fg'
        }`}
      >
        UZ
      </button>
      <button
        type="button"
        onClick={() => switchLang('ru')}
        className={`px-2.5 py-1 rounded-lg transition-all duration-150 active:scale-95 ${
          lang === 'ru'
            ? 'bg-accent text-white shadow-xs font-bold'
            : 'text-muted hover:text-fg'
        }`}
      >
        RU
      </button>
    </div>
  )
}
export default LangToggle

