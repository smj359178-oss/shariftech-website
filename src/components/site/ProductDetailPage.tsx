"use client";

// ===========================================================================
// ProductDetailPage — صفحه جزئیات محصول
// سربرگ دوستونه (متن + رسانه)، ویژگی‌ها، موارد استفاده، فناوری‌ها،
// یادداشت امنیتی و راهکارهای مرتبط
// ===========================================================================
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Home,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import { CATEGORY_LABELS, toFa, type Product, type SiteSettings } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { accentOf } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ProductIcon } from "./icon-map";

/** گرادیان placeholder رسانه برای هر اکسنت */
const MEDIA_GRADIENT: Record<string, string> = {
  emerald: "from-emerald-500/25 via-teal-500/10 to-transparent",
  amber: "from-amber-500/25 via-orange-500/10 to-transparent",
  violet: "from-violet-500/25 via-purple-500/10 to-transparent",
  rose: "from-rose-500/25 via-red-500/10 to-transparent",
  cyan: "from-cyan-500/25 via-teal-500/10 to-transparent",
  teal: "from-teal-500/25 via-emerald-500/10 to-transparent",
};

/** بج دسته‌بندی امن در هر دو تم */
const CATEGORY_BADGE: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
  amber: "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
  violet: "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/30",
  rose: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30",
  cyan: "bg-cyan-500/10 text-cyan-700 border-cyan-500/25 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/30",
  teal: "bg-teal-500/10 text-teal-700 border-teal-500/25 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/30",
};

export interface ProductDetailPageProps {
  product: Product | null;
  relatedProducts: Product[];
  settings: SiteSettings;
}

