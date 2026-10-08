import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminHash = await bcrypt.hash('Admin1234!', 12)
  const demoHash = await bcrypt.hash('Demo1234!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mizo.uz' },
    update: {},
    create: {
      email: 'admin@mizo.uz',
      passwordHash: adminHash,
      role: 'ADMIN',
      birthDate: new Date('1985-05-15'),
    },
  })

  const demo = await prisma.user.upsert({
    where: { email: 'demo@mizo.uz' },
    update: {},
    create: {
      email: 'demo@mizo.uz',
      passwordHash: demoHash,
      role: 'USER',
      birthDate: new Date('2000-03-20'),
      goals: {
        create: [
          { name: 'Mashina', totalAmount: 50_000_000, savedAmount: 12_000_000, monthlyAmount: 2_000_000 },
          { name: 'Kvartira', totalAmount: 200_000_000, savedAmount: 30_000_000, monthlyAmount: 5_000_000 },
        ],
      },
      reminders: {
        create: [
          { name: 'Ipoteka', amount: 1_500_000, dayOfMonth: 5, phone: '+998901234567' },
          { name: 'Karta krediti', amount: 800_000, dayOfMonth: 15, phone: '+998901234567' },
        ],
      },
      queries: {
        create: [
          { category: 'CREDIT', questionText: "Kreditim bor, to'lay olmayapman" },
          { category: 'BUDGET', questionText: 'Oyligim yetmayapti' },
          { category: 'FRAUD', questionText: 'Telegramda tez pul ishlash taklifi keldi' },
        ],
      },
    },
  })

  // Prefix 1 = male, 1900s → 05.12.1989
  const pnflUser = await prisma.user.upsert({
    where: { pnfl: '10512891234567' },
    update: {},
    create: {
      pnfl: '10512891234567',
      passwordHash: demoHash,
      role: 'USER',
      birthDate: new Date('1989-12-05'),
      goals: {
        create: [
          { name: 'Toʻy', totalAmount: 80_000_000, savedAmount: 60_000_000, monthlyAmount: 3_000_000 },
          { name: 'Favqulodda fond', totalAmount: 15_000_000, savedAmount: 4_000_000, monthlyAmount: 1_000_000 },
        ],
      },
      reminders: {
        create: [
          { name: 'Avtokredit', amount: 2_300_000, dayOfMonth: 10, phone: '+998935554433' },
          { name: 'Mikroqarz', amount: 600_000, dayOfMonth: 25, phone: '+998935554433' },
        ],
      },
      queries: {
        create: [
          { category: 'INVEST', questionText: 'Investitsiya qilsam boʻladimi?' },
          { category: 'GOAL', questionText: 'Toʻy uchun pul yigʻmoqchiman' },
          { category: 'CREDIT', questionText: '30 mln kredit 36% foiz 24 oy' },
        ],
      },
    },
  })

  const blocked = await prisma.user.upsert({
    where: { email: 'test@mizo.uz' },
    update: {},
    create: {
      email: 'test@mizo.uz',
      passwordHash: demoHash,
      role: 'USER',
      birthDate: new Date('1995-11-08'),
      isBlocked: true,
    },
  })

  await seedLoanOffers()
  await seedCommunityTips(demo.id, pnflUser.id)
  await seedHealthHistory(demo.id)

  console.log('Seed tayyor:', {
    admin: admin.email,
    demo: demo.email,
    pnfl: pnflUser.pnfl,
    blocked: blocked.email,
  })
}

const DEMO_NOTE = 'Namuna maʼlumot — aniq shartlarni bank saytidan tekshiring.'

// Illustrative demo terms, not live bank quotes; refresh from bank sites before any real use.
async function seedLoanOffers() {
  type Offer = [bank: string, product: string, type: string, rateMin: number, rateMax: number, minAmount: number, maxAmount: number, minTerm: number, maxTerm: number, collateral: boolean, days: number, online: boolean]
  const offers: Offer[] = [
    ['Kapitalbank', 'Onlayn mikroqarz', 'MICRO', 32, 42, 1_000_000, 50_000_000, 3, 36, false, 1, true],
    ['Anorbank', 'Raqamli mikroqarz', 'MICRO', 29, 39, 500_000, 30_000_000, 3, 24, false, 1, true],
    ['TBC Bank', 'Onlayn isteʼmol krediti', 'CONSUMER', 26, 34, 1_000_000, 100_000_000, 6, 48, false, 1, true],
    ['Hamkorbank', 'Isteʼmol krediti', 'CONSUMER', 24, 30, 5_000_000, 200_000_000, 12, 60, true, 3, false],
    ['Asakabank', 'Avtokredit', 'AUTO', 21, 25, 30_000_000, 600_000_000, 12, 60, true, 5, false],
    ['Davr Bank', 'Avtokredit', 'AUTO', 22, 26, 20_000_000, 400_000_000, 12, 48, true, 3, true],
    ['Ipoteka-bank', 'Ipoteka', 'MORTGAGE', 17, 20, 100_000_000, 1_500_000_000, 60, 240, true, 10, false],
    ['Xalq banki', 'Ipoteka', 'MORTGAGE', 17.5, 21, 80_000_000, 1_000_000_000, 60, 240, true, 12, false],
    ['Agrobank', 'Taʼlim krediti', 'EDUCATION', 14, 18, 2_000_000, 60_000_000, 12, 84, false, 5, false],
    ['Ipak Yoʻli Banki', 'Refinansirovka', 'REFINANCE', 21, 25, 5_000_000, 300_000_000, 12, 60, false, 3, true],
    ['Orient Finans', 'Refinansirovka', 'REFINANCE', 22, 26, 3_000_000, 200_000_000, 12, 48, false, 2, true],
    ['Milliy bank', 'Isteʼmol krediti', 'CONSUMER', 23, 28, 10_000_000, 300_000_000, 12, 60, true, 4, false],
  ]
  await prisma.loanOffer.deleteMany()
  await prisma.loanOffer.createMany({
    data: offers.map(([bank, product, type, rateMin, rateMax, minAmount, maxAmount, minTermMonths, maxTermMonths, collateralRequired, approvalDays, onlineApply]) => ({
      bank, product, type, rateMin, rateMax, minAmount, maxAmount, minTermMonths, maxTermMonths, collateralRequired, approvalDays, onlineApply, note: DEMO_NOTE,
    })),
  })
}

