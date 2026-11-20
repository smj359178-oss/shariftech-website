// ===========================================================================
// /api/messages/[id] — تغییر وضعیت/اولویت/یادداشت و حذف پیام (پنل مدیریت)
// مجوزها: PUT نیاز به messages.write | DELETE نیاز به messages.delete
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import { serializeMessage } from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { readJsonBody } from "@/lib/csrf";
import { MESSAGE_STATUS_LABELS, MESSAGE_PRIORITY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// PUT — تغییر وضعیت / اولویت / یادداشت داخلی (نیاز به messages.write)
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  note: z.string().max(2000).optional(),
});

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "messages.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "پیام یافت نشد" }, { status: 404 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return Response.json({ error: "داده پیام نامعتبر است" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
  if (parsed.data.note !== undefined) data.note = parsed.data.note;

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "فیلدی برای بروزرسانی ارسال نشده است" }, { status: 400 });
  }

  const updated = await db.$transaction(async (tx) => {
    const message = await tx.contactMessage.update({ where: { id }, data });
    await tx.activityLog.create({
      data: {
        action: "به‌روزرسانی پیام",
        entity: "ContactMessage",
        entityId: id,
        details: `${existing.name} | ${
          parsed.data.status ? MESSAGE_STATUS_LABELS[parsed.data.status] : ""
        }${parsed.data.priority ? " / اولویت: " + MESSAGE_PRIORITY_LABELS[parsed.data.priority] : ""}${
          parsed.data.note !== undefined ? " / یادداشت" : ""
        }`,
        user: auth.user.username,
      },
    });
    return message;
  });

  return Response.json({ message: serializeMessage(updated) });
}

// ---------------------------------------------------------------------------
// DELETE — حذف پیام (نیاز به messages.delete — فقط ADMIN)
// ---------------------------------------------------------------------------
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "messages.delete");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "پیام یافت نشد" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.contactMessage.delete({ where: { id } });
    await tx.activityLog.create({
      data: {
        action: "حذف پیام",
        entity: "ContactMessage",
        entityId: id,
        details: existing.name,
        user: auth.user.username,
      },
    });
  });

  return Response.json({ success: true });
}
