'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentTextIcon } from './HeroIcons'
import {
  ArrowUpDown,
  Filter,
  CheckCircle,
  ExternalLink,
  Percent,
  Building,
  Sparkles,
  Search,
} from 'lucide-react'
import { Modal } from '@/components/Modal'

interface LoanOffer {
  id: string
  bank: string
  logoText: string
  product: string
  rate: number
  maxAmount: number
  maxTermMonths: number
  monthlyPaymentEstimate: number // 30 mln, 24 oy uchun
  features: string[]
  badge?: string
}

const LOAN_DATA: LoanOffer[] = [
  {
    id: 'loan-1',
    bank: 'TBC Bank',
    logoText: 'TBC',
    product: 'Tezkor onlayn mikroqarz',
    rate: 24,
    maxAmount: 50_000_000,
    maxTermMonths: 36,
    monthlyPaymentEstimate: 1_588_000,
    features: ['Garovsiz', 'Ilovada 2 daqiqada', 'Hujjatlarsiz'],
    badge: 'Eng past foiz',
  },
  {
    id: 'loan-2',
    bank: 'Ipak Yoʻli Bank',
    logoText: 'IYB',
    product: 'Universal isteʼmol krediti',
    rate: 26,
    maxAmount: 100_000_000,
    maxTermMonths: 48,
    monthlyPaymentEstimate: 1_621_000,
    features: ['Katta summa', 'Onlayn tasdiqlash', 'Qulay grafik'],
    badge: 'Ommabop',
  },
  {
    id: 'loan-3',
    bank: 'SQB (Oʻzsanoatqurilishbank)',
    logoText: 'SQB',
    product: 'Yashil energiya va taʼmirlash',
    rate: 25,
    maxAmount: 80_000_000,
    maxTermMonths: 60,
    monthlyPaymentEstimate: 1_604_000,
    features: ['Uzoq muddat (5 yil)', 'Past dastlabki toʻlov'],
  },
  {
    id: 'loan-4',
    bank: 'Hamkorbank',
    logoText: 'HB',
    product: 'Avto va maishiy texnika',
    rate: 28,
    maxAmount: 60_000_000,
    maxTermMonths: 36,
    monthlyPaymentEstimate: 1_655_000,
    features: ['Tezkor koʻrib chiqish', 'Barcha viloyatlarda'],
  },
  {
    id: 'loan-5',
    bank: 'Kapitalbank',
    logoText: 'KB',
    product: 'Ekspress kredit',
    rate: 30,
    maxAmount: 40_000_000,
    maxTermMonths: 24,
    monthlyPaymentEstimate: 1_689_000,
    features: ['Faqat pasport', 'Naqd yoki kartaga'],
  },
]

