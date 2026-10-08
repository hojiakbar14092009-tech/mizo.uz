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

  console.log('Seed tayyor:', {
    admin: admin.email,
    demo: demo.email,
    pnfl: pnflUser.pnfl,
    blocked: blocked.email,
  })
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
