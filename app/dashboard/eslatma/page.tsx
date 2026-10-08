'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellAlertIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon,
  PhoneIcon,
  SignalIcon,
  WifiIcon,
  Battery50Icon,
} from '@heroicons/react/24/outline'
import type { PaymentReminder } from '@/types'
import { Modal } from '@/components/Modal'
import { InputField } from '@/components/InputField'
import { Badge } from '@/components/Badge'
import { SkeletonCard } from '@/components/SkeletonCard'

export default function EslatmaPage() {
  const tNav = useTranslations('nav')
  const tSms = useTranslations('sms')
  const tCommon = useTranslations('common')

  const [reminders, setReminders] = useState<PaymentReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSmsReminder, setSelectedSmsReminder] = useState<PaymentReminder | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null)
  const [smsToast, setSmsToast] = useState<{ title: string; desc: string } | null>(null)
  const [smsBubbleKey, setSmsBubbleKey] = useState<number>(0)

  // Yangi eslatma formasi
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [dayOfMonth, setDayOfMonth] = useState<number | ''>(5)
  const [phone, setPhone] = useState('+998901234567')

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/user/reminders')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.reminders)) {
          setReminders(data.reminders)
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
    fetchReminders()
  }, [])

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !dayOfMonth || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/user/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          dayOfMonth: Number(dayOfMonth),
          phone,
        }),
      })

      if (res.ok) {
        setIsAddModalOpen(false)
        setName('')
        setAmount('')
        setDayOfMonth(5)
        await fetchReminders()
      }
    } catch {
      // error
    } finally {
      setSubmitting(false)
    }
  }

  // SMS yuborish funksiyasi
  const handleSendSms = async (reminder: PaymentReminder) => {
    setSendingSmsId(reminder.id)
    setSelectedSmsReminder(reminder)
    setSmsBubbleKey((prev) => prev + 1)

    try {
      const res = await fetch(`/api/sms/reminder/${reminder.id}`, { method: 'POST' })
      if (res.ok) {
        setSmsToast({
          title: tSms('sent'),
          desc: tSms('demo'),
        })
      } else {
        const err = await res.json().catch(() => null)
        setSmsToast({
          title: 'Xatolik',
          desc: err?.error?.message || 'SMS yuborishda xatolik yuz berdi.',
        })
      }
    } catch {
      setSmsToast({
        title: 'Xatolik',
        desc: 'Server bilan aloqa uzildi.',
      })
    } finally {
      setSendingSmsId(null)
      // Toastni 5 soniyadan so'ng yopish
      setTimeout(() => {
        setSmsToast(null)
      }, 5000)
    }
  }

  const today = new Date().getDate()

  // Eslatma holatini hisoblash (Kechikkan, Yaqin, Normal)
  const getReminderStatus = (day: number) => {
    const diff = day - today
    if (diff < 0) {
      return {
        type: 'overdue',
        label: 'Kechikkan',
        cardBorder: 'border-danger/60 bg-danger/5',
        badgeVariant: 'danger' as const,
        diff,
      }
    } else if (diff <= 3) {
      return {
        type: 'approaching',
        label: diff === 0 ? 'Bugun toʻlash kuni' : `${diff} kun qoldi`,
        cardBorder: 'border-warning/60 bg-warning/5',
        badgeVariant: 'warning' as const,
        diff,
      }
    } else {
      return {
        type: 'normal',
        label: `${diff} kun qoldi`,
        cardBorder: 'border-border bg-surface',
        badgeVariant: 'success' as const,
        diff,
      }
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sarlavha va Yangi eslatma tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <BellAlertIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              {tNav('eslatma')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Kredit, ijara va kommunal toʻlovlarni oʻz vaqtida amalga oshiring va SMS xabarnoma oling
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Yangi eslatma</span>
        </button>
      </div>

      {/* Toast xabarnomasi */}
      <AnimatePresence>
        {smsToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl bg-surface border border-accent shadow-lg flex items-start justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-fg">{smsToast.title}</p>
                <p className="text-[11px] text-muted mt-0.5">{smsToast.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSmsToast(null)}
              className="text-muted hover:text-fg p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eslatmalar ro'yxati */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-surface text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
              <BellAlertIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-fg">
              Toʻlov eslatmalari mavjud emas
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Kredit yoki majburiy toʻlov sanasini kiritib qoʻying, Mizo sizga SMS orqali eslatib turadi!
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Birinchi eslatmani qoʻshish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((reminder) => {
              const status = getReminderStatus(reminder.dayOfMonth)

              return (
                <motion.div
                  key={reminder.id}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-3xl border shadow-xs transition-all space-y-4 ${status.cardBorder}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-fg tracking-tight">
                        {reminder.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        <span>Har oyning <strong>{reminder.dayOfMonth}-sanasi</strong></span>
                      </p>
                    </div>
                    <Badge variant={status.badgeVariant}>{status.label}</Badge>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
                    <div>
                      <span className="text-[11px] text-muted block">Toʻlov summasi:</span>
                      <strong className="text-base font-black text-fg">
                        {reminder.amount.toLocaleString('uz-UZ')} {tCommon('som')}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* SMS yuborish tugmasi */}
                      <button
                        type="button"
                        onClick={() => handleSendSms(reminder)}
                        disabled={sendingSmsId === reminder.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                        <span>
                          {sendingSmsId === reminder.id ? 'Yuborilmoqda...' : 'SMS yuborish'}
                        </span>
                      </button>

                      {/* Telefon ko'rinishi */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSmsReminder(reminder)
                          setSmsBubbleKey((prev) => prev + 1)
                        }}
                        className="p-1.5 rounded-xl bg-surface border border-border text-muted hover:text-fg hover:border-accent/40 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        title="Telefonda ko'rish"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Yangi eslatma qo'shish modali */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yangi toʻlov eslatmasi"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <InputField
            label="Eslatma nomi"
            name="name"
            required
            placeholder="Masalan: Ipoteka, Kommunal toʻlov, Maktab toʻlovi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            label="Toʻlov summasi (soʻm)"
            name="amount"
            type="number"
            required
            placeholder="1 500 000"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
          />

          <InputField
            label="Har oyning qaysi kunida (1-31)"
            name="dayOfMonth"
            type="number"
            required
            min={1}
            max={31}
            placeholder="10"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value ? Number(e.target.value) : '')}
          />

          <InputField
            label="Telefon raqami (SMS uchun)"
            name="phone"
            type="tel"
            placeholder="+998901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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

      {/* SMS KO'RISH VA FLY-IN ANIMATSIYASI (Telefon ramkasi) */}
      <Modal
        isOpen={!!selectedSmsReminder}
        onClose={() => setSelectedSmsReminder(null)}
        title="SMS xabarnoma simulyatori"
        maxWidth="max-w-sm"
      >
        {selectedSmsReminder && (
          <div className="flex flex-col items-center justify-center py-2">
            {/* Telefon korpusi (w-72, rounded-[2.5rem]) */}
            <div className="w-72 rounded-[2.5rem] bg-zinc-950 text-white p-4 shadow-2xl border-4 border-zinc-800 space-y-4 relative overflow-hidden">
              {/* Dynamic Island */}
              <div className="w-20 h-4 bg-zinc-800 rounded-full mx-auto" />

              {/* Status bar */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2 font-medium">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <SignalIcon className="w-3 h-3" />
                  <WifiIcon className="w-3 h-3" />
                  <Battery50Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Kontakt sarlavhasi */}
              <div className="text-center pb-2 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-accent text-white font-black flex items-center justify-center mx-auto mb-1 text-sm shadow-md">
                  M
                </div>
                <p className="text-xs font-bold text-zinc-100">Mizo</p>
                <p className="text-[10px] text-zinc-400">Rasmiy xizmat</p>
              </div>

              {/* SMS suhbat maydoni & UCHIB KELUVCHI SMS PUFAKCHASI */}
              <div className="py-4 space-y-2 min-h-40 flex flex-col justify-end">
                <motion.div
                  key={smsBubbleKey}
                  initial={{ y: 60, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  className="self-end max-w-[88%] rounded-2xl rounded-br-xs p-3.5 bg-accent text-white text-xs shadow-lg space-y-1.5"
                >
                  <p className="leading-relaxed font-medium">
                    Mizo: {selectedSmsReminder.name} boʻyicha{' '}
                    <strong>{selectedSmsReminder.amount.toLocaleString('uz-UZ')} soʻm</strong> toʻlov muddati har oyning{' '}
                    <strong>{selectedSmsReminder.dayOfMonth}-sanasida</strong>. mizo.uz
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-white/80">
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>Hozirgina · Yetkazildi</span>
                  </div>
                </motion.div>
              </div>

              {/* Pastki uy chizig'i (Home bar) */}
              <div className="w-28 h-1 bg-zinc-600 rounded-full mx-auto mt-2" />
            </div>

            <p className="text-[11px] text-muted mt-3 text-center">
              {tSms('demo')}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
