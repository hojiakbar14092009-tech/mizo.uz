'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BanknotesIcon,
  PlusIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  FlagIcon,
  CalendarDaysIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'
import type { SavingsGoal } from '@/types'
import { Modal } from '@/components/Modal'
import { InputField } from '@/components/InputField'
import { SkeletonCard } from '@/components/SkeletonCard'
import { ConfettiParticles, DrawCheckmark } from '@/components/Celebration'

export default function TejashPage() {
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')

  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Bayram animatsiyasi holati
  const [celebrating, setCelebrating] = useState(false)

  // Yangi maqsad formasi
  const [name, setName] = useState('')
  const [totalAmount, setTotalAmount] = useState<number | ''>('')
  const [savedAmount, setSavedAmount] = useState<number | ''>(0)
  const [monthlyAmount, setMonthlyAmount] = useState<number | ''>('')

  // Maqsadlarni yuklash
  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/user/goals')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.goals)) {
          setGoals(data.goals)
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals()
  }, [])

  // Yangi maqsad qo'shish
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !totalAmount || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          totalAmount: Number(totalAmount),
          savedAmount: Number(savedAmount) || 0,
          monthlyAmount: Number(monthlyAmount) || 0,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setName('')
        setTotalAmount('')
        setSavedAmount(0)
        setMonthlyAmount('')
        await fetchGoals()

        // Bayram konfetti va chiziluvchi ✓ animatsiyasi
        setCelebrating(true)
        setTimeout(() => {
          setCelebrating(false)
        }, 3500)
      }
    } catch {
      // Error
    } finally {
      setSubmitting(false)
    }
  }

  // Statistikalar
  const totalGoalsCount = goals.length
  const totalSavedSum = goals.reduce((acc, g) => acc + (g.savedAmount || 0), 0)
  const totalMonthlySum = goals.reduce((acc, g) => acc + (g.monthlyAmount || 0), 0)

  // Tavsiya matni
  const getGoalAdvice = (percentage: number) => {
    if (percentage < 30) {
      return 'Boshlangʻich bosqich: oylik daromaddan kamida 10% ajratib boring'
    } else if (percentage < 75) {
      return 'Ajoyib natija! Qoʻshimcha mablagʻlarni ham maqsadga yoʻnaltiring'
    } else {
      return 'Maqsadga juda yaqin qoldingiz! Yakuniy qadamni qoʻying'
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Yangi maqsad saqlanganda konfetti animatsiyasi */}
      <AnimatePresence>
        {celebrating && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <ConfettiParticles active={celebrating} />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="bg-surface/95 backdrop-blur-md border border-accent/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3 text-center pointer-events-auto"
            >
              <DrawCheckmark size={64} className="text-accent" />
              <div>
                <h3 className="text-base font-extrabold text-fg">
                  Yangi maqsad muvaffaqiyatli saqlandi!
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Har bir qadam sizni moliyaviy erkinlik sari yaqinlashtiradi.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sarlavha va Yangi maqsad tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              {tNav('tejash')} va Jamgʻarma maqsadlari
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Moliyaviy orzularingizni aniq maqsadlarga aylantiring va oylik jamgʻarmani kuzating
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Yangi maqsad</span>
        </button>
      </div>

      {/* 3 ta statistika kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Jami maqsadlar */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-surface border border-border shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
            <FlagIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xs text-muted font-medium block">Maqsadlar soni</span>
            <strong className="text-xl font-black text-fg">{totalGoalsCount} ta</strong>
          </div>
        </motion.div>

        {/* 2. Jami jamg'arilgan */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-surface border border-border shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center flex-shrink-0">
            <BanknotesIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xs text-muted font-medium block">Jami jamgʻarilgan</span>
            <strong className="text-xl font-black text-fg">
              {totalSavedSum.toLocaleString('uz-UZ')}{' '}
              <span className="text-xs font-semibold text-muted">{tCommon('som')}</span>
            </strong>
          </div>
        </motion.div>

        {/* 3. Oylik reja */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-surface border border-border shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
            <ArrowTrendingUpIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xs text-muted font-medium block">Oylik reja</span>
            <strong className="text-xl font-black text-fg">
              {totalMonthlySum.toLocaleString('uz-UZ')}{' '}
              <span className="text-xs font-semibold text-muted">{tCommon('som')}</span>
            </strong>
          </div>
        </motion.div>
      </div>

      {/* Maqsadlar ro'yxati */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : goals.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-surface text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-fg">
              Jamgʻarma maqsadlari hali kiritilmagan
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Uy, avtomobil, sayohat yoki favqulodda jamgʻarma uchun maqsad belgilang va uni muntazam toʻldirib boring.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Birinchi maqsadni qoʻshish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map((goal, idx) => {
              const progress = Math.min(
                100,
                Math.round(((goal.savedAmount || 0) / (goal.totalAmount || 1)) * 100)
              )
              const remaining = Math.max(0, goal.totalAmount - (goal.savedAmount || 0))
              const monthsLeft =
                goal.monthlyAmount && goal.monthlyAmount > 0
                  ? Math.ceil(remaining / goal.monthlyAmount)
                  : null

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="p-5 sm:p-6 rounded-3xl bg-surface border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Yuqori qism: Maqsad nomi va foizi */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-base text-fg tracking-tight">
                        {goal.name}
                      </h3>
                      {monthsLeft !== null && (
                        <p className="text-xs text-muted flex items-center gap-1">
                          <CalendarDaysIcon className="w-3.5 h-3.5" />
                          <span>Taxminan {monthsLeft} oyda erishiladi</span>
                        </p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-accent/15 text-accent font-black text-xs">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full bg-border/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-fg">
                        {(goal.savedAmount || 0).toLocaleString('uz-UZ')} {tCommon('som')}
                      </span>
                      <span className="text-muted">
                        {goal.totalAmount.toLocaleString('uz-UZ')} {tCommon('som')}
                      </span>
                    </div>
                  </div>

                  {/* Tavsiya matni */}
                  <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted text-[11px]">
                      <SparklesIcon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{getGoalAdvice(progress)}</span>
                    </div>

                    {goal.monthlyAmount && goal.monthlyAmount > 0 && (
                      <span className="text-[11px] font-bold text-fg whitespace-nowrap ml-2">
                        {goal.monthlyAmount.toLocaleString('uz-UZ')} {tCommon('som')}/oy
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Yangi maqsad yaratish modali */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi jamgʻarma maqsadi"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <InputField
            label="Maqsad nomi"
            name="name"
            required
            placeholder="Masalan: Yangi avtomobil, Uy taʼmiri, Sayohat"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            label="Kerakli jami summa (soʻm)"
            name="totalAmount"
            type="number"
            required
            placeholder="50 000 000"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : '')}
          />

          <InputField
            label="Hozirgacha toʻplangan summa (soʻm)"
            name="savedAmount"
            type="number"
            placeholder="5 000 000"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value ? Number(e.target.value) : '')}
          />

          <InputField
            label="Oylik qoʻshish rejangiz (soʻm)"
            name="monthlyAmount"
            type="number"
            placeholder="2 000 000"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value ? Number(e.target.value) : '')}
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-border/60 transition-colors"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? tCommon('loading') : tCommon('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
