// ===========================================================================
// سریال‌ایزرهای مشترک بین Route Handler ها — بدون تکرار کد
// ===========================================================================
import type {
  Product,
  ContactMessage,
  ProductUseCase,
  AdminUserRecord,
} from "@/lib/types";
import type {
  Product as ProductRow,
  ContactMessage as MessageRow,
  AdminUser as UserRow,
} from "@prisma/client";

function parseJsonArray<T>(raw: string, guard: (item: unknown) => item is T): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(guard);
  } catch {
    return [];
  }
}

const isString = (item: unknown): item is string => typeof item === "string";

const isUseCase = (item: unknown): item is ProductUseCase =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as { title?: unknown }).title === "string" &&
  typeof (item as { description?: unknown }).description === "string";

export function serializeProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    summary: row.summary,
    description: row.description,
    features: parseJsonArray(row.features, isString),
    useCases: parseJsonArray(row.useCases, isUseCase),
    techStack: parseJsonArray(row.techStack, isString),
    image: row.image,
    icon: row.icon,
    accent: row.accent,
    featured: row.featured,
    status: row.status,
    sort: row.sort,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeMessage(row: MessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    subject: row.subject,
    message: row.message,
    status: row.status,
    priority: row.priority,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeUser(row: UserRow): AdminUserRecord {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/** تولید اسلاگ از عنوان: فقط حروف لاتین، اعداد و خط تیره */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // عنوان فارسی => اسلاگ خالی => پسوند تصادفی
  if (!slug) return `product-${Date.now().toString(36)}`;
  return slug.slice(0, 180);
}

/** تضمین یکتایی اسلاگ با افزودن پسوند -2، -3 و ... */
export async function ensureUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const { db } = await import("@/lib/db");
  let candidate = base;
  let counter = 1;
  for (;;) {
    const existing = await db.product.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`.slice(0, 190);
  }
}

/** پاسخ صفحه‌بندی‌شده استاندارد */
export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
