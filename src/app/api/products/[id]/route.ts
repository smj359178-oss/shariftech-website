// ===========================================================================
// /api/products/[id] — دریافت، ویرایش و حذف تک‌محصول
// مجوزها: GET عمومی (فقط منتشرشده) | PUT نیاز به products.write |
//         DELETE نیاز به products.delete (فقط ADMIN)
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import {
  serializeProduct,
  slugify,
  ensureUniqueSlug,
} from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { readJsonBody } from "@/lib/csrf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET — عمومی فقط منتشرشده؛ پیش‌نویس‌ها نیازمند مجوز products.read
// ---------------------------------------------------------------------------
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const row = await db.product.findUnique({ where: { id } });
  if (!row) {
    return Response.json({ error: "محصول یافت نشد" }, { status: 404 });
  }
  if (row.status !== "PUBLISHED") {
    const auth = await requirePermission(request, "products.read");
    if (!auth.ok) {
      return Response.json({ error: "محصول یافت نشد" }, { status: 404 });
    }
  }
  return Response.json({ product: serializeProduct(row) });
}

// ---------------------------------------------------------------------------
// PUT — ویرایش جزئی محصول (نیاز به مجوز products.write)
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  title: z.string().min(2, "عنوان باید حداقل ۲ کاراکتر باشد").max(200).optional(),
  slug: z.string().max(200).optional(),
  subtitle: z.string().max(200).optional(),
  category: z.enum(["AI_AGENT", "DASHBOARD", "SMART_SYSTEM", "CUSTOM"]).optional(),
  summary: z.string().max(1000).optional(),
  description: z.string().max(10000).optional(),
  features: z.array(z.string().max(120)).max(12).optional(),
  useCases: z
    .array(z.object({ title: z.string().max(120), description: z.string().max(600) }))
    .max(6)
    .optional(),
  techStack: z.array(z.string().max(60)).max(12).optional(),
  image: z.string().max(300).optional(),
  icon: z.string().max(60).optional(),
  accent: z.enum(["emerald", "amber", "teal", "cyan", "rose", "violet"]).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
  sort: z.number().int().min(0).max(9999).optional(),
});

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "products.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "محصول یافت نشد" }, { status: 404 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  const data: Record<string, unknown> = {};

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.slug !== undefined) {
    data.slug = await ensureUniqueSlug(slugify(input.slug), id);
  }
  if (input.subtitle !== undefined) data.subtitle = input.subtitle.trim();
  if (input.category !== undefined) data.category = input.category;
  if (input.summary !== undefined) data.summary = input.summary.trim();
  if (input.description !== undefined) data.description = input.description;
  if (input.features !== undefined) data.features = JSON.stringify(input.features);
  if (input.useCases !== undefined) data.useCases = JSON.stringify(input.useCases);
  if (input.techStack !== undefined) data.techStack = JSON.stringify(input.techStack);
  if (input.image !== undefined) data.image = input.image.trim();
  if (input.icon !== undefined) data.icon = input.icon;
  if (input.accent !== undefined) data.accent = input.accent;
  if (input.featured !== undefined) data.featured = input.featured;
  if (input.status !== undefined) data.status = input.status;
  if (input.sort !== undefined) data.sort = input.sort;

  const updated = await db.$transaction(async (tx) => {
    const product = await tx.product.update({ where: { id }, data });
    await tx.activityLog.create({
      data: {
        action: "ویرایش محصول",
        entity: "Product",
        entityId: id,
        details: `${product.title} | فیلدها: ${Object.keys(data).join("، ") || "-"}`,
        user: auth.user.username,
      },
    });
    return product;
  });

  return Response.json({ product: serializeProduct(updated) });
}

// ---------------------------------------------------------------------------
// DELETE — حذف محصول (نیاز به مجوز products.delete — فقط ADMIN)
// ---------------------------------------------------------------------------
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requirePermission(request, "products.delete");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "محصول یافت نشد" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.product.delete({ where: { id } });
    await tx.activityLog.create({
      data: {
        action: "حذف محصول",
        entity: "Product",
        entityId: id,
        details: existing.title,
        user: auth.user.username,
      },
    });
  });

  return Response.json({ success: true });
}
