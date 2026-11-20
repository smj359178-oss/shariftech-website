import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shariftech.ir";

// ===========================================================================
// نقشه سایت — معماری تک‌مسیر (Single-Route)
//
// صفحات داخلی سایت (#/products، #/about، …) با روتر مجازی سمت کلاینت
// تعویض می‌شوند و طبق استاندارد sitemap.org، آدرس‌های دارای fragment (#)
// در نقشه سایت مجاز نیستند و توسط موتورهای جستجو ایندکس نمی‌شوند.
//
// بنابراین تنها URL متعارف (canonical) ثبت می‌شود؛ ایندکس‌پذیری محصولات
// از طریق موارد زیر تضمین شده است:
//  ۱) رندر سمت سرور (SSR) همه محتوای صفحه اصلی — موتورها و ربات‌های AI
//     کل محتوا را بدون اجرای JS می‌بینند
//  ۲) JSON-LD کامل در همان صفحه: ItemList محصولات + FAQPage هم‌سو با
//     محتوای قابل‌مشاهده
//  ۳) robots.txt: دسترسی کامل به ربات‌های جستجو و هوش مصنوعی (GPTBot،
//     ClaudeBot، PerplexityBot و …)
// ===========================================================================
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
