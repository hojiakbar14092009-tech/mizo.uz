'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const features = [
  {
    uz: { title: 'AI Maslahatchi', desc: 'Moliyaviy savollaringizga real javoblar' },
    ru: { title: 'AI Советник', desc: 'Реальные ответы на финансовые вопросы' },
    icon: '🤖',
  },
  {
    uz: { title: 'Refinansirovka', desc: 'Qimmat qarz arzonarosiga o\'zgartiring' },
    ru: { title: 'Рефинансирование', desc: 'Замените дорогие кредиты дешёвыми' },
    icon: '💳',
  },
  {
    uz: { title: 'Tejash Rejasi', desc: 'Byudjet boʻyicha tejash topshiriq' },
    ru: { title: 'План Сбережений', desc: 'Найдите скрытые возможности экономии' },
    icon: '💰',
  },
  {
    uz: { title: 'Eslatmalar', desc: 'SMS orqali to\'lov vaqti eslatma' },
    ru: { title: 'Напоминания', desc: 'SMS когда приходит время платежа' },
    icon: '🔔',
  },
  {
    uz: { title: 'Firibgarlik Detector', desc: 'Red flags va xavfli signallarni aniqlang' },
    ru: { title: 'Детектор мошенничества', desc: 'Выявляйте красные флаги и риски' },
    icon: '⚠️',
  },
  {
    uz: { title: 'Boylik Simulyatori', desc: '5-10 yillik prognoza qiling' },
    ru: { title: 'Симулятор Капитала', desc: 'Спланируйте свой рост на 5-10 лет' },
    icon: '📈',
  },
  {
    uz: { title: 'Eng Yaxshi Kreditlar', desc: 'Barcha banklar bir yerdada' },
    ru: { title: 'Лучшие Кредиты', desc: 'Все банки в одном месте' },
    icon: '🏦',
  },
  {
    uz: { title: 'Hamjamiyat', desc: 'Boshqa foydalanuvchilarning tajribasi' },
    ru: { title: 'Сообщество', desc: 'Опыт других пользователей' },
    icon: '👥',
  },
]

