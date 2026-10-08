import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import type { AiCategory, ChatTurn, Lang, SavingsAdvice } from '@/types'

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5'
// Server-side refusal fallback is only accepted on these models.
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5'])

let cached: Anthropic | null | undefined
function getClient(): Anthropic | null {
  if (cached === undefined) cached = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null
  return cached
}

export function aiEnabled(): boolean {
  return getClient() !== null
}

function fallbackParams() {
  return FALLBACK_MODELS.has(MODEL)
    ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
    : {}
}

const SYSTEM = `You are Mizo, a personal-finance assistant for people in Uzbekistan (mizo.uz).
Users are adults managing salaries, consumer loans, microloans, mortgages, savings goals, and suspicious money offers.

How to answer:
- Reply in the user's language: Uzbek (Latin script, write oʻ and gʻ with U+02BB) or Russian. The request names the language.
- Be concrete: use the user's own numbers, show the arithmetic briefly, give amounts in so'm.
- Prefer 3-6 short, actionable steps over general theory. Plain text with short lists; no tables, no headings.
- Do not name specific banks, quote specific bank rates, or include links. For loan comparisons point the user to Mizo's "Eng yaxshi kreditlar" section; for repayment order, to the "Kredit" section (Avalanche / Snowball plan).
- If something looks like fraud (guaranteed income, pyramid/referral schemes, upfront payments, pressure to transfer money), say so clearly and suggest reporting to the 1030 hotline.
- You are not a licensed advisor; mention that only when a decision is large or irreversible (taking a mortgage, investing savings).`

function langLine(lang: Lang): string {
  return lang === 'ru' ? 'Answer in Russian.' : 'Answer in Uzbek (Latin script).'
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

export async function chatReply(history: ChatTurn[], lang: Lang): Promise<{ reply: string; source: 'claude' | 'fallback' }> {
  const client = getClient()
  const turns = history.slice(-12)
  while (turns.length > 0 && turns[0].role !== 'user') turns.shift()
  const last = turns[turns.length - 1]
  if (!client || !last || last.role !== 'user') return { reply: fallbackChat(last?.content ?? '', lang), source: 'fallback' }

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      output_config: { effort: 'medium' },
      messages: [
        ...turns.slice(0, -1).map((t) => ({ role: t.role, content: t.content })),
        { role: 'user', content: `${langLine(lang)}\n\n${last.content}` },
      ],
      ...fallbackParams(),
    })
    const reply = response.stop_reason === 'refusal' ? '' : textOf(response.content)
    if (reply) return { reply, source: 'claude' }
  } catch (error) {
    logApiError('chat', error)
  }
  return { reply: fallbackChat(last.content, lang), source: 'fallback' }
}

const AdviceSchema = z.object({
  summary: z.string(),
  budget: z.object({ needsPct: z.number(), wantsPct: z.number(), savingsPct: z.number() }),
  actions: z.array(z.object({ title: z.string(), detail: z.string(), monthlySaving: z.number() })),
  quickWins: z.array(z.string()),
  warnings: z.array(z.string()),
  estimatedMonthlySaving: z.number(),
})

export interface SavingsAdviceInput {
  monthlyIncome: number
  expenses: { category: string; amount: number }[]
  monthlyDebtPayments: number
  goal?: { name: string; amount: number; months: number }
  note?: string
}

export async function savingsAdvice(input: SavingsAdviceInput, lang: Lang): Promise<SavingsAdvice> {
  const client = getClient()
  if (!client) return fallbackAdvice(input, lang)

  const prompt = `${langLine(lang)}
Build a monthly savings plan for this user. Every number is in so'm per month.
${JSON.stringify(input)}

Fill the fields like this:
- summary: 2-3 sentences on where the money goes and the biggest opportunity.
- budget: the target split of income in percent (needsPct + wantsPct + savingsPct = 100), adjusted to this user's real situation rather than a fixed 50/30/20.
- actions: 3-5 specific cuts or changes tied to the listed categories, each with a realistic monthlySaving.
- quickWins: 2-4 things doable this week.
- warnings: risks you see (debt load above 30% of income, no buffer, unrealistic goal); empty if none.
- estimatedMonthlySaving: the sum the actions free up.`

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      output_config: { effort: 'medium', format: betaZodOutputFormat(AdviceSchema) },
      messages: [{ role: 'user', content: prompt }],
      ...fallbackParams(),
    })
    if (response.stop_reason !== 'refusal' && response.parsed_output) {
      return { ...response.parsed_output, source: 'claude' }
    }
  } catch (error) {
    logApiError('savings-advice', error)
  }
  return fallbackAdvice(input, lang)
}

