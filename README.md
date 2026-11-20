# شرکت فناوری اطلاعات دانشگاه صنعتی شریف — وب‌سایت رسمی (شریف‌تک)

وب‌سایت رسمی نمایش محصولات و راهکارهای هوش مصنوعی صنعتی (ایجنت‌های هوشمند، داشبوردهای مدیریتی نفت/گاز/پتروشیمی/پالایشگاه و سیستم‌های هوشمند) به‌همراه پنل مدیریت چندنقشی کامل.

> **نسخه ۱.۰** — بعد از ممیزی جامع امنیتی و بازطراحی کامل، همه موارد بحرانی ممیزی اصلاح شده‌اند. فهرست کامل اصلاحات در انتهای این سند آمده است.

---

## ویژگی‌ها

- **کاملاً مستقل و آفلاین**: هیچ وابستگی خارجی وجود ندارد — بدون CDN، فونت خارجی، سرویس خارجی یا فایل بیرونی. فونت وزیرمتن لوکال، تصاویر محصولات لوکال، دیتابیس SQLite فایل، پس‌زمینه متحرک «شبیه ویدیو» با Canvas بومی (بدون فایل ویدیو).
- **دو تم کامل روشن/تیره**: دکمه تغییر تم در هدر و پنل مدیریت؛ پالت ۴ رنگ سازمانی (زمردی، کهربایی، بنفش، رز + فیروزه‌ای مکمل).
- **چند صفحه‌ای با تعویض آنی**: روتر مجازی hash-based (بدون reload): خانه، محصولات، جزئیات هر محصول، صنایع، درباره ما، پرسش‌های متداول، تماس، پنل مدیریت — با deep-link و انتقال نرم.
- **طراحی سه‌بعدی**: صحنه WebGL (کره شبکه عصبی) با fallback امن CSS، کارت‌های Tilt سه‌بعدی، ماکاپ داشبورد صنعتی در هیرو، پس‌زمینه اورورا + ذرات. همه با رعایت `prefers-reduced-motion`.
- **سئوی کامل + AI-SEO**: متادیتای کامل، Open Graph/Twitter Card، JSON-LD امن (Organization، WebSite، SoftwareApplication، FAQPage هم‌سو با محتوای صفحه)، sitemap و robots با دسترسی ربات‌های AI.
- **پنل مدیریت ۴ نقشی** (تجربه‌ای شبیه وردپرس برای غیرفنی‌ها): مدیر سیستم، کارشناس محتوا، کارشناس فروش، ناظر — داشبورد KPI، مدیریت کامل محصولات (CMS)، صندوق پیام‌ها با یادداشت و اولویت، تنظیمات سایت، مدیریت کاربران، لاگ فعالیت.
- **سرعت**: SSR از دیتابیس، Server-first، فونت variable تکی، انیمیشن‌های CSS، بدون کتابخانه سنگین در مسیر عمومی، صفحه‌بندی سمت سرور.

## تکنولوژی‌ها

| لایه | فناوری |
|---|---|
| فریم‌ورک | Next.js 16.4.6 (App Router) + TypeScript |
| استایل | Tailwind CSS 4 + shadcn/ui + next-themes |
| دیتابیس | Prisma + PostgreSQL (Vercel Postgres) |
| صحنه سه‌بعدی | Three.js + React Three Fiber (با fallback و کنترل کیفیت) |
| احراز هویت | نشست سروری + کوکی HttpOnly + scrypt async |

## راه‌اندازی محلی (بدون هیچ وابستگی بیرونی)

پیش‌نیاز: **Node.js 20+** یا **Bun 1.1+**

```bash
# ۱) نصب وابستگی‌ها
bun install        # یا npm install

# ۲) ساخت دیتابیس + داده اولیه
bun run db:push
bun run db:seed

# ۳) اجرا
bun run dev        # http://localhost:3000
```

### متغیرهای محیطی (`.env`)

