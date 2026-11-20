"use client";

// ===========================================================================
// IndustriesPage — صفحات صنایع هدف؛ شش بلوک بزرگ با چیدمان یک‌درمیان
// هر بلوک: توضیح صنعت + چالش‌ها + راهکارهای متناظر با اسلاگ‌های واقعی
// ===========================================================================
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Factory,
  FlaskConical,
  Fuel,
  Mountain,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ContactSection } from "./ContactSection";

interface IndustrySolution {
  slug: string;
  title: string;
}

interface Industry {
  name: string;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
  challenges: string[];
  solutions: IndustrySolution[];
}

const INDUSTRIES: Industry[] = [
  {
    name: "نفت و گاز",
    description:
      "از سرچاهی تا خطوط انتقال و مخازن ذخیره؛ پایش یکپارچه عملیات بالادستی با اتصال زنده به سامانه‌های تله‌متری و SCADA، بدون جابجایی داده از شبکه سازمان.",
    icon: Fuel,
    accent: "emerald",
    challenges: [
      "پراکندگی جغرافیایی تجهیزات و نبود تصویر یکپارچه از عملیات",
      "توقفات ناخواسته تجهیزات دوار و هزینه بالای نگهداری واکنشی",
      "گزارش‌های دستی با دقت پایین و تاخیر در تصمیم‌گیری مدیریتی",
    ],
    solutions: [
      { slug: "industrial-agent-suite", title: "سوئیت ایجنت‌های صنعتی شریف" },
      { slug: "petro-executive-dashboard", title: "داشبورد جامع مدیریت تولید نفت و گاز" },
      { slug: "predictive-maintenance", title: "سیستم نگهداری پیش‌بینانه" },
    ],
  },
  {
    name: "پتروشیمی",
    description:
      "پایش پیوسته واحدهای فرآیندی الفین، اتیلن و محصول نهایی؛ کشف زودهنگام انحراف پارامترها و شبیه‌سازی سناریوها پیش از اعمال روی خط واقعی.",
    icon: Factory,
    accent: "violet",
    challenges: [
      "انحراف پارامترهای فرآیند از حالت بهینه بدون هشدار به‌موقع",
      "مصرف انرژی بالا در کوره‌ها و برج‌های تقطیر",
      "گزارش‌گیری دستی و ناهماهنگ میان واحدهای عملیاتی",
    ],
    solutions: [
      { slug: "petro-executive-dashboard", title: "داشبورد جامع مدیریت تولید نفت و گاز" },
      { slug: "energy-optimization-agent", title: "ایجنت بهینه‌سازی انرژی" },
      { slug: "digital-twin", title: "دوقلوی دیجیتال فرآیند" },
    ],
  },
  {
    name: "پالایشگاه",
    description:
      "نظارت لحظه‌ای بر واحدهای تقطیر و تصفیه با موتور هشدار هوشمند؛ پاسخ سریع به انحرافات پیش از تبدیل شدن به توقف تولید یا حادثه HSE.",
    icon: FlaskConical,
    accent: "amber",
    challenges: [
      "هشدارهای پراکنده DCS و تشخیص دیرهنگام انحراف فرآیند",
      "الزامات سخت‌گیرانه HSE و رانش مشعل نیازمند گزارش‌دهی مستند",
      "وابستگی عملیات به تجربه فردی اپراتورهای شیفت",
    ],
    solutions: [
      { slug: "refinery-realtime-ops", title: "داشبورد پایش لحظه‌ای پالایشگاه" },
      { slug: "flare-monitoring", title: "پایش هوشمند مشعل و زیست‌محیطی" },
      { slug: "energy-optimization-agent", title: "ایجنت بهینه‌سازی انرژی" },
    ],
  },
  {
    name: "نیروگاه",
    description:
      "مدیریت هوشمند بار و انرژی در شرایط تولید متغیر؛ پیش‌بینی سلامت توربین‌ها و بهینه‌سازی راندمان حرارتی با مدل‌های ترکیبی فیزیکی و یادگیری ماشین.",
    icon: Zap,
    accent: "cyan",
    challenges: [
      "نوسان بار و دشواری مدیریت لحظه‌ای توزیع انرژی",
      "نگهداری توربین‌ها و دیگ‌های بخار با هزینه و ریسک بالا",
      "افت تدریجی راندمان بدون ابزار دقیق تشخیص علت",
    ],
    solutions: [
      { slug: "predictive-maintenance", title: "سیستم نگهداری پیش‌بینانه" },
      { slug: "energy-optimization-agent", title: "ایجنت بهینه‌سازی انرژی" },
      { slug: "digital-twin", title: "دوقلوی دیجیتال فرآیند" },
    ],
  },
  {
    name: "فولاد و معدن",
    description:
      "محیط عملیاتی پرخطر با خطوط تولید پیوسته؛ پایش بینایی ماشین برای ایمنی پرسنل و نگهداری پیش‌بینانه تجهیزات سنگین و کوره‌های صنعتی.",
    icon: Mountain,
    accent: "rose",
    challenges: [
      "ریسک بالای حوادث ایمنی و نبود پایش خودکار نقض PPE",
      "توقف کوره و خط تولید با خسارت سنگین در هر ساعت",
      "فرسایش سریع تجهیزات سنگین در شرایط سخت کاری",
    ],
    solutions: [
      { slug: "vision-safety", title: "بینایی ماشین برای پایش ایمنی (HSE)" },
      { slug: "predictive-maintenance", title: "سیستم نگهداری پیش‌بینانه" },
      { slug: "industrial-agent-suite", title: "سوئیت ایجنت‌های صنعتی شریف" },
    ],
  },
  {
    name: "آب و برق",
    description:
      "شبکه‌های گسترده توزیع با ایستگاه‌های پراکنده؛ پایش دور ایستگاه‌ها، کشف تلفات و مدیریت مصرف با داشبوردهای مدیریتی لحظه‌ای.",
    icon: Droplets,
    accent: "teal",
    challenges: [
      "پایش ایستگاه‌های پراکنده بدون حضور نیروی انسانی",
      "تلفات پنهان انرژی و آب در شبکه توزیع",
      "نبود تصویر تجمیعی KPI برای مدیریت ارشد مجموعه",
    ],
    solutions: [
      { slug: "petro-executive-dashboard", title: "داشبورد جامع مدیریت تولید نفت و گاز" },
      { slug: "predictive-maintenance", title: "سیستم نگهداری پیش‌بینانه" },
      { slug: "energy-optimization-agent", title: "ایجنت بهینه‌سازی انرژی" },
    ],
  },
];

