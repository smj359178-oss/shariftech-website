// ===========================================================================
// ناوبری مجازی سایت — روتر hash برای تعویض آنی صفحات (بدون reload)
// مسیرها: #/ | #/products | #/products/<slug> | #/industries | #/about
//         | #/contact | #/faq | #/admin
// ===========================================================================

export type SiteRoute =
  | { name: "home" }
  | { name: "products" }
  | { name: "product"; slug: string }
  | { name: "industries" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "faq" }
  | { name: "admin" };

/** پارس hash مرورگر به Route ساخت‌یافته */
export function parseHash(hash: string): SiteRoute {
  const path = hash.replace(/^#/, "").replace(/^\/+/, "");
  if (!path) return { name: "home" };

  const segments = path.split("/").filter(Boolean);

  switch (segments[0]) {
    case "products":
      return segments[1] ? { name: "product", slug: decodeURIComponent(segments[1]) } : { name: "products" };
    case "industries":
      return { name: "industries" };
    case "about":
      return { name: "about" };
    case "contact":
      return { name: "contact" };
    case "faq":
      return { name: "faq" };
    case "admin":
      return { name: "admin" };
    default:
      return { name: "home" };
  }
}

/** تبدیل Route به hash — برای navigate و ساخت لینک‌ها */
export function routeToHash(route: SiteRoute): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "products":
      return "#/products";
    case "product":
      return `#/products/${encodeURIComponent(route.slug)}`;
    case "industries":
      return "#/industries";
    case "about":
      return "#/about";
    case "contact":
      return "#/contact";
    case "faq":
      return "#/faq";
    case "admin":
      return "#/admin";
  }
}

/** کلید یکتای route برای AnimatePresence و key های React */
export function routeKey(route: SiteRoute): string {
  return route.name === "product" ? `product:${route.slug}` : route.name;
}

/** ناوبری برنامه‌ای: تغییر hash (رویداد hashchange را فعال می‌کند) */
export function navigate(route: SiteRoute): void {
  const target = routeToHash(route);
  if (window.location.hash === target) {
    // اگر روتر روی همین صفحه است، فقط به بالا برگرد
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = target;
}

/** عنوان سند برای هر صفحه (سئو و دسترس‌پذیری) */
export const ROUTE_TITLES: Record<SiteRoute["name"], string> = {
  home: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف | هوش مصنوعی صنعتی",
  products: "محصولات و راهکارها | شریف‌تک",
  product: "جزئیات محصول | شریف‌تک",
  industries: "صنایع هدف | شریف‌تک",
  about: "درباره شریف‌تک | شریف‌تک",
  contact: "تماس با ما | شریف‌تک",
  faq: "پرسش‌های متداول | شریف‌تک",
  admin: "پنل مدیریت | شریف‌تک",
};
