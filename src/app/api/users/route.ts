// ===========================================================================
// /api/users — مدیریت کاربران پنل (نیاز به مجوز users.write برای نوشتن)
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/auth";
import { readJsonBody } from "@/lib/csrf";
import type { AdminUserRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// GET — فهرست کاربران (نیاز به مجوز users.read)
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const auth = await requirePermission(request, "users.read");
  if (!auth.ok) return auth.response;

  const rows = await db.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  const users: AdminUserRecord[] = rows.map((row) => ({
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));
  return Response.json({ users });
}

// ---------------------------------------------------------------------------
// POST — ایجاد کاربر جدید (نیاز به مجوز users.write)
// ---------------------------------------------------------------------------
const createSchema = z.object({
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .max(60)
    .regex(/^[a-z0-9._-]+$/, "نام کاربری فقط حروف لاتین کوچک، عدد، نقطه و خط تیره"),
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(120),
  email: z.string().max(200).optional(),
  role: z.enum(["ADMIN", "EDITOR", "SALES", "VIEWER"]),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(200)
    .regex(/[A-Za-z]/, "رمز عبور باید شامل حرف باشد")
    .regex(/[0-9]/, "رمز عبور باید شامل عدد باشد"),
});

export async function POST(request: Request) {
  const auth = await requirePermission(request, "users.write");
  if (!auth.ok) return auth.response;

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  const username = input.username.toLowerCase();
  const existing = await db.adminUser.findUnique({ where: { username } });
  if (existing) {
    return Response.json({ error: "این نام کاربری قبلاً ثبت شده است" }, { status: 409 });
  }

  const created = await db.$transaction(async (tx) => {
    const user = await tx.adminUser.create({
      data: {
        username,
        passwordHash: await hashPassword(input.password),
        name: input.name.trim(),
        email: input.email?.trim() ?? "",
        role: input.role,
        isActive: true,
        passwordUpdatedAt: new Date(),
      },
    });
    await tx.activityLog.create({
      data: {
        action: "ایجاد کاربر",
        entity: "AdminUser",
        entityId: user.id,
        details: `${user.username} | نقش: ${user.role}`,
        user: auth.user.username,
      },
    });
    return user;
  });

  return Response.json({ user: serializeUser(created) }, { status: 201 });
}
