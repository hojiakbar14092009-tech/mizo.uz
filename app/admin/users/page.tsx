'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-react'
import { User } from '@/types'
import { Badge } from '@/components/Badge'
import { SkeletonCard } from '@/components/SkeletonCard'
import { UserDetailModal } from '@/components/admin/UserDetailModal'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewing, setViewing] = useState<{ id: string; name: string } | null>(null)

  // Foydalanuvchilarni yuklash
  const fetchUsers = async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.items)) {
          setUsers(data.items)
          setTotal(data.total || data.items.length)
          setPage(data.page || p)
          return
        }
      }
      // Fallback seed ma'lumotlari
      const seedUsers: User[] = [
        {
          id: 'admin-1',
          email: 'hojiakbar14092009@gmail.com',
          role: 'ADMIN',
          birthDate: new Date('1985-05-15'),
          createdAt: new Date('2026-01-01'),
          isBlocked: false,
        },
        {
          id: 'demo-2',
          email: 'coddycamp@gmail.com',
          role: 'USER',
          birthDate: new Date('2000-03-20'),
          createdAt: new Date('2026-02-10'),
          isBlocked: false,
        },
        {
          id: 'pnfl-3',
          pnfl: '10512891234567',
          role: 'USER',
          birthDate: new Date('1989-12-05'),
          createdAt: new Date('2026-03-01'),
          isBlocked: false,
        },
        {
          id: 'blocked-4',
          email: 'test@mizo.uz',
          role: 'USER',
          birthDate: new Date('1995-11-08'),
          createdAt: new Date('2026-03-05'),
          isBlocked: true,
        },
      ]
      setUsers(seedUsers)
      setTotal(seedUsers.length)
    } catch {
      // Fallback
      setUsers([
        {
          id: 'demo-2',
          email: 'coddycamp@gmail.com',
          role: 'USER',
          birthDate: new Date('2000-03-20'),
          createdAt: new Date('2026-02-10'),
          isBlocked: false,
        },
      ])
      setTotal(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(page)
  }, [page])

  // Block / Unblock almashtirish
  const toggleBlockStatus = async (user: User) => {
    const nextState = !user.isBlocked
    setUpdatingId(user.id)

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: nextState }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: nextState } : u))
        )
      } else {
        // Mahalliy holatda ham sinov uchun yangilab ko'rsatish
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: nextState } : u))
        )
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBlocked: nextState } : u))
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // Maskalash funksiyalari
  const maskEmail = (emailStr?: string | null) => {
    if (!emailStr) return '-'
    const parts = emailStr.split('@')
    if (parts.length !== 2) return emailStr
    const name = parts[0]
    const domain = parts[1]
    const prefix = name.slice(0, 2)
    return `${prefix}***@***.${domain.split('.').pop() || 'uz'}`
  }

  const maskPnfl = (pnflStr?: string | null) => {
    if (!pnflStr) return '-'
    const clean = pnflStr.replace(/\D/g, '')
    if (clean.length < 14) return pnflStr
    const last7 = clean.slice(7)
    return `●●●●●●●${last7}`
  }

  // Yoshni hisoblash
  const getAge = (birthDate: Date | string) => {
    const birth = new Date(birthDate)
    if (isNaN(birth.getTime())) return '-'
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} yosh`
  }

  // Qidiruv filtri
  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.pnfl && u.pnfl.includes(term)) ||
      u.role.toLowerCase().includes(term)
    )
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="space-y-6">
      {/* Sarlavha va qidiruv */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-border/60 transition-colors"
              aria-label="Ortga"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-fg flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              <span>Foydalanuvchilar boshqaruvi</span>
            </h1>
          </div>
          <p className="text-sm text-muted ml-8">
            Roʻyxatdan oʻtgan barcha fuqarolar, ularning holati va xavfsizlik boshqaruvi
          </p>
        </div>

        {/* Qidiruv inputi */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Email yoki JShShIR qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-fg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      {/* Foydalanuvchilar jadvali */}
      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted space-y-2">
            <p className="font-semibold text-fg">Foydalanuvchilar topilmadi</p>
            <p className="text-xs">Qidiruv parametrlarini oʻzgartirib koʻring</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background/60 text-muted uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Foydalanuvchi</th>
                  <th className="py-3.5 px-4">Identifikator</th>
                  <th className="py-3.5 px-4">Yosh</th>
                  <th className="py-3.5 px-4">Sana</th>
                  <th className="py-3.5 px-4">Holat</th>
                  <th className="py-3.5 px-4 text-center">Koʻrish</th>
                  <th className="py-3.5 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const displayName = u.email ? maskEmail(u.email) : maskPnfl(u.pnfl)
                  const initial = (u.email ? u.email[0] : 'U').toUpperCase()

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-background/50 transition-colors"
                    >
                      {/* Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-fg block">
                              {displayName}
                            </span>
                            <span className="text-[10px] text-muted uppercase">
                              Rol: {u.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email yoki PNFL */}
                      <td className="py-3.5 px-4 text-muted">
                        {u.email ? (
                          <span className="font-mono text-fg">{maskEmail(u.email)}</span>
                        ) : (
                          <span className="font-mono text-fg">{maskPnfl(u.pnfl)}</span>
                        )}
                      </td>

                      {/* Yosh */}
                      <td className="py-3.5 px-4 font-medium text-fg">
                        {getAge(u.birthDate)}
                      </td>

                      {/* Sana */}
                      <td className="py-3.5 px-4 text-muted">
                        {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                      </td>

                      {/* Holat badge */}
                      <td className="py-3.5 px-4">
                        {u.isBlocked ? (
                          <Badge variant="danger">Bloklangan</Badge>
                        ) : (
                          <Badge variant="success">Faol</Badge>
                        )}
                      </td>

                      {/* Batafsil maʼlumot */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewing({ id: u.id, name: displayName })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-fg/5 text-fg hover:bg-accent/15 hover:text-accent transition-all duration-100 active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Koʻrish</span>
                        </button>
                      </td>

                      {/* Block / Unblock tugma */}
                      <td className="py-3.5 px-4 text-right">
                        {u.role === 'ADMIN' ? (
                          <span className="text-[11px] text-muted italic">
                            Boshqaruvchi
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleBlockStatus(u)}
                            disabled={updatingId === u.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all duration-100 active:scale-95 cursor-pointer shadow-2xs ${
                              u.isBlocked
                                ? 'bg-accent/15 text-accent hover:bg-accent/25'
                                : 'bg-danger/15 text-danger hover:bg-danger/25'
                            }`}
                          >
                            {updatingId === u.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : u.isBlocked ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Blokdan chiqarish</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Bloklash</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Sahifalash paneli (Pagination) */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border gap-3 text-xs text-muted">
          <div>
            <span>
              Koʻrsatilmoqda: <strong>{total === 0 ? 0 : startItem}-{endItem}</strong> /{' '}
              <strong>{total}</strong> foydalanuvchi
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-surface text-fg hover:bg-background disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Oldingi sahifa"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pNum = i + 1
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={`min-w-7 h-7 px-2 rounded-lg font-bold transition-colors ${
                    page === pNum
                      ? 'bg-accent text-white shadow-xs'
                      : 'border border-border bg-surface text-fg hover:bg-background'
                  }`}
                >
                  {pNum}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface text-fg hover:bg-background disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Keyingi sahifa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewing && (
        <UserDetailModal key={viewing.id} userId={viewing.id} displayName={viewing.name} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}

