"use client";

// ===========================================================================
// نگاشت آیکون‌ها و کلاس‌های رنگی اکسنت محصولات سایت
// توجه: تمام کلاس‌های Tailwind به‌صورت استاتیک و کامل تعریف شده‌اند
// (سازگار با Tailwind 4 - بدون ساخت پویا نام کلاس)
// ===========================================================================
import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Cpu,
  Database,
  Eye,
  Factory,
  Flame,
  Gauge,
  LayoutDashboard,
  LineChart,
  Network,
  Radar,
  Rocket,
  ScanEye,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** نگاشت نام آیکون‌های lucide (ذخیره‌شده در دیتابیس) به کامپوننت مربوطه */
export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  Bot,
  Zap,
  LayoutDashboard,
  Gauge,
  Activity,
  ScanEye,
  Cpu,
  Brain,
  Factory,
  Flame,
  Workflow,
  Radar,
  Eye,
  BarChart3,
  TrendingUp,
  Settings2,
  ShieldCheck,
  Rocket,
  Network,
  Wrench,
  Boxes,
  LineChart,
  Database,
  Sparkles,
};

/** دریافت آیکون محصول با fallback پیش‌فرض (Cpu) */
export function getProductIcon(name: string): LucideIcon {
  return PRODUCT_ICONS[name] ?? Cpu;
}

/** کامپوننت آیکون محصول (در سطح ماژول تعریف شده تا در رندر ساخته نشود) */
export function ProductIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = PRODUCT_ICONS[name] ?? Cpu;
  return <Icon className={className} aria-hidden="true" />;
}

/** مجموعه کلاس‌های استاتیک مربوط به هر رنگ اکسنت */
export interface AccentClasses {
  /** کلاس بج: پس‌زمینه + متن + حاشیه */
  badge: string;
  /** کلاس جعبه آیکون: پس‌زمینه + متن */
  iconBox: string;
  /** کلاس حاشیه در حالت hover کارت */
  ring: string;
  /** کلاس دکمه کمکی با رنگ اکسنت */
  button: string;
  /** سایه درخشش با رنگ اکسنت */
  glowShadow: string;
}

const ACCENT_CLASSES: Record<string, AccentClasses> = {
  emerald: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    iconBox: "bg-emerald-500/15 text-emerald-300",
    ring: "hover:border-emerald-400/40",
    button:
      "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.45)]",
  },
  amber: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    iconBox: "bg-amber-500/15 text-amber-300",
    ring: "hover:border-amber-400/40",
    button:
      "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(245,158,11,0.45)]",
  },
  teal: {
    badge: "bg-teal-500/15 text-teal-300 border-teal-400/30",
    iconBox: "bg-teal-500/15 text-teal-300",
    ring: "hover:border-teal-400/40",
    button:
      "bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(20,184,166,0.45)]",
  },
  cyan: {
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    iconBox: "bg-cyan-500/15 text-cyan-300",
    ring: "hover:border-cyan-400/40",
    button:
      "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(6,182,212,0.45)]",
  },
  rose: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    iconBox: "bg-rose-500/15 text-rose-300",
    ring: "hover:border-rose-400/40",
    button:
      "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(244,63,94,0.45)]",
  },
  violet: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    iconBox: "bg-violet-500/15 text-violet-300",
    ring: "hover:border-violet-400/40",
    button:
      "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border border-violet-400/30",
    glowShadow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.45)]",
  },
};

/** دریافت کلاس‌های رنگی اکسنت با پیش‌فرض emerald */
export function getAccentClasses(accent: string): AccentClasses {
  return ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.emerald;
}
