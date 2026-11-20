"use client";

// ===========================================================================
// ProductsPage — فهرست کامل محصولات با فیلتر دسته‌بندی و جستجو
// از کارت مشترک ProductCard استفاده می‌کند
// ===========================================================================
import { useMemo, useState } from "react";
import { PackageSearch, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS, toFa, type Product, type SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";
import { ContactSection } from "./ContactSection";

const CATEGORIES = ["AI_AGENT", "DASHBOARD", "SMART_SYSTEM", "CUSTOM"] as const;

export interface ProductsPageProps {
  products: Product[];
  settings: SiteSettings;
}

export function ProductsPage({ products, settings }: ProductsPageProps) {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  /** شمارش هر دسته‌بندی برای چیپ‌های فیلتر */
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    for (const key of CATEGORIES) {
      map[key] = products.filter((p) => p.category === key).length;
    }
    return map;
  }, [products]);

  /** فیلتر ترکیبی دسته‌بندی + جستجو در عنوان و خلاصه */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = category === "all" || product.category === category;
      const matchQuery =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.summary.toLowerCase().includes(q) ||
        product.subtitle.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [products, category, query]);

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
          style={{ animationDelay: "-9s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              محصولات و راهکارها
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-snug sm:text-5xl">
              محصولات و راهکارهای <span className="text-gradient">شریف‌تک</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              پرتفوی کامل راهکارهای هوش مصنوعی صنعتی؛ از ایجنت‌های خودکار تا داشبوردهای مدیریتی
              لحظه‌ای، همه با قابلیت استقرار در شبکه داخلی سازمان شما.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ابزار فیلتر و جستجو */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal delay={100}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* چیپ‌های دسته‌بندی */}
              <div className="flex flex-wrap items-center gap-2">
                {[{ key: "all", label: "همه" }, ...CATEGORIES.map((key) => ({ key, label: CATEGORY_LABELS[key] }))].map(
                  (chip) => {
                    const active = category === chip.key;
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setCategory(chip.key)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border bg-transparent text-muted-foreground hover:border-emerald-400/40 hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {chip.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                            active
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {toFa(counts[chip.key] ?? 0)}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              {/* جستجو */}
              <div className="relative w-full lg:w-72">
                <Search
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="جستجوی محصولات"
                  placeholder="جستجو در محصولات..."
                  className="min-h-[44px] ps-9 pe-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="پاک کردن جستجو"
                    className="absolute top-1/2 end-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* شبکه محصولات */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product, index) => (
                <Reveal
                  key={product.id}
                  delay={Math.min(index, 8) * 70}
                  variant="scale"
                  className="h-full"
                >
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="glass flex flex-col items-center gap-4 rounded-3xl py-16 text-center">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
                </span>
                <p className="font-bold">محصولی یافت نشد</p>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  عبارت جستجو یا فیلتر دسته‌بندی را تغییر دهید؛ یا برای راهکار سفارشی با ما در
                  تماس باشید.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* نوار تماس */}
      <ContactSection settings={settings} />
    </>
  );
}
