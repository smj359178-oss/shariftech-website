// ===========================================================================
// /api/products — فهرست عمومی/کامل محصولات + ایجاد محصول (پنل مدیریت)
// مجوزها: GET عمومی (منتشرشده) | GET all=1 نیاز به products.read |
//         POST نیاز به products.write
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import {
  serializeProduct,
  slugify,
  ensureUniqueSlug,
  paginated,
} from "@/lib/serializers";
import { requirePermission } from "@/lib/permissions";
import { readJsonBody } from "@/lib/csrf";
import { rateLimit, clientIp, RATE_POLICIES, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// GET — عمومی: فقط منتشرشده (با صفحه‌بندی) | با auth و all=1: همه محصولات
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const url = new URL(request.url);
  const wantsAll = url.searchParams.get("all") === "1";
  const page = Math.max(1, Math.min(100, Number(url.searchParams.get("page") || "1") || 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("pageSize") || "50") || 50)
  );

  if (wantsAll) {
    const auth = await requirePermission(request, "products.read");
    if (!auth.ok) return auth.response;

    const [rows, total] = await Promise.all([
      db.product.findMany({
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count(),
    ]);
    return Response.json(
      { ...paginated(rows.map(serializeProduct), total, page, pageSize), products: rows.map(serializeProduct) }
    );
  }

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where: { status: "PUBLISHED" } }),
  ]);

  const products = rows.map(serializeProduct);
  return Response.json({
    ...paginated(products, total, page, pageSize),
    products,
  });
}

// ---------------------------------------------------------------------------
// POST — ایجاد محصول (نیاز به مجوز products.write)
// ---------------------------------------------------------------------------
const createSchema = z.object({
  title: z.string().min(2, "عنوان باید حداقل ۲ کاراکتر باشد").max(200),
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

export async function POST(request: Request) {
  const auth = await requirePermission(request, "products.write");
  if (!auth.ok) return auth.response;

  const ip = clientIp(request);
  const rl = rateLimit(`products-write:ip:${ip}`, 30, 60_000);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSec);

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  const slug = await ensureUniqueSlug(slugify(input.slug?.trim() || input.title));

  const created = await db.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        title: input.title.trim(),
        slug,
        subtitle: input.subtitle?.trim() ?? "",
        category: input.category ?? "AI_AGENT",
        summary: input.summary?.trim() ?? "",
        description: input.description ?? "",
        features: JSON.stringify(input.features ?? []),
        useCases: JSON.stringify(input.useCases ?? []),
        techStack: JSON.stringify(input.techStack ?? []),
        image: input.image?.trim() ?? "",
        icon: input.icon ?? "Cpu",
        accent: input.accent ?? "emerald",
        featured: input.featured ?? false,
        status: input.status ?? "PUBLISHED",
        sort: input.sort ?? 100,
      },
    });
    await tx.activityLog.create({
      data: {
        action: "ایجاد محصول",
        entity: "Product",
        entityId: product.id,
        details: product.title,
        user: auth.user.username,
      },
    });
    return product;
  });

  return Response.json({ product: serializeProduct(created) }, { status: 201 });
}
