// ===========================================================================
// /api/users/[id] — ویرایش، تغییر رمز، فعال/غیرفعال و حذف کاربر
// همه عملیات نیاز به مجوز users.write دارند (فقط ADMIN)
// تغییر رمز/نقش/وضعیت، همه نشست‌های آن کاربر را باطل می‌کند
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { hashPassword, revokeAllUserSessions } from "@/lib/auth";
import { readJsonBody } from "@/lib/csrf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// PUT — ویرایش کاربر (نیاز به مجوز users.write)
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(120).optional(),
  email: z.string().max(200).optional(),
  role: z.enum(["ADMIN", "EDITOR", "SALES", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
  /** تغییر رمز عبور — همه نشست‌های کاربر باطل می‌شود */
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(200)
    .regex(/[A-Za-z]/, "رمز عبور باید شامل حرف باشد")
    .regex(/[0-9]/, "رمز عبور باید شامل عدد باشد")
    .optional(),
});

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "users.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  // محافظت خودی: آخرین ADMIN فعال یا خودِ کاربر جاری نباید غیرفعال/تنزل شود
  if (
    (input.isActive === false || (input.role && input.role !== "ADMIN")) &&
    existing.role === "ADMIN" &&
    existing.isActive &&
    (existing.id === auth.user.id || !input.isActive)
  ) {
    const activeAdmins = await db.adminUser.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      return Response.json(
        { error: "حداقل یک مدیر فعال باید باقی بماند" },
        { status: 409 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.email !== undefined) data.email = input.email.trim();
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password !== undefined) {
    data.passwordHash = await hashPassword(input.password);
    data.passwordUpdatedAt = new Date();
  }

  const updated = await db.$transaction(async (tx) => {
    const user = await tx.adminUser.update({ where: { id }, data });
    // تغییر رمز / نقش / وضعیت → ابطال همه نشست‌ها
    if (input.password !== undefined || input.role !== undefined || input.isActive === false) {
      await tx.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await tx.activityLog.create({
      data: {
        action:
          input.password !== undefined
            ? "تغییر رمز کاربر"
            : "ویرایش کاربر",
        entity: "AdminUser",
        entityId: id,
        details: `${user.username} | فیلدها: ${Object.keys(data).join("، ")}`,
        user: auth.user.username,
      },
    });
    return user;
  });

  // ابطال خارج از تراکنش برای کاهش قفل‌ها (هم‌ارز ابطال درون تراکنش)
  if (input.password !== undefined || input.role !== undefined || input.isActive === false) {
    await revokeAllUserSessions(id);
  }

  return Response.json({ user: serializeUser(updated) });
}

// ---------------------------------------------------------------------------
// DELETE — حذف کاربر (نیاز به مجوز users.write؛ خود و آخرین مدیر ممنوع)
// ---------------------------------------------------------------------------
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "users.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }
  if (existing.id === auth.user.id) {
    return Response.json({ error: "حذف حساب خودتان مجاز نیست" }, { status: 409 });
  }
  if (existing.role === "ADMIN") {
    const activeAdmins = await db.adminUser.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      return Response.json(
        { error: "حداقل یک مدیر فعال باید باقی بماند" },
        { status: 409 }
      );
    }
  }

  await db.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: id } });
    await tx.adminUser.delete({ where: { id } });
    await tx.activityLog.create({
      data: {
        action: "حذف کاربر",
        entity: "AdminUser",
        entityId: id,
        details: `${existing.username} (${existing.role})`,
        user: auth.user.username,
      },
    });
  });

  return Response.json({ success: true });
}
