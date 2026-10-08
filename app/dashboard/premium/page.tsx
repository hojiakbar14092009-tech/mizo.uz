'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommunityTips } from '@/components/premium/CommunityTips'
import { WealthSimulator } from '@/components/premium/WealthSimulator'
import { HealthScore } from '@/components/premium/HealthScore'
import { LoanOffers } from '@/components/premium/LoanOffers'
import {
  UsersIcon,
  TrendingUpIcon,
  AcademicCapIcon,
  DocumentTextIcon,
} from '@/components/premium/HeroIcons'
import { Crown, Layers } from 'lucide-react'

type PremiumTab = 'all' | 'community' | 'wealth' | 'score' | 'loans'

export default function PremiumPage() {
  const [activeTab, setActiveTab] = useState<PremiumTab>('all')

  const tabs: Array<{
    id: PremiumTab
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { id: 'all', label: 'Barchasi (All in One)', icon: Layers },
    { id: 'community', label: 'Jamiyat Maslahatlari', icon: UsersIcon },
    { id: 'wealth', label: 'Boylik Simulyatori', icon: TrendingUpIcon },
    { id: 'score', label: 'Salomatlik Reytingi', icon: AcademicCapIcon },
    { id: 'loans', label: 'Kredit Takliflari', icon: DocumentTextIcon },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2"
    >
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-accent/20 via-surface to-background border border-accent/30 shadow-md overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-white text-xs font-extrabold shadow-xs">
              <Crown className="w-3.5 h-3.5" />
              <span>Mizo Premium v3.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-fg">
              Moliyaviy Imkoniyatlaringizni <br className="hidden sm:inline" />
              <span className="text-accent">Maksimal Darajaga Chiqaring</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Jamiyat tajribasi, murakkab foizli boylik simulyatori, 100 ballik salomatlik indeksi va Oʻzbekiston banklarining eng yaxshi kredit takliflari bir joyda.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-fg shadow-2xs">
              ✨ Framer Motion Animatsiyalari
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-fg shadow-2xs">
              📊 Jonli Grafiklar
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigatsiyasi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-surface text-muted border border-border hover:text-fg hover:border-accent/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Kontent maydoni (AnimatePresence bilan almashtirish) */}
      <AnimatePresence mode="wait">
        {activeTab === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* 1. Health Score */}
            <HealthScore />

            <div className="border-t border-border/60 pt-8">
              {/* 2. Wealth Builder */}
              <WealthSimulator />
            </div>

            <div className="border-t border-border/60 pt-8">
              {/* 3. Loan Offers */}
              <LoanOffers />
            </div>

            <div className="border-t border-border/60 pt-8">
              {/* 4. Community Tips */}
              <CommunityTips />
            </div>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <CommunityTips />
          </motion.div>
        )}

        {activeTab === 'wealth' && (
          <motion.div
            key="wealth"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <WealthSimulator />
          </motion.div>
        )}

        {activeTab === 'score' && (
          <motion.div
            key="score"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <HealthScore />
          </motion.div>
        )}

        {activeTab === 'loans' && (
          <motion.div
            key="loans"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <LoanOffers />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