/** بلوک یک صنعت با چیدمان یک‌درمیان */
function IndustryBlock({ industry, index }: { industry: Industry; index: number }) {
  const soft = accentOf(industry.accent);
  const Icon = industry.icon;
  const reversed = index % 2 === 1;

  return (
    <Reveal className="h-full">
      <article className="glass rounded-3xl p-6 sm:p-8 lg:p-10">
        <div
          className={cn(
            "flex flex-col gap-8",
            reversed ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          {/* ستون معرفی صنعت */}
          <div className="flex flex-1 flex-col items-start gap-4">
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                soft.iconBg,
                soft.iconText,
              )}
            >
              <Icon className="size-7" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-black leading-9 sm:text-3xl">{industry.name}</h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {industry.description}
            </p>
            <button
              type="button"
              onClick={() => navigate({ name: "products" })}
              className={cn(
                "mt-auto inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                soft.softBg,
                soft.softText,
                "hover:opacity-90",
              )}
            >
              راهکار مناسب این صنعت
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* ستون چالش‌ها و راهکارها */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {/* چالش‌های صنعت */}
            <div className="rounded-3xl border border-border bg-muted/40 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <AlertTriangle className="size-4 text-amber-500 dark:text-amber-300" aria-hidden="true" />
                چالش‌های صنعت
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {industry.challenges.map((challenge) => (
                  <li key={challenge} className="flex items-start gap-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            {/* راهکارهای ما */}
            <div className="rounded-3xl border border-border bg-muted/40 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                راهکارهای ما
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {industry.solutions.map((solution) => (
                  <li key={solution.slug} className="flex items-start gap-2 text-xs leading-6 text-foreground/85 sm:text-sm">
                    <CheckCircle2
                      className="mt-1 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-300"
                      aria-hidden="true"
                    />
                    {solution.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function IndustriesPage({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {/* سربرگ صفحه */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pb-14">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="aurora-blob -top-24 start-[-8%] size-80 bg-cyan-500/25"
          aria-hidden="true"
        />
        <div
          className="aurora-blob top-6 end-[-6%] size-72 bg-emerald-500/20"
          aria-hidden="true"
          style={{ animationDelay: "-11s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              صنایع هدف
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-snug sm:text-5xl">
              راهکارهای هوشمند برای <span className="text-gradient">صنایع زیرساختی</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              شریف‌تک در قلب صنایع استراتژیک کشور ریشه دارد؛ برای هر صنعت، چالش‌های واقعی را
              می‌شناسیم و راهکار متناسب را با دانش همان حوزه اجرا می‌کنیم.
            </p>
          </Reveal>
        </div>
      </section>

      {/* بلوک صنایع */}
      <section className="pb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6">
          {INDUSTRIES.map((industry, index) => (
            <IndustryBlock key={industry.name} industry={industry} index={index} />
          ))}
        </div>
      </section>

      {/* نوار تماس */}
      <ContactSection settings={settings} />
    </>
  );
}
