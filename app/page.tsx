'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeroBackgroundTracker } from '@/components/HeroBackgroundTracker'
import { AnimatedCard } from '@/components/AnimatedCard'
import { InteractiveQA } from '@/components/InteractiveQA'
import { MizoLogo } from '@/components/MizoLogo'
import { LanguageToggle } from '@/components/LanguageToggle'

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

const qaItems = [
  {
    icon: '❓',
    question: {
      uz: 'Qarz boʻyicha qalangan?',
      ru: 'Застрял с долгами?',
    },
    answer: {
      uz: 'Avalanche va Snowball algoritmlari orqali 18 oy oldin qutulishingiz mumkin.',
      ru: 'Используя методы Avalanche и Snowball, выплатите долги на 18 месяцев быстрее.',
    },
  },
  {
    icon: '💰',
    question: {
      uz: 'Oylik daromaddan pul tejay olmayapsizmi?',
      ru: 'Не можете копить деньги?',
    },
    answer: {
      uz: 'AI 50/30/20 byudjet rejasi va haftalik Quick Wins bilan tejash boshlang.',
      ru: 'Начните копить с AI плана бюджета 50/30/20 и еженедельными советами.',
    },
  },
  {
    icon: '🚨',
    question: {
      uz: 'Firibgarlar yoki shubhali SMS xabarlarga duch keldingizmi?',
      ru: 'Сталкиваетесь с мошенничеством?',
    },
    answer: {
      uz: '0–100 ballik Red Flags xavf oʻlchagichi shubhali takliflari aniqlaydi.',
      ru: 'Детектор Red Flags (0–100 баллов) выявляет подозрительные предложения.',
    },
  },
  {
    icon: '🤖',
    question: {
      uz: 'Murakkab moliyaviy vaziyatda maslahat kerakmi?',
      ru: 'Нужен совет по финансам?',
    },
    answer: {
      uz: 'Claude AI shaxsiy 24/7 yordamchisi sizga moliyaviy masla beradi.',
      ru: 'Личный AI-помощник Claude дает совет 24/7 по вашей ситуации.',
    },
  },
  {
    icon: '🏦',
    question: {
      uz: 'Qaysi bank krediti eng arzon va ishonchli?',
      ru: 'Какой кредит выбрать?',
    },
    answer: {
      uz: 'Oʻzbekiston banklarining eng yaxshi kredit takliflari reytingi ko\'rsatiladi.',
      ru: 'Рейтинг лучших кредитов от банков Узбекистана с фильтрацией.',
    },
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
      qaTitle: 'Saytda qanday muammolarni hal qila olasiz?',
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
      qaTitle: 'Какие проблемы решает Mizo?',
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

  const qaItemsForLang = qaItems.map((item) => ({
    icon: item.icon,
    question: item.question[lang],
    answer: item.answer[lang],
  }))

  return (
    <div className="min-h-screen bg-surface text-fg dark:bg-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-surface/80 backdrop-blur-sm dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MizoLogo size="md" />
            <span className="text-sm font-medium">Mizo</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onChange={setLang} />
            <Link href="/login" className="px-3 py-1.5 rounded text-sm font-medium text-accent hover:bg-accent/10 transition">
              {copy.login}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-16 sm:py-24 overflow-hidden">
        <HeroBackgroundTracker />

        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-accent/70 uppercase tracking-wider">{copy.tagline}</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{copy.headline}</h1>
          </div>
          <p className="text-lg text-fg/70 max-w-2xl mx-auto leading-relaxed">{copy.subheadline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/register" className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition inline-block text-center">
              {copy.cta}
            </Link>
            <Link href="/login" className="px-6 py-3 rounded-lg border border-border/50 font-medium hover:bg-surface-alt transition inline-block text-center">
              {copy.login}
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Q&A */}
      <section className="px-6 py-16 bg-surface-alt dark:bg-surface">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">{copy.qaTitle}</h2>
          <InteractiveQA items={qaItemsForLang} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">{copy.features}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <AnimatedCard key={i} icon={f.icon} title={f[lang].title} solution={f[lang].desc} delay={i * 0.1} />
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
