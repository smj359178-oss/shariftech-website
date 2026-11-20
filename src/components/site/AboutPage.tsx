"use client";

// ===========================================================================
// AboutPage — درباره شریف‌تک: روایت، ارزش‌ها، آمار، هویت سازمانی و CTA
// ===========================================================================
import { Eye, GraduationCap, Handshake, Headset, ShieldCheck, type LucideIcon } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { toFa } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { accentOf, type AccentName } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";

interface CompanyValue {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentName;
}

const VALUES: CompanyValue[] = [
  {
    title: "دانش‌محوری",
    description: "هر تصمیم فنی بر پایه پژوهش و دانش مهندسی؛ مستند به اکوسیستم دانشگاه صنعتی شریف.",
    icon: GraduationCap,
    accent: "emerald",
  },
  {
    title: "امنیت‌محوری",
    description: "امنیت، خط قرمز طراحی ماست؛ از معماری تا استقرار و بهره‌برداری.",
    icon: ShieldCheck,
    accent: "cyan",
  },
  {
    title: "شفافیت",
    description: "نقشه راه، برآورد هزینه و پیشرفت پروژه همیشه در دسترس و قابل راستی‌آزمایی است.",
    icon: Eye,
    accent: "amber",
  },
  {
    title: "مسئولیت‌پذیری",
    description: "تعهد مکتوب به کیفیت، SLA و پشتیبانی پس از تحویل؛ تا نتیجه نهایی.",
    icon: Handshake,
    accent: "violet",
  },
];

/** آمار ساکن (ارقام فارسی) */
const STAT_STRIP = [
  { value: `${toFa(120)}+`, label: "پروژه صنعتی موفق" },
  { value: `${toFa(35)}+`, label: "صنعت و مجموعه" },
  { value: `${toFa(98)}٪`, label: "رضایت کارفرما" },
  { value: `${toFa(24)}/${toFa(7)}`, label: "پشتیبانی فنی" },
] as const;

export function AboutPage({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {/* سربرگ صفحه */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pb-14">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="aurora-blob -top-24 start-[-8%] size-80 bg-emerald-500/25"
          aria-hidden="true"
        />
        <div
          className="aurora-blob top-6 end-[-6%] size-72 bg-amber-500/20"
          aria-hidden="true"
          style={{ animationDelay: "-7s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              درباره ما
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-snug sm:text-5xl">
              درباره <span className="text-gradient">شریف‌تک</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              پیوند دانش دانشگاهی با نیاز واقعی صنعت؛ تیمی که هوش مصنوعی را از محیط آزمایشگاه به
              خط تولید می‌آورد.
            </p>
          </Reveal>
        </div>
      </section>

      {/* روایت شرکت */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="glass rounded-3xl p-6 sm:p-10">
              <h2 className="text-xl font-black leading-8 sm:text-2xl">
                از دانشگاه <span className="text-gradient">به صنعت</span>
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-sm leading-8 text-muted-foreground sm:text-base">
                <p>
                  شریف‌تک (شرکت فناوری اطلاعات دانشگاه صنعتی شریف) با تکیه بر دانش و اکوسیستم
                  پژوهشی دانشگاه صنعتی شریف و عضویت در پارک علم و فناوری، تمرکز خود را بر صنایع
                  استراتژیک کشور گذاشته است؛ صنایعی که هر ساعت توقف در آن‌ها هزینه سنگینی دارد و
                  به‌دقت، امنیت و پایداری راهکار فنی نیاز دارند.
                </p>
                <p>
                  تیم ما ترکیبی از مهندسان هوش مصنوعی و داده، متخصصان حوزه صنعت و دانش‌آموختگان
                  برتر دانشگاه است؛ کنار هم با یک هدف: ساختن راهکارهایی که نه در اسلایدها، که در
                  عملیات روزانه کارخانه جان می‌گیرند. ما از نیازسنجی میدانی شروع می‌کنیم، با
                  اسپرینت‌های شفاف توسعه می‌دهیم و تا استقرار پایدار و پشتیبانی ۲۴/۷ همراه شما
                  می‌مانیم.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ارزش‌ها */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-3">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              ارزش‌های سازمانی
            </p>
            <h2 className="text-2xl font-black sm:text-3xl">
              اصولی که <span className="text-gradient">پایبندیم</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => {
              const soft = accentOf(value.accent);
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={index * 80} className="h-full">
                  <div
                    className={cn(
                      "glass h-full rounded-3xl p-6 transition-[border-color] duration-300",
                      soft.borderHover,
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl",
                        soft.iconBg,
                        soft.iconText,
                      )}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-bold leading-7">{value.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* نوار آمار */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-6 sm:p-8 lg:grid-cols-4">
              {STAT_STRIP.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2 py-3 text-center">
                  <span className="text-3xl font-black leading-none text-gradient sm:text-4xl" dir="ltr">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* هویت سازمانی */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal variant="scale">
            <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-8 text-center sm:p-10">
              <Logo siteName={settings.siteName} siteShortName={settings.siteShortName} />
              <p className="text-lg font-black leading-8 sm:text-xl">
                {settings.siteName}
              </p>
              <div className="flex flex-col items-center gap-1.5 text-sm leading-7 text-muted-foreground">
                <span>{settings.address}</span>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300"
                >
                  <Headset className="size-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  <span dir="ltr" className="font-mono">
                    {settings.phone}
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ردیف اقدام */}
      <section className="py-8 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal delay={100}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate({ name: "contact" })}
                className="sheen glow-primary relative inline-flex min-h-[48px] items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-950"
              >
                رزرو جلسه فنی
              </button>
              <button
                type="button"
                onClick={() => navigate({ name: "products" })}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-foreground transition-colors hover:border-emerald-400/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                کاوش محصولات
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
