'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { HealthScoreResult, HealthHistoryPoint, HealthBand, HealthComponentKey } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function SalomatlikPage() {
  const tHealth = useTranslations('health')
  const tCommon = useTranslations('common')

  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)

  // Input maydonlari
  const [monthlyIncome, setMonthlyIncome] = useState<number>(7_000_000)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(4_200_000)
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState<number>(1_100_000)
  const [savingsBalance, setSavingsBalance] = useState<number>(12_000_000)

  // Natija va tarix
  const [healthResult, setHealthResult] = useState<HealthScoreResult | null>(null)
  const [historyPoints, setHistoryPoints] = useState<HealthHistoryPoint[]>([])

  // Dastlabki ma'lumotlarni yuklash (GET /api/health/score)
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/health/score')
        if (res.ok) {
          const data = await res.json()
          if (data.history) setHistoryPoints(data.history)
          if (data.latest) {
            setHealthResult({
              score: data.latest.score,
              band: data.latest.band,
              components: data.latest.components,
              weakest: data.latest.weakest,
              recommendations: data.latest.recommendations,
            })
          }
          if (data.lastInputs) {
            if (data.lastInputs.monthlyIncome) setMonthlyIncome(data.lastInputs.monthlyIncome)
            if (data.lastInputs.monthlyExpenses) setMonthlyExpenses(data.lastInputs.monthlyExpenses)
            if (data.lastInputs.monthlyDebtPayments) setMonthlyDebtPayments(data.lastInputs.monthlyDebtPayments)
            if (data.lastInputs.savingsBalance) setSavingsBalance(data.lastInputs.savingsBalance)
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [])

  const getLang = (): 'uz' | 'ru' => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )mz_lang=([^;]*)/)
      if (match && decodeURIComponent(match[1]) === 'ru') return 'ru'
    }
    return 'uz'
  }

  // Bahoni hisoblash (POST /api/health/score)
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setComputing(true)

    try {
      const res = await fetch('/api/health/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: getLang(),
          monthlyIncome,
          monthlyExpenses,
          monthlyDebtPayments,
          savingsBalance,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setHealthResult(data.result)
        if (data.history) setHistoryPoints(data.history)
      }
    } catch {
      // ignore
    } finally {
      setComputing(false)
    }
  }

  // Token ranglarni CSS dan olish
  const [themeColors, setThemeColors] = useState({
    accent: '#059669',
    border: '#e2e8f0',
    fg: '#0f172a',
    muted: '#64748b',
  })

  useEffect(() => {
    const updateColors = () => {
      const s = getComputedStyle(document.documentElement)
      setThemeColors({
        accent: s.getPropertyValue('--mz-accent').trim() || '#059669',
        border: s.getPropertyValue('--mz-border').trim() || '#e2e8f0',
        fg: s.getPropertyValue('--mz-fg').trim() || '#0f172a',
        muted: s.getPropertyValue('--mz-muted').trim() || '#64748b',
      })
    }
    updateColors()
    const observer = new MutationObserver(updateColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 12 oylik trend Chart.js ma'lumotlari
  const chartLabels =
    historyPoints.length > 0
      ? historyPoints.map((h) => h.month)
      : ['Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mart']
  const chartValues =
    historyPoints.length > 0 ? historyPoints.map((h) => h.score) : [60, 64, 68, 71, 74, 78]

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: tHealth('trend'),
        data: chartValues,
        fill: true,
        borderColor: themeColors.accent,
        backgroundColor: `${themeColors.accent}20`,
        tension: 0.35,
        pointBackgroundColor: themeColors.accent,
        pointBorderColor: '#ffffff',
        pointRadius: 4,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: `${themeColors.border}80` },
        ticks: { color: themeColors.muted, font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: themeColors.muted, font: { size: 10 } },
      },
    },
  }

  // Radial gauge hisoblash (0 -> 100)
  const currentScore = healthResult ? healthResult.score : 70
  const needleAngle = -90 + (currentScore / 100) * 180

  const bandTitle = (band?: HealthBand) => {
    switch (band) {
      case 'EXCELLENT':
        return tHealth('bands.EXCELLENT')
      case 'GOOD':
        return tHealth('bands.GOOD')
      case 'FAIR':
        return tHealth('bands.FAIR')
      case 'WEAK':
        return tHealth('bands.WEAK')
      case 'CRITICAL':
        return tHealth('bands.CRITICAL')
      default:
        return tHealth('bands.GOOD')
    }
  }

  const componentLabel = (key: HealthComponentKey) => {
    switch (key) {
      case 'savingsRate':
        return tHealth('components.savingsRate')
      case 'debtToIncome':
        return tHealth('components.debtToIncome')
      case 'emergencyFund':
        return tHealth('components.emergencyFund')
      case 'expenseRatio':
        return tHealth('components.expenseRatio')
      case 'goalProgress':
        return tHealth('components.goalProgress')
      default:
        return key
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Sarlavha */}
      <div className="space-y-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-accent">
          <ChartBarIcon className="w-6 h-6 stroke-[2]" />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-fg">
            {tHealth('title')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted">{tHealth('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chap panel: Form kiritish (lg: 5 ustun) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-fg border-b border-border pb-3">
            Oylik koʻrsatkichlarni kiriting
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">{tHealth('income')} (soʻm):</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">{tHealth('expenses')} (soʻm):</label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">{tHealth('debtPayments')} (soʻm):</label>
              <input
                type="number"
                value={monthlyDebtPayments}
                onChange={(e) => setMonthlyDebtPayments(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">{tHealth('savingsBalance')} (soʻm):</label>
              <input
                type="number"
                value={savingsBalance}
                onChange={(e) => setSavingsBalance(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={computing}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {computing ? tCommon('loading') : tHealth('check')}
            </button>
          </form>
        </div>

        {/* O'ng panel: Animatsiyali Gauge, Komponentlar, Trend (lg: 7 ustun) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Radial Gauge & Ball kartasi */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            {/* 180° Gauge */}
            <div className="relative w-64 h-36 flex items-end justify-center pt-2">
              <svg width="240" height="130" viewBox="0 0 240 130" className="overflow-visible">
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeLinecap="round"
                  className="text-border/60"
                />

                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke="url(#healthGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                <circle cx="120" cy="120" r="9" className="fill-fg" />
              </svg>

              {/* Strelka */}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '120px',
                  width: '4px',
                  height: '85px',
                  originX: '50%',
                  originY: '100%',
                }}
                initial={{ rotate: -90 }}
                animate={{ rotate: needleAngle }}
                transition={{ type: 'spring', stiffness: 50, damping: 14 }}
                className="rounded-full bg-fg shadow-md -ml-[2px]"
              />
            </div>

            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black text-fg tracking-tight">
                {currentScore}
                <span className="text-base text-muted font-normal"> / 100</span>
              </span>
              <p className="text-sm font-extrabold text-accent">
                {bandTitle(healthResult?.band)}
              </p>
            </div>
          </div>

          {/* Komponentlar progress bar'lari */}
          {healthResult && healthResult.components && (
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
                Tarkibiy komponentlar (Points):
              </h3>

              <div className="space-y-3">
                {healthResult.components.map((comp) => {
                  const pct = Math.min(100, Math.round((comp.points / comp.weight) * 100))
                  const isWeakest = comp.key === healthResult.weakest

                  return (
                    <div key={comp.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-fg flex items-center gap-1.5">
                          <span>{componentLabel(comp.key)}</span>
                          {isWeakest && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-danger/15 text-danger">
                              Zaif
                            </span>
                          )}
                        </span>
                        <span className="font-extrabold text-accent">
                          {comp.points} / {comp.weight} ball
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            pct >= 70 ? 'bg-accent' : pct >= 40 ? 'bg-warning' : 'bg-danger'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 12 oylik trend chizig'i (Line Chart) */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
              <span>{tHealth('trend')}</span>
            </h3>
            <div className="h-48 w-full pt-2">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Tavsiyalar */}
          {healthResult && healthResult.recommendations && healthResult.recommendations.length > 0 && (
            <div className="p-5 rounded-3xl bg-accent/15 border border-accent/30 space-y-2.5">
              <div className="flex items-center gap-2 text-accent">
                <SparklesIcon className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {tHealth('recommendations')}:
                </h4>
              </div>
              <ul className="text-xs text-fg space-y-1.5">
                {healthResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

