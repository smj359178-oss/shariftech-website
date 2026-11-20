// ===========================================================================
// توابع کمکی قالب‌بندی پنل مدیریت — تاریخ فارسی، وضعیت و اولویت پیام‌ها
// ===========================================================================
import { toFa } from "@/lib/types";

// ---------------------------------------------------------------------------
// تاریخ و زمان فارسی
// ---------------------------------------------------------------------------

/** تاریخ شمسی — مثال: ۱۴۰۳/۰۵/۱۲ */
export function formatDateFa(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fa-IR");
}

/** تاریخ + ساعت شمسی — مثال: ۱۴۰۳/۰۵/۱۲ ۱۴:۰۵ */
export function formatDateTimeFa(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("fa-IR")} ${date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** زمان نسبی — «۳ دقیقه پیش»، «۲ ساعت پیش»، «۵ روز پیش» و در غیر این‌صورت تاریخ */
export function timeAgoFa(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "لحظه‌ای پیش";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${toFa(days)} روز پیش`;

  return formatDateFa(iso);
}

/** حروف اول نام برای آواتار — دو کاراکتر اولِ دو کلمه نخست */
export function initialsFa(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

// ---------------------------------------------------------------------------
// کلاس‌های ظاهری بج وضعیت و نقطه اولویت پیام‌ها
// ---------------------------------------------------------------------------

const STATUS_BADGE_CLASSES: Record<string, string> = {
  NEW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  READ: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  REPLIED: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  ARCHIVED: "border-border bg-muted text-muted-foreground",
};

/** کلاس Tailwind بج وضعیت پیام (NEW=زمرد، READ=آبی آسمانی، REPLIED=بنفش، ARCHIVED=خنثی) */
export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status] ?? "border-border bg-muted text-muted-foreground";
}

const PRIORITY_DOT_CLASSES: Record<string, string> = {
  URGENT: "bg-rose-500",
  HIGH: "bg-amber-500",
  NORMAL: "bg-muted-foreground/60",
  LOW: "bg-slate-400",
};

/** کلاس Tailwind نقطه اولویت پیام (URGENT=سرخابی، HIGH=کهربایی، NORMAL=خنثی، LOW=خاکستری) */
export function priorityDotClass(priority: string): string {
  return PRIORITY_DOT_CLASSES[priority] ?? "bg-muted-foreground/60";
}
