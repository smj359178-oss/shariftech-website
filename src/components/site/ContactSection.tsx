"use client";

// ===========================================================================
// ContactSection — نوار فشرده تماس برای انتهای صفحات دوم
// راست: عنوان و متن + چیپ‌های تماس | چپ: دکمه صفحه تماس و فرم مشاوره
// ===========================================================================
import { Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { Reveal } from "./Reveal";

export function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contact" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal variant="scale">
          <div className="glass flex flex-col items-stretch justify-between gap-6 rounded-3xl p-6 sm:p-8 lg:flex-row lg:items-center">
            {/* ستون راست: متن + چیپ‌های تماس */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black leading-8 sm:text-2xl">
                آماده <span className="text-gradient">شروع</span> هستید؟
              </h3>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                تیم فنی و تجاری ما نیاز سازمان شما را بررسی و راهکار متناسب را پیشنهاد می‌کند؛
                در کمتر از یک روز کاری پاسخ می‌دهیم.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="glass inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground/90 transition-colors hover:border-emerald-400/40"
                >
                  <Phone className="size-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  <span dir="ltr" className="font-mono text-xs sm:text-sm">
                    {settings.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="glass inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground/90 transition-colors hover:border-amber-400/40"
                >
                  <Mail className="size-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                  <span dir="ltr" className="font-mono text-xs sm:text-sm">
                    {settings.email}
                  </span>
                </a>
              </div>
            </div>

            {/* ستون چپ: دکمه رفتن به صفحه تماس */}
            <button
              type="button"
              onClick={() => navigate({ name: "contact" })}
              className="sheen glow-primary relative inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-950"
            >
              صفحه تماس و فرم مشاوره
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
