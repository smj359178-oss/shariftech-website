"use client";

// ===========================================================================
// WhyUsSection — شبکه بنتو شش‌کارتی «چرا شریف‌تک؟»
// کارت پهن زمردی (مالکیت کد) + پنج کارت مزیت با اکسنت‌های برند
// ===========================================================================
import {
  GraduationCap,
  Headset,
  Rocket,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

interface WhyCard {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
  /** کارت پهن دوستونه */
  wide?: boolean;
}

const CARDS: WhyCard[] = [
  {
    title: "فناوری بومی با مالکیت کامل کد",
    description:
      "همه راهکارها در کشور و توسط تیم ما توسعه داده می‌شوند و کد منبع، مستندات و دانش فنی به‌طور کامل در اختیار سازمان شما قرار می‌گیرد؛ بدون وابستگی به فروشنده و بدون ریسک تحریم یا قطع سرویس.",
    icon: ShieldCheck,
    accent: "emerald",
    wide: true,
  },
  {
    title: "هسته تیم دانشگاهی",
    description: "ترکیب دانش دانشگاه صنعتی شریف با تجربه میدانی صنایع نفت، گاز و پتروشیمی.",
    icon: GraduationCap,
    accent: "violet",
  },
  {
    title: "سرعت تحویل",
    description: "۴ تا ۸ هفته تا اولین نسخه قابل استفاده؛ با نقشه راه شفاف از روز نخست.",
    icon: Rocket,
    accent: "amber",
  },
  {
    title: "امنیت سازمانی",
    description: "RBAC، رمزنگاری انتقال و ثبت کامل لاگ فعالیت در تمام ماژول‌ها.",
    icon: ShieldCheck,
    accent: "cyan",
  },
  {
    title: "استقرار On-Premise",
    description: "اجرای کامل روی زیرساخت شما؛ بدون وابستگی به اینترنت و با داده داخل شبکه.",
    icon: Server,
    accent: "rose",
  },
  {
    title: "پشتیبانی ۲۴/۷ با SLA",
    description: "تیم پشتیبانی اختصاصی با توافق‌نامه سطح خدمت تضمین‌شده.",
    icon: Headset,
    accent: "emerald",
  },
];

export function WhyUsSection() {
  return (
    <section id="why-us" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            چرا شریف‌تک؟
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            مزیت رقابتی <span className="text-gradient">ما</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, index) => {
            const soft = accentOf(card.accent);
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={index * 80}
                className={cn("h-full", card.wide && "sm:col-span-2")}
              >
                <TiltCard className="h-full">
                  <div
                    className={cn(
                      "card-3d flex h-full flex-col rounded-3xl border bg-card p-6 transition-[border-color,box-shadow] duration-300 hover:shadow-[var(--shadow-elevated)]",
                      soft.borderHover,
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                        soft.iconBg,
                        soft.iconText,
                      )}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-bold leading-7">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {card.description}
                    </p>
                    {card.wide && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {["تحویل کد منبع", "مستندسازی کامل"].map((chip) => (
                          <li
                            key={chip}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground/80"
                          >
                            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                            {chip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