| متغیر | توضیح |
|---|---|
| `DATABASE_URL` | رشته اتصال Postgres (مثلاً Vercel Postgres/Neon). برای لوکال: `postgres://user:pass@localhost:5432/shariftech` |
| `AUTH_SECRET` | **اجباری در production** (≥۳۲ کاراکتر تصادفی). در نبود آن، startup متوقف می‌شود (fail-fast). |
| `NEXT_PUBLIC_SITE_URL` | آدرس عمومی سایت برای canonical/sitemap (پیش‌فرض `https://shariftech.ir`) |
| `ALLOW_EMBED` | `true` فقط برای محیط پیش‌نمایش؛ در production نباید تنظیم شود تا `frame-ancestors 'self'` و `X-Frame-Options: SAMEORIGIN` فعال شوند |
| `ADMIN_PASSWORD` / `EDITOR_PASSWORD` / `SALES_PASSWORD` / `VIEWER_PASSWORD` | رمزهای اولیه Seed (فقط برای demo؛ بلافاصله از پنل تغییر دهید) |

تولید راز امن:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### استقرار production (Vercel + Vercel Postgres)

پروژه برای اجرای serverless آماده است (Prisma + PostgreSQL، `postinstall: prisma generate`):

1. در Vercel یک دیتابیس Postgres (Marketplace Neon) بسازید و به پروژه وصل کنید — متغیر `DATABASE_URL` خودکار ست می‌شود.
2. متغیرهای محیطی پروژه: `AUTH_SECRET` (راز ≥۳۲ کاراکتر)، `NEXT_PUBLIC_SITE_URL`، و در صورت نیاز رمزهای Seed.
3. ساخت جداول و داده اولیه روی دیتابیس ابری:
   ```bash
   vercel env pull .env.local   # دریافت DATABASE_URL
   bun run db:push
   ADMIN_PASSWORD=... EDITOR_PASSWORD=... SALES_PASSWORD=... VIEWER_PASSWORD=... bun run db:seed
   ```
4. Deploy از طریق داشبورد (اتصال GitHub) یا `vercel --prod`.

نکته‌های استقرار:
- در serverless فایل SQLite قابل استفاده نیست؛ این پروژه روی Vercel از **Postgres** استفاده می‌کند.
- پشت reverse-proxy باید `X-Forwarded-For` و `X-Forwarded-Proto` ست شود (برای IP واقعی و تشخیص HTTPS کوکی Secure).
- محدودکننده نرخ درون‌حافظه‌ای برای تک‌نمونه است؛ برای چندنمونه‌ای، Redis/WAF جایگزین کنید.
- قبل از انتشار: `AUTH_SECRET` قوی، تغییر همه رمزهای seed، و فعال بودن HTTPS الزامی است.
- در production اطلاعات دموی صفحه ورود نمایش داده نمی‌شود (نیاز به `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` دارد).

---

## حساب‌های نسخه نمایشی (پنل مدیریت در `/#/admin`)

| کاربر | رمز | نقش | دسترسی |
|---|---|---|---|
| `admin` | `Sharif@1404` | مدیر سیستم | کامل — همه بخش‌ها |
| `editor` | `Editor@1404` | کارشناس محتوا | محصولات (ایجاد/ویرایش)، مشاهده پیام‌ها |
| `sales` | `Sales@1404` | کارشناس فروش | پیام‌ها (مشاهده + وضعیت/اولویت/یادداشت) |
| `viewer` | `Viewer@1404` | ناظر | فقط مشاهده |

> این رمزها فقط **پیش‌فرض محلی/dummy seed** هستند و در نمونه زنده production معتبر نیستند؛ رمزهای محیط واقعی با متغیرهای محیطی ست می‌شوند. تغییر رمز از پنل، همه نشست‌های همان کاربر را باطل می‌کند.

---

## معماری

