// ===========================================================================
// /api/messages — ثبت پیام تماس (عمومی + ضداسپم) + فهرست پیام‌ها (پنل)
// مجوزها: POST عمومی با rate limit | GET نیاز به messages.read
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import { serializeMessage, paginated } from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { readJsonBody } from "@/lib/csrf";
import { rateLimit, clientIp, RATE_POLICIES, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST — ثبت پیام جدید از فرم تماس (عمومی، با محافظت ضداسپم)
// ---------------------------------------------------------------------------
const createSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(120),
  email: z
    .string()
    .min(5, "ایمیل نامعتبر است")
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "ایمیل نامعتبر است"),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, "متن پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(5000, "متن پیام بیش از حد طولانی است"),
  /** honeypot — باید خالی باشد؛ ربات‌ها همه فیلدها را پر می‌کنند */
  website: z.string().max(0, "درخواست نامعتبر است").optional(),
});

export async function POST(request: Request) {
  const ip = clientIp(request);

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  // --- ضداسپم: محدودیت نرخ بر اساس IP و ایمیل ---
  const ipCheck = rateLimit(
    `contact:ip:${ip}`,
    RATE_POLICIES.CONTACT_IP.limit,
    RATE_POLICIES.CONTACT_IP.windowMs
  );
  if (!ipCheck.allowed) return tooManyRequests(ipCheck.retryAfterSec);

  const emailCheck = rateLimit(
    `contact:email:${input.email.toLowerCase()}`,
    RATE_POLICIES.CONTACT_EMAIL.limit,
    RATE_POLICIES.CONTACT_EMAIL.windowMs
  );
  if (!emailCheck.allowed) return tooManyRequests(emailCheck.retryAfterSec);

  // --- کنترل پیام تکراری: همان متن از همان ایمیل در ۱۰ دقیقه اخیر ---
  const recentDuplicate = await db.contactMessage.findFirst({
    where: {
      email: input.email.trim().toLowerCase(),
      message: input.message.trim(),
      createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
    },
    select: { id: true },
  });
  if (recentDuplicate) {
    return Response.json(
      { error: "پیام مشابهی چند دقیقه پیش ثبت شده است" },
      { status: 429 }
    );
  }

  const created = await db.$transaction(async (tx) => {
    const message = await tx.contactMessage.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() ?? "",
        company: input.company?.trim() ?? "",
        subject: input.subject?.trim() ?? "",
        message: input.message.trim(),
        ip,
      },
    });
    await tx.activityLog.create({
      data: {
        action: "دریافت پیام جدید",
        entity: "ContactMessage",
        entityId: message.id,
        details: `${message.name} | ${message.subject || "بدون موضوع"}`,
        user: message.name,
      },
    });
    return message;
  });

  return Response.json({ message: serializeMessage(created) }, { status: 201 });
}

// ---------------------------------------------------------------------------
// GET — فهرست صفحه‌بندی‌شده پیام‌ها با فیلتر وضعیت (نیاز به messages.read)
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const auth = await requirePermission(request, "messages.read");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const page = Math.max(1, Math.min(100, Number(url.searchParams.get("page") || "1") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || "20") || 20));
  const statusFilter = url.searchParams.get("status");
  const where =
    statusFilter && ["NEW", "READ", "REPLIED", "ARCHIVED"].includes(statusFilter)
      ? { status: statusFilter }
      : {};

  const [rows, total] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.contactMessage.count({ where }),
  ]);

  return Response.json(
    { ...paginated(rows.map(serializeMessage), total, page, pageSize) }
  );
}
