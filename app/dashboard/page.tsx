'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import { SavingsAdvice } from '@/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: 'claude' | 'fallback'
  category?: string
  isTyping?: boolean
}

export default function AiPage() {
  const tAi = useTranslations('ai')
  const tCommon = useTranslations('common')
  const tCat = useTranslations('categories')

  // Chat holati
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0)
  const [rateLimited, setRateLimited] = useState(false)

  // Tejash rejasi modal/form holati
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [savingsLoading, setSavingsLoading] = useState(false)
  const [savingsResult, setSavingsResult] = useState<SavingsAdvice | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(6_000_000)
  const [debtPayments, setDebtPayments] = useState<number>(1_200_000)
  const [expenses, setExpenses] = useState<Array<{ category: string; amount: number }>>([
    { category: 'Oziq-ovqat', amount: 2_500_000 },
    { category: 'Kommunal va transport', amount: 800_000 },
  ])
  const [goalName, setGoalName] = useState('Favqulodda fond')
  const [goalAmount, setGoalAmount] = useState<number>(15_000_000)
  const [goalMonths, setGoalMonths] = useState<number>(12)

  const chatBottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // AI o'ylash qadamlari matnlari
  const thinkingSteps = [
    tAi('thinkingSteps.0'),
    tAi('thinkingSteps.1'),
    tAi('thinkingSteps.2'),
    tAi('thinkingSteps.3'),
  ]

  // Thinking stepper timer
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setThinkingStepIndex((prev) => (prev + 1) % thinkingSteps.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [loading, thinkingSteps.length])

  // Scroll pastga
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Tilni aniqlash
  const getLang = (): 'uz' | 'ru' => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )mz_lang=([^;]*)/)
      if (match && decodeURIComponent(match[1]) === 'ru') return 'ru'
    }
    return 'uz'
  }

  // Yozuv mashinkasi (Typewriter) effekti
  const runTypewriter = (fullText: string, messageId: string) => {
    let currentIdx = 0
    const speed = 12 // ms per char

    const interval = setInterval(() => {
      currentIdx += 2
      if (currentIdx >= fullText.length) {
        clearInterval(interval)
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: fullText, isTyping: false } : m))
        )
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content: fullText.slice(0, currentIdx) } : m
          )
        )
      }
    }, speed)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setRateLimited(false)

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)
    setThinkingStepIndex(0)

    try {
      const payloadMessages = nextMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: getLang(),
          messages: payloadMessages,
        }),
      })

      if (res.status === 429) {
        setRateLimited(true)
        setLoading(false)
        return
      }

      if (res.ok) {
        const data = await res.json()
        const botMsgId = `bot-${Date.now()}`
        const initialBotMsg: ChatMessage = {
          id: botMsgId,
          role: 'assistant',
          content: '',
          source: data.source,
          category: data.category,
          isTyping: true,
        }
        setMessages((prev) => [...prev, initialBotMsg])
        runTypewriter(data.reply || '', botMsgId)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: tAi('fallbackNotice'),
            source: 'fallback',
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: tAi('fallbackNotice'),
          source: 'fallback',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Tejash rejasi so'rovi
  const handleBuildSavingsPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingsLoading(true)

    try {
      const res = await fetch('/api/ai/savings-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: getLang(),
          monthlyIncome,
          monthlyDebtPayments: debtPayments,
          expenses: expenses.filter((ex) => ex.amount > 0),
          goal: goalName && goalAmount > 0 ? { name: goalName, amount: goalAmount, months: goalMonths } : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSavingsResult(data)
      }
    } catch {
      // ignore
    } finally {
      setSavingsLoading(false)
    }
  }

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { category: '', amount: 0 }])
  }

  const removeExpenseRow = (idx: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Yuqori panel va Tejash rejasi tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <CpuChipIcon className="w-6 h-6 stroke-[2]" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-fg">
              {tAi('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted">{tAi('subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowSavingsModal(!showSavingsModal)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface border border-border text-fg hover:border-accent hover:text-accent active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <BanknotesIcon className="w-4 h-4 text-accent" />
          <span>{tAi('savingsTitle')}</span>
        </button>
      </div>

      {/* Rate limited ogohlantirish */}
      {rateLimited && (
        <div className="p-4 rounded-2xl bg-danger/15 border border-danger/40 text-danger text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{tAi('rateLimited')}</span>
        </div>
      )}

      {/* TEJASH REJASI KARTASI (Toggle / Form) */}
      <AnimatePresence>
        {showSavingsModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-3xl bg-surface border border-border shadow-md space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-fg">{tAi('savingsTitle')}</h3>
                <p className="text-xs text-muted">{tAi('savingsSubtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSavingsModal(false)}
                className="text-xs text-muted hover:text-fg underline cursor-pointer"
              >
                {tCommon('cancel')}
              </button>
            </div>

            <form onSubmit={handleBuildSavingsPlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">{tAi('income')}:</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">{tAi('debtPayments')}:</label>
                  <input
                    type="number"
                    value={debtPayments}
                    onChange={(e) => setDebtPayments(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Xarajatlar ro'yxati */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted">Xarajatlar:</label>
                  <button
                    type="button"
                    onClick={addExpenseRow}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>{tAi('addExpense')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {expenses.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={tAi('expenseCategory')}
                        value={ex.category}
                        onChange={(e) => {
                          const val = e.target.value
                          setExpenses((prev) => prev.map((item, idx) => (idx === i ? { ...item, category: val } : item)))
                        }}
                        className="flex-1 p-2 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                        required
                      />
                      <input
                        type="number"
                        placeholder={tAi('expenseAmount')}
                        value={ex.amount || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setExpenses((prev) => prev.map((item, idx) => (idx === i ? { ...item, amount: val } : item)))
                        }}
                        className="w-36 p-2 rounded-xl border border-border bg-background text-fg text-xs outline-none focus:border-accent"
                        required
                      />
                      {expenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(i)}
                          className="p-2 text-muted hover:text-danger cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingsLoading}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-accent hover:opacity-95 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingsLoading ? tCommon('loading') : tAi('buildPlan')}
              </button>
            </form>

            {/* Tejash rejasi natijasi */}
            {savingsResult && (
              <div className="pt-4 border-t border-border space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-accent/15 border border-accent/30 text-fg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      {tAi('estimatedSaving')}:
                    </span>
                    <strong className="text-base font-black text-accent">
                      +{savingsResult.estimatedMonthlySaving.toLocaleString('uz-UZ')} {tCommon('som')}/{tCommon('perMonth')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed">{savingsResult.summary}</p>
                </div>

                {/* 50/30/20 Taqsimot */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-muted block text-[10px]">{tAi('needs')}</span>
                    <strong className="text-sm font-extrabold text-fg">
                      {savingsResult.budget.needsPct}%
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-muted block text-[10px]">{tAi('wants')}</span>
                    <strong className="text-sm font-extrabold text-fg">
                      {savingsResult.budget.wantsPct}%
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/25">
                    <span className="text-accent block text-[10px]">{tAi('savings')}</span>
                    <strong className="text-sm font-extrabold text-accent">
                      {savingsResult.budget.savingsPct}%
                    </strong>
                  </div>
                </div>

                {/* Qadamlar */}
                {savingsResult.actions && savingsResult.actions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">
                      {tAi('actions')}:
                    </span>
                    <div className="space-y-1.5">
                      {savingsResult.actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-background border border-border flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-fg">{act.title}</p>
                            <p className="text-muted text-[11px] mt-0.5">{act.detail}</p>
                          </div>
                          {act.monthlySaving > 0 && (
                            <span className="font-extrabold text-accent whitespace-nowrap">
                              +{act.monthlySaving.toLocaleString('uz-UZ')} {tCommon('som')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT XABARLARI MAYDONI */}
      <div className="min-h-[380px] max-h-[560px] overflow-y-auto space-y-4 p-2 pr-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mx-auto">
              <SparklesIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-fg">{tAi('title')}</h3>
              <p className="text-xs text-muted leading-relaxed">{tAi('subtitle')}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="max-w-[85%] sm:max-w-md rounded-2xl rounded-tr-xs px-4 py-3 bg-accent text-white shadow-xs text-xs sm:text-sm">
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[90%] sm:max-w-xl rounded-2xl rounded-tl-xs p-4 sm:p-5 bg-surface border border-border shadow-md space-y-2.5 text-xs sm:text-sm">
                {/* Fallback notice */}
                {msg.source === 'fallback' && (
                  <div className="flex items-center gap-1.5 text-[11px] text-warning bg-warning/10 px-2.5 py-1 rounded-lg border border-warning/20">
                    <InformationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tAi('fallbackNotice')}</span>
                  </div>
                )}

                <div className="text-fg leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                  {msg.isTyping && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pulsatsiyalanuvchi AI shar + thinkingSteps */}
        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border max-w-sm shadow-xs animate-in fade-in">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-accent/30"
              />
              <div className="w-5 h-5 rounded-full bg-accent shadow-sm" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-fg">{tAi('thinking')}</p>
              <p className="text-[11px] text-muted transition-all duration-300">
                {thinkingSteps[thinkingStepIndex]}
              </p>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input maydoni */}
      <div className="p-2 rounded-2xl bg-surface border border-border shadow-xs focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40 transition-all flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={tAi('placeholder')}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-xs sm:text-sm text-fg placeholder:text-muted/60 max-h-36 py-2 px-2"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-accent text-white hover:opacity-95 active:scale-95 transition-all disabled:opacity-30 cursor-pointer flex-shrink-0"
          aria-label="Yuborish"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
