// ===========================================================================
// سریال‌سازی امن JSON-LD
//
// JSON.stringify به‌تنهایی کاراکترهای خطرناک را escape نمی‌کند؛ متنی که از
// پنل مدیریت آمده و حاوی `</script>` باشد می‌تواند ساختار تگ اسکریپت را
// بشکند و به Stored XSS منجر شود. این سریالایز همه کاراکترهای حساس را
// امن‌سازی می‌کند تا خروجی در <script type="application/ld+json"> بی‌خطر باشد.
// ===========================================================================

/**
 * Escape کاراکترهای خطرناک برای قرارگیری در JSON داخل تگ <script>:
 *  • `<` و `>` — جلوگیری از شکستن تگ و اجرای HTML
 *  • `&` — جلوگیری از تفسیر entity های HTML
 *  • U+2028 / U+2029 — معتبر در JSON ولی خطازا در JavaScript literal
 */
function escapeJsonForScript(json: string): string {
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** سریال‌سازی بی‌خطر داده ساختاریافته برای تگ script */
export function safeJsonLd(data: unknown): string {
  return escapeJsonForScript(JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// اعتبارسنجی URL برای لینک‌های اجتماعی — فقط https مجاز است
// (از href مستقیم در Footer/Header استفاده می‌شوند؛ scheme جعلی مثل
//  javascript: باید کاملاً مسدود باشد)
// ---------------------------------------------------------------------------
const ALLOWED_SOCIAL_HOSTS = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "instagram.com",
  "www.instagram.com",
  "t.me",
  "telegram.me",
  "x.com",
  "twitter.com",
  "www.x.com",
  "www.twitter.com",
  "youtube.com",
  "www.youtube.com",
  "github.com",
  "www.github.com",
  "aparat.com",
  "www.aparat.com",
]);

export function sanitizeSocialUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const value = raw.trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    if (!ALLOWED_SOCIAL_HOSTS.has(url.hostname.toLowerCase())) return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** پاکسازی متن آزاد: حذف کنترل‌کاراکترها و محدودیت طول */
export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .slice(0, maxLength);
}
