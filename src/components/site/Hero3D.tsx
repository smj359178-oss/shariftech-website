"use client";

// ===========================================================================
// هیرو نسخه ۳ — نامتقارن دو ستونه با پیش‌نمایش واقعی محصول
// ستون متن (RTL) + ستون ماکاپ داشبورد صنعتی با افکت 3D + صحنه شبکه عصبی
// پس‌زمینه: AmbientFlow (شبیه ویدیو) + اورورا CSS + گرید
// نگارش CTA حرفه‌ای + چیپ‌های آمار شناور
// ===========================================================================
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ChevronDown,
  FolderCheck,
  Building2,
  Headset,
  HeartHandshake,
  TrendingUp,
  Bot,
  Gauge,
  Activity,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { toFa } from "@/lib/types";
import { AmbientFlow } from "./AmbientFlow";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-72 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_70%)] blur-2xl" />
    </div>
  ),
});

/** چیپ‌های آمار شناور هیرو */
const HERO_STATS = [
  { icon: FolderCheck, value: `+${toFa(120)}`, caption: "پروژه موفق", delay: "0s" },
  { icon: Building2, value: `${toFa(35)}+`, caption: "صنعت و مجموعه", delay: "0.7s" },
  { icon: HeartHandshake, value: `${toFa(98)}٪`, caption: "رضایت کارفرما", delay: "1.4s" },
  { icon: Headset, value: `${toFa(24)}/${toFa(7)}`, caption: "پشتیبانی فنی", delay: "2.1s" },
] as const;