/** نوت‌فاند ظریف برای اسلاگ نامعتبر */
function NotFoundState() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-24">
      <div className="glass flex flex-col items-center gap-5 rounded-3xl px-8 py-14 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-black">محصول یافت نشد</h1>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          ممکن است این راهکار جابجا شده یا نام آن تغییر کرده باشد؛ فهرست کامل محصولات را بررسی
          کنید.
        </p>
        <button
          type="button"
          onClick={() => navigate({ name: "products" })}
          className="glow-primary inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-950"
        >
          مشاهده همه محصولات
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export function ProductDetailPage({ product, relatedProducts, settings }: ProductDetailPageProps) {
  if (!product) return <NotFoundState />;

  const soft = accentOf(product.accent);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const hasImage = typeof product.image === "string" && product.image.length > 0;

  return (
    <>
      {/* نان‌چرخ (Breadcrumb) */}
      <nav aria-label="مسیر صفحه" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <button
              type="button"
              onClick={() => navigate({ name: "home" })}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Home className="size-4" aria-hidden="true" />
              خانه
            </button>
          </li>
          <li aria-hidden="true">
            <ChevronLeft className="size-4 text-muted-foreground" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => navigate({ name: "products" })}
              className="inline-flex min-h-[44px] items-center rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              محصولات
            </button>
          </li>
          <li aria-hidden="true">
            <ChevronLeft className="size-4 text-muted-foreground" />
          </li>
          <li aria-current="page" className="min-h-[44px] inline-flex items-center px-2 py-1 font-semibold text-foreground/90">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* سربرگ محصول: دو ستونه */}
      <section className="relative overflow-hidden pb-4 pt-8">
        <div
          className="aurora-blob -top-32 start-[-10%] size-96 bg-emerald-500/20"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14">
          {/* ستون متن (راست در RTL) */}
          <Reveal className="flex flex-col items-start gap-5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                CATEGORY_BADGE[product.accent] ?? CATEGORY_BADGE.emerald,
              )}
            >
              {categoryLabel}
            </span>
            <h1 className="text-3xl font-black leading-snug sm:text-4xl">{product.title}</h1>
            <p dir="ltr" className="text-left font-mono text-sm text-muted-foreground">
              {product.subtitle}
            </p>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {product.summary}
            </p>

            {/* چک‌لیست ویژگی‌ها */}
            <ul className="flex flex-col gap-2.5">
              {product.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm leading-6">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                    aria-hidden="true"
                  />
                  <span className="text-foreground/85">{feature}</span>
                </li>
              ))}
            </ul>

            {/* چیپ‌های فناوری */}
            <ul className="flex flex-wrap gap-2">
              {product.techStack.map((tech) => (
                <li
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-foreground/80"
                >
                  <Code2 className="size-3.5 text-violet-500 dark:text-violet-300" aria-hidden="true" />
                  {tech}
                </li>
              ))}
            </ul>

            {/* دکمه‌های اقدام */}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate({ name: "contact" })}
                className="sheen glow-primary relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-950"
              >
                درخواست مشاوره برای این راهکار
              </button>
              <button
                type="button"
                onClick={() => navigate({ name: "products" })}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-foreground transition-colors hover:border-emerald-400/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                همه محصولات
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* ستون رسانه (چپ در RTL) */}
          <Reveal delay={140} variant="scale">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border bg-card depth-shadow-lg">
              {hasImage ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                    MEDIA_GRADIENT[product.accent] ?? MEDIA_GRADIENT.emerald,
                  )}
                  aria-hidden="true"
                >
                  <ProductIcon name={product.icon} className="size-20 opacity-80" />
                </div>
              )}
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
              {/* چیپ شناور اکسنت */}
              <div className="glass-strong absolute bottom-4 start-4 flex items-center gap-3 rounded-2xl p-3 pe-4">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    soft.iconBg,
                    soft.iconText,
                  )}
                >
                  <ProductIcon name={product.icon} className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{categoryLabel}</span>
                  <span className="text-xs font-bold">
                    {toFa(product.features.length)} قابلیت کلیدی
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ویژگی‌های کلیدی */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-3">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              امکانات
            </p>
            <h2 className="text-2xl font-black sm:text-3xl">
              ویژگی‌های <span className="text-gradient">کلیدی</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature, index) => (
              <Reveal key={feature} delay={Math.min(index, 8) * 60} className="h-full">
                <div
                  className={cn(
                    "glass flex h-full items-start gap-3 rounded-2xl p-5 transition-[border-color] duration-300",
                    soft.borderHover,
                  )}
                >
                  <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", soft.dot)} aria-hidden="true" />
                  <p className="text-sm leading-7 text-foreground/85">{feature}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* موارد استفاده واقعی */}
      {product.useCases.length > 0 && (
        <section className="pb-14 sm:pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="flex flex-col items-start gap-3">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                کاربرد عملی
              </p>
              <h2 className="text-2xl font-black sm:text-3xl">
                موارد استفاده <span className="text-gradient">واقعی</span>
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {product.useCases.map((useCase, index) => (
                <Reveal key={useCase.title} delay={index * 90} className="h-full">
                  <div
                    className={cn(
                      "glass h-full rounded-3xl p-6 transition-[border-color] duration-300",
                      soft.borderHover,
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          soft.iconBg,
                          soft.iconText,
                        )}
                      >
                        <Building2 className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-bold leading-6">{useCase.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* فناوری‌های به‌کاررفته + یادداشت امنیتی */}
      <section className="pb-14 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-3">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              زیرساخت فنی
            </p>
            <h2 className="text-2xl font-black sm:text-3xl">
              فناوری‌های <span className="text-gradient">به‌کاررفته</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {product.techStack.map((tech) => (
                <li
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/85"
                >
                  <Code2 className="size-4 text-violet-500 dark:text-violet-300" aria-hidden="true" />
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <div className="glass-strong mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold leading-6">استقرار On-Premise در دسترس است</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    این راهکار به‌طور کامل روی زیرساخت داخلی شما اجرا می‌شود؛ داده‌ها هرگز از شبکه
                    سازمان خارج نمی‌شوند.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate({ name: "contact" })}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-300"
              >
                جزئیات بیشتر
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* راهکارهای مرتبط */}
      {relatedProducts.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="flex flex-col items-start gap-3">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                ادامه مسیر
              </p>
              <h2 className="text-2xl font-black sm:text-3xl">
                راهکارهای <span className="text-gradient">مرتبط</span>
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedProducts.map((related, index) => (
                <Reveal key={related.id} delay={index * 90} className="h-full">
                  <button
                    type="button"
                    onClick={() => navigate({ name: "product", slug: related.slug })}
                    aria-label={`مشاهده ${related.title}`}
                    className={cn(
                      "group flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-card text-right transition-[border-color,box-shadow] duration-300 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      accentOf(related.accent).borderHover,
                    )}
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden border-b border-border">
                      {related.image ? (
                        <Image
                          src={related.image}
                          alt={related.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <span
                          className={cn(
                            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                            MEDIA_GRADIENT[related.accent] ?? MEDIA_GRADIENT.emerald,
                          )}
                          aria-hidden="true"
                        >
                          <ProductIcon name={related.icon} className="size-10 opacity-80" />
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 items-center justify-between gap-3 p-5">
                      <span className="font-bold leading-6">{related.title}</span>
                      <ArrowLeft
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
