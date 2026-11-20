"use client";

// ===========================================================================
// StatsSection — نوار آمار با شمارنده متحرک مبتنی بر IntersectionObserver
// احترام به prefers-reduced-motion (پرش مستقیم به مقدار نهایی)
// ===========================================================================
import { useEffect, useRef, useState } from "react";
import { Building2, FolderCheck, Headset, HeartHandshake, type LucideIcon } from "lucide-react";
import { toFa } from "@/lib/types";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  accent: AccentName;
}

const STATS: StatItem[] = [
  { value: 120, suffix: "+", label: "پروژه صنعتی موفق", icon: FolderCheck, accent: "emerald" },
  { value: 35, suffix: "+", label: "صنعت و مجموعه", icon: Building2, accent: "violet" },
  { value: 98, suffix: "٪", label: "رضایت کارفرما", icon: HeartHandshake, accent: "amber" },
  { value: 24, suffix: "/۷", label: "پشتیبانی فنی", icon: Headset, accent: "cyan" },
];

const COUNT_DURATION_MS = 1400;

/** شمارنده: با ورود به دید شروع می‌شود؛ با کاهش حرکت مستقیم مقدار نهایی */
function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} dir="ltr" className="block text-4xl font-black leading-none text-gradient sm:text-5xl">
      {toFa(display)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            آمار و دستاوردها
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            اعداد، <span className="text-gradient">خودشان حرف می‌زنند</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((stat, index) => {
            const soft = accentOf(stat.accent);
            const Icon = stat.icon;
            return (
              <Reveal key={stat.label} delay={index * 90} variant="scale" className="h-full">
                <div className="glass flex h-full flex-col items-center rounded-3xl p-5 text-center transition-[border-color] duration-300 sm:p-6">
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      soft.iconBg,
                      soft.iconText,
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="mt-4">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
