'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUpIcon } from './HeroIcons'
import {
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Coins,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

export function WealthSimulator() {
  // Interaktiv slayderlar
  const [monthlySavings, setMonthlySavings] = useState<number>(2_000_000) // 2 mln so'm
  const [annualRate, setAnnualRate] = useState<number>(18) // 18% yillik
  const [years, setYears] = useState<number>(10) // 10 yil
  const [showTable, setShowTable] = useState<boolean>(false)

  // Murakkab foiz hisoblash va yillik tahlil
  const { yearlyData, finalTotal, totalDeposited, totalInterest, achievedMilestones } =
    useMemo(() => {
      const data: Array<{
        year: number
        deposited: number
        interest: number
        total: number
      }> = []

      const monthlyRate = annualRate / 100 / 12
      let runningTotal = 0
      let runningDeposited = 0

      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          runningTotal = (runningTotal + monthlySavings) * (1 + monthlyRate)
          runningDeposited += monthlySavings
        }

        data.push({
          year: y,
          deposited: Math.round(runningDeposited),
          interest: Math.round(runningTotal - runningDeposited),
          total: Math.round(runningTotal),
        })
      }

      const endTotal = Math.round(runningTotal)
      const endDeposited = Math.round(runningDeposited)
      const endInterest = Math.round(runningTotal - runningDeposited)

      // Marralar (Milestones): 50 mln, 100 mln, 500 mln, 1 mlrd
      const milestones: string[] = []
      if (endTotal >= 1_000_000_000) milestones.push('Milliarder (1 Mlrd+ soʻm)')
      else if (endTotal >= 500_000_000) milestones.push('Yarim Milliard (500 Mln+)')
      else if (endTotal >= 100_000_000) milestones.push('100 Mlnlik marra')
      else if (endTotal >= 50_000_000) milestones.push('50 Mlnlik boshlangʻich jamgʻarma')

      return {
        yearlyData: data,
        finalTotal: endTotal,
        totalDeposited: endDeposited,
        totalInterest: endInterest,
        achievedMilestones: milestones,
      }
    }, [monthlySavings, annualRate, years])

  // Chart grafigi uchun maksimal qiymat
  const maxChartValue = Math.max(1, finalTotal)

  return (
    <section className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <TrendingUpIcon className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              Boylik simulyatori (Wealth Builder)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Murakkab foizning kuchi bilan kelajakdagi kapitalingizni hisoblang va rejalashtiring
          </p>
        </div>

        {/* Milestone bayrami (🎉) */}
        {achievedMilestones.length > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-accent/15 border border-accent/30 text-accent text-xs font-extrabold self-start sm:self-auto"
          >
            <span className="text-base">🎉</span>
            <span>{achievedMilestones[0]}</span>
          </motion.div>
        )}
      </div>

      {/* Asosiy kontent: Mobilda Full-width stack, Desktopda yonma-yon (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chap panel: Slayderlar (lg: 5 ustun) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
          <h3 className="font-bold text-base text-fg border-b border-border pb-3">
            Simulyatsiya parametrlari
          </h3>

          {/* Slayder 1: Oylik jamg'arma */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Oylik tejash:</span>
              <span className="font-extrabold text-accent text-sm">
                {monthlySavings.toLocaleString('uz-UZ')} soʻm
              </span>
            </div>
            <input
              type="range"
              min={200_000}
              max={20_000_000}
              step={200_000}
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>200 ming</span>
              <span>10 mln</span>
              <span>20 mln</span>
            </div>
          </div>

          {/* Slayder 2: Yillik foiz stavkasi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Yillik daromad (omonat/investitsiya):</span>
              <span className="font-extrabold text-accent text-sm">
                {annualRate}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>5% (Past)</span>
              <span>18% (Oʻrtacha omonat)</span>
              <span>30% (Aktiv)</span>
            </div>
          </div>

          {/* Slayder 3: Yillar muddati */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Muddati (yillar):</span>
              <span className="font-extrabold text-accent text-sm">
                {years} yil
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>1 yil</span>
              <span>15 yil</span>
              <span>30 yil</span>
            </div>
          </div>

          {/* Natijaviy umumiy ko'rsatkichlar kartochkasi */}
          <div className="p-4 rounded-xl bg-background border border-border space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Siz kiritgan sarmoya:</span>
              <strong className="text-fg">
                {totalDeposited.toLocaleString('uz-UZ')} soʻm
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Sof ishlangan foizlar:</span>
              <strong className="text-accent">
                +{totalInterest.toLocaleString('uz-UZ')} soʻm
              </strong>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border font-bold text-sm">
              <span className="text-fg">Jami yakuniy kapital:</span>
              <span className="text-accent text-base">
                {finalTotal.toLocaleString('uz-UZ')} soʻm
              </span>
            </div>
          </div>
        </div>

        {/* O'ng panel: Jonli Grafik va Dinamika (lg: 7 ustun) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-fg">
              Oʻsish dinamikasi ({years} yillik)
            </h3>
            <span className="text-xs text-muted font-medium">
              Real-vaqt animatsiyasi
            </span>
          </div>

          {/* SVG Animated Bar Chart */}
          <div className="h-64 w-full flex items-end gap-1.5 pt-8 pb-4 px-2 border-b border-border">
            {yearlyData.map((d) => {
              const depositedHeight = (d.deposited / maxChartValue) * 100
              const totalHeight = (d.total / maxChartValue) * 100

              return (
                <div
                  key={d.year}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-zinc-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-xl">
                    <span>{d.year}-yil</span>
                    <strong>{d.total.toLocaleString('uz-UZ')} soʻm</strong>
                  </div>

                  {/* Ikki qavatli ustun (Deposited + Interest) */}
                  <div className="w-full max-w-[28px] h-full flex flex-col justify-end rounded-t-md overflow-hidden bg-border/40">
                    <motion.div
                      layout
                      initial={{ height: 0 }}
                      animate={{ height: `${totalHeight}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-md relative flex flex-col justify-between"
                    >
                      {/* Pastki o'z puli qismi */}
                      <div
                        className="w-full bg-emerald-800/60"
                        style={{ height: `${(d.deposited / d.total) * 100}%` }}
                      />
                    </motion.div>
                  </div>

                  {/* Yil belgisi */}
                  <span className="text-[10px] text-muted mt-2 font-semibold">
                    {d.year % 5 === 0 || d.year === 1 || d.year === years
                      ? `${d.year}y`
                      : ''}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Diagramma legandasi */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-800" />
              <span>Oʻzingiz kiritgan pul</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span>Murakkab foizdan foyda</span>
            </div>
          </div>

          {/* Yilma-yil jadval (Toggle) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              <span>{showTable ? 'Jadvalni yopish' : 'Yilma-yil batafsil jadvalni koʻrish'}</span>
              {showTable ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <AnimatePresence>
              {showTable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-x-auto mt-3 border border-border rounded-xl"
                >
                  <table className="w-full text-xs text-left">
                    <thead className="bg-background text-muted uppercase font-semibold">
                      <tr className="border-b border-border">
                        <th className="py-2.5 px-3">Yil</th>
                        <th className="py-2.5 px-3">Kiritilgan</th>
                        <th className="py-2.5 px-3">Sof Foiz</th>
                        <th className="py-2.5 px-3 text-right">Jami Kapital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {yearlyData.map((d) => (
                        <tr key={d.year} className="hover:bg-background/60">
                          <td className="py-2 px-3 font-bold">{d.year}-yil</td>
                          <td className="py-2 px-3 text-muted">
                            {d.deposited.toLocaleString('uz-UZ')} soʻm
                          </td>
                          <td className="py-2 px-3 text-accent font-medium">
                            +{d.interest.toLocaleString('uz-UZ')} soʻm
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-fg">
                            {d.total.toLocaleString('uz-UZ')} soʻm
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
      </div>
    </section>
  )
}
export default WealthSimulator

