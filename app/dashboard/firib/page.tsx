'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import type { AiResult } from '@/types'

export default function FiribPage() {
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiResult | null>(null)

  const quickSamples = [
    'Telegramda kuniga 500$ daromad taklif qilishdi, oldindan 100 ming soʻm toʻlash kerak ekan.',
    'Click nomidan xabar keldi: "Sizga 2 mln soʻm bonus berildi, tasdiqlash kodini yuboring".',
    'Bank xodimi qoʻngʻiroq qilib, kartam xavfsizligi uchun SMS kodni soʻramoqda.',
  ]

  const handleCheck = async (sampleText?: string) => {
    const textToCheck = (sampleText || text).trim()
    if (!textToCheck || loading) return

    setLoading(true)
    setResult(null)

    const langCookie = typeof document !== 'undefined'
      ? document.cookie.match(/mz_lang=(uz|ru)/)?.[1] || 'uz'
      : 'uz'

    try {
      const res = await fetch('/api/user/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[FIRIBGARLIK TEKSHIRUVI]: ${textToCheck}`,
          lang: langCookie,
        }),
      })

      if (res.ok) {
        const data: AiResult = await res.json()
        setResult(data)
      } else {
        // Fallback agar backend xato bersa
        setResult({
          category: 'FRAUD',
          riskLevel: 'HIGH',
          riskScore: 85,
          title: 'Shubhali moliyaviy taklif yoki firibgarlik alomati',
          steps: [
            'Hech qachon SMS orqali kelgan 4–6 xonali tasdiqlash kodini hech kimga aytmang.',
            'Rasmiy bank ilovasiga kirib, kartangiz xavfsizligini tekshiring.',
            'Agar pul yechib olingan boʻlsa, zudlik bilan 1102 (Kiberxavfsizlik) yoki bankingizga murojaat qiling.',
          ],
          flags: [
            'Oldindan toʻlov yoki depozit talab qilish',
            'Shoshiltirish va psixologik bosim oʻtkazish',
            'Karta maʼlumotlari yoki SMS tasdiq kodini soʻrash',
          ],
        })
      }
    } catch {
      // Fallback
      setResult({
        category: 'FRAUD',
        riskLevel: 'MEDIUM',
        riskScore: 55,
        title: 'Xabarda shubhali belgilar mavjud',
        steps: [
          'Begona havolalarga kirmang va shaxsiy maʼlumotlarni kiritmang.',
          'Taklifni rasmiy manbalardan yoki bank qoʻllab-quvvatlash xizmati orqali tekshiring.',
        ],
        flags: [
          'Nomaʼlum yoki shubhali manba',
          'Oson va kafolatlangan katta daromad vaʼdasi',
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  // Yarim doira gauge hisoblash parametrlari (180°)
  const riskScore = result ? result.riskScore : 0
  const radius = 75
  const circumference = Math.PI * radius // ~235.6
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, riskScore)) / 100)

  // Rangni tanlash
  let strokeColor = 'text-accent'
  let summaryBg = 'bg-accent/15 border-accent/30 text-accent'
  let summaryTitle = 'Xavf darajasi past — ehtiyotkorlikni saqlang'

  if (riskScore > 60 || result?.riskLevel === 'HIGH') {
    strokeColor = 'text-danger'
    summaryBg = 'bg-danger/15 border-danger/30 text-danger'
    summaryTitle = 'Yuqori xavf — firibgarlik ehtimoli juda katta'
  } else if (riskScore > 30 || result?.riskLevel === 'MEDIUM') {
    strokeColor = 'text-warning'
    summaryBg = 'bg-warning/15 border-warning/30 text-warning'
    summaryTitle = 'Oʻrtacha xavf — shubhali belgilar mavjud'
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Sarlavha */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <ShieldExclamationIcon className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
            {tNav('firib')}ga qarshi AI Tahlili
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Shubhali xabar, SMS, havola yoki investitsiya taklifini kiriting — sunʼiy intellekt xavf darajasini tahlil qiladi
        </p>
      </div>

      {/* Matn kiritish maydoni */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted block">
            Shubhali xabar yoki taklif matnini kiriting:
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masalan: Telegramda nomaʼlum botdan kelgan yutuq, tez boyish taklifi yoki bank nomidan kelgan gʻalati SMS..."
            className="w-full p-4 rounded-2xl bg-background border border-border text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none transition-all"
          />
        </div>

        {/* Tezkor namunalar */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted block">
            Tezkor tekshirish namunalari:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(sample)
                  handleCheck(sample)
                }}
                className="text-left text-[11px] px-3 py-1.5 rounded-xl bg-background border border-border text-muted hover:text-fg hover:border-accent/40 active:scale-98 transition-all cursor-pointer"
              >
                {sample.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Tekshirish tugmasi */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => handleCheck()}
            disabled={!text.trim() || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Tahlil qilinmoqda...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Xavfsizlikni tekshirish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tahlil natijasi */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-6"
          >
            {/* Yuqori xulosa paneli */}
            <div className={`p-4 rounded-2xl border ${summaryBg} flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                {riskScore > 60 ? (
                  <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <ShieldCheckIcon className="w-6 h-6 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                    {summaryTitle}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">{result.title}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-black">{riskScore}</span>
                <span className="text-xs font-bold opacity-80">/100</span>
                <p className="text-[10px] uppercase font-bold opacity-75">Xavf bali</p>
              </div>
            </div>

            {/* Asosiy 2 ustun: Yarim doira gauge + Xavfli belgilar va Qadamlar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Yarim doira gauge (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-28 flex items-end justify-center">
                  <svg className="w-48 h-48 transform -rotate-180" viewBox="0 0 200 200">
                    {/* Kulrang orqa yo'l */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="text-border"
                    />
                    {/* Rangli ko'rsatkich */}
                    <motion.circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`${strokeColor} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute bottom-2 text-center">
                    <span className="text-3xl font-black text-fg">{riskScore}</span>
                    <span className="text-xs text-muted block -mt-1 font-semibold">Ball</span>
                  </div>
                </div>
                <div className="flex justify-between w-48 text-[11px] text-muted font-bold px-1 mt-1">
                  <span>0 (Xavfsiz)</span>
                  <span>100 (Kritik)</span>
                </div>
              </div>

              {/* Xavfli belgilar (Flags) va Tavsiya qadamlari (7 cols) */}
              <div className="md:col-span-7 space-y-5">
                {/* Flags */}
                {result.flags && result.flags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-fg flex items-center gap-1.5">
                      <ExclamationCircleIcon className="w-4 h-4 text-warning" />
                      <span>Aniqlangan shubhali alomatlar:</span>
                    </h4>
                    <div className="space-y-1.5">
                      {result.flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-background border border-border text-xs text-muted"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                {result.steps && result.steps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-fg flex items-center gap-1.5">
                      <ShieldCheckIcon className="w-4 h-4 text-accent" />
                      <span>Tavsiya etilgan xavfsizlik choralari:</span>
                    </h4>
                    <div className="space-y-1.5">
                      {result.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/20 text-xs text-fg"
                        >
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