async function seedCommunityTips(demoId: string, pnflId: string) {
  if ((await prisma.communityTip.count()) > 0) return
  const tips: { userId: string; category: string; title: string; content: string; savedAmount?: number; likesCount: number }[] = [
    { userId: demoId, category: 'CREDIT', title: 'Mikroqarzni refinansirovka qildim', content: '42% lik mikroqarzimni 24% lik refinansirovka krediti bilan yopdim. Oylik toʻlov 1,1 mln dan 870 ming soʻmga tushdi. Ariza onlayn, 2 kunda tasdiqlandi.', savedAmount: 2_760_000, likesCount: 48 },
    { userId: pnflId, category: 'CREDIT', title: 'Avalanche usuli ishladi', content: 'Uchta qarzim bor edi. Avval eng yuqori foizlisini qoʻshimcha toʻlov bilan yopdim, qolganlariga minimal toʻladim. Jami 7 oy oldin qutuldim.', savedAmount: 1_900_000, likesCount: 35 },
    { userId: demoId, category: 'BUDGET', title: 'Maosh kuni 15% avtomatik', content: 'Maosh tushgan kuni 15% avtomatik ravishda depozitga oʻtadi. Koʻrmagan pulni sarflamaysiz — 1 yilda 9 mln yigʻildi.', savedAmount: 9_000_000, likesCount: 61 },
    { userId: pnflId, category: 'BUDGET', title: 'Obunalarni tozaladim', content: 'Kartadagi barcha avtomatik toʻlovlarni tekshirdim: 4 ta keraksiz obuna chiqdi. Oyiga 180 ming soʻm qaytdi.', savedAmount: 180_000, likesCount: 22 },
    { userId: demoId, category: 'BUDGET', title: 'Bozorga roʻyxat bilan', content: 'Haftalik ovqat menyusi va roʻyxat tuzib bozorga boraman. Oziq-ovqat xarajati 25% kamaydi.', savedAmount: 600_000, likesCount: 29 },
    { userId: pnflId, category: 'FRAUD', title: 'Telegramdagi “kafolatli daromad”', content: 'Kuniga 5% daromad vaʼda qilgan kanal avval 200 ming soʻm “aktivatsiya” soʻradi. Mizo radarida 85% xavf chiqdi — pul oʻtkazmadim.', likesCount: 54 },
    { userId: demoId, category: 'FRAUD', title: 'SMS kodni hech kimga aytmang', content: '“Bank xodimi” qoʻngʻiroq qilib kartaga kelgan kodni soʻradi. Bank hech qachon kod soʻramaydi — darhol telefonni qoʻydim.', likesCount: 40 },
    { userId: pnflId, category: 'GOAL', title: 'Toʻy uchun 18 oyda', content: 'Maqsadni 80 mln ga qoʻydim va oyiga 3 mln avtomatik toʻlov belgiladim. Progressni Mizoda koʻrib turish motivatsiya beradi.', savedAmount: 60_000_000, likesCount: 31 },
    { userId: demoId, category: 'INVEST', title: 'Avval favqulodda fond', content: 'Investitsiyadan oldin 4 oylik xarajatimni depozitga qoʻydim. Ishsiz qolganimda qarz olishga majbur boʻlmadim.', likesCount: 26 },
    { userId: pnflId, category: 'INVEST', title: 'Depozit foizini solishtiring', content: 'Bir xil muddatli depozitlarda banklar orasidagi farq 3–4% gacha. 20 mln da bu yiliga 700 ming soʻm.', savedAmount: 700_000, likesCount: 19 },
  ]
  for (const t of tips) await prisma.communityTip.create({ data: t })
}

async function seedHealthHistory(userId: string) {
  const scores = [41, 46, 52, 55, 61, 64]
  const now = new Date()
  for (let i = 0; i < scores.length; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (scores.length - 1 - i), 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const breakdown = JSON.stringify({ band: scores[i] >= 65 ? 'GOOD' : scores[i] >= 50 ? 'FAIR' : 'WEAK', components: [], weakest: 'emergencyFund', recommendations: [] })
    const inputs = JSON.stringify({ monthlyIncome: 8_000_000, monthlyExpenses: 5_200_000 - i * 150_000, monthlyDebtPayments: 1_500_000, savingsBalance: 2_000_000 + i * 900_000 })
    await prisma.healthSnapshot.upsert({
      where: { userId_month: { userId, month } },
      create: { userId, month, score: scores[i], breakdown, inputs },
      update: { score: scores[i], breakdown, inputs },
    })
  }
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
