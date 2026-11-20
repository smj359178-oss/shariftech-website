"use client";

// ===========================================================================
// ArchitectureSection — معماری چهارلایه راهکار شریف‌تک
// RTL: جریان از راست (منابع داده) به چپ (داشبوردها)؛ در موبایل عمودی
// ===========================================================================
import { Fragment } from "react";
import {
  ArrowDown,
  ArrowLeft,
  Brain,
  Database,
  LayoutDashboard,
  Network,
  type LucideIcon,
} from "lucide-react";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

interface ArchitectureLayer {
  title: string;
  chips: string[];
  icon: LucideIcon;
  accent: AccentName;
}

const LAYERS: ArchitectureLayer[] = [
  {
    title: "لایه منابع داده",
    chips: ["SCADA", "IoT", "ERP/MES", "Historian"],
    icon: Database,
    accent: "emerald",
  },
  {
    title: "لایه یکپارچه‌سازی امن",
    chips: ["OPC-UA", "MQTT", "Modbus", "REST API"],
    icon: Network,
    accent: "cyan",
  },
  {
    title: "موتور هوش مصنوعی",
    chips: ["ایجنت‌های صنعتی", "مدل‌های پیش‌بینی", "بینایی ماشین", "قوانین فرآیندی"],
    icon: Brain,
    accent: "violet",
  },
  {
    title: "داشبوردها و اقدامات",
    chips: ["داشبورد مدیریتی", "هشدار هوشمند", "گزارش خودکار", "ChatOps"],
    icon: LayoutDashboard,
    accent: "amber",
  },
];

const PERSIAN_NUMBERS = ["۱", "۲", "۳", "۴"] as const;

/** کارت یک لایه معماری */
function LayerCard({ layer, index }: { layer: ArchitectureLayer; index: number }) {
  const soft = accentOf(layer.accent);
  const Icon = layer.icon;
  return (
    <TiltCard className="w-full">
      <div
        className={cn(
          "card-3d glass relative flex h-full flex-col rounded-3xl p-5 transition-[border-color] duration-300 sm:p-6",
          soft.borderHover,
        )}
      >
        {/* شماره لایه */}
        <span
          className={cn(
            "absolute -top-4 start-5 flex size-9 items-center justify-center rounded-full text-base font-black text-white shadow-md",
            soft.button,
          )}
          aria-hidden="true"
        >
          {PERSIAN_NUMBERS[index]}
        </span>

        <div className="mt-2 flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              soft.iconBg,
              soft.iconText,
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="font-bold leading-6">{layer.title}</h3>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {layer.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] text-foreground/80"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </TiltCard>
  );
}

/** رابط افقی بین دو لایه (دسکتاپ) */
function ConnectorDesktop() {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-center gap-1 self-center" aria-hidden="true">
      <span className="h-1 w-full animate-pulse rounded-full bg-gradient-to-l from-emerald-400/60 via-violet-400/60 to-amber-400/60" />
      <ArrowLeft className="size-4 text-muted-foreground" />
    </div>
  );
}

/** رابط عمودی بین دو لایه (موبایل) */
function ConnectorMobile() {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1 lg:hidden" aria-hidden="true">
      <ArrowDown className="size-4 text-muted-foreground" />
    </div>
  );
}

export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            معماری راهکار
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            معماری <span className="text-gradient">راهکار شریف‌تک</span>
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            از منابع داده صنعتی تا تصمیم عملیاتی؛ داده شما در چهار لایه امن و استاندارد به دانش
            اجرایی تبدیل می‌شود — بدون خروج حتی یک بایت از شبکه سازمان.
          </p>
        </Reveal>

        {/* چیدمان دسکتاپ: ردیف افقی (RTL — لایه اول در راست) */}
        <div className="mt-14 hidden lg:flex lg:items-stretch">
          {LAYERS.map((layer, index) => (
            <Fragment key={layer.title}>
              <Reveal delay={index * 110} className="flex-1">
                <LayerCard layer={layer} index={index} />
              </Reveal>
              {index < LAYERS.length - 1 && <ConnectorDesktop />}
            </Fragment>
          ))}
        </div>

        {/* چیدمان موبایل: پشته عمودی با فلش پایین */}
        <div className="mt-12 flex flex-col items-stretch lg:hidden">
          {LAYERS.map((layer, index) => (
            <Fragment key={layer.title}>
              <Reveal delay={index * 90}>
                <LayerCard layer={layer} index={index} />
              </Reveal>
              {index < LAYERS.length - 1 && <ConnectorMobile />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
