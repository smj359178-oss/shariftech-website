"use client";

// ===========================================================================
// ناوبری پایین موبایل — منوی زیبا و چسبیده با نشانگر فعال
// فقط در موبایل/تبلت (زیر lg) نمایش داده می‌شود؛ دسترسی‌پذیر و لمس‌پذیر
// ===========================================================================
import { Home, Package, Factory, Headset, ShieldCheck } from "lucide-react";
import { navigate, type SiteRoute } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { route: { name: "home" } as SiteRoute, label: "خانه", icon: Home },
  { route: { name: "products" } as SiteRoute, label: "محصولات", icon: Package },
  { route: { name: "industries" } as SiteRoute, label: "صنایع", icon: Factory },
  { route: { name: "contact" } as SiteRoute, label: "تماس", icon: Headset },
] as const;

export function MobileBottomNav({ currentRoute }: { currentRoute: SiteRoute }) {
  // پنل مدیریت ناوبری عمومی ندارد
  if (currentRoute.name === "admin") return null;

  return (
    <nav
      aria-label="ناوبری پایین موبایل"
      className="pb-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-2xl sm:hidden"
      style={{ boxShadow: "0 -8px 30px -12px rgba(0,0,0,0.35)" }}
    >
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = currentRoute.name === item.route.name;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.route)}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 pt-1.5 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* نشانگر فعال بالای آیکون */}
              <span
                className={cn(
                  "absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-l from-emerald-400 to-teal-400 transition-all duration-300",
                  active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                )}
                aria-hidden="true"
              />
              <Icon
                className={cn(
                  "size-[22px] transition-colors",
                  active
                    ? "text-emerald-500 dark:text-emerald-300"
                    : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[10.5px] font-medium leading-3 transition-colors",
                  active
                    ? "font-bold text-emerald-600 dark:text-emerald-300"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* ورود پنل */}
        <button
          type="button"
          onClick={() => navigate({ name: "admin" })}
          className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 pt-1.5 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShieldCheck className="size-[22px] text-muted-foreground" aria-hidden="true" />
          <span className="text-[10.5px] font-medium leading-3 text-muted-foreground">
            پنل
          </span>
        </button>
      </div>
    </nav>
  );
}
