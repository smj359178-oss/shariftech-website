// ===========================================================================
// /api/activity — لاگ فعالیت‌ها با صفحه‌بندی و فیلتر (نیاز به activity.read)
// ===========================================================================
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { paginated } from "@/lib/serializers";
import type { ActivityEntry } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requirePermission(request, "activity.read");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const page = Math.max(1, Math.min(100, Number(url.searchParams.get("page") || "1") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || "20") || 20));
  const entity = url.searchParams.get("entity");
  const search = url.searchParams.get("q")?.trim().slice(0, 80);

  const where: Record<string, unknown> = {};
  if (entity && ["Product", "ContactMessage", "AdminUser", "SiteSetting"].includes(entity)) {
    where.entity = entity;
  }
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { details: { contains: search } },
      { user: { contains: search } },
    ];
  }

  const [rows, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.activityLog.count({ where }),
  ]);

  const items: ActivityEntry[] = rows.map((r) => ({
    id: r.id,
    action: r.action,
    entity: r.entity,
    entityId: r.entityId,
    details: r.details,
    user: r.user,
    createdAt: r.createdAt.toISOString(),
  }));

  return Response.json({ ...paginated(items, total, page, pageSize) });
}
