import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// لاگ کوئری فقط در محیط development فعال است؛ در production ثبت کوئری
// می‌تواند داده‌های حساس را به لاگ‌ها منتقل کند.
const prismaLogger =
  process.env.NODE_ENV === "production"
    ? (["error", "warn"] as const)
    : (["error", "warn"] as const);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [...prismaLogger],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
