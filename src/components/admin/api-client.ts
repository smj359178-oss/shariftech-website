// ===========================================================================
// کلاینت فراخوانی API پنل مدیریت — احراز هویت مبتنی بر کوکی HttpOnly
//
// مدل امنیتی:
// - هیچ توکن یا اعتبارنامه‌ای در جاوااسکریپت ذخیره نمی‌شود
//   (بدون localStorage / sessionStorage / document.cookie)
// - مرورگر کوکی نشست (sharif_session) را به‌صورت خودکار ارسال می‌کند؛
//   درخواست‌ها هم‌مبدأ هستند و با credentials: "include" فرستاده می‌شوند
// - روی هر پاسخ 401، خطای SessionExpiredError پرتاب می‌شود تا بخش‌ها
//   کاربر را مطلع کرده و به حالت «خروج» بازگردند
// ===========================================================================

/** خطای API — status کد HTTP پاسخ است (0 = خطای شبکه) */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * منقضی‌شدن نشست (پاسخ 401).
 * پیام سرور در صورت وجود عیناً حفظ می‌شود تا در فرم ورود
 * «به‌صورت verbatim» نمایش داده شود.
 */
export class SessionExpiredError extends Error {
  constructor(message?: string) {
    super(message ?? "نشست شما منقضی شده است؛ لطفاً دوباره وارد شوید");
    this.name = "SessionExpiredError";
  }
}

/**
 * فراخوانی API هم‌مبدأ با کوکی نشست.
 * - در صورت وجود body، هدر Content-Type: application/json تنظیم می‌شود
 * - پاسخ ناموفق به ApiError با پیام فارسی سرور تبدیل می‌شود
 * - پاسخ 401 به SessionExpiredError نگاشت می‌شود
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers, credentials: "include" });
  } catch {
    throw new ApiError("خطا در ارتباط با سرور؛ اتصال شبکه را بررسی کنید", 0);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // پاسخ بدون بدنه JSON
  }

  if (!response.ok) {
    const payload = (data ?? {}) as { error?: string; message?: string };
    const message =
      payload.error || payload.message || `خطای سرور (${response.status})`;
    if (response.status === 401) {
      throw new SessionExpiredError(payload.error || payload.message);
    }
    throw new ApiError(message, response.status);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// توابع کمکی متدهای متداول
// ---------------------------------------------------------------------------

export function getJSON<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "GET" });
}

export function postJSON<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export function putJSON<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body) });
}

export function delJSON<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}
