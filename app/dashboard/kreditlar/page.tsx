'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BuildingLibraryIcon,
  SparklesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowTrendingDownIcon,
  Squares2X2Icon,
  TableCellsIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import type { RankedLoanOffer, LoanType, LoanBadge } from '@/types'

const LOAN_TYPES: LoanType[] = ['CONSUMER', 'AUTO', 'MORTGAGE', 'MICRO', 'EDUCATION', 'REFINANCE']

export default function KreditlarPage() {
  const t = useTranslations('loans')
  const tCommon = useTranslations('common')

  // Filtr holatlari
  const [amount, setAmount] = useState<number>(30_000_000) // 30 mln
  const [termMonths, setTermMonths] = useState<number>(24) // 24 oy
  const [loanType, setLoanType] = useState<LoanType>('CONSUMER')
  const [noCollateral, setNoCollateral] = useState<boolean>(false)
  const [currentRatePct, setCurrentRatePct] = useState<number | ''>('')

  // Ko'rinish rejimi: 'cards' yoki 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const [offers, setOffers] = useState<RankedLoanOffer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        amount: String(amount),
        termMonths: String(termMonths),
        type: loanType,
        ...(noCollateral ? { noCollateral: 'true' } : {}),
        ...(currentRatePct !== '' && Number(currentRatePct) > 0
          ? { currentRatePct: String(currentRatePct) }
          : {}),
      })

      const res = await fetch(`/api/loans/best?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers || [])
      } else {
        const errData = await res.json().catch(() => null)
        setError(errData?.error?.message || t('none'))
        setOffers([])
      }
    } catch {
      setError(t('none'))
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOffers()
  }, [amount, termMonths, loanType, noCollateral, currentRatePct])

  // Badge ranglarini aniqlash
  const getBadgeStyle = (badge: LoanBadge) => {
    switch (badge) {
      case 'BEST_VALUE':
        return 'bg-accent/15 text-accent border-accent/40 font-bold'
      case 'LOWEST_RATE':
        return 'bg-sky-500/15 text-sky-500 border-sky-500/40 font-bold'
      case 'FASTEST':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/40 font-semibold'
      case 'NO_COLLATERAL':
        return 'bg-purple-500/15 text-purple-500 border-purple-500/40 font-semibold'
      case 'ONLINE':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 font-semibold'
      default:
        return 'bg-surface text-muted border-border font-medium'
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sarlavha va ko'rinish tanlovi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <BuildingLibraryIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              {t('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* View mode toggle (desktop uchun) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="hidden md:flex items-center p-1 rounded-xl bg-surface border border-border">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>Kartalar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
              <span>Jadval</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtr paneli */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-fg flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-accent" />
            <span>Qidiruv shartlari va parametrlar</span>
          </h2>
          <span className="text-xs text-muted">
            {offers.length} ta taklif topildi
          </span>
        </div>

        {/* Kredit turlari (Pill buttonlar) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted block">
            {t('type')}
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LOAN_TYPES.map((type) => {
              const active = loanType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLoanType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                    active
                      ? 'bg-accent text-white shadow-2xs'
                      : 'bg-background border border-border text-muted hover:text-fg hover:border-accent/40'
                  }`}
                >
                  {t(`types.${type}`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Asosiy filtr slayderlari va inputlari */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Summa */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('amount')}</span>
              <span className="font-bold text-fg">
                {amount.toLocaleString('uz-UZ')} {tCommon('som')}
              </span>
            </div>
            <input
              type="range"
              min={1_000_000}
              max={300_000_000}
              step={1_000_000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>1 mln</span>
              <span>300 mln</span>
            </div>
          </div>

          {/* 2. Muddat */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted">{t('term')}</span>
              <span className="font-bold text-fg">
                {termMonths} {tCommon('months')}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={120}
              step={1}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>3 {tCommon('months')}</span>
              <span>120 {tCommon('months')}</span>
            </div>
          </div>

          {/* 3. Joriy stavka (ixtiyoriy) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted block">
              {t('currentRate')}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Masalan: 26%"
                value={currentRatePct}
                onChange={(e) =>
                  setCurrentRatePct(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full py-2 px-3 rounded-xl bg-background border border-border text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
              <span className="absolute right-3 top-2 text-xs text-muted font-bold">%</span>
            </div>
          </div>

          {/* 4. Garovsiz toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border self-end">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-fg">{t('noCollateral')}</p>
              <p className="text-[10px] text-muted">Kafil yoki garovsiz</p>
            </div>
            <button
              type="button"
              onClick={() => setNoCollateral(!noCollateral)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                noCollateral ? 'bg-accent' : 'bg-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  noCollateral ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Yuklanish holati */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <ArrowPathIcon className="w-7 h-7 text-accent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted">{tCommon('loading')}</p>
        </div>
      )}

      {/* Topilmadi holati */}
      {!loading && offers.length === 0 && (
        <div className="p-10 rounded-3xl bg-surface border border-border text-center space-y-3">
          <InformationCircleIcon className="w-10 h-10 text-muted mx-auto" />
          <p className="text-sm font-bold text-fg">{t('none')}</p>
          <p className="text-xs text-muted max-w-md mx-auto">
            {tCommon('demoData')}
          </p>
        </div>
      )}

      {/* KARTALAR KO'RINIShI (Mobile va Desktop cards) */}
      {!loading && offers.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="p-5 sm:p-6 rounded-3xl bg-surface border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
            >
              {/* Yuqori qism: Bank va mahsulot nomi */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-fg tracking-tight">
                      {offer.bank}
                    </h3>
                    <p className="text-xs font-medium text-muted">{offer.product}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-accent tracking-tight">
                      {offer.rateMin}%
                    </span>
                    {offer.rateMax > offer.rateMin && (
                      <span className="text-xs text-muted ml-0.5">–{offer.rateMax}%</span>
                    )}
                    <span className="block text-[10px] text-muted">yillik stavka</span>
                  </div>
                </div>

                {/* Badgelar */}
                <div className="flex flex-wrap gap-1.5">
                  {offer.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] ${getBadgeStyle(badge)}`}
                    >
                      {t(`badges.${badge}`)}
                    </span>
                  ))}
                </div>
              </div>

              {/* O'rta qism: To'lovlar va shartlar */}
              <div className="space-y-2.5 pt-3 border-t border-border/70 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">{t('monthlyPayment')}:</span>
                  <span className="font-extrabold text-fg">
                    {offer.monthlyPaymentMin.toLocaleString('uz-UZ')} {tCommon('som')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted">{t('overpayment')}:</span>
                  <span className="font-medium text-muted">
                    {offer.overpaymentMin.toLocaleString('uz-UZ')} {tCommon('som')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted">Koʻrib chiqish:</span>
                  <span className="font-semibold text-fg">
                    {t('approval', { days: offer.approvalDays })}
                  </span>
                </div>

                {/* Agar joriy kreditga nisbatan tejash bo'lsa */}
                {offer.savingVsCurrent !== null && offer.savingVsCurrent > 0 && (
                  <div className="p-2 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-[11px] flex items-center gap-1.5">
                    <ArrowTrendingDownIcon className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {t('saving', {
                        amount: offer.savingVsCurrent.toLocaleString('uz-UZ'),
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Pastki qism: Izoh va Ariza topshirish */}
              <div className="space-y-3 pt-2">
                {offer.note && (
                  <p className="text-[11px] text-muted/90 italic leading-relaxed">
                    «{offer.note}»
                  </p>
                )}

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs group-hover:shadow-accent/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Ariza topshirish</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* JADVAL KO'RINIShI (Desktop Table) */}
      {!loading && offers.length > 0 && viewMode === 'table' && (
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-background/70 text-muted border-b border-border font-semibold">
              <tr>
                <th className="py-3.5 px-5">Bank va mahsulot</th>
                <th className="py-3.5 px-4">Stavka</th>
                <th className="py-3.5 px-4">{t('monthlyPayment')}</th>
                <th className="py-3.5 px-4">{t('overpayment')}</th>
                <th className="py-3.5 px-4">Muddat</th>
                <th className="py-3.5 px-4">Xususiyatlar</th>
                <th className="py-3.5 px-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-accent/5 transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-extrabold text-fg text-sm">{offer.bank}</p>
                    <p className="text-[11px] text-muted">{offer.product}</p>
                  </td>
                  <td className="py-4 px-4 font-black text-accent text-sm">
                    {offer.rateMin}%
                    {offer.rateMax > offer.rateMin && `–${offer.rateMax}%`}
                  </td>
                  <td className="py-4 px-4 font-bold text-fg">
                    {offer.monthlyPaymentMin.toLocaleString('uz-UZ')} {tCommon('som')}
                  </td>
                  <td className="py-4 px-4 text-muted">
                    {offer.overpaymentMin.toLocaleString('uz-UZ')} {tCommon('som')}
                  </td>
                  <td className="py-4 px-4 text-fg font-medium">
                    {t('approval', { days: offer.approvalDays })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {offer.badges.map((b) => (
                        <span
                          key={b}
                          className={`px-1.5 py-0.5 rounded border text-[9px] ${getBadgeStyle(b)}`}
                        >
                          {t(`badges.${b}`)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      Tanlash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Namuna eslatmasi */}
      <div className="p-4 rounded-2xl bg-surface/60 border border-border/80 text-[11px] text-muted flex items-center gap-2">
        <InformationCircleIcon className="w-4 h-4 text-accent flex-shrink-0" />
        <span>{tCommon('demoData')}</span>
      </div>
    </div>
  )
}
