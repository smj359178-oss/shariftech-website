// ===========================================================================
// GET /api/health — بررسی سلامت سرویس + اتصال دیتابیس (برای مانیتورینگ)
// ===========================================================================
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "up", timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { status: "degraded", database: "down", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
