// ===========================================================================
// GET /api/stats — آمار داشبورد (نیاز به مجوز dashboard.read)
// ===========================================================================
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { serializeMessage } from "@/lib/serializers";
import type { DashboardStats } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY_LABELS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

export async function GET(request: Request) {
  const auth = await requirePermission(request, "dashboard.read");
  if (!auth.ok) return auth.response;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    productsTotal,
    productsPublished,
    messagesTotal,
    messagesNew,
    messagesWeek,
    sessionsActive,
    recentRows,
    weekRows,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { createdAt: { gte: weekAgo } } }),
    db.session.count({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
    }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.contactMessage.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
  ]);

  // نمودار هفتگی: پیام‌های هر روز هفته اخیر
  const dailyCounts = new Map<string, number>();
  for (const row of weekRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
  }
  const weeklyMessages: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    weeklyMessages.push({
      day: DAY_LABELS[date.getDay()],
      count: dailyCounts.get(key) ?? 0,
    });
  }

  const stats: DashboardStats = {
    productsTotal,
    productsPublished,
    messagesTotal,
    messagesNew,
    messagesWeek,
    sessionsActive,
    recentMessages: recentRows.map(serializeMessage),
    weeklyMessages,
  };

  return Response.json({ stats });
}
