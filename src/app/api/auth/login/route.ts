// ===========================================================================
// POST /api/auth/login — ورود به پنل مدیریت (نشست کوکی امن)
// محافظت‌ها: Rate limit per-IP + per-account، scrypt async،
// تایمینگ هموار، CSRF same-origin، سقف اندازه بدنه
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  buildSessionCookie,
  isRequestHttps,
  verifyPassword,
  equalizeTiming,
} from "@/lib/auth";
import { rateLimit, clientIp, RATE_POLICIES, tooManyRequests } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/csrf";
import { permissionsOf } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است").max(100),
  password: z.string().min(1, "رمز عبور الزامی است").max(200),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();

  // --- CSRF: Origin باید هم‌مبدأ باشد ---
  if (!readJsonBody.call) {
    /* unreachable — برای سازگاری تایپ */
  }
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  // --- Rate limit: هر IP و هر حساب ---
  const ipCheck = rateLimit(
    `login:ip:${ip}`,
    RATE_POLICIES.LOGIN_IP.limit,
    RATE_POLICIES.LOGIN_IP.windowMs
  );
  if (!ipCheck.allowed) {
    return tooManyRequests(ipCheck.retryAfterSec);
  }

  const parsed = loginSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return Response.json(
      { error: "نام کاربری و رمز عبور الزامی است" },
      { status: 400 }
    );
  }

  const username = parsed.data.username.trim().toLowerCase();
  const accountCheck = rateLimit(
    `login:acc:${username}`,
    RATE_POLICIES.LOGIN_ACCOUNT.limit,
    RATE_POLICIES.LOGIN_ACCOUNT.windowMs
  );
  if (!accountCheck.allowed) {
    return tooManyRequests(accountCheck.retryAfterSec);
  }

  const user = await db.adminUser.findUnique({ where: { username } });

  // تایمینگ هموار: برای کاربر ناموجود هم عملیات scrypt انجام می‌شود
  const passwordOk = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : await (async () => {
        await equalizeTiming();
        return false;
      })();

  if (!user || !passwordOk) {
    return Response.json(
      { error: "نام کاربری یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  }

  if (!user.isActive) {
    return Response.json(
      { error: "حساب کاربری شما غیرفعال شده است؛ با مدیر سیستم تماس بگیرید" },
      { status: 403 }
    );
  }

  // --- ایجاد نشست سروری + کوکی HttpOnly ---
  const { token, expiresAt } = await createSession(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    {
      userAgent: request.headers.get("user-agent") || undefined,
      ip,
    }
  );

  await db.$transaction([
    db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
    db.activityLog.create({
      data: {
        action: "ورود به سیستم",
        entity: "AdminUser",
        entityId: user.id,
        details: "ورود موفق به پنل مدیریت",
        user: user.username,
      },
    }),
  ]);

  const response = Response.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: permissionsOf(user.role),
    },
  });

  response.headers.set(
    "Set-Cookie",
    buildSessionCookie(token, expiresAt, isRequestHttps(request))
  );
  return response;
}
