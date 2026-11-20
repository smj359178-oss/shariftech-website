"use client";

// ===========================================================================
// هدر چسبان سایت — نسخه حرفه‌ای:
//  • منوی دسکتاپ با نشانگر فعال و افکت hover گرادیانی
//  • کشوی موبایل با backdrop تیره، بستن با Escape، قفل اسکرول و مدیریت فوکوس
//  • دکمه تغییر تم روشن/تیره
//  • CTA با نگارش حرفه‌ای (مشاوره تخصصی)
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X, Headset, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { navigate, type SiteRoute } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { route: { name: "home" } as SiteRoute, label: "خانه" },
  { route: { name: "products" } as SiteRoute, label: "محصولات" },
  { route: { name: "industries" } as SiteRoute, label: "صنایع" },
  { route: { name: "about" } as SiteRoute, label: "درباره ما" },
  { route: { name: "faq" } as SiteRoute, label: "پرسش‌های متداول" },
  { route: { name: "contact" } as SiteRoute, label: "تماس" },
] as const;

function isActive(current: SiteRoute, target: SiteRoute): boolean {
  return current.name === target.name;
}

export function SiteHeader({
  settings,
  currentRoute,
}: {
  settings: SiteSettings;
  currentRoute: SiteRoute;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- کشوی موبایل: قفل اسکرول + Escape + تله فوکوس + بازگشت فوکوس ---
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      // تله فوکوس: Tab فقط بین عناصر تمرکزپذیر کشو می‌چرخد
      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      // بازگشت فوکوس به دکمه همبرگر پس از بستن کشو
      if (prevFocus?.isConnected) prevFocus.focus();
      else triggerRef.current?.focus();
    };
  }, [menuOpen]);

  // بستن کشو هنگام تعویض صفحه
  useEffect(() => {
    setMenuOpen(false);
  }, [currentRoute]);

  const go = useCallback((route: SiteRoute) => {
    setMenuOpen(false);
    navigate(route);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-strong shadow-lg shadow-black/10 dark:shadow-black/40"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* لوگو و نام برند */}
        <button
          type="button"
          onClick={() => go({ name: "home" })}
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${settings.siteName} — رفتن به صفحه اصلی`}
        >
          <Logo siteName={settings.siteName} siteShortName={settings.siteShortName} />
        </button>

        {/* ناوبری دسکتاپ */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="ناوبری اصلی"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(currentRoute, item.route);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.route)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {/* خط زیرین گرادیانی */}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-l from-emerald-400 via-teal-400 to-violet-400 transition-all duration-300",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* کنترل‌های سمت چپ */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {/* ورود پنل مدیریت — آیکون محافظت‌شده */}
          <button
            type="button"
            onClick={goAdmin}
            aria-label="ورود به پنل مدیریت"
            title="ورود به پنل مدیریت"
            className="glass hidden size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:border-amber-400/40 hover:text-amber-400 focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            <ShieldCheck className="size-5" />
          </button>

          {/* CTA اصلی — نگارش حرفه‌ای */}
          <button
            type="button"
            onClick={() => go({ name: "contact" })}
            className="sheen glow-primary hidden items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex dark:text-emerald-950"
          >
            <Headset className="size-4" />
            مشاوره تخصصی رایگان
          </button>

          {/* دکمه منوی موبایل */}
          <button
            type="button"
            ref={(node) => {
              closeBtnRef.current = node;
              triggerRef.current = node;
            }}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            className="glass inline-flex size-11 items-center justify-center rounded-xl text-foreground transition-colors hover:border-emerald-400/40 focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* --- کشوی موبایل: سطح مات + backdrop --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-drawer" ref={drawerRef}>
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            aria-label="ناوبری موبایل"
            className="animate-in fade-in slide-in-from-top-4 absolute inset-x-3 top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-1 overflow-y-auto rounded-3xl border border-border bg-card/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl duration-200"
          >
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(currentRoute, item.route);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.route)}
                  aria-current={active ? "page" : undefined}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={cn(
                    "animate-in fade-in slide-in-from-right-2 flex min-h-[52px] items-center justify-between rounded-2xl px-4 text-[15px] font-semibold transition-colors",
                    active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "text-foreground/90 hover:bg-muted"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            <div className="my-2 h-px bg-border" aria-hidden="true" />

            <button
              type="button"
              onClick={() => go({ name: "contact" })}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-4 text-[15px] font-bold text-white dark:text-emerald-950"
            >
              <Headset className="size-5" />
              مشاوره تخصصی رایگان
            </button>
            <button
              type="button"
              onClick={goAdmin}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShieldCheck className="size-4" />
              ورود به پنل مدیریت
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

function goAdmin() {
  navigate({ name: "admin" });
}
