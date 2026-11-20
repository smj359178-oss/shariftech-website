"use client";

// ===========================================================================
// ProcessSection — مسیر همکاری چهارگامی با دایره‌های شماره‌دار گرادیانی
// خط اتصال نقطه‌چین در دسکتاپ؛ امن در هر دو تم (border-token)
// ===========================================================================
import { ClipboardList, DraftingCompass, LineChart, Rocket, type LucideIcon } from "lucide-react";
import { toFa } from "@/lib/types";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface ProcessStep {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
}

const STEPS: ProcessStep[] = [
  {
    title: "نیازسنجی رایگان",
    description: "جلسه فنی، تحلیل نیاز و ارزیابی امکان‌پذیری — بدون هیچ هزینه‌ای.",
    icon: ClipboardList,
    accent: "emerald",
  },
  {
    title: "طراحی و نقشه راه",
    description: "معماری راهکار، برآورد زمان و هزینه و مستند SOW شفاف.",
    icon: DraftingCompass,
    accent: "amber",
  },
  {
    title: "پیاده‌سازی و استقرار",
    description: "اسپرینت‌های دوسالانه، تست پذیرش و آموزش تیم سازمان شما.",
    icon: Rocket,
    accent: "violet",
  },
  {
    title: "بهره‌برداری و توسعه",
    description: "SLA سازمانی، مانیتورینگ سلامت سرویس‌ها و توسعه مستمر قابلیت‌ها.",
    icon: LineChart,
    accent: "cyan",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            فرآیند همکاری
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            مسیر همکاری، <span className="text-gradient">شفاف و مطمئن</span>
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            از نخستین جلسه تا بهره‌برداری پایدار، هر گام با خروجی مشخص و توافق مکتوب پیش می‌رود.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* خط اتصال افقی (فقط دسکتاپ) */}
          <div
            className="absolute right-[12.5%] left-[12.5%] top-7 hidden border-t-2 border-dashed border-border lg:block"
            aria-hidden="true"
          />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => {
              const soft = accentOf(step.accent);
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 110} className="h-full">
                  <div className="relative flex h-full flex-col items-center gap-5">
                    {/* دایره شماره گام با گرادیان اکسنت */}
                    <span
                      className={cn(
                        "z-10 flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-black text-white shadow-lg",
                        soft.button,
                      )}
                    >
                      {toFa(index + 1)}
                    </span>

                    {/* کارت گام */}
                    <div className="glass w-full rounded-3xl p-6 text-center">
                      <span
                        className={cn(
                          "mx-auto flex size-11 items-center justify-center rounded-2xl",
                          soft.iconBg,
                          soft.iconText,
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 font-bold leading-7">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
