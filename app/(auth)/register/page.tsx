'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  EnvelopeIcon,
  IdentificationIcon,
  LockClosedIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { InputField } from '@/components/InputField'
import { PasswordStrengthBar } from '@/components/PasswordStrengthBar'

type AuthMethod = 'email' | 'pnfl'

export default function RegisterPage() {
  const router = useRouter()
  const tAuth = useTranslations('auth')
  const tErr = useTranslations('errors')
  const [isPending, startTransition] = useTransition()

  // Bosqichlar: 1 = Metod tanlash, 2 = Forma to'ldirish
  const [step, setStep] = useState<1 | 2>(1)
  const [method, setMethod] = useState<AuthMethod>('email')

  // Form maydonlari
  const [email, setEmail] = useState('')
  const [pnfl, setPnfl] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Xatolar holati
  const [ageRestrictionError, setAgeRestrictionError] = useState(false)
  const [toastError, setToastError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const showToast = (msg: string) => {
    setToastError(msg)
    setTimeout(() => setToastError(null), 4000)
  }

  const calculateAgeFromDate = (dateStr: string): number | null => {
    if (!dateStr) return null
    const birth = new Date(dateStr)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Backend qoidasi bo'yicha JShShIR parsing:
  // 1-raqam: 1 yoki 2 -> 1900-yillar, 3 yoki 4 -> 2000-yillar
  // 2-3 raqamlar: kun, 4-5 raqamlar: oy, 6-7 raqamlar: yil
  const parsePnfl = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 14)
    if (clean.length < 14) return null

    const d1 = Number(clean[0])
    if (d1 < 1 || d1 > 4) return null

    const century = d1 <= 2 ? 1900 : 2000
    const day = Number(clean.slice(1, 3))
    const month = Number(clean.slice(3, 5)) - 1
    const year = century + Number(clean.slice(5, 7))

    const birth = new Date(year, month, day)
    if (birth.getFullYear() !== year || birth.getMonth() !== month || birth.getDate() !== day) {
      return null
    }
    if (birth > new Date()) return null

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    const dayStr = String(day).padStart(2, '0')
    const monthStr = String(month + 1).padStart(2, '0')

    return {
      formattedDate: `${dayStr}.${monthStr}.${year}`,
      isoDate: `${year}-${monthStr}-${dayStr}`,
      age,
    }
  }

  const pnflInfo = method === 'pnfl' && pnfl.length === 14 ? parsePnfl(pnfl) : null
  const emailAge = method === 'email' && birthDate ? calculateAgeFromDate(birthDate) : null

  const handlePnflChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 14)
    setPnfl(raw)
  }

  const formattedPnflDisplay = pnfl.length > 7 ? `${pnfl.slice(0, 7)} ${pnfl.slice(7)}` : pnfl
  const todayStr = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAgeRestrictionError(false)
    setFieldErrors({})

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: tErr('WEAK_PASSWORD') }))
      return
    }

    if (password.length < 8) {
      setFieldErrors((prev) => ({ ...prev, password: tErr('WEAK_PASSWORD') }))
      return
    }

    let resolvedBirthDate = birthDate
    if (method === 'pnfl') {
      if (pnfl.length !== 14 || !pnflInfo) {
        showToast(tErr('PNFL_INVALID'))
        return
      }
      resolvedBirthDate = pnflInfo.isoDate
      if (pnflInfo.age < 18) {
        setAgeRestrictionError(true)
        return
      }
    } else {
      if (emailAge !== null && emailAge < 18) {
        setAgeRestrictionError(true)
        return
      }
    }

    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          method,
          password,
          confirmPassword,
        }

        if (method === 'email') {
          payload.email = email
          payload.birthDate = resolvedBirthDate
        } else {
          payload.pnfl = pnfl
          payload.birthDate = resolvedBirthDate
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          if (data.error?.code === 'AGE_RESTRICTION') {
            setAgeRestrictionError(true)
          } else if (data.error?.code === 'DUPLICATE_USER') {
            showToast(tErr('DUPLICATE_USER'))
          } else if (data.error?.code === 'WEAK_PASSWORD') {
            showToast(tErr('WEAK_PASSWORD'))
          } else if (data.error?.code === 'PNFL_INVALID') {
            showToast(tErr('PNFL_INVALID'))
          } else {
            showToast(data.error?.message || tErr('VALIDATION'))
          }
          return
        }

        router.push('/dashboard')
        router.refresh()
      } catch {
        showToast(tErr('VALIDATION'))
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
          {tAuth('register')}
        </h2>
        <p className="text-xs sm:text-sm text-muted">
          Mizo moliyaviy platformasida shaxsiy hisobingizni oching
        </p>
      </div>

      {/* AGE_RESTRICTION xatosi: Katta amber karta */}
      {ageRestrictionError && (
        <div className="p-5 rounded-2xl border border-warning/40 bg-warning/15 text-fg space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <ShieldExclamationIcon className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-warning text-sm">18+</h4>
              <p className="text-xs text-fg leading-relaxed">
                {tErr('AGE_RESTRICTION')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAgeRestrictionError(false)}
            className="text-xs font-semibold text-warning underline hover:text-fg transition-colors"
          >
            Yopish
          </button>
        </div>
      )}

      {/* BOSQICH 1: Metod tanlash */}
      {step === 1 ? (
        <div className="space-y-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">
            Roʻyxatdan oʻtish usuli:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setMethod('email')
                setStep(2)
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-surface hover:border-accent hover:shadow-lg transition-all duration-200 text-center group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-3">
                <EnvelopeIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-fg text-sm">{tAuth('email')}</span>
              <span className="text-[11px] text-muted mt-1">Pochta va tugʻilgan sana</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('pnfl')
                setStep(2)
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-surface hover:border-accent hover:shadow-lg transition-all duration-200 text-center group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-3">
                <IdentificationIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-fg text-sm">JShShIR</span>
              <span className="text-[11px] text-muted mt-1">14 raqamli pasport kodi</span>
            </button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs sm:text-sm text-muted">
              Hisobingiz bormi?{' '}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                {tAuth('login')}
              </Link>
            </p>
          </div>
        </div>
      ) : (
        /* BOSQICH 2: Forma to'ldirish */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setAgeRestrictionError(false)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Usulni oʻzgartirish</span>
            </button>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
              {method === 'email' ? 'Email' : 'JShShIR'}
            </span>
          </div>

          {method === 'email' && (
            <>
              <InputField
                label={tAuth('email')}
                name="email"
                type="email"
                required
                placeholder="misol@mizo.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<EnvelopeIcon className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <InputField
                  label={tAuth('birthDate')}
                  name="birthDate"
                  type="date"
                  required
                  max={todayStr}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  icon={<CalendarIcon className="w-4 h-4" />}
                />
                {emailAge !== null && (
                  <div className="text-xs font-medium px-1 flex items-center justify-between">
                    <span>
                      Yosh:{' '}
                      <strong className={emailAge >= 18 ? 'text-accent' : 'text-danger'}>
                        {emailAge} yil
                      </strong>
                    </span>
                    {emailAge < 18 ? (
                      <span className="text-danger font-semibold">18 yoshdan kichik!</span>
                    ) : (
                      <span className="text-accent font-semibold">✓ 18+</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {method === 'pnfl' && (
            <div className="space-y-2">
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
                helperText="1-raqam: 1-2 (1900-yillar), 3-4 (2000-yillar)"
              />

              {pnflInfo && (
                <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between text-muted">
                    <span>{tAuth('birthDate')}:</span>
                    <strong className="text-fg">{pnflInfo.formattedDate}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Yosh:</span>
                    <strong className={pnflInfo.age >= 18 ? 'text-accent' : 'text-danger'}>
                      {pnflInfo.age} yil {pnflInfo.age >= 18 ? '✓' : '(18 yoshdan kichik)'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <InputField
            label={tAuth('password')}
            name="password"
            type="password"
            required
            placeholder="Kamida 8 belgi, 1 ta katta harf"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            icon={<LockClosedIcon className="w-4 h-4" />}
          />
          <PasswordStrengthBar password={password} />

          <InputField
            label={tAuth('confirmPassword')}
            name="confirmPassword"
            type="password"
            required
            placeholder="Parolni qayta kiriting"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            icon={<LockClosedIcon className="w-4 h-4" />}
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-accent hover:opacity-95 active:scale-95 transition-all duration-100 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlusIcon className="w-4 h-4" />
                <span>{tAuth('register')}</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-xs sm:text-sm text-muted">
              Hisobingiz bormi?{' '}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                {tAuth('login')}
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
