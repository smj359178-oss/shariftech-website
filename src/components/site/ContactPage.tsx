"use client";

// ===========================================================================
// ContactPage — صفحه تماس: فرم مشاوره (راست) + اطلاعات تماس (چپ)
// فرم در موبایل اول رندر می‌شود (DOM: ستون فرم قبل از ستون اطلاعات)
// ===========================================================================
import { Clock, Instagram, Linkedin, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { Reveal } from "./Reveal";
import { ContactForm } from "./ContactForm";

export function ContactPage({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.linkedin, label: "لینکدین شریف‌تک", icon: Linkedin },
    { href: settings.instagram, label: "اینستاگرام شریف‌تک", icon: Instagram },
    { href: settings.telegram, label: "تلگرام شریف‌تک", icon: Send },
  ].filter((social) => social.href);

  const infoRows = [
    {
      icon: Phone,
      iconBox: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
      label: "تلفن تماس",
      value: settings.phone,
      valueDir: "ltr" as const,
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      iconBox: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
      label: "ایمیل",
      value: settings.email,
      valueDir: "ltr" as const,
      href: `mailto:${settings.email}`,
    },
    {
      icon: MapPin,
      iconBox: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
      label: "نشانی",
      value: settings.address,
      valueDir: undefined,
      href: undefined,
    },
    {
      icon: Clock,
      iconBox: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
      label: "ساعات کاری",
      value: "شنبه تا پنجشنبه، ۸ تا ۱۷",
      valueDir: undefined,
      href: undefined,
    },
  ];

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
          className="aurora-blob top-6 end-[-6%] size-72 bg-violet-500/20"
          aria-hidden="true"
          style={{ animationDelay: "-10s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              ارتباط با ما
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-snug sm:text-5xl">
              تماس با <span className="text-gradient">شریف‌تک</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              فرم مشاوره را تکمیل کنید یا مستقیماً با ما در تماس باشید؛ در کمتر از یک روز کاری
              پاسخ می‌دهیم.
            </p>
          </Reveal>
        </div>
      </section>

      {/* بدنه دوستونه */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:gap-10">
          {/* ستون فرم (راست در RTL / اول در موبایل) */}
          <Reveal className="lg:col-span-3">
            <div className="glass-strong rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black leading-8">فرم مشاوره و رزرو جلسه فنی</h2>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                موارد ستاره‌دار الزامی هستند.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          {/* ستون اطلاعات تماس (چپ در RTL) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {infoRows.map((row, index) => {
              const Icon = row.icon;
              const content = (
                <>
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${row.iconBox}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span
                      dir={row.valueDir}
                      className={row.valueDir ? "text-left font-mono text-sm font-medium" : "text-sm font-medium leading-6"}
                    >
                      {row.value}
                    </span>
                  </span>
                </>
              );
              return (
                <Reveal key={row.label} delay={index * 70}>
                  {row.href ? (
                    <a
                      href={row.href}
                      className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-emerald-400/40"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="glass flex items-center gap-4 rounded-2xl p-4">{content}</div>
                  )}
                </Reveal>
              );
            })}

            {/* شبکه‌های اجتماعی */}
            {socials.length > 0 && (
              <Reveal delay={280}>
                <div className="glass flex flex-col gap-3 rounded-2xl p-5">
                  <span className="text-xs text-muted-foreground">ما را دنبال کنید:</span>
                  <div className="flex items-center gap-2.5">
                    {socials.map((social) => {
                      const SocialIcon = social.icon;
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-emerald-400/40 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300"
                        >
                          <SocialIcon className="size-4" aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            )}

            {/* یادداشت محرمانگی داده */}
            <Reveal delay={340}>
              <div className="glass flex items-start gap-3 rounded-2xl p-5">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300"
                  aria-hidden="true"
                />
                <p className="text-xs leading-6 text-muted-foreground">
                  اطلاعات ارسالی شما محرمانه است، فقط برای پاسخگویی به درخواست استفاده می‌شود و
                  هرگز با اشخاص ثالث به اشتراک گذاشته نمی‌شود.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
