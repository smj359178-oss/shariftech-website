// ===========================================================================
// سیستم احراز هویت پنل مدیریت — نسخه امن (Session-Cookie)
//
// ویژگی‌های امنیتی:
//  • توکن نشست تصادفی ۳۲ بایتی؛ فقط SHA-256 آن در دیتابیس ذخیره می‌شود
//  • کوکی HttpOnly + SameSite=Lax (+ Secure روی HTTPS) — توکن هرگز از JS
//    قابل خواندن نیست و در URL هم پذیرفته نمی‌شود
//  • انقضا و ابطال (revoke) سمت سرور؛ خروج، تغییر رمز یا غیرفعال‌سازی
//    کاربر همه نشست‌های مرتبط را باطل می‌کند
//  • scrypt غیرهمزمان + تایمینگ‌هموار برای جلوگیری از enumeration
//  • در production نبودِ AUTH_SECRET سبز توقف startup می‌شود (fail-fast)
// ===========================================================================
import crypto from "crypto";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// راز امضا: در production الزامی است — بدون مقدار پیش‌فرض ناامن
// ---------------------------------------------------------------------------
const AUTH_SECRET = (() => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[Security] AUTH_SECRET تعریف نشده است. یک راز تصادفی قوی (≥32 بایت) تنظیم کنید."
      );
    }
    // فقط برای dev/sandbox: راز موقت تصادفی در همان پردازش
    return crypto.randomBytes(32).toString("hex");
  }
  if (secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[Security] AUTH_SECRET باید حداقل ۳۲ کاراکتر باشد.");
    }
  }
  return secret;
})();

export const SESSION_COOKIE = "sharif_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // ۸ ساعت

// ---------------------------------------------------------------------------
// هش رمز عبور — scrypt غیرهمزمان با salt تصادفی
// ---------------------------------------------------------------------------
const scryptAsync = crypto.scrypt as unknown as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  callback: (err: Error | null, derivedKey: Buffer) => void
) => void;

function scryptKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptAsync(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scryptKey(password, salt);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

/** مقایسه با تایمینگ ثابت */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const candidate = await scryptKey(password, salt);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

/**
 * یک hash نمونه برای کاربر ناموجود — همیشه اجرا می‌شود تا زمان پاسخ
 * بین «کاربر ناموجود» و «رمز اشتباه» قابل تشخیص نباشد (timing enumeration).
 */
const DUMMY_HASH = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
export async function equalizeTiming(): Promise<void> {
  try {
    await verifyPassword("dummy-timing-equalizer", DUMMY_HASH);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// نشست‌های سرور (Session Store در دیتابیس)
// ---------------------------------------------------------------------------
function sha256(input: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(input).digest("hex");
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
  sessionId: string;
}

/**
 * ایجاد نشست جدید. مقدار بازگشتی «توکن خام» است که فقط یک‌بار
 * در کوکی Set-Cookie قرار می‌گیرد و هرگز در دیتابیس ذخیره نمی‌شود.
 */
export async function createSession(
  user: { id: string; username: string; name: string; role: string },
  meta: { userAgent?: string; ip?: string } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      userAgent: (meta.userAgent || "").slice(0, 300),
      ip: (meta.ip || "").slice(0, 60),
    },
  });

  // پاکسازی نشست‌های منقضی (سبک و تصادفی برای کاهش بار)
  if (Math.random() < 0.1) {
    db.session
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => undefined);
  }

  return { token, expiresAt };
}

/** اعتبارسنجی توکن نشست + بررسی فعال بودن کاربر و نقش به‌روز */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const session = await db.session.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: true },
    });
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() < Date.now()) return null;
    if (!session.user.isActive) return null;
    return {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      role: session.user.role,
      sessionId: session.id,
    };
  } catch {
    return null;
  }
}

/** ابطال یک نشست مشخص */
export async function revokeSession(sessionId: string): Promise<void> {
  await db.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** ابطال همه نشست‌های یک کاربر (تغییر رمز / غیرفعال‌سازی) */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// استخراج نشست از Request (فقط کوکی — هرگز از query یا header سفارشی)
// ---------------------------------------------------------------------------
function parseCookieHeader(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export async function getAuthUser(request: Request): Promise<SessionUser | null> {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  return verifySessionToken(token);
}

// ---------------------------------------------------------------------------
// کوکی امن
// ---------------------------------------------------------------------------
export function buildSessionCookie(
  token: string,
  expiresAt: Date,
  isHttps: boolean
): string {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (isHttps) attrs.push("Secure");
  return attrs.join("; ");
}

export function buildClearSessionCookie(isHttps: boolean): string {
  const attrs = [
    `${SESSION_COOKIE}=`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
  ];
  if (isHttps) attrs.push("Secure");
  return attrs.join("; ");
}

export function isRequestHttps(request: Request): boolean {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    new URL(request.url).protocol.replace(":", "");
  return proto === "https";
}

/** پاسخ استاندارد 401 */
export function unauthorized(): Response {
  return Response.json({ error: "احراز هویت لازم است" }, { status: 401 });
}
