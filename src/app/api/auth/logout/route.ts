// ===========================================================================
// POST /api/auth/logout — ابطال نشست سروری + پاک‌سازی کوکی
// ===========================================================================
import { getAuthUser, revokeSession, buildClearSessionCookie, isRequestHttps } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (user) {
    try {
      await revokeSession(user.sessionId);
      await db.activityLog.create({
        data: {
          action: "خروج از سیستم",
          entity: "AdminUser",
          entityId: user.id,
          details: "خروج از پنل مدیریت",
          user: user.username,
        },
      });
    } catch {
      /* خروج نباید به دلیل خطای دیتابیس شکست بخورد */
    }
  }

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    buildClearSessionCookie(isRequestHttps(request))
  );
  return response;
}
