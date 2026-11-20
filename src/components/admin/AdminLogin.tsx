"use client";

// ===========================================================================
// صفحه ورود به پنل مدیریت شریف‌تک — احراز هویت با کوکی نشست امن (HttpOnly)
// هیچ توکنی در جاوااسکریپت نگه‌داری نمی‌شود؛ سرور کوکی را تنظیم می‌کند.
// ===========================================================================
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postJSON, SessionExpiredError } from "@/components/admin/api-client";
import type { AdminSessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LoginResponse {
  user: AdminSessionUser;
}

/** اطلاعات ورود نسخه نمایشی — در محیط عملیاتی باید تغییر داده شوند */
const DEMO_ACCOUNTS: { role: string; username: string; password: string }[] = [
  { role: "مدیر", username: "admin", password: "Sharif@1404" },
  { role: "کارشناس محتوا", username: "editor", password: "Editor@1404" },
  { role: "فروش", username: "sales", password: "Sales@1404" },
  { role: "ناظر", username: "viewer", password: "Viewer@1404" },
];

// امنیت: اطلاعات دمو هرگز در بیلد production به بازدیدکننده نمایش داده
// نمی‌شود؛ فقط در dev یا وقتی صریحاً NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true باشد.
const SHOW_DEMO_ACCOUNTS =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true";

export function AdminLogin({
  onSuccess,
}: {
  onSuccess: (user: AdminSessionUser) => void;
}) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  // فوکوس اولیه روی فیلد نام کاربری (ترتیب منطقی فرم)
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!username.trim() || !password) {
      setError("نام کاربری و رمز عبور را وارد کنید");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await postJSON<LoginResponse>("/api/auth/login", {
        username: username.trim(),
        password,
      });
      onSuccess(data.user);
    } catch (err) {
      // خطای 401 ورود (اعتبارنامه اشتباه) عیناً از سرور نمایش داده می‌شود
      setError(
        err instanceof SessionExpiredError || err instanceof Error
          ? err.message
          : "خطا در برقراری ارتباط با سرور"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      {/* پس‌زمینه شبکه‌ای */}
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      {/* هاله‌های نور (aurora glow) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/2 h-[26rem] w-[26rem] translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong depth-shadow rounded-3xl p-8">
          {/* برند */}
          <div className="mb-7 flex flex-col items-center text-center">
            <Logo siteName="شرکت فناوری اطلاعات دانشگاه صنعتی شریف" siteShortName="شریف‌تک" />
            <h1 className="mt-6 text-xl font-bold">ورود به پنل مدیریت</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              دسترسی امن برای تیم شریف‌تک
            </p>
          </div>

          {/* نوار خطا */}
          {error ? (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-username">نام کاربری</Label>
              <div className="relative">
                <User className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-username"
                  ref={usernameRef}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید"
                  aria-label="نام کاربری"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  dir="ltr"
                  className="h-11 pe-10 text-left"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">رمز عبور</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  aria-label="رمز عبور"
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-11 pe-10 ps-12 text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  className="absolute start-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full text-base font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  در حال ورود...
                </>
              ) : (
                "ورود به پنل مدیریت"
              )}
            </Button>
          </form>

          {/* اطلاعات ورود نسخه نمایشی — فقط در dev یا با متغیر محیطی صریح */}
          {SHOW_DEMO_ACCOUNTS ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              aria-expanded={showDemo}
              aria-controls="admin-demo-accounts"
              className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              اطلاعات ورود نسخه نمایشی
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  showDemo && "rotate-180"
                )}
                aria-hidden
              />
            </button>
            {showDemo ? (
              <motion.div
                id="admin-demo-accounts"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                  {DEMO_ACCOUNTS.map((account) => (
                    <div
                      key={account.username}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="shrink-0 text-muted-foreground">
                        {account.role}:
                      </span>
                      <span dir="ltr" className="text-left font-mono text-foreground">
                        {account.username} / {account.password}
                      </span>
                    </div>
                  ))}
                  <p className="border-t border-border pt-2 text-[11px] leading-5 text-muted-foreground">
                    در محیط عملیاتی این اطلاعات باید پیش از انتشار تغییر داده شوند.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </div>
          ) : null}

          {/* بازگشت به سایت */}
          <div className="mt-6 text-center">
            <a
              href="#/"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-3"
            >
              بازگشت به سایت
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
