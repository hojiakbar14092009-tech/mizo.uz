import Link from 'next/link'
import type { CSSProperties, ComponentType, SVGProps } from 'react'
import { getTranslations } from 'next-intl/server'
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BellAlertIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CreditCardIcon,
  HeartIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/Logo'
import { LangToggle } from '@/components/LangToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Backdrop } from '@/components/landing/Backdrop'
import { Reveal } from '@/components/landing/Reveal'
import { FaqAccordion } from '@/components/landing/FaqAccordion'
import { CopyField } from '@/components/landing/CopyField'
import './landing.css'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const FEATURES: { href: string; Icon: Icon }[] = [
  { href: '/dashboard', Icon: ChatBubbleLeftRightIcon },
  { href: '/dashboard/kredit', Icon: CreditCardIcon },
  { href: '/dashboard/tejash', Icon: BanknotesIcon },
  { href: '/dashboard/eslatma', Icon: BellAlertIcon },
  { href: '/dashboard/firib', Icon: ShieldExclamationIcon },
  { href: '/dashboard/boylik', Icon: ArrowTrendingUpIcon },
  { href: '/dashboard/kreditlar', Icon: BuildingLibraryIcon },
  { href: '/dashboard/salomatlik', Icon: HeartIcon },
  { href: '/dashboard/hamjamiyat', Icon: UserGroupIcon },
]

const PROBLEM_ICONS: Icon[] = [CreditCardIcon, BanknotesIcon, ShieldExclamationIcon, BuildingLibraryIcon]

// Seeded demo data (prisma/seed.ts): health history and the three demo debts.
const HEALTH_HISTORY = [41, 46, 52, 55, 61, 64]
const DEBT_RATES = [45, 30, 22]

const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties

