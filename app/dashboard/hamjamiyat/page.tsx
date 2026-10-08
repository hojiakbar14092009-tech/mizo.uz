'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  PlusIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowPathIcon,
  XMarkIcon,
  FireIcon,
  ClockIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import type { CommunityTipView, AiCategory } from '@/types'

const CATEGORIES: Array<AiCategory | 'ALL'> = ['ALL', 'BUDGET', 'CREDIT', 'GOAL', 'INVEST', 'FRAUD']

export default function HamjamiyatPage() {
  const t = useTranslations('community')
  const tCategories = useTranslations('categories')
  const tCommon = useTranslations('common')

  const [tips, setTips] = useState<CommunityTipView[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AiCategory | 'ALL'>('ALL')
  const [sortOrder, setSortOrder] = useState<'top' | 'new'>('top')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)

  // Maslahat ulashish modali
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false)
  const [formCategory, setFormCategory] = useState<AiCategory>('BUDGET')
  const [formTitle, setFormTitle] = useState<string>('')
  const [formContent, setFormContent] = useState<string>('')
  const [formSavedAmount, setFormSavedAmount] = useState<number | ''>('')
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Maslahatlarni yuklash
  const fetchTips = async (reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory)
      params.set('sort', sortOrder)
      if (!reset && nextCursor) params.set('cursor', nextCursor)

      const res = await fetch(`/api/community/tips?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setTips(data.tips || [])
        } else {
          setTips((prev) => [...prev, ...(data.tips || [])])
        }
        setNextCursor(data.nextCursor || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTips(true)
  }, [selectedCategory, sortOrder])

  // Optimistic Like amali
  const handleLike = async (tipId: string, currentLiked: boolean, currentCount: number) => {
    // Optimistik yangilash
    setTips((prev) =>
      prev.map((tip) => {
        if (tip.id === tipId) {
          return {
            ...tip,
            likedByMe: !currentLiked,
            likesCount: currentLiked ? currentCount - 1 : currentCount + 1,
          }
        }
        return tip
      })
    )

    try {
      const res = await fetch(`/api/community/tips/${tipId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setTips((prev) =>
          prev.map((tip) =>
            tip.id === tipId
              ? { ...tip, likedByMe: data.liked, likesCount: data.likesCount }
              : tip
          )
        )
      } else {
        // Rollback agar backend xato bersa
        setTips((prev) =>
          prev.map((tip) =>
            tip.id === tipId
              ? { ...tip, likedByMe: currentLiked, likesCount: currentCount }
              : tip
          )
        )
      }
    } catch {
      // Rollback
      setTips((prev) =>
        prev.map((tip) =>
          tip.id === tipId
            ? { ...tip, likedByMe: currentLiked, likesCount: currentCount }
            : tip
        )
      )
    }
  }

  // Yangi maslahat saqlash
  const handleCreateTip = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (formTitle.trim().length < 5 || formTitle.trim().length > 80) {
      setFormError('Sarlavha 5 tadan 80 tagacha belgi boʻlishi kerak.')
      return
    }
    if (formContent.trim().length < 20 || formContent.trim().length > 600) {
      setFormError('Matn 20 tadan 600 tagacha belgi boʻlishi kerak.')
      return
    }

    setFormSubmitting(true)
    try {
      const res = await fetch('/api/community/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory,
          title: formTitle.trim(),
          content: formContent.trim(),
          ...(formSavedAmount !== '' && Number(formSavedAmount) > 0
            ? { savedAmount: Number(formSavedAmount) }
            : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsShareModalOpen(false)
        setFormTitle('')
        setFormContent('')
        setFormSavedAmount('')
        // Yangi qo'shilgan maslahatni boshiga joylash
        setTips((prev) => [data.tip, ...prev])
      } else {
        const err = await res.json().catch(() => null)
        setFormError(err?.error?.message || 'Xatolik yuz berdi.')
      }
    } catch {
      setFormError('Server bilan aloqa uzildi.')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sarlavha va "Tajriba ulashish" tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              {t('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            {t('subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t('share')}</span>
        </button>
      </div>

      {/* Filtrlar va Saralash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-3">
        {/* Kategoriyalar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat
            const label = cat === 'ALL' ? t('all') : tCategories(cat)

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-accent text-white shadow-2xs'
                    : 'bg-surface border border-border text-muted hover:text-fg hover:border-accent/40'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Saralash (Top / New) */}
        <div className="flex items-center p-1 rounded-xl bg-surface border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortOrder('top')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortOrder === 'top'
                ? 'bg-accent text-white shadow-2xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            <FireIcon className="w-3.5 h-3.5" />
            <span>{t('top')}</span>
          </button>
          <button
            type="button"
            onClick={() => setSortOrder('new')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortOrder === 'new'
                ? 'bg-accent text-white shadow-2xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{t('new')}</span>
          </button>
        </div>
      </div>

      {/* Maslahatlar ro'yxati (1 col mobile -> 2 col tablet -> 3 col desktop) */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <ArrowPathIcon className="w-7 h-7 text-accent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted">{tCommon('loading')}</p>
        </div>
      ) : tips.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-dashed border-border text-center space-y-3">
          <UserGroupIcon className="w-10 h-10 text-muted mx-auto" />
          <p className="text-sm font-bold text-fg">{tCommon('empty')}</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Birinchi boʻlib oʻz tajribangizni boshqalar bilan ulashing!
          </p>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>{t('share')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map((tip, idx) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -3 }}
                className="p-5 sm:p-6 rounded-3xl bg-surface border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
              >
                {/* Toifa va Muallif */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-[11px]">
                      {tCategories(tip.category)}
                    </span>
                    <span className="text-[11px] text-muted font-medium">
                      {tip.author}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-fg tracking-tight leading-snug">
                    {tip.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">
                    {tip.content}
                  </p>
                </div>

                {/* Tejagan summasi va Like tugmasi */}
                <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                  {tip.savedAmount && tip.savedAmount > 0 ? (
                    <div className="inline-flex items-center gap-1.5 text-accent text-xs font-bold">
                      <BanknotesIcon className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {t('saved', { amount: tip.savedAmount.toLocaleString('uz-UZ') })}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Pop Heart Like Button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 1.3 }}
                    onClick={() => handleLike(tip.id, tip.likedByMe, tip.likesCount)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      tip.likedByMe
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                        : 'bg-background border-border text-muted hover:text-rose-500 hover:border-rose-500/40'
                    }`}
                  >
                    {tip.likedByMe ? (
                      <HeartSolidIcon className="w-4 h-4 text-rose-500" />
                    ) : (
                      <HeartOutlineIcon className="w-4 h-4" />
                    )}
                    <span>{tip.likesCount}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Yana yuklash (Pagination cursor) */}
          {nextCursor && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => fetchTips(false)}
                disabled={loadingMore}
                className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:border-accent/40 text-xs font-bold text-fg transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {loadingMore ? tCommon('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tajriba ulashish modali */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-surface border border-border p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h2 className="text-base font-extrabold text-fg">{t('share')}</h2>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-fg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-danger/15 border border-danger/40 text-danger text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateTip} className="space-y-4">
                {/* Toifa tanlash */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted block">Toifa</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AiCategory)}
                    className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  >
                    <option value="BUDGET">{tCategories('BUDGET')}</option>
                    <option value="CREDIT">{tCategories('CREDIT')}</option>
                    <option value="GOAL">{tCategories('GOAL')}</option>
                    <option value="INVEST">{tCategories('INVEST')}</option>
                    <option value="FRAUD">{tCategories('FRAUD')}</option>
                  </select>
                </div>

                {/* Sarlavha (5-80) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-muted">{t('tipTitle')}</label>
                    <span className="text-[10px] text-muted">{formTitle.length}/80</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Qisqa va aniq sarlavha (5-80 belgi)"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </div>

                {/* Mazmuni (20-600) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-muted">{t('tipContent')}</label>
                    <span className="text-[10px] text-muted">{formContent.length}/600</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    maxLength={600}
                    placeholder="Tafsilotlar, olingan xulosalar va boshqalarga maslahat..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
                  />
                </div>

                {/* Tejagan summasi (ixtiyoriy) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted block">
                    {t('savedAmount')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Masalan: 1500000"
                    value={formSavedAmount}
                    onChange={(e) =>
                      setFormSavedAmount(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-border/60 transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-95 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {formSubmitting ? tCommon('loading') : tCommon('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