/** ماکاپ داشبورد صنعتی — پیش‌نمایش واقعی محصول با CSS/SVG بومی */
function DashboardMockup() {
  return (
    <div className="preserve-3d relative w-full max-w-lg" aria-hidden="true">
      {/* قاب اصلی داشبورد */}
      <div className="card-3d depth-shadow-lg glass-strong relative overflow-hidden rounded-3xl border border-emerald-400/20 p-5 sm:p-6">
        {/* سربرگ داشبورد */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 dark:text-emerald-300">
              <Gauge className="size-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold">پایش لحظه‌ای واحد فرآیندی</span>
              <span className="text-[10px] text-muted-foreground">
                داشبورد شریف‌تک — نمای عملیات
              </span>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
            زنده
          </span>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "دبی خط تولید", value: `${toFa(842)}`, unit: "m³/h", trend: "+۲.۴٪", up: true },
            { label: "دمای برج", value: `${toFa(64)}`, unit: "°C", trend: "-۱.۱٪", up: true },
            { label: "راندمان", value: `${toFa(96.2)}`, unit: "٪", trend: "+۰.۸٪", up: true },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="card-3d-layer rounded-2xl border border-border bg-background/40 p-3"
            >
              <span className="text-[9.5px] text-muted-foreground">{kpi.label}</span>
              <div className="mt-1 flex items-baseline gap-1" dir="ltr">
                <span className="text-lg font-black text-foreground">{kpi.value}</span>
                <span className="text-[9px] text-muted-foreground">{kpi.unit}</span>
              </div>
              <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 dark:text-emerald-300">
                <TrendingUp className="size-2.5" />
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>

        {/* نمودار روند SVG */}
        <div className="mt-3 rounded-2xl border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground">
              روند تولید ۲۴ ساعت اخیر
            </span>
            <span className="flex items-center gap-1 text-[9px] text-violet-500 dark:text-violet-300">
              <Bot className="size-3" />
              پیش‌بینی ایجنت هوشمند
            </span>
          </div>
          <svg viewBox="0 0 300 72" className="w-full" role="img" aria-label="نمودار روند تولید">
            <defs>
              <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="1" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 56 C30 50 45 40 70 42 S110 30 140 26 S190 34 220 22 S270 16 300 10 L300 72 L0 72 Z"
              fill="url(#heroArea)"
            />
            <path
              d="M0 56 C30 50 45 40 70 42 S110 30 140 26 S190 34 220 22 S270 16 300 10"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* خط پیش‌بینی بنفش */}
            <path
              d="M220 22 S250 24 300 14"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.6"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <circle cx="300" cy="10" r="3" fill="#10b981" />
          </svg>
          {/* نوارهای سلامت تجهیزات */}
          <div className="mt-2 space-y-1.5">
            {[
              { label: "پمپ P-101", w: "88%", c: "bg-emerald-400" },
              { label: "کمپرسور C-04", w: "72%", c: "bg-amber-400" },
            ].map((eq) => (
              <div key={eq.label} className="flex items-center gap-2">
                <Activity className="size-3 text-muted-foreground" />
                <span className="w-20 text-[9px] text-muted-foreground">{eq.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${eq.c}`} style={{ width: eq.w }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* چیپ هوش مصنوعی شناور */}
      <div className="glass animate-float absolute -top-5 -left-4 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-xl sm:-left-8">
        <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500 dark:text-violet-300">
          <Bot className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-[10.5px] font-bold">ایجنت عیب‌یاب</span>
          <span className="text-[9px] text-muted-foreground">۲ هشدار حل‌شده امروز</span>
        </div>
      </div>

      {/* چیپ صرفه‌جویی شناور */}
      <div className="glass animate-float-slow absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-xl sm:-right-7">
        <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 dark:text-amber-300">
          <TrendingUp className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-[10.5px] font-bold">صرفه‌جویی انرژی</span>
          <span className="text-[9px] text-muted-foreground">{toFa(18)}٪ در ۳ ماه</span>
        </div>
      </div>
    </div>
  );
}

export function Hero3D({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      {/* پس‌زمینه متحرک شبیه ویدیو (بومی و سبک) */}
      <AmbientFlow />

      {/* لایه‌های اورورا CSS + گرید */}
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div
        className="aurora-blob pointer-events-none -top-32 right-[4%] size-[420px] bg-emerald-500/20 dark:bg-emerald-500/15"
        style={{ animationDelay: "0s" }}
        aria-hidden="true"
      />
      <div
        className="aurora-blob pointer-events-none bottom-[-140px] left-[2%] size-[380px] bg-violet-500/15 dark:bg-violet-500/12"
        style={{ animationDelay: "-8s" }}
        aria-hidden="true"
      />
      <div
        className="aurora-blob pointer-events-none top-[20%] left-[38%] size-[300px] bg-amber-500/12 dark:bg-amber-500/10"
        style={{ animationDelay: "-14s" }}
        aria-hidden="true"
      />

      {/* صحنه سه‌بعدی (فقط سمت کلاینت) */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <HeroScene />
      </div>

      {/* وینیت خوانایی متن */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/50"
        aria-hidden="true"
      />

      {/* محتوای دو ستونه */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-8">
        {/* ستون متن */}
        <div className="text-center lg:text-right">
          {/* بج بالای عنوان */}
          <div className="animate-rise mb-7 flex justify-center lg:justify-start" style={{ animationDelay: "0.05s" }}>
            <div className="glass animate-float inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm text-emerald-700 dark:text-emerald-200">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-pulse-dot rounded-full bg-emerald-400" />
              </span>
              پارک علم و فناوری دانشگاه صنعتی شریف
            </div>
          </div>

          {/* عنوان اصلی */}
          <h1
            className="animate-rise mx-auto max-w-2xl text-4xl font-black leading-[1.3] sm:text-5xl lg:text-[3.4rem] lg:leading-[1.22]"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-gradient">{settings.heroTitle}</span>
          </h1>

          {/* زیرعنوان */}
          <p
            className="animate-rise mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0"
            style={{ animationDelay: "0.3s" }}
          >
            {settings.heroSubtitle}
          </p>

          {/* دکمه‌های اقدام — نگارش حرفه‌ای */}
          <div
            className="animate-rise mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            style={{ animationDelay: "0.45s" }}
          >
            <button
              type="button"
              onClick={() => navigate({ name: "products" })}
              className="sheen glow-primary group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring sm:w-auto dark:text-emerald-950"
            >
              کاوش در محصولات
              <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => navigate({ name: "contact" })}
              className="glass inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-foreground transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/5 sm:w-auto focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Headset className="size-5 text-emerald-500 dark:text-emerald-300" />
              مشاوره تخصصی رایگان
            </button>
          </div>

          {/* چیپ‌های آمار شناور */}
          <div
            className="animate-rise mt-12 flex flex-wrap items-stretch justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "0.6s" }}
          >
            {HERO_STATS.map((stat) => (
              <div
                key={stat.caption}
                className="glass animate-float flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ animationDelay: stat.delay }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-300">
                  <stat.icon className="size-5" />
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-lg font-black leading-6" dir="ltr">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.caption}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ستون ماکاپ محصول — فقط دسکتاپ و تبلت بزرگ */}
        <div className="perspective-1600 hidden justify-center lg:flex">
          <div className="animate-rise w-full" style={{ animationDelay: "0.5s" }}>
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* نشانگر اسکرول */}
      <a
        href="#hero-next"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("hero-next")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-emerald-400 lg:bottom-6"
      >
        <ChevronDown className="size-5 animate-bounce" />
        اسکرول کنید
      </a>
    </section>
  );
}