export function LoanOffers() {
  const [offers] = useState<LoanOffer[]>(LOAN_DATA)
  const [sortBy, setSortBy] = useState<'rate' | 'maxAmount' | 'maxTermMonths'>('rate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [maxRateFilter, setMaxRateFilter] = useState<number>(32)
  const [minAmountFilter, setMinAmountFilter] = useState<number>(0)
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null)
  const [applySuccess, setApplySuccess] = useState<boolean>(false)

  // Saralash va filtrlash
  const filteredAndSortedOffers = useMemo(() => {
    return offers
      .filter((o) => o.rate <= maxRateFilter && o.maxAmount >= minAmountFilter)
      .sort((a, b) => {
        const valA = a[sortBy]
        const valB = b[sortBy]
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })
  }, [offers, sortBy, sortOrder, maxRateFilter, minAmountFilter])

  const toggleSort = (field: 'rate' | 'maxAmount' | 'maxTermMonths') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleApply = (offer: LoanOffer) => {
    setSelectedOffer(offer)
    setApplySuccess(false)
  }

  const handleConfirmApply = (e: React.FormEvent) => {
    e.preventDefault()
    setApplySuccess(true)
    setTimeout(() => {
      setSelectedOffer(null)
      setApplySuccess(false)
    }, 2200)
  }

  return (
    <section className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <DocumentTextIcon className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              Kredit takliflari agregatori (Loan Offers)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Oʻzbekistondagi yetakchi banklarning rasmiy stavkalarini solishtiring va eng arzonini tanlang
          </p>
        </div>
      </div>

      {/* Stavka taqqoslash charti (Animated bars) */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
          Banklar boʻyicha yillik foiz stavkasi solishtirmasi:
        </h3>

        <div className="space-y-3">
          {offers.map((offer) => {
            const widthPercentage = (offer.rate / 35) * 100
            const isLowest = offer.rate === 24

            return (
              <div key={offer.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-fg flex items-center gap-2">
                    <span>{offer.bank}</span>
                    <span className="text-[11px] text-muted font-normal">
                      ({offer.product})
                    </span>
                  </span>
                  <span
                    className={`font-extrabold ${
                      isLowest ? 'text-accent' : 'text-fg'
                    }`}
                  >
                    {offer.rate}% yillik
                  </span>
                </div>

                <div className="h-3 w-full bg-border/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      isLowest
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-r from-zinc-500 to-zinc-400'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtrlar paneli */}
      <div className="p-4 rounded-xl bg-background border border-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted font-semibold">Maksimal stavka:</span>
            <select
              value={maxRateFilter}
              onChange={(e) => setMaxRateFilter(Number(e.target.value))}
              className="bg-surface border border-border rounded-lg px-2.5 py-1 text-fg outline-none"
            >
              <option value={25}>25% gacha</option>
              <option value={28}>28% gacha</option>
              <option value={32}>Barchasi (32% gacha)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted font-semibold">Saralash:</span>
            <button
              type="button"
              onClick={() => toggleSort('rate')}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                sortBy === 'rate'
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface text-muted border-border'
              }`}
            >
              <span>Foiz</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSort('maxAmount')}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                sortBy === 'maxAmount'
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface text-muted border-border'
              }`}
            >
              <span>Summa</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <span className="text-muted">
          Topildi: <strong>{filteredAndSortedOffers.length} ta</strong> taklif
        </span>
      </div>

      {/* DESKTOP KO'RINISH: Jadval (Table view) */}
      <div className="hidden md:block rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-background text-muted uppercase font-semibold border-b border-border">
            <tr>
              <th className="py-3.5 px-4">Bank va Mahsulot</th>
              <th className="py-3.5 px-4">Foiz stavkasi</th>
              <th className="py-3.5 px-4">Maksimal summa</th>
              <th className="py-3.5 px-4">Maksimal muddat</th>
              <th className="py-3.5 px-4">Afzalliklari</th>
              <th className="py-3.5 px-4 text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedOffers.map((offer) => (
              <tr key={offer.id} className="hover:bg-background/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent font-extrabold flex items-center justify-center text-xs shadow-2xs">
                      {offer.logoText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fg text-sm">{offer.bank}</span>
                        {offer.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                            {offer.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted">{offer.product}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-extrabold text-accent text-sm">
                    {offer.rate}%
                  </span>
                  <span className="text-[10px] text-muted block">yillik</span>
                </td>

                <td className="py-3.5 px-4 font-bold text-fg">
                  {(offer.maxAmount / 1_000_000).toFixed(0)} mln soʻm
                </td>

                <td className="py-3.5 px-4 text-muted">
                  {offer.maxTermMonths} oy ({offer.maxTermMonths / 12} yil)
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {offer.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border text-muted"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  {/* Glow animation "Apply now" button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApply(offer)}
                    className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 shadow-md shadow-accent/30 cursor-pointer overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    <span>Ariza berish</span>
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBIL KO'RINISH: Kartalar (Card view) */}
      <div className="md:hidden space-y-4">
        {filteredAndSortedOffers.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent font-extrabold flex items-center justify-center text-xs">
                  {offer.logoText}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-fg">{offer.bank}</h4>
                  <p className="text-[11px] text-muted">{offer.product}</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-accent">
                {offer.rate}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border">
              <div>
                <span className="text-muted block text-[10px]">Maksimal summa:</span>
                <strong className="text-fg">
                  {(offer.maxAmount / 1_000_000).toFixed(0)} mln soʻm
                </strong>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Muddati:</span>
                <strong className="text-fg">{offer.maxTermMonths} oy</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {offer.features.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border text-muted"
                >
                  {f}
                </span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleApply(offer)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-accent shadow-md shadow-accent/20 cursor-pointer"
            >
              Ariza berish
            </motion.button>
          </div>
        ))}
      </div>

      {/* Ariza berish Modali (Spring animation) */}
      <Modal
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        title={selectedOffer ? `${selectedOffer.bank} — Ariza yuborish` : ''}
      >
        {selectedOffer && (
          <div className="space-y-4">
            {applySuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-fg">
                  Arizangiz qabul qilindi!
                </h4>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  {selectedOffer.bank} mutaxassisi 15 daqiqa ichida siz bilan bogʻlanadi.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleConfirmApply} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-background border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">Kredit turi:</span>
                    <strong className="text-fg">{selectedOffer.product}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Yillik stavka:</span>
                    <strong className="text-accent">{selectedOffer.rate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Maksimal summa:</span>
                    <strong className="text-fg">
                      {(selectedOffer.maxAmount / 1_000_000).toFixed(0)} mln soʻm
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">
                    Kerakli summa (soʻm):
                  </label>
                  <input
                    type="number"
                    defaultValue={30_000_000}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">
                    Aloqa uchun telefon:
                  </label>
                  <input
                    type="tel"
                    defaultValue="+998901234567"
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-fg"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 shadow-xs"
                  >
                    Arizani tasdiqlash
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}
export default LoanOffers

