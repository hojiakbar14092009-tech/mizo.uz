'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowTrendingUpIcon,
  SparklesIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  ScaleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
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
  ChartOptions,
  TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { WealthResult } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function BoylikPage() {
  const t = useTranslations('wealth')
  const tCommon = useTranslations('common')

  const [initialAmount, setInitialAmount] = useState<number>(5_000_000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1_500_000)
  const [annualRatePct, setAnnualRatePct] = useState<number>(18)
  const [years, setYears] = useState<number>(10)
  const [growthPct, setGrowthPct] = useState<number>(5)
  const [inflationPct, setInflationPct] = useState<number>(10)

  const [result, setResult] = useState<WealthResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)

  // Chart ranglari (CSS o'zgaruvchilari orqali)
  const [chartTheme, setChartTheme] = useState({
    accent: '#059669',
    accentLight: 'rgba(5, 150, 105, 0.25)',
    interest: '#0284c7',
    interestLight: 'rgba(2, 132, 199, 0.25)',
    border: '#e4e4e7',
    fg: '#18181b',
    muted: '#71717a',
  })

  useEffect(() => {
    function updateTheme() {
      const isDark = document.documentElement.classList.contains('dark')
      setChartTheme({
        accent: isDark ? '#10b981' : '#059669',
        accentLight: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.25)',
        interest: isDark ? '#38bdf8' : '#0284c7',
        interestLight: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.25)',
        border: isDark ? '#27272a' : '#e4e4e7',
        fg: isDark ? '#f4f4f5' : '#18181b',
        muted: isDark ? '#a1a1aa' : '#71717a',
      })
    }

    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 300ms debounce bilan API ga so'rov yuborish
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/wealth/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialAmount,
            monthlyContribution,
            annualRatePct,
            years,
            annualContributionGrowthPct: growthPct,
            inflationPct,
          }),
        })

        if (res.ok) {
          const data: WealthResult = await res.json()
          setResult(data)
        }
      } catch {
        // Fallback xatolik holati
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [initialAmount, monthlyContribution, annualRatePct, years, growthPct, inflationPct])

  // Chart ma'lumotlari
  const chartData = {
    labels: result?.yearly.map((y) => `${y.year}-${tCommon('years')}`) || [],
    datasets: [
      {
        label: t('contributed'),
        data: result?.yearly.map((y) => y.contributed) || [],
        borderColor: chartTheme.accent,
        backgroundColor: chartTheme.accentLight,
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: t('interest'),
        data: result?.yearly.map((y) => y.interest) || [],
        borderColor: chartTheme.interest,
        backgroundColor: chartTheme.interestLight,
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: chartTheme.fg,
          font: { size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: chartTheme.border,
        titleColor: chartTheme.fg,
        bodyColor: chartTheme.fg,
        padding: 10,
        borderColor: chartTheme.accent,
        borderWidth: 1,
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const val = (ctx.raw as number) || 0
            return ` ${ctx.dataset.label}: ${val.toLocaleString('uz-UZ')} ${tCommon('som')}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: chartTheme.border },
        ticks: { color: chartTheme.muted, font: { size: 11 } },
      },
      y: {
        grid: { color: chartTheme.border },
        ticks: {
          color: chartTheme.muted,
          font: { size: 11 },
          callback: (value: string | number) => {
            const num = Number(value)
            if (num >= 1_000_000_000) return `${(num / 1e9).toFixed(1)} mlrd`
            if (num >= 1_000_000) return `${(num / 1e6).toFixed(0)} mln`
            return num.toLocaleString('uz-UZ')
          },
        },
      },
    },
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              {t('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            {t('subtitle')}
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-accent animate-pulse self-start sm:self-auto">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span>{tCommon('loading')}</span>
          </div>
        )}
      </div>

      {/* Asosiy 2 ustunli blok: Slayderlar + Natijalar / Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chap panel: Boshqaruv slayderlari (5 cols) */}
        <div className="lg:col-span-5 space-y-5 p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs">
          <h2 className="text-sm font-bold text-fg flex items-center gap-2">
            <ScaleIcon className="w-4 h-4 text-accent" />
            <span>Parametrlar</span>
          </h2>

          {/* 1. Boshlang'ich summa */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('initial')}</span>
              <span className="font-extrabold text-fg">
                {initialAmount.toLocaleString('uz-UZ')} {tCommon('som')}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100_000_000}
              step={1_000_000}
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>0</span>
              <span>100 mln {tCommon('som')}</span>
            </div>
          </div>

          {/* 2. Oylik badal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('monthly')}</span>
              <span className="font-extrabold text-accent">
                {monthlyContribution.toLocaleString('uz-UZ')} {tCommon('som')}
              </span>
            </div>
            <input
              type="range"
              min={100_000}
              max={20_000_000}
              step={200_000}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>100 ming</span>
              <span>20 mln {tCommon('som')}</span>
            </div>
          </div>

          {/* 3. Yillik foiz */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('rate')}</span>
              <span className="font-extrabold text-fg">{annualRatePct}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={0.5}
              value={annualRatePct}
              onChange={(e) => setAnnualRatePct(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>1%</span>
              <span>40%</span>
            </div>
          </div>

          {/* 4. Muddat (yillar) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('years')}</span>
              <span className="font-extrabold text-fg">
                {years} {tCommon('years')}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={35}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>1 {tCommon('years')}</span>
              <span>35 {tCommon('years')}</span>
            </div>
          </div>

          {/* 5. Qo'shimcha parametrlar: Har yili oshirish va Inflyatsiya */}
          <div className="pt-3 border-t border-border/70 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-muted">{t('growth')}</span>
                <span className="font-bold text-fg">{growthPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={growthPct}
                onChange={(e) => setGrowthPct(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-muted">{t('inflation')}</span>
                <span className="font-bold text-fg">{inflationPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={inflationPct}
                onChange={(e) => setInflationPct(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* O'ng panel: Asosiy xulosa kartalari va Grafik (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 4 ta asosiy indikator kartasi */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5">
            {/* 1. Yakuniy summa */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-accent/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-1.5 text-accent text-xs font-bold mb-1">
                <SparklesIcon className="w-4 h-4" />
                <span>{t('finalBalance')}</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-fg tracking-tight">
                {(result?.finalBalance || 0).toLocaleString('uz-UZ')}
                <span className="text-xs font-semibold text-muted ml-1">{tCommon('som')}</span>
              </p>
            </motion.div>

            {/* 2. Foiz daromadi */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-sky-500 text-xs font-bold mb-1">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <span>{t('interest')}</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-fg tracking-tight">
                {(result?.totalInterest || 0).toLocaleString('uz-UZ')}
                <span className="text-xs font-semibold text-muted ml-1">{tCommon('som')}</span>
              </p>
            </motion.div>

            {/* 3. O'zingiz qo'ygan */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-muted text-xs font-bold mb-1">
                <BanknotesIcon className="w-4 h-4" />
                <span>{t('contributed')}</span>
              </div>
              <p className="text-base sm:text-xl font-bold text-fg tracking-tight">
                {(result?.totalContributed || 0).toLocaleString('uz-UZ')}
                <span className="text-xs font-semibold text-muted ml-1">{tCommon('som')}</span>
              </p>
            </motion.div>

            {/* 4. Bugungi pulda (Real qiymat) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-muted text-xs font-bold mb-1">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>{t('realValue')}</span>
              </div>
              <p className="text-base sm:text-xl font-bold text-fg tracking-tight">
                {(result?.finalRealBalance || 0).toLocaleString('uz-UZ')}
                <span className="text-xs font-semibold text-muted ml-1">{tCommon('som')}</span>
              </p>
            </motion.div>
          </div>

          {/* Stacked Area Chart */}
          <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-fg">Kapital oʻsish dinamikasi</h2>
              <span className="text-xs text-muted">Murakkab foiz effekti</span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Marralar (Milestones) bayram kartalari */}
      {result?.milestones && result.milestones.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-accent" />
            <h2 className="text-base font-extrabold text-fg">Erishiladigan marralar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {result.milestones.map((m, idx) => (
              <motion.div
                key={`${m.amount}-${m.year}-${m.month}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl bg-surface border border-accent/30 shadow-xs flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-extrabold text-fg truncate">
                    {m.amount.toLocaleString('uz-UZ')} {tCommon('som')}
                  </p>
                  <p className="text-[11px] text-muted">
                    {t('milestone', {
                      amount: m.amount.toLocaleString('uz-UZ'),
                      year: m.year,
                      month: m.month,
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Yillik jadval (Table Breakdown) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:border-accent/40 text-xs font-bold text-fg transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <TableCellsIcon className="w-4 h-4 text-accent" />
          <span>Yillar boʻyicha batafsil jadval</span>
          {showTable ? (
            <ChevronUpIcon className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-muted" />
          )}
        </button>

        <AnimatePresence>
          {showTable && result?.yearly && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs"
            >
              <table className="w-full text-xs text-left">
                <thead className="bg-background/60 text-muted border-b border-border font-semibold">
                  <tr>
                    <th className="py-3 px-4">Yil</th>
                    <th className="py-3 px-4">Badallar (Oʻzingiz)</th>
                    <th className="py-3 px-4">Foiz daromadi</th>
                    <th className="py-3 px-4">Jami balans</th>
                    <th className="py-3 px-4">Bugungi pulda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="hover:bg-accent/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-fg">{row.year}-yil</td>
                      <td className="py-3 px-4 text-muted">
                        {row.contributed.toLocaleString('uz-UZ')} {tCommon('som')}
                      </td>
                      <td className="py-3 px-4 text-sky-500 font-semibold">
                        +{row.interest.toLocaleString('uz-UZ')} {tCommon('som')}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-accent">
                        {row.balance.toLocaleString('uz-UZ')} {tCommon('som')}
                      </td>
                      <td className="py-3 px-4 text-fg font-medium">
                        {row.realBalance.toLocaleString('uz-UZ')} {tCommon('som')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
