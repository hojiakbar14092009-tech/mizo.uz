import React, { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { LangToggle } from '@/components/LangToggle'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-12 bg-background text-fg">
      {/* Chap ustun: Brending va gradient paneli (desktop) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-5 relative flex-col justify-between p-10 lg:p-12 border-r border-border bg-gradient-to-br from-accent/15 via-surface to-background overflow-hidden">
        {/* Dekorativ orqa fon doiralari */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Ustki qism: Logo */}
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        {/* O'rta qism: Shior va pufakchalar */}
        <div className="relative z-10 space-y-8 my-auto">
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg leading-tight">
              Aqlli moliya — <br />
              <span className="text-accent">erkin kelajak</span>
            </h1>
            <p className="text-sm lg:text-base text-muted max-w-sm">
              Shaxsiy byudjet, kredit tahlili, jamgʻarma maqsadlari va firibgarlardan himoya qiluvchi zamonaviy milliy platforma.
            </p>
          </div>

          {/* 3 ta pill */}
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border shadow-xs text-fg">
              <span>⚖️</span> Muvozanatli moliya
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border shadow-xs text-fg">
              <span>🔒</span> Xavfsiz
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border shadow-xs text-fg">
              <span>🤖</span> AI yordamchi
            </span>
          </div>
        </div>

        {/* Pastki qism: Mualliflik huquqi */}
        <div className="relative z-10 text-xs text-muted flex items-center justify-between">
          <span>© {new Date().getFullYear()} Mizo. Barcha huquqlar himoyalangan.</span>
        </div>
      </div>

      {/* O'ng ustun: Forma joylashadigan slot */}
      <div className="flex-1 md:col-span-7 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Yuqori o'ng paneldagi sozlamalar (Til va Tema) */}
        <div className="w-full flex justify-between md:justify-end items-center gap-2 mb-6">
          <div className="md:hidden">
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Forma qismi */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {children}
        </div>

        {/* Mobilda pastki qism */}
        <div className="md:hidden text-center text-xs text-muted mt-8">
          © {new Date().getFullYear()} Mizo · Aqlli moliya
        </div>
      </div>
    </div>
  )
}

