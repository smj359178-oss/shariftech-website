// ===========================================================================
// Seed داده اولیه: کاربران با نقش‌های مختلف، تنظیمات، محصولات نمونه
// اجرا: bun run src/db/seed.ts
//
// نکته امنیتی: رمزهای پیش‌فرض فقط برای محیط demo/local هستند.
// در production مقدارها را با متغیرهای محیطی ADMIN_PASSWORD و ... تنظیم
// کنید و بلافاصله پس از اولین ورود، رمزها را تغییر دهید.
// ===========================================================================
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from "../lib/site-defaults";

const db = new PrismaClient();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Sharif@1404";
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || "Editor@1404";
const SALES_PASSWORD = process.env.SALES_PASSWORD || "Sales@1404";
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || "Viewer@1404";

async function main() {
  console.log("🌱 شروع Seed...");

  // 1) کاربران با نقش‌های مختلف
  const users: Array<{
    username: string;
    password: string;
    name: string;
    role: string;
  }> = [
    { username: "admin", password: ADMIN_PASSWORD, name: "مدیر ارشد سیستم", role: "ADMIN" },
    { username: "editor", password: EDITOR_PASSWORD, name: "کارشناس محتوا", role: "EDITOR" },
    { username: "sales", password: SALES_PASSWORD, name: "کارشناس فروش", role: "SALES" },
    { username: "viewer", password: VIEWER_PASSWORD, name: "ناظر سازمانی", role: "VIEWER" },
  ];

  for (const u of users) {
    const existing = await db.adminUser.findUnique({ where: { username: u.username } });
    if (!existing) {
      await db.adminUser.create({
        data: {
          username: u.username,
          passwordHash: await hashPassword(u.password),
          name: u.name,
          role: u.role,
          isActive: true,
          passwordUpdatedAt: new Date(),
        },
      });
      console.log(`✅ کاربر ساخته شد (${u.username} / ${u.password} — نقش ${u.role})`);
    } else {
      console.log(`ℹ️ کاربر ${u.username} از قبل موجود است`);
    }
  }

  // 2) تنظیمات سایت
  const settings = await db.siteSetting.findUnique({ where: { id: "main" } });
  if (!settings) {
    await db.siteSetting.create({
      data: { id: "main", ...DEFAULT_SETTINGS },
    });
    console.log("✅ تنظیمات سایت ساخته شد");
  } else {
    console.log("ℹ️ تنظیمات سایت موجود است");
  }

  // 3) محصولات نمونه
  const productCount = await db.product.count();
  if (productCount === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      const { id, features, useCases, techStack, createdAt, updatedAt, ...rest } = p;
      await db.product.create({
        data: {
          ...rest,
          features: JSON.stringify(features),
          useCases: JSON.stringify(useCases),
          techStack: JSON.stringify(techStack),
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt),
        },
      });
    }
    console.log(`✅ ${DEFAULT_PRODUCTS.length} محصول نمونه ساخته شد`);
  } else {
    console.log(`ℹ️ ${productCount} محصول موجود است`);
  }

  console.log("🌿 Seed کامل شد");
}

main()
  .catch((e) => {
    console.error("❌ خطا در Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
