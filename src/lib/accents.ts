// ===========================================================================
// سیستم رنگ تأکیدی محصولات — نقشه یکجا برای حفظ سازگاری Tailwind
// ۴ رنگ سازمانی: زمردی، کهربایی، بنفش، رز (+ فیروزه‌ای و cyan مکمل)
// رشته‌های کلاس باید کامل و ثابت باشند تا Tailwind 4 بتواند scan کند.
// ===========================================================================

export type AccentName = "emerald" | "amber" | "violet" | "rose" | "cyan" | "teal";

export interface AccentClasses {
  /** پس‌زمینه آیکون */
  iconBg: string;
  /** رنگ متن آیکون */
  iconText: string;
  /** گرادیان دکمه اصلی */
  button: string;
  /** رنگ متن گرادیانی */
  textGradient: string;
  /** حلقه/مرز hover */
  borderHover: string;
  /** پس‌زمینه شفاف ملایم */
  softBg: string;
  /** متن ملایم */
  softText: string;
  /** نقطه وضعیت */
  dot: string;
}

export const ACCENTS: Record<AccentName, AccentClasses> = {
  emerald: {
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-500 dark:text-emerald-300",
    button: "bg-gradient-to-l from-emerald-500 to-teal-600",
    textGradient: "from-emerald-400 to-teal-500",
    borderHover: "hover:border-emerald-400/50",
    softBg: "bg-emerald-500/10",
    softText: "text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-500 dark:text-amber-300",
    button: "bg-gradient-to-l from-amber-500 to-orange-600",
    textGradient: "from-amber-400 to-orange-500",
    borderHover: "hover:border-amber-400/50",
    softBg: "bg-amber-500/10",
    softText: "text-amber-600 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  violet: {
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-500 dark:text-violet-300",
    button: "bg-gradient-to-l from-violet-500 to-purple-600",
    textGradient: "from-violet-400 to-purple-500",
    borderHover: "hover:border-violet-400/50",
    softBg: "bg-violet-500/10",
    softText: "text-violet-600 dark:text-violet-300",
    dot: "bg-violet-400",
  },
  rose: {
    iconBg: "bg-rose-500/15",
    iconText: "text-rose-500 dark:text-rose-300",
    button: "bg-gradient-to-l from-rose-500 to-red-600",
    textGradient: "from-rose-400 to-red-500",
    borderHover: "hover:border-rose-400/50",
    softBg: "bg-rose-500/10",
    softText: "text-rose-600 dark:text-rose-300",
    dot: "bg-rose-400",
  },
  cyan: {
    iconBg: "bg-cyan-500/15",
    iconText: "text-cyan-500 dark:text-cyan-300",
    button: "bg-gradient-to-l from-cyan-500 to-teal-600",
    textGradient: "from-cyan-400 to-teal-500",
    borderHover: "hover:border-cyan-400/50",
    softBg: "bg-cyan-500/10",
    softText: "text-cyan-600 dark:text-cyan-300",
    dot: "bg-cyan-400",
  },
  teal: {
    iconBg: "bg-teal-500/15",
    iconText: "text-teal-500 dark:text-teal-300",
    button: "bg-gradient-to-l from-teal-500 to-emerald-600",
    textGradient: "from-teal-400 to-emerald-500",
    borderHover: "hover:border-teal-400/50",
    softBg: "bg-teal-500/10",
    softText: "text-teal-600 dark:text-teal-300",
    dot: "bg-teal-400",
  },
};

export function accentOf(name: string | undefined | null): AccentClasses {
  if (name && name in ACCENTS) return ACCENTS[name as AccentName];
  return ACCENTS.emerald;
}

export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[];
