'use client'

import React from 'react'

interface PasswordStrengthBarProps {
  password?: string
}

export function PasswordStrengthBar({ password = '' }: PasswordStrengthBarProps) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', width: 'w-0', bg: 'bg-border', text: 'text-muted' }
    
    const hasMinLen = pwd.length >= 8
    const hasLower = /[a-z]/.test(pwd)
    const hasUpper = /[A-Z]/.test(pwd)

    if (!hasMinLen) {
      return {
        score: 1,
        label: 'Kuchsiz (kamida 8 belgi)',
        width: 'w-1/3',
        bg: 'bg-danger',
        text: 'text-danger',
      }
    }

    if (hasMinLen && hasLower && hasUpper) {
      return {
        score: 3,
        label: 'Kuchli parol',
        width: 'w-full',
        bg: 'bg-accent',
        text: 'text-accent',
      }
    }

    return {
      score: 2,
      label: "O'rtacha (katta va kichik harflar qo'shing)",
      width: 'w-2/3',
      bg: 'bg-warning',
      text: 'text-warning',
    }
  }

  const { label, width, bg, text } = getStrength(password)

  if (!password) return null

  return (
    <div className="w-full space-y-1.5 mt-1.5">
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${width} ${bg} transition-all duration-300 ease-out rounded-full`}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={`font-medium ${text} transition-colors duration-200`}>
          {label}
        </span>
        <span className="text-muted text-[11px]">
          {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password)
            ? '✓ Qoidalarga mos'
            : '8+ belgi, Aa'}
        </span>
      </div>
    </div>
  )
}
export default PasswordStrengthBar
