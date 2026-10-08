'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AcademicCapIcon } from './HeroIcons'
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

export function HealthScore() {
  const [score, setScore] = useState<number>(78)

  // 4 ta o'lchov indikatori
  const breakdownItems = [
    {
      name: 'Toʻlov intizomi',
      value: '95%',
      status: 'green',
      desc: 'Barcha toʻlovlar oʻz vaqtida',
    },
    {
      name: 'Qarz yuki (DTI)',
      value: '28%',
      status: 'green',
      desc: 'Oylik daromadning 30% dan kam',
    },
    {
      name: 'Favqulodda fond',
      value: '2.5 oy',
      status: 'yellow',
      desc: 'Tavsiya: 3-6 oylik zaxira',
    },
    {
      name: 'Jamgʻarma odati',
      value: '18%',
      status: 'green',
      desc: 'Har oy muntazam jamgʻariladi',
    },
  ]

  // Oylik trend (oxirgi 6 oy sparkline: 62 -> 65 -> 69 -> 71 -> 75 -> 78)
  const monthlyTrend = [62, 65, 69, 71, 75, 78]

  // Needle aylanish burchagi (-90 dan +90 gacha)
  const needleAngle = -90 + (score / 100) * 180

  // Maslahatlar
  const getScoreTip = (val: number) => {
    if (val < 50) {
      return {
        level: 'Xavfli',
        color: 'text-danger',
        bg: 'bg-danger/10 border-danger/30',
        text: '⚠️ Qarz yukini kamaytiring va darhol oylik xarajatlar byudjetini rejalashtiring.',
      }
    } else if (val < 75) {
      return {
        level: 'Yaxshi',
        color: 'text-warning',
        bg: 'bg-warning/10 border-warning/30',
        text: '🟡 Yaxshi holat! Favqulodda fondingizni kamida 3-6 oylik xarajat darajasiga yetkazing.',
      }
    } else {
      return {
        level: 'Aʼlo darajada',
        color: 'text-accent',
        bg: 'bg-accent/15 border-accent/30',
        text: '🟢 Aʼlo! Moliyaviy intizomingiz yuqori. Erkin mablagʻlarni diversifikatsiyalangan investitsiyalarga yoʻnaltiring.',
      }
    }
  }

  const tipInfo = getScoreTip(score)

  return (
    <section className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <AcademicCapIcon className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              Moliyaviy salomatlik reytingi (Health Score)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            0 dan 100 gacha shkala: Qarzlar, jamgʻarma va toʻlov intizomingizning umumiy tahlili
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gauge va Asosiy ko'rsatkich (lg: 6 ustun) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col items-center justify-between text-center space-y-6">
          <h3 className="font-bold text-base text-fg w-full text-left border-b border-border pb-3">
            Sizning moliyaviy indeksingiz
          </h3>

          {/* Animated 180° Gauge with Needle */}
          <div className="relative w-64 h-36 flex items-end justify-center pt-4">
            <svg
              width="240"
              height="130"
              viewBox="0 0 240 130"
              className="overflow-visible"
            >
              {/* Gradiyentli shkala yoyi */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Orqa fon yoyi */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                className="text-border/60"
              />

              {/* Gradiyentli old yoy */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Markaziy aylana nuqta */}
              <circle cx="120" cy="120" r="10" className="fill-fg" />
            </svg>

            {/* Framer Motion bilan aylanuvchi strelka (Needle) */}
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

          {/* Skor va daraja */}
          <div className="space-y-1">
            <motion.div
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl sm:text-5xl font-black text-fg tracking-tight"
            >
              {score}
              <span className="text-xl text-muted font-normal"> / 100</span>
            </motion.div>
            <p className={`text-sm font-extrabold ${tipInfo.color}`}>
              {tipInfo.level}
            </p>
          </div>

          {/* Oylik trend (Sparkline) */}
          <div className="w-full p-4 rounded-xl bg-background border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted font-semibold">Oxirgi 6 oylik dinamika:</span>
              <span className="text-accent font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+16 ball</span>
              </span>
            </div>

            {/* Mini SVG Sparkline */}
            <div className="h-10 w-full flex items-end justify-between gap-1 pt-1">
              {monthlyTrend.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent/40 rounded-t-sm hover:bg-accent transition-colors"
                    style={{ height: `${(val / 100) * 36}px` }}
                  />
                  <span className="text-[9px] text-muted">{idx + 1}-oy</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* O'ng panel: Tarkibiy indikatorlar va Maslahatlar (lg: 6 ustun) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Maslahat kartasi */}
          <div className={`p-5 rounded-2xl border ${tipInfo.bg} space-y-2 shadow-xs`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-fg">
                AI Tavsiyasi
              </h4>
            </div>
            <p className="text-xs text-fg leading-relaxed">
              {tipInfo.text}
            </p>
          </div>

          {/* 4 ta tarkibiy indikator (Breakdown) */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
              Reyting tarkibi (Indicators):
            </h4>

            <div className="space-y-3">
              {breakdownItems.map((item, idx) => {
                const indicatorBg =
                  item.status === 'green'
                    ? 'bg-accent/15 text-accent border-accent/25'
                    : item.status === 'yellow'
                    ? 'bg-warning/15 text-warning border-warning/25'
                    : 'bg-danger/15 text-danger border-danger/25'

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-fg">{item.name}</p>
                      <p className="text-[11px] text-muted">{item.desc}</p>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${indicatorBg}`}
                    >
                      {item.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default HealthScore