export function categorize(text: string): AiCategory {
  const t = text.toLowerCase()
  if (/firib|aldov|kafolat|piramid|referral|мошен|гарант|пирамид/.test(t)) return 'FRAUD'
  if (/kredit|qarz|foiz|ipoteka|mikroqarz|кредит|долг|ипотек|процент/.test(t)) return 'CREDIT'
  if (/invest|aksiya|depozit|fond|инвест|акци|депозит/.test(t)) return 'INVEST'
  if (/maqsad|yigʻ|yig'|orzu|цель|накоп|мечт/.test(t)) return 'GOAL'
  return 'BUDGET'
}

function logApiError(where: string, error: unknown) {
  if (error instanceof Anthropic.RateLimitError) console.warn(`[claude:${where}] rate limited`)
  else if (error instanceof Anthropic.AuthenticationError) console.error(`[claude:${where}] invalid ANTHROPIC_API_KEY`)
  else if (error instanceof Anthropic.APIError) console.error(`[claude:${where}] API ${error.status}: ${error.message}`)
  else console.error(`[claude:${where}]`, error)
}

const som = (n: number) => `${Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ')} soʻm`

function fallbackAdvice(input: SavingsAdviceInput, lang: Lang): SavingsAdvice {
  const income = Math.max(0, input.monthlyIncome)
  const spent = input.expenses.reduce((s, e) => s + e.amount, 0)
  const top = [...input.expenses].sort((a, b) => b.amount - a.amount).slice(0, 3)
  const actions = top.map((e) => ({
    title: lang === 'ru' ? `Сократить «${e.category}» на 15%` : `“${e.category}” xarajatini 15% ga qisqartirish`,
    detail:
      lang === 'ru'
        ? `Установите месячный лимит ${som(e.amount * 0.85)} и отслеживайте его каждую неделю.`
        : `Oylik limitni ${som(e.amount * 0.85)} qilib belgilang va har hafta tekshiring.`,
    monthlySaving: Math.round(e.amount * 0.15),
  }))
  const estimated = actions.reduce((s, a) => s + a.monthlySaving, 0)
  const warnings: string[] = []
  if (income > 0 && input.monthlyDebtPayments / income > 0.3) {
    warnings.push(
      lang === 'ru'
        ? 'Платежи по долгам превышают 30% дохода — начните с плана погашения в разделе «Кредит».'
        : 'Qarz toʻlovlari daromadning 30% idan oshgan — “Kredit” boʻlimidagi toʻlash rejasidan boshlang.',
    )
  }
  if (spent + input.monthlyDebtPayments > income) {
    warnings.push(lang === 'ru' ? 'Расходы больше дохода.' : 'Xarajatlar daromaddan koʻp.')
  }
  return {
    summary:
      lang === 'ru'
        ? `Доход ${som(income)}, расходы ${som(spent)}. Сократив три крупнейшие категории, можно откладывать около ${som(estimated)} в месяц.`
        : `Daromad ${som(income)}, xarajat ${som(spent)}. Eng katta uchta toifani qisqartirsangiz, oyiga taxminan ${som(estimated)} tejaysiz.`,
    budget: { needsPct: 50, wantsPct: 30, savingsPct: 20 },
    actions,
    quickWins:
      lang === 'ru'
        ? ['Отмените неиспользуемые подписки.', 'Переведите 10% зарплаты на отдельный счёт в день получения.']
        : ['Foydalanmayotgan obunalarni bekor qiling.', 'Maosh kelgan kuniyoq 10% ini alohida hisobga oʻtkazing.'],
    warnings,
    estimatedMonthlySaving: estimated,
    source: 'fallback',
  }
}

function fallbackChat(text: string, lang: Lang): string {
  const t = text.toLowerCase()
  const ru = lang === 'ru'
  if (/firib|aldov|kafolat|piramid|referral|мошен|гарант/.test(t)) {
    return ru
      ? 'Это похоже на мошенничество: гарантированный доход и просьба перевести деньги — главные признаки. Не переводите деньги и сообщите на горячую линию 1030.'
      : 'Bu firibgarlikka oʻxshaydi: kafolatlangan daromad va pul oʻtkazishni soʻrash — asosiy belgilar. Pul oʻtkazmang va 1030 ishonch telefoniga xabar bering.'
  }
  if (/kredit|qarz|foiz|кредит|долг/.test(t)) {
    return ru
      ? 'Сначала гасите долг с самой высокой ставкой (метод Avalanche), остальные — минимальными платежами. Точный план с датами — в разделе «Кредит».'
      : 'Avval eng yuqori foizli qarzni yoping (Avalanche usuli), qolganlariga minimal toʻlov qiling. Sanalari bilan aniq reja — “Kredit” boʻlimida.'
  }
  return ru
    ? 'Начните с правила 50/30/20: 50% — обязательные расходы, 30% — желания, 20% — сбережения. Опишите свой доход и расходы, и я помогу составить план.'
    : '50/30/20 qoidasidan boshlang: 50% — zarur xarajatlar, 30% — xohishlar, 20% — jamgʻarma. Daromad va xarajatlaringizni yozing, reja tuzib beraman.'
}
