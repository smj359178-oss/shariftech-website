"use client";

// ===========================================================================
// CtaSection — نوار فراخوان نهایی با تزئینات اورورا و شبکه‌ای
// ===========================================================================
import { Headset, Rocket } from "lucide-react";
import { navigate } from "@/lib/navigation";
import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal variant="scale">
          <div className="glass-strong relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 sm:py-20">
            {/* تزئینات پس‌زمینه */}
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div
              className="aurora-blob -top-24 right-[10%] size-72 bg-emerald-500/30"
              aria-hidden="true"
            />
            <div
              className="aurora-blob -bottom-28 left-[8%] size-80 bg-violet-500/25"
              aria-hidden="true"
              style={{ animationDelay: "-8s" }}
            />

            <div className="relative flex flex-col items-center gap-5">
              <h2 className="max-w-2xl text-3xl font-black leading-snug sm:text-4xl">
                گام بعدی همکاری را <span className="text-gradient">امروز</span> بردارید
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                یک جلسه ۳۰ دقیقه‌ای فنی و رایگان؛ بدون تعهد، فقط بررسی نیاز شما.
              </p>
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate({ name: "contact" })}
                  className="sheen glow-primary relative inline-flex min-h-[48px] items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-950"
                >
                  <Headset className="size-4" aria-hidden="true" />
                  رزرو جلسه فنی رایگان
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ name: "products" })}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-foreground transition-colors hover:border-violet-400/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Rocket className="size-4 text-violet-500 dark:text-violet-300" aria-hidden="true" />
                  کاوش در محصولات
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
