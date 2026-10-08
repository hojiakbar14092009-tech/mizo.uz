import { calcRefi } from './finance'
import type { AiResult, AiCategory, RiskLevel } from '@/types'

const PATTERNS: Record<AiCategory, RegExp> = {
  CREDIT: /kredit|qarz|to['']l|foiz|bank|ipoteka|кредит|долг/i,
  BUDGET: /teja|byudjet|oylik|xarajat|yetmay|бюджет/i,
  FRAUD: /firib|aldov|kafolat|tez pul|mlm|piramid|мошен/i,
  INVEST: /invest|aksiya|fond|инвест/i,
  GOAL: /maqsad|orzum|yig'|цель/i,
}
const FRAUD_FLAGS = ['kafolatlangan daromad', 'referral', 'tez boyish', 'kripto kafolat', "do'stlarni taklif", 'bosim', 'naqd pul talab']
const STEPS: Record<AiCategory, { uz: string[]; ru: string[] }> = {
  CREDIT: { uz: ["Kredit shartnomasini qayta o'qing", "Bankka refinansirovka so'rovi bilan murojaat qiling", "Oylik to'lovingiz daromadingizning 30% dan oshmasin"], ru: ['Перечитайте кредитный договор', 'Обратитесь в банк с заявкой на рефинансирование', 'Платёж не должен превышать 30% дохода'] },
  BUDGET: { uz: ["Maosh kelishi bilan darhol 10-20% tejash hisobiga o'tkazing", 'Barcha xarajatlarni yozing', "50/30/20 qoidasini qo'llang"], ru: ['Сразу откладывайте 10-20% зарплаты', 'Ведите учёт расходов', 'Применяйте правило 50/30/20'] },
  FRAUD: { uz: ["Hech qachon noma'lum odamga pul o'tkazmang", 'Shubhali taklifni 1030 ga xabar bering', 'Kafolatlangan daromad — bu firibgarlik belgisi'], ru: ['Никогда не переводите деньги незнакомым', 'Сообщите о мошенничестве на 1030', 'Гарантированный доход — признак мошенничества'] },
  INVEST: { uz: ["Avval 3-6 oylik favqulodda fond to'plang", "Yuqori foizli qarzlarni avval to'lang", "Bank depoziti (22%) boshlang'ich investor uchun xavfsiz"], ru: ['Создайте резервный фонд на 3-6 месяцев', 'Сначала погасите долги', 'Депозит (22%) — безопасно для начинающих'] },
  GOAL: { uz: ["Maqsadni aniq summa va muddatga bog'lang", 'Oylik tejashni avtomatik qiling', "Tejash tabida maqsad qo'shing va kuzating"], ru: ['Привяжите цель к сумме и сроку', 'Автоматизируйте накопления', 'Добавьте цель во вкладке Tejash'] },
}

function detectCategory(text: string): AiCategory {
  for (const [cat, re] of Object.entries(PATTERNS)) {
    if (re.test(text)) return cat as AiCategory
  }
  return 'BUDGET'
}

function extractNumbers(text: string) {
  const sumMln = text.match(/(\d+\.?\d*)\s*(mln|млн)/i)
  const sumRaw = text.match(/(\d{6,})/)
  const sum = sumMln ? parseFloat(sumMln[1]) * 1_000_000 : sumRaw ? parseInt(sumRaw[1]) : 0
  const rateM = text.match(/(\d+\.?\d*)\s*(%|foiz|процент)/i)
  const rate = rateM ? parseFloat(rateM[1]) : 0
  const monM = text.match(/(\d+)\s*(oy|месяц)/i)
  const months = monM ? parseInt(monM[1]) : 0
  return { sum, rate, months }
}

export function analyzeText(text: string, lang: 'uz' | 'ru' = 'uz'): AiResult {
  const category = detectCategory(text)
  const l = lang === 'ru' ? 'ru' : 'uz'
  const foundFlags = FRAUD_FLAGS.filter(f => text.toLowerCase().includes(f))
  const riskScore = category === 'FRAUD' ? Math.min(100, foundFlags.length * 20 + 40) : category === 'CREDIT' ? 30 : 10
  const riskLevel: RiskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW'
  const titles: Record<AiCategory, { uz: string; ru: string }> = {
    CREDIT: { uz: 'Kredit tahlili', ru: 'Анализ кредита' },
    BUDGET: { uz: 'Byudjet maslahat', ru: 'Совет по бюджету' },
    FRAUD: { uz: 'Firibgarlik radari', ru: 'Радар мошенничества' },
    INVEST: { uz: 'Investitsiya maslahat', ru: 'Инвестиционный совет' },
    GOAL: { uz: 'Maqsad rejalashtirish', ru: 'Планирование цели' },
  }
  let creditData: AiResult['creditData']
  if (category === 'CREDIT') {
    const { sum, rate, months } = extractNumbers(text)
    if (sum > 0 && rate > 0) {
      const r = calcRefi(sum, rate, months)
      creditData = { sum, rate, months, monthlyPayment: r.currentMonthly, refiSaving: r.totalSaving }
    }
  }
  return { category, riskLevel, riskScore, title: titles[category][l], steps: STEPS[category][l], flags: foundFlags, suggestedTab: category === 'CREDIT' ? 'kredit' : category === 'GOAL' ? 'tejash' : undefined, creditData }
}
