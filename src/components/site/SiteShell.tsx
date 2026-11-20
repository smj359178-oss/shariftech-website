"use client";

// ===========================================================================
// SiteShell — روتر مجازی سایت با تعویض آنی صفحات (بدون reload)
// مسیرها: #/ (خانه) | #/products | #/products/<slug> | #/industries
//         | #/about | #/contact | #/faq | #/admin (پنل مدیریت)
//
// امنیت: نشست مدیر فقط با کوکی HttpOnly مدیریت می‌شود (بدون token در JS)
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Product, SiteSettings, AdminSessionUser } from "@/lib/types";
import {
  parseHash,
  navigate,
  routeKey,
  ROUTE_TITLES,
  type SiteRoute,
} from "@/lib/navigation";
import { HomePage } from "./HomePage";
import { ProductsPage } from "./ProductsPage";
import { ProductDetailPage } from "./ProductDetailPage";
import { IndustriesPage } from "./IndustriesPage";
import { AboutPage } from "./AboutPage";
import { ContactPage } from "./ContactPage";
import { FaqPage } from "./FaqPage";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";

// ---------------------------------------------------------------------------
// کامپوننت‌های پنل مدیریت به‌صورت lazy بارگذاری می‌شوند — بازدیدکننده عادی
// هرگز کد پنل را دانلود نمی‌کند (جداسازی مرز bundle: site / admin)
// ---------------------------------------------------------------------------
const AdminLogin = dynamic(
  () => import("@/components/admin/AdminLogin").then((m) => m.AdminLogin),
  { ssr: false, loading: () => <AdminRouteFallback /> }
);
const AdminShell = dynamic(
  () => import("@/components/admin/AdminShell").then((m) => m.AdminShell),
  { ssr: false, loading: () => <AdminRouteFallback /> }
);

function AdminRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-2 border-border border-t-emerald-400" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      </div>
    </div>
  );
}

interface SiteShellProps {
  initialProducts: Product[];
  initialSettings: SiteSettings;
}

export function SiteShell({ initialProducts, initialSettings }: SiteShellProps) {
  // نکته hydration: رندر اولیه همیشه «خانه» است تا با HTML سرور یکسان بماند؛
  // hash واقعی مرورگر بلافاصله پس از mount اعمال می‌شود (بدون خطای mismatch)
  const [route, setRoute] = useState<SiteRoute>({ name: "home" });
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const prevRouteRef = useRef<string>("home");

  // --- اعمال hash اولیه + پارس تغییر hash (تعویض آنی صفحات) ---
  useEffect(() => {
    // اعمال مسیر اولیه از hash مرورگر (deep-link مثل #/admin یا #/products/x)
    const initial = parseHash(window.location.hash);
    setRoute((prev) => (routeKey(prev) === routeKey(initial) ? prev : initial));
    prevRouteRef.current = routeKey(initial);

    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      setRoute((prev) =>
        routeKey(prev) === routeKey(next) ? prev : next
      );
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // --- بازیابی نشست از کوکی HttpOnly (فقط یک‌بار در mount) ---
  // بهینه‌سازی: برای بازدیدکننده ناشناس درخواست /api/auth/me فرستاده نمی‌شود؛
  // نشست فقط وقتی بازیابی می‌شود که در همین تب قبلاً ورود انجام شده باشد.
  useEffect(() => {
    let cancelled = false;
    const hadSession =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("st-admin-session") === "1";
    if (!hadSession) {
      setSessionLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data?.user) setAdminUser(data.user as AdminSessionUser);
        }
      } catch {
        /* بدون نشست ادامه می‌دهیم */
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- عنوان سند متناسب با صفحه (سئو + دسترس‌پذیری) ---
  useEffect(() => {
    const product = route.name === "product"
      ? products.find((p) => p.slug === route.slug)
      : null;
    document.title = product
      ? `${product.title} | شریف‌تک`
      : ROUTE_TITLES[route.name];
  }, [route, products]);

  // --- تازه‌سازی داده‌ها (پس از تغییرات پنل مدیریت) ---
  const refreshData = useCallback(async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch("/api/products?pageSize=100", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
      ]);
      if (productsRes.ok) {
        const data = await productsRes.json();
        if (Array.isArray(data.products)) setProducts(data.products);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch {
      /* در حالت آفلاین داده‌های اولیه باقی می‌مانند */
    }
  }, []);

  // --- واکنش به تغییر صفحه: اسکرول بالا + تازه‌سازی داده پس از بازگشت از پنل ---
  useEffect(() => {
    const key = routeKey(route);
    if (prevRouteRef.current === key) return;
    const prevWasAdmin = prevRouteRef.current?.startsWith("admin:") || prevRouteRef.current === "admin";
    prevRouteRef.current = key;
    window.scrollTo({ top: 0 });
    // فقط پس از بازگشت از پنل مدیریت داده‌ها تازه می‌شوند — نه در هر جابه‌جایی صفحه
    if (prevWasAdmin && route.name !== "admin") {
      void refreshData();
    }
  }, [route, refreshData]);

  // --- ناوبری ---
  const goAdmin = useCallback(() => navigate({ name: "admin" }), []);
  const exitAdmin = useCallback(() => navigate({ name: "home" }), []);

  const handleLogin = useCallback((user: AdminSessionUser) => {
    // نشست این تب ثبت می‌شود تا /api/auth/me فقط برای مدیرِ واقعی صدا زده شود
    try {
      window.sessionStorage.setItem("st-admin-session", "1");
    } catch {
      /* حالت private browsing — بدون تاثیر بر عملکرد */
    }
    setAdminUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setAdminUser(null);
    exitAdmin();
  }, [exitAdmin]);

  // =========================================================================
  // پنل مدیریت
  // =========================================================================
  if (route.name === "admin") {
    if (sessionLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 animate-spin rounded-full border-2 border-border border-t-emerald-400" />
            <p className="text-sm text-muted-foreground">در حال بررسی نشست…</p>
          </div>
        </div>
      );
    }
    if (!adminUser) {
      return <AdminLogin onSuccess={handleLogin} />;
    }
    return (
      <AdminShell
        user={adminUser}
        onLogout={handleLogout}
        onExitSite={exitAdmin}
        onSiteDataChanged={refreshData}
      />
    );
  }

  // =========================================================================
  // صفحات عمومی (فوتر چسبان با min-h-screen flex flex-col + mt-auto)
  // =========================================================================
  let page: React.ReactNode;
  switch (route.name) {
    case "products":
      page = <ProductsPage products={products} settings={settings} />;
      break;
    case "product": {
      const product = products.find((p) => p.slug === route.slug);
      page = (
        <ProductDetailPage
          product={product ?? null}
          relatedProducts={products.filter((p) => p.slug !== route.slug).slice(0, 3)}
          settings={settings}
        />
      );
      break;
    }
    case "industries":
      page = <IndustriesPage settings={settings} />;
      break;
    case "about":
      page = <AboutPage settings={settings} />;
      break;
    case "contact":
      page = <ContactPage settings={settings} />;
      break;
    case "faq":
      page = <FaqPage settings={settings} />;
      break;
    default:
      page = <HomePage products={products} settings={settings} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} currentRoute={route} />
      <main className="flex-1" key={routeKey(route)}>
        <div className="page-enter">{page}</div>
      </main>
      <SiteFooter settings={settings} onAdminClick={goAdmin} />
      {/* فضای ناوبری پایین موبایل */}
      <div className="h-0 pb-safe-bottom" aria-hidden="true" />
      <MobileBottomNav currentRoute={route} />
    </div>
  );
}
