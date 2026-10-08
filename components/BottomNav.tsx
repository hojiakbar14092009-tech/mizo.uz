'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  CalculatorIcon,
  BanknotesIcon,
  ChartBarIcon,
  EllipsisHorizontalIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  BellAlertIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface BottomNavProps {
  reminderBadgeCount?: number
}

export function BottomNav({ reminderBadgeCount = 0 }: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Asosiy 4 ta tab + "Ko'proq" tugmasi
  const mainTabs = [
    {
      name: t('ai'),
      href: '/dashboard',
      icon: SparklesIcon,
      exact: true,
      badge: null,
    },
    {
      name: t('kredit'),
      href: '/dashboard/kredit',
      icon: CalculatorIcon,
      exact: false,
      badge: null,
    },
    {
      name: t('tejash'),
      href: '/dashboard/tejash',
      icon: BanknotesIcon,
      exact: false,
      badge: null,
    },
    {
      name: t('health'),
      href: '/dashboard/salomatlik',
      icon: ChartBarIcon,
      exact: false,
      badge: null,
    },
  ]

  // "Ko'proq" sheet ichidagi qo'shimcha bo'limlar
  const sheetTabs = [
    {
      name: t('wealth'),
      href: '/dashboard/boylik',
      icon: ArrowTrendingUpIcon,
      desc: 'Murakkab foiz va kapital oʻsishi',
    },
    {
      name: t('loans'),
      href: '/dashboard/kreditlar',
      icon: BuildingLibraryIcon,
      desc: 'Banklarning eng yaxshi stavkalari',
    },
    {
      name: t('community'),
      href: '/dashboard/hamjamiyat',
      icon: UserGroupIcon,
      desc: 'Haqiqiy foydalanuvchilar tajribasi',
    },
    {
      name: t('eslatma'),
      href: '/dashboard/eslatma',
      icon: BellAlertIcon,
      desc: 'Toʻlovlar jadvali va SMS xabarnoma',
      badge: reminderBadgeCount > 0 ? reminderBadgeCount : null,
    },
    {
      name: t('firib'),
      href: '/dashboard/firib',
      icon: ShieldExclamationIcon,
      desc: 'Shubhali xabarlar tahlili',
    },
  ]

  const isMoreActive = sheetTabs.some((tab) => pathname.startsWith(tab.href))

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1.5 pb-safe shadow-lg">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
                  isActive ? 'text-accent font-bold' : 'text-muted hover:text-fg font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 stroke-[2]" />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                    />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
                  {tab.name}
                </span>
              </Link>
            )
          })}

          {/* "Ko'proq" tugmasi */}
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
              isMoreActive ? 'text-accent font-bold' : 'text-muted hover:text-fg font-medium'
            }`}
          >
            <div className="relative">
              <EllipsisHorizontalIcon className="w-5 h-5 stroke-[2]" />
              {reminderBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Koʻproq</span>
          </button>
        </div>
      </nav>

      {/* Pastdan chiqadigan Sheet modal */}
      <AnimatePresence>
        {isSheetOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full bg-surface border-t border-border rounded-t-3xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-bold text-fg">Barcha boʻlimlar</span>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-fg hover:bg-border/60"
                  aria-label="Yopish"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-3">
                {sheetTabs.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-98 ${
                        isActive
                          ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                          : 'bg-background border-border text-fg hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-accent text-white' : 'bg-surface border border-border text-muted'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{item.name}</p>
                          <p className="text-[10px] text-muted">{item.desc}</p>
                        </div>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-danger text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
export default BottomNav
