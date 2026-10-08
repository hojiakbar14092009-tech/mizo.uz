'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowLeft,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { LangToggle } from '@/components/LangToggle'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user?.role !== 'ADMIN') {
            router.push('/dashboard')
            return
          }
        } else {
          router.push('/login')
          return
        }
      } catch {
        // Fallback
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAdminAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    {
      name: 'Statistika',
      href: '/admin',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: 'Foydalanuvchilar',
      href: '/admin/users',
      exact: false,
      icon: Users,
    },
  ]

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-fg">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-fg">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6">
          <Link href="/admin">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                ADMIN
              </span>
            </div>
          </Link>

          {/* Admin ichki menyusi */}
          <nav className="hidden sm:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-muted hover:text-fg hover:bg-border/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-fg border border-border hover:border-accent/40 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboardga qaytish</span>
          </Link>

          <LangToggle />
          <ThemeToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl text-danger hover:bg-danger/10 border border-border transition-colors cursor-pointer"
            aria-label="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobilda navigatsiya paneli */}
      <div className="sm:hidden flex items-center justify-around p-2 bg-surface border-b border-border">
        {navLinks.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                isActive
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted"
        >
          <span>Dashboard</span>
        </Link>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}

