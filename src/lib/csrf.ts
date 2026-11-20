// ===========================================================================
// محافظت CSRF برای درخواست‌های Mutating (POST/PUT/PATCH/DELETE)
//
// نشست با کوکی SameSite=Lax محافظت می‌شود، اما به‌عنوان لایه دفاعی دوم،
// همه درخواست‌های تغییردهنده باید Origin هم‌مبدأ داشته باشند.
// ===========================================================================

/** بررسی هم‌مبدأ بودن Origin با Host درخواست */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // درخواست‌های بدون Origin (مثل fetch های same-origin قدیمی یا curl)
    // — با SameSite=Lax کوکی ارسال نمی‌شود؛ اجازه می‌دهیم و ارزیابی
    // ریسک بر عهده سایر لایه‌ها (rate limit، احراز هویت) است.
    return true;
  }
  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("host");
    if (!host) return false;
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function csrfForbidden(): Response {
  return Response.json(
    { error: "درخواست از مبدأ غیرمجاز" },
    { status: 403 }
  );
}

/** ترکیب بررسی CSRF + محدودیت اندازه بدنه */
export async function readJsonBody(
  request: Request,
  maxBytes = 64 * 1024
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  if (!isSameOrigin(request)) {
    return { ok: false, response: csrfForbidden() };
  }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBytes) {
    return {
      ok: false,
      response: Response.json(
        { error: "حجم درخواست بیش از حد مجاز است" },
        { status: 413 }
      ),
    };
  }
  try {
    const text = await request.text();
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: Response.json(
          { error: "حجم درخواست بیش از حد مجاز است" },
          { status: 413 }
        ),
      };
    }
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: Response.json(
        { error: "بدنه درخواست JSON معتبر نیست" },
        { status: 400 }
      ),
    };
  }
}