function sparkline(values: number[], w: number, h: number) {
  const min = Math.min(...values) - 4
  const max = Math.max(...values) + 2
  return values
    .map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min)) * h).toFixed(1)}`)
    .join(' ')
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <Reveal className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-fg sm:text-[2.6rem] sm:leading-[1.1]">{title}</h2>
      {lead && <p className="text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </Reveal>
  )
}

export default async function Home() {
  const t = await getTranslations('landing')
  const trust = t.raw('hero.trust') as string[]
  const debtNames = t.raw('hero.debts') as string[]
  const problems = t.raw('problems.items') as { problem: string; solution: string; tool: string }[]
  const qa = t.raw('qa.items') as { q: string; a: string }[]
  const features = t.raw('features.items') as { title: string; desc: string }[]
  const titleA = t('hero.titleA').split(' ')
  const titleB = t('hero.titleB').split(' ')

  return (
    <div className="mz-landing relative min-h-screen w-full overflow-x-clip bg-background text-fg">
      <Backdrop />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Mizo" className="rounded-xl focus-visible:outline-2 focus-visible:outline-accent">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted lg:flex">
            <a href="#muammolar" className="transition-colors hover:text-fg">{t('nav.problems')}</a>
            <a href="#savol-javob" className="transition-colors hover:text-fg">{t('nav.qa')}</a>
            <a href="#imkoniyatlar" className="transition-colors hover:text-fg">{t('nav.features')}</a>
            <a href="#demo" className="transition-colors hover:text-fg">{t('nav.demo')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-fg transition-colors hover:text-accent sm:inline-flex">
              {t('nav.login')}
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[var(--mz-on-accent)] shadow-[0_8px_24px_-12px_var(--mz-accent)] transition-transform hover:-translate-y-px"
            >
              {t('nav.start')}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:pb-28 lg:pt-24">
          <div className="min-w-0">
            <p
              className="mz-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur-sm"
              style={delay(0.1)}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mz-gold)]" />
              {t('hero.eyebrow')}
            </p>

            <h1 className="mt-6 text-[clamp(2.6rem,6.2vw,4.6rem)] font-black leading-[1.02] tracking-[-0.04em]">
              {titleA.map((w, i) => (
                <span key={`a${i}`} className="mz-word mr-[0.24em]">
                  <span style={delay(0.25 + i * 0.09)}>{w}</span>
                </span>
              ))}
              <br />
              {titleB.map((w, i) => (
                <span key={`b${i}`} className="mz-word mr-[0.24em]">
                  <span className="text-accent" style={delay(0.25 + (titleA.length + i) * 0.09)}>
                    {w}
                  </span>
                </span>
              ))}
            </h1>

            <p className="mz-rise mt-6 max-w-[58ch] text-lg leading-relaxed text-muted" style={delay(0.85)}>
              {t('hero.lead')}
            </p>

            <div className="mz-rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(1)}>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-[var(--mz-on-accent)] shadow-[0_14px_32px_-14px_var(--mz-accent)] transition-transform hover:-translate-y-0.5"
              >
                {t('hero.ctaPrimary')}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-6 py-3.5 text-[15px] font-semibold text-fg backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent"
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>

            <ul className="mz-rise mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" style={delay(1.15)}>
              {trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Sample panel: what the product actually computes */}
          <div className="mz-rise relative mx-auto w-full max-w-md min-w-0" style={delay(0.6)}>
            <div className="mz-bob rounded-2xl border border-border bg-surface/90 p-5 shadow-[0_30px_60px_-34px_rgba(5,12,10,0.45)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-fg">{t('hero.healthTitle')}</span>
                <span className="rounded-full bg-[var(--mz-gold)]/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--mz-gold)]">
                  {t('hero.sample')}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--mz-border)" strokeWidth="3" />
                    <circle
                      className="mz-ring"
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="var(--mz-accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength={100}
                      style={{ '--ring-to': 100 - HEALTH_HISTORY[HEALTH_HISTORY.length - 1] } as CSSProperties}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center leading-none">
                      <div className="font-mono text-2xl font-bold text-fg">{HEALTH_HISTORY[HEALTH_HISTORY.length - 1]}</div>
                      <div className="mt-1 font-mono text-[10px] text-muted">/100</div>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-accent">{t('hero.healthBand')}</div>
                  <div className="mt-0.5 text-xs text-muted">{t('hero.healthNote')}</div>
                  <svg viewBox="0 0 120 36" className="mt-3 h-9 w-full overflow-visible" preserveAspectRatio="none" fill="none">
                    <polyline
                      points={sparkline(HEALTH_HISTORY, 120, 36)}
                      stroke="var(--mz-accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="mz-bob relative mt-4 rounded-2xl border border-border bg-surface/90 p-5 shadow-[0_30px_60px_-34px_rgba(5,12,10,0.45)] backdrop-blur-md lg:-ml-10"
              style={{ '--bob': '-3s' } as CSSProperties}
            >
              <div className="text-sm font-semibold text-fg">{t('hero.planTitle')}</div>
              <ul className="mt-4 space-y-3">
                {debtNames.map((name, i) => (
                  <li key={name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 font-medium text-fg">
                        {name}
                        {i === 0 && (
                          <span className="rounded-md bg-[var(--mz-gold)]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--mz-gold)]">
                            {t('hero.first')}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-muted">{DEBT_RATES[i]}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/70">
                      <div
                        className="mz-bar h-full rounded-full"
                        style={{
                          width: `${(DEBT_RATES[i] / DEBT_RATES[0]) * 100}%`,
                          background: i === 0 ? 'var(--mz-gold)' : 'var(--mz-accent)',
                          opacity: i === 0 ? 1 : 0.55,
                          '--d': `${1.3 + i * 0.15}s`,
                        } as CSSProperties}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                {t('hero.planNote')}
              </p>
            </div>

            <div
              className="mz-bob mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface/90 p-4 shadow-[0_30px_60px_-34px_rgba(5,12,10,0.45)] backdrop-blur-md lg:ml-12"
              style={{ '--bob': '-6s' } as CSSProperties}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--mz-risk)]/12 text-[var(--mz-risk)]">
                <ShieldExclamationIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-fg">{t('hero.fraudTitle')}</span>
                  <span className="font-mono font-bold text-[var(--mz-risk)]">85/100</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-border/70">
                  <div
                    className="mz-bar h-full w-[85%] rounded-full bg-gradient-to-r from-[var(--mz-gold)] to-[var(--mz-risk)]"
                    style={delay(1.8)}
                  />
                </div>
                <p className="mt-2 truncate text-[11px] text-muted">{t('hero.fraudNote')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem → solution */}
        <section id="muammolar" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHead eyebrow={t('problems.eyebrow')} title={t('problems.title')} lead={t('problems.lead')} />
          <div className="mt-12 space-y-4">
            {problems.map((p, i) => {
              const ToolIcon = PROBLEM_ICONS[i]
              return (
                <Reveal key={p.tool} delay={i * 0.08}>
                  <div className="mz-row grid items-center gap-4 rounded-2xl border border-border bg-surface/75 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-accent/40 sm:p-6 md:grid-cols-[1fr_auto_1.25fr] md:gap-6">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{t('problems.problemLabel')}</div>
                      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-fg">{p.problem}</p>
                    </div>
                    <div className="mz-flow-wrap hidden text-border transition-colors duration-300 md:block" aria-hidden="true">
                      <svg width="76" height="14" viewBox="0 0 76 14" fill="none">
                        <line className="mz-flow" x1="2" y1="7" x2="66" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M64 2l6 5-6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="min-w-0 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{t('problems.solutionLabel')}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                          <ToolIcon className="h-3.5 w-3.5" />
                          {p.tool}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{p.solution}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* Q&A */}
        <section id="savol-javob" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead eyebrow={t('qa.eyebrow')} title={t('qa.title')} />
          </div>
          <Reveal delay={0.1} className="min-w-0">
            <FaqAccordion items={qa} />
          </Reveal>
        </section>

        {/* Features */}
        <section id="imkoniyatlar" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHead eyebrow={t('features.eyebrow')} title={t('features.title')} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const { href, Icon: FeatureIcon } = FEATURES[i]
              return (
                <Reveal key={href} delay={(i % 3) * 0.08}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-surface/75 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-30px_var(--mz-accent)] focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <FeatureIcon className="h-5 w-5" />
                    </span>
                    <span className="mt-4 text-base font-bold text-fg">{f.title}</span>
                    <span className="mt-1 flex-1 text-sm leading-relaxed text-muted">{f.desc}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors group-hover:text-accent">
                      {t('features.open')}
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* Demo accounts */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 pt-20 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/85 p-6 backdrop-blur-md sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--mz-gold)]/10 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mz-gold)]">{t('demo.eyebrow')}</p>
                  <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-fg sm:text-4xl">{t('demo.title')}</h2>
                  <p className="max-w-md leading-relaxed text-muted">{t('demo.lead')}</p>
                  <Link
                    href="/login"
                    className="group mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-[var(--mz-on-accent)] transition-transform hover:-translate-y-0.5"
                  >
                    {t('demo.go')}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: t('demo.userTitle'), note: t('demo.userNote'), email: 'demo@mizo.uz', password: 'Demo1234!' },
                    { title: t('demo.adminTitle'), note: `${t('demo.adminNote')} · /admin`, email: 'admin@mizo.uz', password: 'Admin1234!' },
                  ].map((acc) => (
                    <div key={acc.email} className="space-y-3 rounded-2xl border border-border bg-background/40 p-4">
                      <div>
                        <div className="font-bold text-fg">{acc.title}</div>
                        <div className="text-xs text-muted">{acc.note}</div>
                      </div>
                      <CopyField label={t('demo.email')} value={acc.email} copyLabel={t('demo.copy')} copiedLabel={t('demo.copied')} />
                      <CopyField label={t('demo.password')} value={acc.password} copyLabel={t('demo.copy')} copiedLabel={t('demo.copied')} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/70 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>
              © {new Date().getFullYear()} · {t('footer.rights')}
            </span>
          </div>
          <span className="text-xs">{t('footer.disclaimer')}</span>
        </div>
      </footer>
    </div>
  )
}