export default function Home() {
  const [lang, setLang] = useState<'uz' | 'ru'>('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('mz_lang')
    if (saved === 'ru' || saved === 'uz') {
      setLang(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('mz_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = {
    uz: {
      tagline: 'Aqlli moliya — erkin kelajak',
      headline: 'Moliyaviy salomatlikka yo\'l qo\'ying',
      subheadline: 'Qarz, tejash, investitsiya va bogʻa — hamma bitta joyda, AI maslahat bilan',
      cta: 'Boshlash',
      login: 'Kirish',
      problems: 'Insonlar qanday muammolari bor?',
      solutions: 'Mizo qanday yechim beradi?',
      problem1: 'Qarzlardan qutula olmaydi',
      problem2: 'Tejasha olmaydi',
      problem3: 'Firibgarlarga zaif',
      problem4: 'Moliyaviy savoli boʻlganda javob yoʻq',
      solution1: 'Avalanche/Snowball rejasi',
      solution2: 'AI byudjet rejasi',
      solution3: 'Red flags detektori',
      solution4: 'Real Claude AI maslahat',
      features: 'Asosiy Funksiyalar',
      judges: 'Hakamlar uchun test akkaundi',
      demoEmail: 'demo@mizo.uz',
      demoPass: 'Demo1234!',
      admin: 'Admin',
      adminEmail: 'admin@mizo.uz',
      adminPass: 'Admin1234!',
    },
    ru: {
      tagline: 'Умные финансы — свободное будущение',
      headline: 'На пути к финансовому здоровью',
      subheadline: 'Кредиты, сбережения, инвестиции и цели — всё в одном месте с помощью AI',
      cta: 'Начать',
      login: 'Вход',
      problems: 'Какие проблемы решает Mizo?',
      solutions: 'Что вам помогает?',
      problem1: 'Не могу избавиться от долгов',
      problem2: 'Не получается копить деньги',
      problem3: 'Уязвим перед мошенниками',
      problem4: 'Нет советчика по финансам',
      solution1: 'План Avalanche/Snowball',
      solution2: 'AI план бюджета',
      solution3: 'Детектор риска',
      solution4: 'Советник на базе Claude AI',
      features: 'Основные функции',
      judges: 'Тестовый аккаунт для жюри',
      demoEmail: 'demo@mizo.uz',
      demoPass: 'Demo1234!',
      admin: 'Админ',
      adminEmail: 'admin@mizo.uz',
      adminPass: 'Admin1234!',
    },
  }

  const copy = t[lang]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-surface text-fg dark:bg-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-surface/80 backdrop-blur-sm dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">M</div>
            <span className="text-sm font-medium">Mizo</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
              className="text-xs font-medium uppercase tracking-wide text-fg/60 hover:text-fg transition"
            >
              {lang === 'uz' ? 'Ру' : 'Уз'}
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded text-sm font-medium text-accent hover:bg-accent/10 transition"
            >
              {copy.login}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-accent/70 uppercase tracking-wider">
              {copy.tagline}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {copy.headline}
            </h1>
          </div>
          <p className="text-lg text-fg/70 max-w-2xl mx-auto leading-relaxed">
            {copy.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition inline-block text-center"
            >
              {copy.cta}
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-border/50 font-medium hover:bg-surface-alt transition inline-block text-center"
            >
              {copy.login}
            </Link>
          </div>
        </div>
      </section>

      {/* Problems & Solutions */}
      <section className="px-6 py-16 bg-surface-alt dark:bg-surface">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">{copy.problems}</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="space-y-3 p-4 rounded-lg border border-border/20">
              <div className="text-2xl">📊</div>
              <h3 className="font-semibold">{copy.problem1}</h3>
              <p className="text-sm text-fg/60">{copy.solution1}</p>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border/20">
              <div className="text-2xl">💸</div>
              <h3 className="font-semibold">{copy.problem2}</h3>
              <p className="text-sm text-fg/60">{copy.solution2}</p>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border/20">
              <div className="text-2xl">🚨</div>
              <h3 className="font-semibold">{copy.problem3}</h3>
              <p className="text-sm text-fg/60">{copy.solution3}</p>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border/20">
              <div className="text-2xl">❓</div>
              <h3 className="font-semibold">{copy.problem4}</h3>
              <p className="text-sm text-fg/60">{copy.solution4}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">{copy.features}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-lg border border-border/30 hover:border-accent/50 hover:bg-accent/5 transition space-y-2"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold text-sm">{f[lang].title}</h3>
                <p className="text-xs text-fg/60">{f[lang].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Judges Section */}
      <section className="px-6 py-16 bg-surface-alt dark:bg-surface">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold">{copy.judges}</h2>
          <div className="space-y-3 text-sm font-mono">
            <div>
              <p className="text-fg/60">Demo:</p>
              <p>
                {copy.demoEmail} / {copy.demoPass}
              </p>
            </div>
            <div>
              <p className="text-fg/60">{copy.admin}:</p>
              <p>
                {copy.adminEmail} / {copy.adminPass}
              </p>
            </div>
          </div>
          <p className="text-xs text-fg/50">
            {lang === 'uz'
              ? 'Barcha features, admin panel, SMS logs, community tips, health scores — barchasi ishlab turadi.'
              : 'Все функции, админ-панель, логи SMS, советы сообщества, оценки здоровья — всё работает.'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-8 text-center text-sm text-fg/50">
        <p>© 2025 Mizo. {lang === 'uz' ? 'Barcha huquqlar himoyalangan.' : 'Все права защищены.'}</p>
      </footer>

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
        :root[data-theme='dark'] {
          --surface: #0a0a0a;
          --surface-alt: #141414;
          --fg: #fafafa;
          --accent: #60a5fa;
          --border: #333;
        }
        body {
          background: var(--surface);
          color: var(--fg);
        }
        .bg-surface {
          background-color: var(--surface);
        }
        .bg-surface-alt {
          background-color: var(--surface-alt);
        }
        .bg-surface-hover {
          background-color: var(--surface-alt);
        }
        .text-fg {
          color: var(--fg);
        }
        .text-accent {
          color: var(--accent);
        }
        .bg-accent {
          background-color: var(--accent);
        }
        .border-border {
          border-color: var(--border);
        }
      `}</style>
    </div>
  )
}
