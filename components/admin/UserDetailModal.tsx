'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CreditCard, HeartPulse, MessageCircleQuestion, PiggyBank, Target } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { SkeletonCard } from '@/components/SkeletonCard'
import type { AdminUserDetail, AiCategory, HealthBand, HealthComponentKey } from '@/types'

const CATEGORY: Record<AiCategory, string> = {
  CREDIT: 'Kredit va qarz',
  BUDGET: 'Oylik yetishmasligi',
  FRAUD: 'Firibgarlik xavfi',
  INVEST: 'Investitsiya',
  GOAL: 'Maqsad va tejash',
}

const BAND: Record<HealthBand, string> = {
  EXCELLENT: 'Aʼlo',
  GOOD: 'Yaxshi',
  FAIR: 'Oʻrtacha',
  WEAK: 'Zaif',
  CRITICAL: 'Xavfli',
}

const COMPONENT: Record<HealthComponentKey, string> = {
  savingsRate: 'Jamgʻarish ulushi',
  debtToIncome: 'Qarz yuki',
  emergencyFund: 'Favqulodda jamgʻarma',
  expenseRatio: 'Xarajatlar ulushi',
  goalProgress: 'Maqsadlar progressi',
}

const som = (n: number) => `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} soʻm`

const scoreTone = (score: number) => (score >= 65 ? 'text-accent' : score >= 50 ? 'text-warning' : 'text-danger')

function Section({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-bold text-fg">
        <Icon className="h-4 w-4 text-accent" />
        {title}
      </h4>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted">{text}</p>
}

export function UserDetailModal({ userId, displayName, onClose }: { userId: string; displayName: string; onClose: () => void }) {
  const [data, setData] = useState<AdminUserDetail | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/users/${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<AdminUserDetail>) : Promise.reject(new Error(String(res.status)))))
      .then((detail) => !cancelled && setData(detail))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <Modal isOpen onClose={onClose} title={displayName} maxWidth="max-w-2xl">
      {error ? (
        <p className="py-8 text-center text-sm text-danger">Maʼlumotlarni yuklab boʻlmadi. Qayta urinib koʻring.</p>
      ) : !data ? (
        <div className="space-y-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Asosiy koʻrsatkichlar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Salomatlik bahosi</div>
              {data.health ? (
                <>
                  <div className={`mt-1 text-2xl font-extrabold tabular-nums ${scoreTone(data.health.score)}`}>
                    {data.health.score}
                    <span className="text-xs font-medium text-muted">/100</span>
                  </div>
                  <div className="text-[11px] text-muted">{data.health.band ? BAND[data.health.band] : '—'} · {data.health.month}</div>
                </>
              ) : (
                <div className="mt-1 text-sm text-muted">Baholanmagan</div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Jami jamgʻarilgan</div>
              <div className="mt-1 text-base font-extrabold tabular-nums text-fg">{som(data.totalSaved)}</div>
              <div className="text-[11px] text-muted">maqsad: {som(data.totalTarget)}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Oylik kredit toʻlovlari</div>
              <div className="mt-1 text-base font-extrabold tabular-nums text-fg">{som(data.monthlyPayments)}</div>
              <div className="text-[11px] text-muted">{data.reminders.length} ta toʻlov</div>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Maqsadlar</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-fg">{data.goals.length}</div>
              <div className="text-[11px] text-muted">ta faol maqsad</div>
            </div>
          </div>

          {/* Muammolar */}
          <Section icon={AlertTriangle} title="Qanday muammosi bor">
            {data.problems.length === 0 && !data.health?.weakest ? (
              <Empty text="Foydalanuvchi hali AI maslahatchiga savol bermagan." />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {data.problems.map((p) => (
                    <span key={p.category} className="inline-flex items-center gap-1.5 rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                      {CATEGORY[p.category] ?? p.category}
                      <span className="rounded bg-danger/15 px-1.5 tabular-nums">{p.count}</span>
                    </span>
                  ))}
                  {data.health?.weakest && (
                    <span className="inline-flex items-center rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                      Eng zaif tomoni: {COMPONENT[data.health.weakest] ?? data.health.weakest}
                    </span>
                  )}
                </div>
                {data.recentQuestions.length > 0 && (
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {data.recentQuestions.map((q) => (
                      <li key={q.id} className="flex items-start gap-3 px-3 py-2.5 text-xs">
                        <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-fg">“{q.questionText}”</p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {CATEGORY[q.category] ?? q.category} · {new Date(q.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Section>

          {/* Kreditlar */}
          <Section icon={CreditCard} title="Kreditlar va oylik toʻlovlar">
            {data.reminders.length === 0 ? (
              <Empty text="Kredit toʻlovi eslatmalari kiritilmagan." />
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {data.reminders.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-fg">{r.name}</p>
                      <p className="text-[11px] text-muted">Har oyning {r.dayOfMonth}-kuni</p>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-fg">{som(r.amount)} / oy</span>
                  </li>
                ))}
              </ul>
            )}
            {data.health && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-background/60 p-3 text-xs sm:grid-cols-4">
                {[
                  ['Oylik daromad', data.health.monthlyIncome],
                  ['Oylik xarajat', data.health.monthlyExpenses],
                  ['Qarz toʻlovlari', data.health.monthlyDebtPayments],
                  ['Jamgʻarma qoldigʻi', data.health.savingsBalance],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-[11px] text-muted">{label}</dt>
                    <dd className="font-semibold tabular-nums text-fg">{typeof value === 'number' ? som(value) : '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Section>

          {/* Maqsadlar */}
          <Section icon={Target} title="Maqsadlar va jamgʻarma">
            {data.goals.length === 0 ? (
              <Empty text="Tejash maqsadlari qoʻshilmagan." />
            ) : (
              <ul className="space-y-3">
                {data.goals.map((g) => {
                  const pct = g.totalAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.totalAmount) * 100)) : 0
                  return (
                    <li key={g.id} className="space-y-1.5 rounded-xl border border-border p-3 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 font-semibold text-fg">
                          <PiggyBank className="h-3.5 w-3.5 text-accent" />
                          {g.name}
                        </span>
                        <span className="font-bold tabular-nums text-accent">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex flex-wrap justify-between gap-x-3 text-[11px] text-muted tabular-nums">
                        <span>
                          {som(g.savedAmount)} / {som(g.totalAmount)}
                        </span>
                        <span>oyiga {som(g.monthlyAmount)}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>

          {/* Salomatlik tarixi */}
          <Section icon={HeartPulse} title="Moliyaviy salomatlik tarixi">
            {data.healthHistory.length === 0 ? (
              <Empty text="Foydalanuvchi hali moliyaviy salomatlik testini topshirmagan." />
            ) : (
              <div className="flex items-end gap-2 overflow-x-auto pb-1">
                {data.healthHistory.map((h) => (
                  <div key={h.month} className="flex min-w-11 flex-1 flex-col items-center gap-1">
                    <span className={`text-[11px] font-bold tabular-nums ${scoreTone(h.score)}`}>{h.score}</span>
                    <div className="flex h-16 w-full items-end rounded-md bg-border/50">
                      <div className="w-full rounded-md bg-accent/70" style={{ height: `${h.score}%` }} />
                    </div>
                    <span className="text-[10px] text-muted tabular-nums">{h.month.slice(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </Modal>
  )
}
