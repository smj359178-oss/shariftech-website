// ===========================================================================
// GET /api/auth/me — اطلاعات کاربر جاری پنل مدیریت (بر اساس کوکی نشست)
// ===========================================================================
import { getAuthUser, unauthorized } from "@/lib/auth";
import { permissionsOf } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  return Response.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: permissionsOf(user.role),
    },
  });
}
