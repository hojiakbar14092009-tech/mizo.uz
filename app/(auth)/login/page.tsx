'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeroBackgroundTracker } from '@/components/HeroBackgroundTracker'
import { MizoLogo } from '@/components/MizoLogo'

export default function LoginPage() {
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('mz_lang')
    if (saved === 'uz' || saved === 'ru') setLang(saved)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-surface text-fg dark:bg-black dark:text-white relative overflow-hidden">
      <HeroBackgroundTracker />

      <header className="sticky top-0 z-50 border-b border-border/30 bg-surface/80 backdrop-blur-sm dark:bg-black/80 relative">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <MizoLogo size="md" />
            <span className="text-sm font-medium">Mizo</span>
          </Link>
          <button
            onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className="text-xs font-medium uppercase tracking-wide text-fg/60 hover:text-fg transition"
          >
            {lang === 'uz' ? 'Ру' : 'Уз'}
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 min-h-[calc(100vh-60px)] flex items-center justify-center px-6 py-8"
      >
        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold">{lang === 'uz' ? 'Kirish' : 'Вход'}</h1>
            <p className="text-fg/60 text-sm">
              {lang === 'uz' ? 'Moliyaviy salomatlikka yoʻl qoʻying' : 'Na puti k finansovomu zdorovʻyu'}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 p-6 rounded-lg border border-border/30 bg-surface-alt dark:bg-surface/50 backdrop-blur-sm"
          >
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-medium text-fg/70">Email</label>
              <motion.input
                type="email"
                placeholder="demo@mizo.uz"
                className="w-full px-3 py-2.5 rounded-lg bg-surface dark:bg-slate-800 border border-border/50 text-fg placeholder-fg/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                whileFocus={{
                  scale: 1.01,
                  boxShadow: '0 0 12px rgba(96, 165, 250, 0.3)',
                }}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-medium text-fg/70">{lang === 'uz' ? 'Parol' : 'Parol'}</label>
              <motion.input
                type="password"
                placeholder="Demo1234!"
                className="w-full px-3 py-2.5 rounded-lg bg-surface dark:bg-slate-800 border border-border/50 text-fg placeholder-fg/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                whileFocus={{
                  scale: 1.01,
                  boxShadow: '0 0 12px rgba(96, 165, 250, 0.3)',
                }}
              />
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-medium hover:shadow-lg hover:shadow-accent/50 transition-all duration-300"
            >
              {lang === 'uz' ? 'Kirish' : 'Vhod'}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-fg/50 space-y-1"
          >
            <p>{lang === 'uz' ? 'Test akkauntlar:' : 'Test akkauntlar:'}</p>
            <p className="font-mono">demo@mizo.uz / Demo1234!</p>
            <p className="font-mono">admin@mizo.uz / Admin1234!</p>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        :root {
          --surface: #fafafa;
          --surface-alt: #f3f3f3;
          --fg: #1a1a1a;
          --accent: #3b82f6;
          --border: #e0e0e0;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) {
            --surface: #0a0a0a;
            --surface-alt: #141414;
            --fg: #fafafa;
            --accent: #60a5fa;
            --border: #333;
          }
        }
      `}</style>
    </div>
  )
}
