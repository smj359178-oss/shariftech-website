"use client";

// ===========================================================================
// ProductCard — کارت محصول مشترک (ProductsSection + ProductsPage)
// طراحی: ناحیه رسانه 16/10 (تصویر محلی یا placeholder گرادیانی) + بدنه با
// پیش‌نمایش ویژگی‌ها و دکمه جزئیات؛ افکت Tilt سه‌بعدی روی دسکتاپ
// ===========================================================================
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Star } from "lucide-react";
import { CATEGORY_LABELS, type Product } from "@/lib/types";
import { navigate } from "@/lib/navigation";
import { accentOf } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { ProductIcon } from "./icon-map";
import { TiltCard } from "./TiltCard";

/** بج دسته‌بندی — نسخه امن برای هر دو تم (روشن/تیره) */
const CATEGORY_BADGE: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
  amber: "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
  violet: "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/30",
  rose: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30",
  cyan: "bg-cyan-500/10 text-cyan-700 border-cyan-500/25 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/30",
  teal: "bg-teal-500/10 text-teal-700 border-teal-500/25 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/30",
};

/** دکمه نرم اکسنت — امن در هر دو تم */
const SOFT_BUTTON: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25",
  amber: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
  violet: "bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25",
  rose: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
  cyan: "bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/25",
  teal: "bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300 dark:hover:bg-teal-500/25",
};

/** گرادیان placeholder رسانه برای هر اکسنت */
const MEDIA_GRADIENT: Record<string, string> = {
  emerald: "from-emerald-500/25 via-teal-500/10 to-transparent",
  amber: "from-amber-500/25 via-orange-500/10 to-transparent",
  violet: "from-violet-500/25 via-purple-500/10 to-transparent",
  rose: "from-rose-500/25 via-red-500/10 to-transparent",
  cyan: "from-cyan-500/25 via-teal-500/10 to-transparent",
  teal: "from-teal-500/25 via-emerald-500/10 to-transparent",
};

function badgeClass(accent: string): string {
  return CATEGORY_BADGE[accent] ?? CATEGORY_BADGE.emerald;
}
function buttonClass(accent: string): string {
  return SOFT_BUTTON[accent] ?? SOFT_BUTTON.emerald;
}
function gradientClass(accent: string): string {
  return MEDIA_GRADIENT[accent] ?? MEDIA_GRADIENT.emerald;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const soft = accentOf(product.accent);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const hasImage = typeof product.image === "string" && product.image.length > 0;
  // اگر بارگذاری تصویر شکست خورد (مسیر نامعتبر)، به گرافیک گرادیانی برگردیم
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [product.image]);

  return (
    <TiltCard className={cn("group", className)}>
      <article
        className={cn(
          "card-3d depth-shadow flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-[border-color,box-shadow] duration-300 hover:shadow-[var(--shadow-elevated)] focus-within:shadow-[var(--shadow-elevated)]",
          soft.borderHover,
        )}
      >
        {/* ناحیه رسانه */}
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
          {hasImage && !imageFailed ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                gradientClass(product.accent),
              )}
              aria-hidden="true"
            >
              <ProductIcon name={product.icon} className="size-12 opacity-80" />
            </div>
          )}
          {/* لایه شبکه‌ای ملایم */}
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          {/* بج دسته‌بندی */}
          <span
            className={cn(
              "absolute top-3 start-3 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md",
              badgeClass(product.accent),
            )}
          >
            {categoryLabel}
          </span>
        </div>

        {/* بدنه کارت */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                soft.iconBg,
                soft.iconText,
              )}
            >
              <ProductIcon name={product.icon} className="size-5" />
            </span>
          </div>

          <h3 className="mt-4 text-lg font-bold leading-7">{product.title}</h3>
          <p dir="ltr" className="mt-1 text-left font-mono text-xs text-muted-foreground">
            {product.subtitle}
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
            {product.summary}
          </p>

          {/* پیش‌نمایش ویژگی‌ها */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.features.slice(0, 2).map((feature) => (
              <li
                key={feature}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground/80"
              >
                <Check className="size-3 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <span className="truncate">{feature}</span>
              </li>
            ))}
          </ul>

          {/* فوتر کارت */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate({ name: "product", slug: product.slug })}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                buttonClass(product.accent),
              )}
              aria-label={`جزئیات محصول ${product.title}`}
            >
              جزئیات محصول
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
            </button>
            {product.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Star className="size-3 fill-current" aria-hidden="true" />
                محصول شاخص
              </span>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
