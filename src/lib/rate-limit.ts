// ===========================================================================
// محدودکننده نرخ درخواست (Rate Limiter) — پنجره لغزان درون‌حافظه‌ای
//
// مناسب برای تک‌نمونه (single instance). برای استقرار چندنمونه‌ای،
// این ماژول باید با Redis یا لایه WAF جایگزین شود (مستند README).
// نقشه‌ها به‌صورت دوره‌ای تمیز می‌شوند تا رشد حافظه نداشته باشند.
// ===========================================================================

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();
let lastPrune = Date.now();

function prune(now: number, windowMs: number) {
  // pruning فقط هر ۶۰ ثانیه یا وقتی نقشه بزرگ شده است
  if (now - lastPrune < 60_000 && buckets.size < 5_000) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs * 4);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * بررسی مصرف در یک پنجره زمانی.
 * @param key کلید یکتا (مثلاً `login:ip:1.2.3.4` یا `contact:ip:...`)
 * @param limit حداکثر تعداد مجاز در پنجره
 * @param windowMs طول پنجره به میلی‌ثانیه
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  prune(now, windowMs);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: limit - bucket.timestamps.length,
    retryAfterSec: 0,
  };
}

/** استخراج IP کلاینت — فقط از پراکسی مورد اعتماد (Gateway داخلی) */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// ---------------------------------------------------------------------------
// سیاست‌های آماده پروژه
// ---------------------------------------------------------------------------
export const RATE_POLICIES = {
  /** ورود: ۱۰ تلاش در ۱۰ دقیقه برای هر IP */
  LOGIN_IP: { limit: 10, windowMs: 10 * 60_000 },
  /** ورود: ۶ تلاش در ۱۰ دقیقه برای هر نام کاربری */
  LOGIN_ACCOUNT: { limit: 6, windowMs: 10 * 60_000 },
  /** فرم تماس: ۵ پیام در ساعت برای هر IP */
  CONTACT_IP: { limit: 5, windowMs: 60 * 60_000 },
  /** فرم تماس: ۳ پیام در ساعت برای هر ایمیل */
  CONTACT_EMAIL: { limit: 3, windowMs: 60 * 60_000 },
  /** APIهای عمومی: ۱۲۰ درخواست در دقیقه برای هر IP */
  PUBLIC_API: { limit: 120, windowMs: 60_000 },
} as const;

/** پاسخ استاندارد 429 با هدر Retry-After */
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: "درخواست‌های بیش از حد؛ لطفاً کمی بعد دوباره تلاش کنید" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
