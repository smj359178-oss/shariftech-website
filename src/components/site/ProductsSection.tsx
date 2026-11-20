"use client";

// ===========================================================================
// ProductsSection — نمایش محصولات شاخص در صفحه اصلی
// تا ۳ محصول منتخب (fallback: سه محصول اول) + کارت راهکار سفارشی
// ===========================================================================
import { useMemo } from "react";
import { ArrowLeft, Sparkles, Wrench } from "lucide-react";
import type { Product } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";

export function ProductsSection({ products }: { products: Product[] }) {
  // محصولات شاخص در اولویت؛ در نبود آن‌ها، سه محصول اول
  const picks = useMemo(() => {
    const featured = products.filter((p) => p.featured);
    const rest = products.filter((p) => !p.featured);
    return [...featured, ...rest].slice(0, 3);
  }, [products]);

  return (
    <section id="products" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* سربرگ بخش */}
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            محصولات و راهکارها
          </p>
          <h2 className="max-w-3xl text-3xl font-black leading-snug sm:text-4xl">
            راهکارهای <span className="text-gradient">هوشمند</span> برای صنایع واقعی
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            هر محصول، حاصل تجربه صنعتی و پژوهش دانشگاهی است؛ از ایجنت‌های هوشمند تا داشبوردهای
            مدیریتی لحظه‌ای، همه با استانداردهای سازمانی و قابلیت استقرار در شبکه داخلی شما.
          </p>
          <button
            type="button"
            onClick={() => navigate({ name: "products" })}
            className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-400/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            مشاهده همه محصولات
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
        </Reveal>

        {/* شبکه کارت‌ها */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((product, index) => (
            <Reveal key={product.id} delay={index * 90} variant="scale" className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}

          {/* کارت راهکار سفارشی */}
          <Reveal delay={picks.length * 90} variant="scale" className="h-full">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-purple-500/5 to-transparent p-6 depth-shadow transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
              <div className="relative">
                <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
                  <Wrench className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold leading-7">راهکار سفارشی می‌خواهید؟</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  نیاز شما با محصولات آماده پاسخ نمی‌گیرد؟ تیم مهندسی ما راهکار اختصاصی را از
                  تحلیل نیاز تا استقرار و پشتیبانی کنار شما اجرا می‌کند.
                </p>
              </div>
              <div className="relative mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ name: "contact" })}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-violet-500/15 px-4 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-violet-300"
                  aria-label="شروع همکاری برای راهکار سفارشی"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  شروع همکاری
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                <span className="text-xs text-muted-foreground">تحویل کد منبع</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