```text
src/
  app/
    page.tsx              # SSR داده‌ها + JSON-LD امن + SiteShell
    layout.tsx            # فونت لوکال + ThemeProvider + متادیتا
    api/
      auth/{login,logout,me}    # نشست کوکی HttpOnly
      products(+[id])           # CRUD + صفحه‌بندی + RBAC
      messages(+[id])           # فرم عمومی ضداسپم + صندوق
      settings                  # عمومی GET / ADMIN PUT با allowlist URL
      users(+[id])              # مدیریت کاربران (ADMIN)
      activity                  # لاگ فعالیت
      stats / health            # داشبورد / سلامت سرویس
  components/
    site/                 # صفحات و بخش‌های عمومی (روتر مجازی)
    admin/                # پنل مدیریت (login, dashboard, products, messages, settings, users, activity)
    ui/                   # shadcn/ui
  lib/
    auth.ts               # نشست سروری + scrypt + کوکی امن
    permissions.ts        # ماتریس نقش→مجوز (RBAC)
    rate-limit.ts         # پنجره لغزان per-IP/per-account
    csrf.ts               # بررسی Origin + سقف اندازه بدنه
    jsonld.ts             # سریال‌سازی امن JSON-LD + allowlist URL
    serializers.ts / navigation.ts / accents.ts / faq-content.ts
  db/seed.ts              # داده اولیه (کاربران، تنظیمات، ۹ محصول)
prisma/schema.prisma      # مدل‌ها + index ها
```

## امنیت (اصلاحات ممیزی)

| # | مورد ممیزی | وضعیت |
|---|---|---|
| ۱ | وابستگی‌های آسیب‌پذیر (Next/React/sharp) | ✅ Next `16.4.6`، React `19.3.1`، sharp `0.35.5` |
| ۲ | راز پیش‌فرض امضای توکن | ✅ حذف fallback؛ fail-fast در production |
| ۳ | توکن در localStorage + پذیرش token در URL | ✅ نشست سروری + کوکی HttpOnly/SameSite؛ توکن هرگز به JS/URL نمی‌رود |
| ۴ | توکن بدون revoke و بررسی دوباره کاربر | ✅ جدول Session با hash توکن؛ logout/تغییر رمز/غیرفعال‌سازی → ابطال؛ وضعیت active کاربر در هر درخواست بررسی می‌شود |
| ۵ | RBAC ناقص | ✅ ماتریس مجوز در `permissions.ts` و enforce سمت سرور در همه Route ها |
| ۶ | محدودسازی ورود | ✅ per-IP + per-account با پنجره لغزان؛ تایمینگ هموار برای کاربر ناموجود؛ scrypt async |
| ۷ | فرم تماس بدون ضداسپم | ✅ rate limit IP+ایمیل، honeypot، تشخیص پیام تکراری، سقف Content-Length |
| ۸ | نبود CSP و X-Frame-Options | ✅ CSP کامل + frame-ancestors (env-driven) + XFO در production |
| ۹ | تزریق JSON-LD | ✅ سریال‌سازی امن (`< > & U+2028/9`) + validate URLهای اجتماعی با allowlist https |
| ۱۰ | دیتابیس Preview در artifact | ✅ مستندسازی + جداسازی محیط؛ seed رمز محیطی |
| ۱۱ | query logging در production | ✅ فقط error/warn |
| ۱۲ | تراکنش mutation + audit log | ✅ همه تغییرات در `db.$transaction` |

## تست‌های انجام‌شده (تأیید محیطی)

- ورود/خروج با ۴ نقش؛ ابطال نشست پس از خروج (کوکی قدیمی → 401)
- 403 برای عملیات خارج از مجوز (settings/messages/users با کاربر sales)
- Rate limit ورود: پاسخ 429 پس از حد مجاز (per-IP و per-account)
- CSRF: درخواست با Origin خارجی → 403
- JSON-LD معتبر (parse موفق) + هم‌سویی با FAQ صفحه
- فرم تماس end-to-end + ثبت در صندوق + نشانه‌گذاری خوانده‌شده
- CRUD محصول توسط کارشناس محتوا + حذف فقط توسط مدیر
- تم روشن/تیره در سایت و پنل؛ ریسپانسیو موبایل با ناوبری پایین
- عدم خطای hydration با deep-link (مثل بازکردن مستقیم `/#/admin`)
