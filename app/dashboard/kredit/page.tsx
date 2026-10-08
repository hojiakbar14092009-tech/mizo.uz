'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalculatorIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { DebtComparison } from '@/types'
import { CountUpNumber, SuccessRing } from '@/components/Celebration'

export default function KreditPage() {
  const tRefi = useTranslations('refi')
  const tDebts = useTranslations('debts')
  const tCommon = useTranslations('common')

  // Refinansirovka holati
  const [refiSum, setRefiSum] = useState<number>(30_000_000)
  const [refiRate, setRefiRate] = useState<number>(36)
  const [refiMonths, setRefiMonths] = useState<number>(24)
  const [isCalculated, setIsCalculated] = useState(false)
  const [targetMarketRate] = useState(24) // Bozor o'rtacha refinans stavkasi

  // Oylik to'lov hisoblash formulasi
  const calculateMonthly = (principal: number, annualRate: number, months: number) => {
    if (principal <= 0 || months <= 0) return 0
    if (annualRate <= 0) return principal / months
    const monthlyRate = annualRate / 12 / 100
    const factor = Math.pow(1 + monthlyRate, months)
    return Math.round((principal * (monthlyRate * factor)) / (factor - 1))
  }

  const currentMonthly = calculateMonthly(refiSum, refiRate, refiMonths)
  const newMonthly = calculateMonthly(refiSum, Math.min(targetMarketRate, refiRate), refiMonths)
  const monthlySaving = Math.max(0, currentMonthly - newMonthly)
  const totalSaving = monthlySaving * refiMonths

  // Qarz rejasi (POST /api/debts/plan) holati
  const [monthlyBudget, setMonthlyBudget] = useState<number>(2_500_000)
  const [debtsList, setDebtsList] = useState<
    Array<{ name: string; balance: number; ratePct: number; minPayment: number }>
  >([
    { name: 'Mikroqarz', balance: 5_000_000, ratePct: 48, minPayment: 500_000 },
    { name: 'Maishiy texnika krediti', balance: 12_000_000, ratePct: 36, minPayment: 800_000 },
    { name: 'Isteʼmol krediti', balance: 25_000_000, ratePct: 28, minPayment: 1_100_000 },
  ])

  const [debtComparison, setDebtComparison] = useState<DebtComparison | null>(null)
  const [debtLoading, setDebtLoading] = useState(false)
  const [debtError, setDebtError] = useState<string | null>(null)

  const handleCalculateRefi = () => {
    setIsCalculated(true)
  }

  const handleBuildDebtPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebtLoading(true)
    setDebtError(null)

    try {
      const res = await fetch('/api/debts/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudget,
          debts: debtsList,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.code === 'BUDGET_TOO_LOW') {
          const req = data.error?.required || 2400000
          setDebtError(tDebts('budgetTooLow', { required: req.toLocaleString('uz-UZ') }))
        } else {
          setDebtError(data.error?.message || tDebts('budgetTooLow', { required: '...' }))
        }
        return
      }

      setDebtComparison(data)
    } catch {
      setDebtError('Server xatosi')
    } finally {
      setDebtLoading(false)
    }
  }

  const addDebtItem = () => {
    setDebtsList((prev) => [...prev, { name: '', balance: 0, ratePct: 24, minPayment: 0 }])
  }

  const removeDebtItem = (idx: number) => {
    setDebtsList((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Sarlavha */}
      <div className="space-y-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-accent">
          <CalculatorIcon className="w-6 h-6 stroke-[2]" />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-fg">
            {tRefi('title')} & {tDebts('title')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Qarz yukini kamaytirish va bozorning eng past stavkalariga oʻtish vositalari
        </p>
      </div>

      {/* 1. REFINANSIROVKA TUSHUNTIRISH KARTALARI (refi.*) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <InformationCircleIcon className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-fg">{tRefi('whatTitle')}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed">{tRefi('what')}</p>

          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-bold text-fg mb-1.5">{tRefi('prosTitle')}:</h4>
            <ul className="text-xs text-muted space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{tRefi('pros.0')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{tRefi('pros.1')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{tRefi('pros.2')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-warning">
            <ShieldCheckIcon className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-fg">{tRefi('howTitle')}</h3>
          </div>
          <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>{tRefi('how.0')}</li>
            <li>{tRefi('how.1')}</li>
            <li>{tRefi('how.2')}</li>
            <li>{tRefi('how.3')}</li>
          </ol>

          <div className="p-3 rounded-2xl bg-warning/10 border border-warning/30 text-xs text-fg space-y-0.5 mt-2">
            <span className="font-bold text-warning block">{tRefi('watchTitle')}:</span>
            <p className="text-[11px] text-muted">{tRefi('watch')}</p>
          </div>
        </div>
      </div>

      {/* 2. REFINANSIROVKA HISOBLAGICHI */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
        <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
          <ArrowTrendingDownIcon className="w-5 h-5 text-accent" />
          <span>Refinansirovka kalkulyatori</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Kredit qoldigʻi (soʻm):</label>
            <input
              type="number"
              value={refiSum}
              onChange={(e) => setRefiSum(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Joriy yillik foiz (%):</label>
            <input
              type="number"
              value={refiRate}
              onChange={(e) => setRefiRate(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Qolgan muddat (oy):</label>
            <input
              type="number"
              value={refiMonths}
              onChange={(e) => setRefiMonths(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCalculateRefi}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 shadow-sm active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CalculatorIcon className="w-4 h-4" />
          <span>{tCommon('calculate')}</span>
        </button>

        {/* Natijalar: Raqamlar 0 dan count-up + Muvaffaqiyat halqasi */}
        {isCalculated && (
          <div className="p-6 rounded-2xl bg-background border border-border space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  Kutilayotgan tejash:
                </span>
                <p className="text-2xl sm:text-3xl font-black text-accent flex items-center gap-2">
                  <span>+</span>
                  <CountUpNumber value={monthlySaving} suffix={` ${tCommon('som')}/${tCommon('perMonth')}`} />
                </p>
                <p className="text-xs text-muted">
                  Jami muddat davomida: <strong>{totalSaving.toLocaleString('uz-UZ')} {tCommon('som')}</strong>
                </p>
              </div>

              {/* Muvaffaqiyat halqasi */}
              <div className="flex items-center gap-3">
                <SuccessRing />
                <span className="text-xs font-bold text-accent">Muvaffaqiyatli hisoblandi!</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-border">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block text-[10px]">Joriy toʻlov:</span>
                <strong className="text-fg">{currentMonthly.toLocaleString('uz-UZ')} soʻm</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block text-[10px]">Yangi toʻlov (24%):</span>
                <strong className="text-accent">{newMonthly.toLocaleString('uz-UZ')} soʻm</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block text-[10px]">Oylik foyda:</span>
                <strong className="text-accent">{monthlySaving.toLocaleString('uz-UZ')} soʻm</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block text-[10px]">Jami muddat:</span>
                <strong className="text-fg">{refiMonths} oy</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. QARZ REJASI (debts.*, POST /api/debts/plan) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
            <ArrowPathIcon className="w-5 h-5 text-accent" />
            <span>{tDebts('title')}</span>
          </h2>
          <p className="text-xs text-muted">
            Avalanche va Snowball strategiyalarini solishtirib, qarzdan eng tez va arzon qutulish yoʻlini tanlang
          </p>
        </div>

        {debtError && (
          <div className="p-3.5 rounded-2xl bg-danger/15 border border-danger/40 text-danger text-xs font-semibold animate-in fade-in">
            {debtError}
          </div>
        )}

        <form onSubmit={handleBuildDebtPlan} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">{tDebts('budget')}:</label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
              required
            />
          </div>

          {/* Qarzlar ro'yxati inputlari */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted">Qarzlaringiz roʻyxati:</label>
              <button
                type="button"
                onClick={addDebtItem}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>{tDebts('addDebt')}</span>
              </button>
            </div>

            <div className="space-y-2">
              {debtsList.map((d, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 rounded-xl bg-background border border-border">
                  <input
                    type="text"
                    placeholder="Qarz nomi"
                    value={d.name}
                    onChange={(e) => {
                      const val = e.target.value
                      setDebtsList((prev) => prev.map((item, idx) => (idx === i ? { ...item, name: val } : item)))
                    }}
                    className="sm:col-span-4 p-2 rounded-lg border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                  <input
                    type="number"
                    placeholder={tDebts('balance')}
                    value={d.balance || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setDebtsList((prev) => prev.map((item, idx) => (idx === i ? { ...item, balance: val } : item)))
                    }}
                    className="sm:col-span-3 p-2 rounded-lg border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                  <input
                    type="number"
                    placeholder={tDebts('rate')}
                    value={d.ratePct || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setDebtsList((prev) => prev.map((item, idx) => (idx === i ? { ...item, ratePct: val } : item)))
                    }}
                    className="sm:col-span-2 p-2 rounded-lg border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                  <input
                    type="number"
                    placeholder={tDebts('minPayment')}
                    value={d.minPayment || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setDebtsList((prev) => prev.map((item, idx) => (idx === i ? { ...item, minPayment: val } : item)))
                    }}
                    className="sm:col-span-2 p-2 rounded-lg border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                  {debtsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDebtItem(i)}
                      className="sm:col-span-1 p-2 text-muted hover:text-danger flex justify-center cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={debtLoading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {debtLoading ? tCommon('loading') : tDebts('buildPlan')}
          </button>
        </form>

        {/* 3 ta Strategiya kartasi va Vaqt chizig'i (Timeline) */}
        {debtComparison && (
          <div className="space-y-6 pt-4 border-t border-border animate-in fade-in">
            {/* Tejash ko'rsatkichi */}
            <div className="p-4 rounded-2xl bg-accent/15 border border-accent/30 text-fg space-y-1">
              <p className="font-extrabold text-sm text-accent">
                {tDebts('savedVsMinimum', {
                  amount: debtComparison.interestSavedVsMinimum.toLocaleString('uz-UZ'),
                  months: debtComparison.monthsSavedVsMinimum,
                })}
              </p>
              {debtComparison.extraPaymentTip && (
                <p className="text-xs text-muted">
                  {tDebts('extraTip', {
                    extra: debtComparison.extraPaymentTip.extra.toLocaleString('uz-UZ'),
                    months: debtComparison.extraPaymentTip.monthsSaved,
                    amount: debtComparison.extraPaymentTip.interestSaved.toLocaleString('uz-UZ'),
                  })}
                </p>
              )}
            </div>

            {/* 3 ta Karta (Avalanche, Snowball, Minimum) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Avalanche */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  debtComparison.recommended === 'AVALANCHE'
                    ? 'bg-accent/10 border-accent/40 shadow-md ring-1 ring-accent/30'
                    : 'bg-background border-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-fg">{tDebts('avalancheTitle')}</h3>
                    {debtComparison.recommended === 'AVALANCHE' && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-extrabold">
                        {tDebts('recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{tDebts('avalanche')}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Muddat:</span>
                    <strong className="text-fg">{debtComparison.avalanche.months} oy</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Jami foiz:</span>
                    <strong className="text-accent">
                      {debtComparison.avalanche.totalInterest.toLocaleString('uz-UZ')} soʻm
                    </strong>
                  </div>
                </div>
              </div>

              {/* Snowball */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  debtComparison.recommended === 'SNOWBALL'
                    ? 'bg-accent/10 border-accent/40 shadow-md ring-1 ring-accent/30'
                    : 'bg-background border-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-fg">{tDebts('snowballTitle')}</h3>
                    {debtComparison.recommended === 'SNOWBALL' && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-extrabold">
                        {tDebts('recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{tDebts('snowball')}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Muddat:</span>
                    <strong className="text-fg">{debtComparison.snowball.months} oy</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Jami foiz:</span>
                    <strong className="text-warning">
                      {debtComparison.snowball.totalInterest.toLocaleString('uz-UZ')} soʻm
                    </strong>
                  </div>
                </div>
              </div>

              {/* Minimum */}
              <div className="p-5 rounded-2xl border bg-background border-border flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-fg">{tDebts('minimumTitle')}</h3>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Faqat belgilangan eng kam toʻlovni toʻlash. Foiz eng koʻp boʻladi.
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Muddat:</span>
                    <strong className="text-fg">
                      {debtComparison.minimum.finished ? `${debtComparison.minimum.months} oy` : tDebts('notFinished')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Jami foiz:</span>
                    <strong className="text-danger">
                      {debtComparison.minimum.totalInterest.toLocaleString('uz-UZ')} soʻm
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Qarzlar yopilish vaqt chizig'i (Timeline) */}
            <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-accent" />
                <span>Qarzlarning yopilish navbati (Tavsiya etilgan reja boʻyicha):</span>
              </span>

              <div className="space-y-2">
                {debtComparison[debtComparison.recommended.toLowerCase() as 'avalanche' | 'snowball'].order.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-fg">{item.name}</span>
                        <span className="text-[10px] text-muted block">
                          Toʻlangan foiz: {item.interestPaid.toLocaleString('uz-UZ')} soʻm
                        </span>
                      </div>
                    </div>

                    <span className="font-extrabold text-accent">
                      {item.month}-oyda toʻliq yopiladi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
