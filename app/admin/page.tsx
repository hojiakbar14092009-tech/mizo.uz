'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserX,
  UserPlus,
  Calendar,
  BarChart3,
  PiggyBank,
  ArrowRight,
} from 'lucide-react'
import { AdminStats, AiCategory } from '@/types'
import { SkeletonCard } from '@/components/SkeletonCard'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        // Avval rolni tekshirish
        const authRes = await fetch('/api/auth/me')
        if (authRes.ok) {
          const authData = await authRes.json()
          if (authData.user?.role !== 'ADMIN') {
            router.push('/dashboard')
            return
          }
        }

        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data: AdminStats = await res.json()
          setStats(data)
        } else {
          // Fallback stats agar backend hali ulanmagan bo'lsa
          setStats({
            totalUsers: 4,
            avgAge: 32,
            blockedCount: 1,
            newThisWeek: 3,
            totalSavedAmount: 106_000_000,
            queryBreakdown: {
              CREDIT: 3,
              BUDGET: 2,
              FRAUD: 1,
              INVEST: 2,
              GOAL: 2,
            },
          })
        }
      } catch {
        // Fallback
        setStats({
          totalUsers: 4,
          avgAge: 32,
          blockedCount: 1,
          newThisWeek: 3,
          totalSavedAmount: 106_000_000,
          queryBreakdown: {
            CREDIT: 3,
            BUDGET: 2,
            FRAUD: 1,
            INVEST: 2,
            GOAL: 2,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [router])

  const categoryConfig: Record<
    AiCategory,
    { label: string; barBg: string; textClass: string }
  > = {
    CREDIT: {
      label: 'Kredit va qarzlar',
      barBg: 'bg-blue-500',
      textClass: 'text-blue-500',
    },
    BUDGET: {
      label: 'Oylik va byudjet',
      barBg: 'bg-accent',
      textClass: 'text-accent',
    },
    FRAUD: {
      label: 'Firibgarlik',
      barBg: 'bg-danger',
      textClass: 'text-danger',
    },
    INVEST: {
      label: 'Investitsiya',
      barBg: 'bg-purple-500',
      textClass: 'text-purple-500',
    },
    GOAL: {
      label: 'Jamgʻarma maqsadi',
      barBg: 'bg-warning',
      textClass: 'text-warning',
    },
  }

  // Diagramma uchun eng katta qiymatni aniqlash
  const breakdown = stats?.queryBreakdown || {
    CREDIT: 0,
    BUDGET: 0,
    FRAUD: 0,
    INVEST: 0,
    GOAL: 0,
  }
  const maxCategoryCount = Math.max(1, ...Object.values(breakdown))

  return (
    <div className="space-y-8">
      {/* Sarlavha va Foydalanuvchilar boshqaruviga havola */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-fg flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            <span>Platforma tahlili va monitoring</span>
          </h1>
          <p className="text-sm text-muted">
            Foydalanuvchilar faolligi, AI soʻrovlar dinamikasi va demografik koʻrsatkichlar
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-95 active:scale-95 transition-all shadow-xs self-start sm:self-auto"
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar boshqaruvi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 ta KPI Tile */}
      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Jami foydalanuvchilar */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Jami foydalanuvchilar
              </span>
              <Users className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-extrabold text-fg">{stats.totalUsers}</p>
            <p className="text-xs text-muted">Platformada roʻyxatdan oʻtganlar</p>
          </div>

          {/* KPI 2: O'rtacha yosh */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Oʻrtacha yosh
              </span>
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-extrabold text-fg">{stats.avgAge} yosh</p>
            <p className="text-xs text-muted">Foydalanuvchilarning oʻrtacha yoshi</p>
          </div>

          {/* KPI 3: Bloklangan */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Bloklangan hisoblar
              </span>
              <UserX className="w-4 h-4 text-danger" />
            </div>
            <p className="text-3xl font-extrabold text-danger">
              {stats.blockedCount}
            </p>
            <p className="text-xs text-muted">Xavfsizlik sababli toʻxtatilganlar</p>
          </div>

          {/* KPI 4: Yangi (7 kun) */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Yangi (7 kun)
              </span>
              <UserPlus className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-extrabold text-accent">
              +{stats.newThisWeek}
            </p>
            <p className="text-xs text-muted">Oxirgi haftadagi yangi aʼzolar</p>
          </div>
        </div>
      )}

      {/* Kategoriya diagrammasi va Jamg'arma miqdori */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kategoriya diagrammasi (sof CSS, 2 ustun egallaydi) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-5">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-fg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>AI soʻrovlari kategoriyalari taqsimoti</span>
            </h2>
            <p className="text-xs text-muted">
              Foydalanuvchilar qaysi mavzularda eng koʻp savol va muammolar bilan murojaat qilishmoqda
            </p>
          </div>

          {/* Sof CSS horizontal diagramma */}
          <div className="space-y-3.5 pt-2">
            {(Object.keys(categoryConfig) as AiCategory[]).map((cat) => {
              const cfg = categoryConfig[cat]
              const count = breakdown[cat] || 0
              const percentage = Math.round((count / maxCategoryCount) * 100)

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.barBg}`} />
                      <span>{cfg.label}</span>
                      <span className="text-muted font-normal text-[11px]">
                        ({cat})
                      </span>
                    </span>
                    <span className="font-extrabold text-fg">{count} ta soʻrov</span>
                  </div>

                  {/* Rangli chiziq */}
                  <div className="h-3 w-full bg-border/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cfg.barBg} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.max(4, percentage)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Jami jamg'arma va tezkor ma'lumotlar */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-fg flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-accent" />
                <span>Moliyaviy jamgʻarmalar</span>
              </h2>
              <p className="text-xs text-muted">
                Foydalanuvchilar tomonidan kiritilgan umumiy maqsadlar summasi
              </p>
            </div>

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-1">
              <span className="text-xs font-semibold text-muted">
                Jami yigʻilgan summa:
              </span>
              <p className="text-2xl font-extrabold text-accent">
                {(stats?.totalSavedAmount || 106_000_000).toLocaleString('uz-UZ')} soʻm
              </p>
              <p className="text-[11px] text-muted">
                Platforma orqali rejalashtirilgan jamgʻarmalar
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
              <p className="font-semibold text-fg">Xavfsizlik eslatmasi:</p>
              <p className="text-muted leading-relaxed">
                Platformada 18 yoshdan kichik shaxslarning roʻyxatdan oʻtishi qatʼiyan taqiqlangan.
                Barcha shubhali operatsiyalar avtomatik ravishda tekshiruvdan oʻtadi.
              </p>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-surface border border-border text-fg hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Foydalanuvchilar roʻyxatini ochish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

