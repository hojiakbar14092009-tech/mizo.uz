'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  EnvelopeIcon,
  IdentificationIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { InputField } from '@/components/InputField'

type AuthMethod = 'email' | 'pnfl'

export default function LoginPage() {
  const router = useRouter()
  const tAuth = useTranslations('auth')
  const tErr = useTranslations('errors')
  const [isPending, startTransition] = useTransition()

  const [method, setMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [pnfl, setPnfl] = useState('')
  const [password, setPassword] = useState('')

  const [toastError, setToastError] = useState<string | null>(null)
  const [blockedAlert, setBlockedAlert] = useState(false)

  const showToast = (msg: string) => {
    setToastError(msg)
    setTimeout(() => setToastError(null), 4000)
  }

  const handlePnflChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 14)
    setPnfl(raw)
  }

  const formattedPnflDisplay = pnfl.length > 7 ? `${pnfl.slice(0, 7)} ${pnfl.slice(7)}` : pnfl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setToastError(null)
    setBlockedAlert(false)

    startTransition(async () => {
      try {
        const payload: Record<string, string> = {
          method,
          password,
        }

        if (method === 'email') {
          payload.email = email
        } else {
          payload.pnfl = pnfl
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          if (data.error?.code === 'ACCOUNT_BLOCKED') {
            setBlockedAlert(true)
          } else if (data.error?.code === 'INVALID_CREDENTIALS') {
            showToast(tErr('INVALID_CREDENTIALS'))
          } else {
            showToast(data.error?.message || tErr('INVALID_CREDENTIALS'))
          }
          return
        }

        if (data.user?.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      } catch {
        showToast(tErr('INVALID_CREDENTIALS'))
      }
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Toast Alert */}
      {toastError && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-danger text-white shadow-xl animate-in slide-in-from-top duration-200">
          <ShieldExclamationIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastError}</span>
        </div>
      )}

      {/* Sarlavha */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
          {tAuth('login')}
        </h2>
        <p className="text-xs sm:text-sm text-muted">
          Hisobingizga kirish uchun maʼlumotlaringizni kiriting
        </p>
      </div>

      {/* Bloklangan hisob ogohlantirishi */}
      {blockedAlert && (
        <div className="p-4 rounded-2xl border border-danger/40 bg-danger/10 text-danger space-y-1 animate-in zoom-in-95">
          <h4 className="font-bold text-sm">{tErr('ACCOUNT_BLOCKED')}</h4>
          <p className="text-xs text-fg leading-relaxed">
            Hisobingiz maʼmuriyat tomonidan toʻxtatilgan. Qoʻllab-quvvatlash xizmati bilan bogʻlaning.
          </p>
        </div>
      )}

      {/* Metod toggle: Email | JShShIR */}
      <div className="flex p-1 rounded-xl bg-surface border border-border">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            method === 'email' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-fg'
          }`}
        >
          <EnvelopeIcon className="w-4 h-4" />
          <span>{tAuth('email')}</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('pnfl')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            method === 'pnfl' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-fg'
          }`}
        >
          <IdentificationIcon className="w-4 h-4" />
          <span>JShShIR</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {method === 'email' ? (
          <InputField
            label={tAuth('email')}
            name="email"
            type="email"
            required
            placeholder="email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<EnvelopeIcon className="w-4 h-4" />}
          />
        ) : (
          <InputField
            label={tAuth('pnfl')}
            name="pnfl"
            type="text"
            required
            maxLength={15}
            placeholder="1051289 1234567"
            value={formattedPnflDisplay}
            onChange={handlePnflChange}
            icon={<IdentificationIcon className="w-4 h-4" />}
          />
        )}

        <InputField
          label={tAuth('password')}
          name="password"
          type="password"
          required
          placeholder="Parolingizni kiriting"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockClosedIcon className="w-4 h-4" />}
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl font-bold text-white bg-accent hover:opacity-95 active:scale-95 transition-all duration-100 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>{tAuth('login')}</span>
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <p className="text-xs sm:text-sm text-muted">
            Hisobingiz yoʻqmi?{' '}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              {tAuth('register')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
