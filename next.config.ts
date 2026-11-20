import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// سرصفحه‌های امنیتی
// CSP: اسکریپت/استایل inline برای هایدراسیون Next لازم است؛ eval فقط در dev
// frame-ancestors: در محیط پیش‌نمایش/سندباکس باز است؛ در production با
// متغیر محیطی ALLOW_EMBED=false (یا عدم تنظیم) به 'self' محدود می‌شود.
// ---------------------------------------------------------------------------
const isProd = process.env.NODE_ENV === "production";
const allowEmbed = process.env.ALLOW_EMBED === "true" || !isProd;
const frameAncestors = allowEmbed ? "*" : "'self'";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      `frame-ancestors ${frameAncestors}`,
    ].join("; "),
  },
  ...(allowEmbed
    ? []
    : [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]),
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // پنل پیش‌نمایش سندباکس روی دامنه space-z.ai اجرا می‌شود؛
  // اجازه دسترسی به منابع dev (مثل فونت DevTools) فقط در محیط توسعه
  ...(isProd
    ? {}
    : {
        allowedDevOrigins: [
          "preview-chat-fbb09537-9142-42cc-8243-87988ae11276.space-z.ai",
          "*.space-z.ai",
        ],
      }),
  // مسیر ریشه Turbopack به‌صورت قطعی تعیین می‌شود تا پوشه‌های node_modules
  // خارج از پروژه باعث خطای workspace-root inference نشوند
  turbopack: {
    root: rootDir,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
