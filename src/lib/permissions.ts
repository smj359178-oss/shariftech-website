// ===========================================================================
// لایه مجوزها (RBAC Policy) — منبع واحد حقیقت برای نقش‌ها و دسترسی‌ها
// Route Handlerها باید همیشه از requirePermission استفاده کنند؛
// پنهان‌سازی منو در UI فقط جنبه تجربه کاربری دارد و کنترل امنیتی نیست.
// ===========================================================================

export type Role = "ADMIN" | "EDITOR" | "SALES" | "VIEWER";

export const ROLES: Role[] = ["ADMIN", "EDITOR", "SALES", "VIEWER"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "مدیر سیستم",
  EDITOR: "کارشناس محتوا",
  SALES: "کارشناس فروش",
  VIEWER: "ناظر",
};

/** مجوزهای پایه — هر عملیات حساس در API یکی از این‌ها را نیاز دارد */
export type Permission =
  | "dashboard.read"
  | "products.read"
  | "products.write" // ایجاد و ویرایش محصول
  | "products.delete" // حذف محصول
  | "messages.read"
  | "messages.write" // تغییر وضعیت/یادداشت
  | "messages.delete"
  | "settings.read"
  | "settings.write"
  | "users.read"
  | "users.write"
  | "activity.read";

/** ماتریس نقش → مجوزها */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard.read",
    "products.read",
    "products.write",
    "products.delete",
    "messages.read",
    "messages.write",
    "messages.delete",
    "settings.read",
    "settings.write",
    "users.read",
    "users.write",
    "activity.read",
  ],
  EDITOR: [
    "dashboard.read",
    "products.read",
    "products.write",
    "messages.read",
    "settings.read",
    "activity.read",
  ],
  SALES: ["dashboard.read", "products.read", "messages.read", "messages.write"],
  VIEWER: ["dashboard.read", "products.read", "messages.read"],
};

export function isValidRole(role: string): role is Role {
  return (ROLES as string[]).includes(role);
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (!isValidRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsOf(role: string): Permission[] {
  return isValidRole(role) ? ROLE_PERMISSIONS[role] : [];
}

// ---------------------------------------------------------------------------
// کمکی‌های پاسخ API
// ---------------------------------------------------------------------------
export function forbidden(permission?: string): Response {
  return Response.json(
    {
      error: permission
        ? `برای این عملیات مجوز «${permission}» لازم است`
        : "دسترسی به این عملیات مجاز نیست",
    },
    { status: 403 }
  );
}

/**
 * نتیجه بررسی مجوز — یا نشست معتبر یا پاسخ خطا آماده
 * استفاده در Route Handler:
 *   const auth = await requirePermission(request, "products.write");
 *   if (!auth.ok) return auth.response;
 *   const user = auth.user;
 */
export type AuthCheck =
  | { ok: true; user: { id: string; username: string; name: string; role: string; sessionId: string } }
  | { ok: false; response: Response };

export async function requirePermission(
  request: Request,
  permission: Permission
): Promise<AuthCheck> {
  const { getAuthUser, unauthorized } = await import("@/lib/auth");
  const user = await getAuthUser(request);
  if (!user) return { ok: false, response: unauthorized() };
  if (!hasPermission(user.role, permission)) {
    return { ok: false, response: forbidden(permission) };
  }
  return { ok: true, user };
}
