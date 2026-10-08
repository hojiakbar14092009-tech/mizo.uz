'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CpuChipIcon,
  CalculatorIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  BellAlertIcon,
  ShieldExclamationIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/Logo'
import { LangToggle } from '@/components/LangToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'

interface UserData {
  id: string
  email?: string | null
  pnfl?: string | null
  role: 'USER' | 'ADMIN'
  birthDate?: string | Date
}

interface DueReminder {
  id: string
  name: string
  amount: number
  dayOfMonth: number
  daysLeft: number
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const tNav = useTranslations('nav')
  const tApp = useTranslations('app')
  const tAuth = useTranslations('auth')

  const [user, setUser] = useState<UserData | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [dueReminders, setDueReminders] = useState<DueReminder[]>([])
  const [dismissDueBanner, setDismissDueBanner] = useState(false)

  // Foydalanuvchi ma'lumotlari va muddati kelgan eslatmalar
  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) setUser(data.user)
        }
      } catch {
        // ignore
      }
    }

    async function loadDueReminders() {
      try {
        const res = await fetch('/api/user/reminders/due')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setDueReminders(data)
          }
        }
      } catch {
        // ignore
      }
    }

    loadUserData()
    loadDueReminders()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    {
      name: tNav('ai'),
      href: '/dashboard',
      icon: CpuChipIcon,
      exact: true,
      badge: null,
    },
    {
      name: tNav('kredit'),
      href: '/dashboard/kredit',
      icon: CalculatorIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('tejash'),
      href: '/dashboard/tejash',
      icon: BanknotesIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('health'),
      href: '/dashboard/salomatlik',
      icon: ChartBarIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('wealth'),
      href: '/dashboard/boylik',
      icon: ArrowTrendingUpIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('loans'),
      href: '/dashboard/kreditlar',
      icon: BuildingLibraryIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('community'),
      href: '/dashboard/hamjamiyat',
      icon: UserGroupIcon,
      exact: false,
      badge: null,
    },
    {
      name: tNav('eslatma'),
      href: '/dashboard/eslatma',
      icon: BellAlertIcon,
      exact: false,
      badge: dueReminders.length > 0 ? dueReminders.length : null,
    },
    {
      name: tNav('firib'),
      href: '/dashboard/firib',
      icon: ShieldExclamationIcon,
      exact: false,
      badge: null,
    },
  ]

  const userDisplayName =
    user?.email ||
    (user?.pnfl ? `JShShIR: ${user.pnfl.slice(0, 4)}...${user.pnfl.slice(-4)}` : tAuth('welcomeBack'))

  return (
    <div className="min-h-screen flex bg-background text-fg relative">
      {/* Aurora gradient dog'lar va nozik grid foni */}
      <AuroraBackground />

      {/* Chap yon panel — Desktop 230px */}
      <aside className="hidden md:flex flex-col w-[230px] border-r border-border bg-surface/90 backdrop-blur-md p-4 flex-shrink-0 justify-between select-none fixed top-0 bottom-0 left-0 z-30 shadow-xs">
        <div className="space-y-5">
          {/* Logo */}
          <div className="px-2 pt-1">
            <Link href="/dashboard">
              <Logo size="md" />
            </Link>
          </div>

          {/* Navigatsiya ro'yxati (layoutId bilan faol belgi siljishi) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors duration-150 group ${
                    isActive ? 'text-white font-bold' : 'text-muted hover:text-fg'
                  }`}
                >
                  {/* layoutId bilan silliq siljuvchi fon */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-accent rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`relative z-10 min-w-4 h-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                        isActive ? 'bg-white text-accent' : 'bg-danger text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Admin panel havolasi (agar ADMIN bo'lsa) */}
          {user?.role === 'ADMIN' && (
            <div className="pt-2 border-t border-border">
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-warning hover:bg-warning/10 transition-colors"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Admin boshqaruvi</span>
              </Link>
            </div>
          )}
        </div>

        {/* Shior */}
        <div className="p-3 rounded-xl bg-background/80 border border-border text-[11px] text-muted text-center">
          <p className="font-semibold text-fg">{tApp('name')}</p>
          <p className="mt-0.5 text-[10px]">{tApp('tagline')}</p>
        </div>
      </aside>

      {/* Asosiy kontent maydoni */}
      <div className="flex-1 md:ml-[230px] flex flex-col min-h-screen relative z-10">
        {/* Yuqori Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 bg-surface/90 backdrop-blur-md border-b border-border shadow-2xs">
          {/* Mobilda Logo */}
          <div className="md:hidden">
            <Link href="/dashboard">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-fg tracking-tight">
              {navItems.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.name ||
                tApp('name')}
            </h2>
          </div>

          {/* O'ng paneldagi boshqaruvlar */}
          <div className="flex items-center gap-2.5">
            <LangToggle />
            <ThemeToggle />

            {/* Foydalanuvchi menyusi */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-border bg-surface hover:border-accent/40 text-xs font-semibold text-fg transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold text-xs">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-xs">
                  {userDisplayName}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-muted" />
              </button>

              {/* Dropdown oynasi */}
              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface border border-border shadow-xl z-30 py-2 text-xs divide-y divide-border animate-in zoom-in-95">
                    <div className="px-4 py-2 space-y-0.5">
                      <p className="font-semibold text-fg truncate">{userDisplayName}</p>
                      <p className="text-[10px] text-muted">
                        Rol: <strong className="text-accent">{user?.role || 'USER'}</strong>
                      </p>
                    </div>

                    <div className="py-1">
                      {user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-warning hover:bg-warning/10 font-medium transition-colors"
                        >
                          <ShieldCheckIcon className="w-4 h-4" />
                          <span>Admin panel</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger/10 font-medium transition-colors cursor-pointer"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>{tAuth('logout')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Muddati kelgan eslatmalar banneri (GET /api/user/reminders/due) */}
        {!dismissDueBanner && dueReminders.length > 0 && (
          <div className="mx-4 sm:mx-8 mt-4 p-3.5 rounded-2xl bg-warning/15 border border-warning/40 text-fg shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-warning">
                  Toʻlov muddati yaqinlashmoqda ({dueReminders.length} ta eslatma):
                </p>
                <p className="text-muted mt-0.5">
                  {dueReminders.map((r) => `${r.name} (${r.daysLeft <= 0 ? 'Bugun' : `${r.daysLeft} kun qoldi`})`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/eslatma"
                className="px-3 py-1 rounded-xl bg-warning text-zinc-950 font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Koʻrish
              </Link>
              <button
                type="button"
                onClick={() => setDismissDueBanner(true)}
                className="p-1 rounded-lg text-muted hover:text-fg hover:bg-warning/20"
                aria-label="Yopish"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sahifa ichki kontenti */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobil uchun pastki navigatsiya */}
        <BottomNav reminderBadgeCount={dueReminders.length} />
      </div>
    </div>
  )
}
