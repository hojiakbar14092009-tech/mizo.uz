import { PrismaClient } from '@prisma/client'

declare global {
  var __mizo_prisma: PrismaClient | undefined
}

export const prisma = global.__mizo_prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.__mizo_prisma = prisma
