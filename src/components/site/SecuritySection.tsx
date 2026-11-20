"use client";

// ===========================================================================
// SecuritySection — امنیت و استقرار در سطح سازمانی
// شش کارت فشرده + بنر سیاست‌های داده (glass-strong)
// ===========================================================================
import {
  DatabaseBackup,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ScrollText,
  Server,
  type LucideIcon,
} from "lucide-react";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SecurityCard {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
}

const CARDS: SecurityCard[] = [
  {
    title: "استقرار کاملاً داخلی",
    description: "اجرای کامل روی زیرساخت شما، بدون وابستگی به اینترنت.",
    icon: Server,
    accent: "emerald",
  },
  {
    title: "کنترل دسترسی نقش‌محور",
    description: "RBAC با نقش‌های مدیر، کارشناس، فروش و ناظر.",
    icon: KeyRound,
    accent: "amber",
  },
  {
    title: "رمزنگاری و شبکه امن",
    description: "TLS، شبکه‌بندی منطقی و جداسازی کامل داده.",
    icon: LockKeyhole,
    accent: "cyan",
  },
  {
    title: "ثبت کامل ردپا",
    description: "لاگ فعالیت تمام عملیات حساس، قابل ممیزی و جستجو.",
    icon: ScrollText,
    accent: "violet",
  },
  {
    title: "پشتیبان‌گیری و بازیابی",
    description: "بکاپ خودکار زمان‌بندی‌شده و تست دوره‌ای بازیابی.",
    icon: DatabaseBackup,
    accent: "teal",
  },
  {
    title: "مدیریت نشست‌ها",
    description: "نشست امن، ابطال فوری دسترسی و انقضای خودکار.",
    icon: Fingerprint,
    accent: "rose",
  },
];

const POLICY_CHIPS = [
  "داده‌های شما فقط در شبکه سازمانی",
  "بدون ارسال داده به سرویس‌های بیرونی",
  "منطبق با الزامات HSE و IT سازمان",
] as const;

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            امنیت و استقرار
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            امنیت و استقرار <span className="text-gradient">در سطح سازمانی</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, index) => {
            const soft = accentOf(card.accent);
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={index * 70} className="h-full">
                <div
                  className={cn(
                    "glass flex h-full items-start gap-4 rounded-3xl p-5 transition-[border-color] duration-300 sm:p-6",
                    soft.borderHover,
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      soft.iconBg,
                      soft.iconText,
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-6">{card.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* بنر سیاست‌های داده */}
        <Reveal delay={200}>
          <div className="glass-strong mt-8 flex flex-col items-center gap-4 rounded-3xl p-6 sm:flex-row sm:justify-center sm:gap-6 sm:p-7">
            {POLICY_CHIPS.map((policy) => (
              <span
                key={policy}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-2.5 text-xs font-medium text-foreground/85 sm:text-sm"
              >
                <span className="size-2 shrink-0 animate-pulse-dot rounded-full bg-emerald-400" aria-hidden="true" />
                {policy}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
