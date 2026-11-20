// ===========================================================================
// /api/settings — دریافت (عمومی) و بروزرسانی (مجوز settings.write) تنظیمات
// لینک‌های اجتماعی با allowlist دامنه + پروتکل https اعتبارسنجی می‌شوند
// ===========================================================================
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { hasPermission, forbidden } from "@/lib/permissions";
import { sanitizeSocialUrl } from "@/lib/jsonld";
import { DEFAULT_SETTINGS } from "@/lib/site-defaults";
import { readJsonBody } from "@/lib/csrf";
import type { SiteSettings } from "@/lib/types";
import type { SiteSetting as SettingsRow } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeSettings(row: SettingsRow): SiteSettings {
  return {
    id: row.id,
    siteName: row.siteName,
    siteShortName: row.siteShortName,
    tagline: row.tagline,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    phone: row.phone,
    email: row.email,
    address: row.address,
    linkedin: row.linkedin,
    instagram: row.instagram,
    telegram: row.telegram,
  };
}

// ---------------------------------------------------------------------------
// GET — تنظیمات فعال سایت (عمومی)
// ---------------------------------------------------------------------------
export async function GET() {
  let row = await db.siteSetting.findUnique({ where: { id: "main" } });
  if (!row) {
    row = await db.siteSetting.create({
      data: { id: "main", ...DEFAULT_SETTINGS },
    });
  }
  return Response.json({ settings: serializeSettings(row) });
}

// ---------------------------------------------------------------------------
// PUT — بروزرسانی تنظیمات (نیاز به مجوز settings.write — فقط ADMIN)
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  siteName: z.string().max(200).optional(),
  siteShortName: z.string().max(100).optional(),
  tagline: z.string().max(300).optional(),
  heroTitle: z.string().max(300).optional(),
  heroSubtitle: z.string().max(1000).optional(),
  phone: z.string().max(60).optional(),
  email: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  linkedin: z.string().max(300).optional(),
  instagram: z.string().max(300).optional(),
  telegram: z.string().max(300).optional(),
});

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  if (!hasPermission(user.role, "settings.write")) {
    return forbidden("settings.write");
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "داده ورودی نامعتبر است";
    return Response.json({ error: message }, { status: 400 });
  }
  const input = parsed.data;

  const data: Partial<SiteSettings> = {};
  if (input.siteName !== undefined) data.siteName = input.siteName.trim();
  if (input.siteShortName !== undefined) data.siteShortName = input.siteShortName.trim();
  if (input.tagline !== undefined) data.tagline = input.tagline.trim();
  if (input.heroTitle !== undefined) data.heroTitle = input.heroTitle.trim();
  if (input.heroSubtitle !== undefined) data.heroSubtitle = input.heroSubtitle.trim();
  if (input.phone !== undefined) data.phone = input.phone.trim();
  if (input.email !== undefined) data.email = input.email.trim();
  if (input.address !== undefined) data.address = input.address.trim();

  // لینک‌های اجتماعی: فقط https و فقط دامنه‌های مجاز — خالی = حذف لینک
  if (input.linkedin !== undefined) {
    const clean = input.linkedin.trim() ? sanitizeSocialUrl(input.linkedin) : "";
    if (input.linkedin.trim() && !clean) {
      return Response.json(
        { error: "لینک لینکدین باید یک آدرس https معتبر از دامنه‌های مجاز باشد" },
        { status: 400 }
      );
    }
    data.linkedin = clean;
  }
  if (input.instagram !== undefined) {
    const clean = input.instagram.trim() ? sanitizeSocialUrl(input.instagram) : "";
    if (input.instagram.trim() && !clean) {
      return Response.json(
        { error: "لینک اینستاگرام باید یک آدرس https معتبر از دامنه‌های مجاز باشد" },
        { status: 400 }
      );
    }
    data.instagram = clean;
  }
  if (input.telegram !== undefined) {
    const clean = input.telegram.trim() ? sanitizeSocialUrl(input.telegram) : "";
    if (input.telegram.trim() && !clean) {
      return Response.json(
        { error: "لینک تلگرام باید یک آدرس https معتبر از دامنه‌های مجاز باشد" },
        { status: 400 }
      );
    }
    data.telegram = clean;
  }

  const row = await db.$transaction(async (tx) => {
    const saved = await tx.siteSetting.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...DEFAULT_SETTINGS, ...data },
    });
    await tx.activityLog.create({
      data: {
        action: "به‌روزرسانی تنظیمات سایت",
        entity: "SiteSetting",
        entityId: "main",
        details: `فیلدها: ${Object.keys(data).join("، ") || "-"}`,
        user: user.username,
      },
    });
    return saved;
  });

  return Response.json({ settings: serializeSettings(row) });
}
