import { db } from "@/lib/db";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from "@/lib/site-defaults";
import { SiteShell } from "@/components/site/SiteShell";
import { safeJsonLd } from "@/lib/jsonld";
import { FAQ_CONTENT } from "@/lib/faq-content";
import { Product, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shariftech.ir";

// ===========================================================================
// دریافت داده‌ها از دیتابیس (SSR برای سئو)
// خطای اتصال لاگ می‌شود (نه خاموش)؛ در حالت خطا داده پیش‌فرض دمو نمایش
// داده می‌شود تا سایت هرگز سفید/خالی نبیند.
// ===========================================================================
async function getSiteData(): Promise<{
  products: Product[];
  settings: SiteSettings;
  dbHealthy: boolean;
}> {
  try {
    const [rawProducts, settings] = await Promise.all([
      db.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
        take: 100,
      }),
      db.siteSetting.findUnique({ where: { id: "main" } }),
    ]);

    const products: Product[] = rawProducts.map((p) => {
      const safeParse = (raw: string): unknown => {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      };
      const features = safeParse(p.features);
      const useCases = safeParse(p.useCases);
      const techStack = safeParse(p.techStack);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        category: p.category,
        summary: p.summary,
        description: p.description,
        features: Array.isArray(features)
          ? features.filter((f): f is string => typeof f === "string")
          : [],
        useCases: Array.isArray(useCases)
          ? useCases.filter(
              (u): u is { title: string; description: string } =>
                typeof u === "object" &&
                u !== null &&
                typeof (u as { title?: unknown }).title === "string" &&
                typeof (u as { description?: unknown }).description === "string"
            )
          : [],
        techStack: Array.isArray(techStack)
          ? techStack.filter((t): t is string => typeof t === "string")
          : [],
        image: p.image,
        icon: p.icon,
        accent: p.accent,
        featured: p.featured,
        status: p.status,
        sort: p.sort,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    const siteSettings: SiteSettings = settings
      ? {
          siteName: settings.siteName,
          siteShortName: settings.siteShortName,
          tagline: settings.tagline,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          linkedin: settings.linkedin,
          instagram: settings.instagram,
          telegram: settings.telegram,
        }
      : DEFAULT_SETTINGS;

    return {
      products: products.length > 0 ? products : DEFAULT_PRODUCTS,
      settings: siteSettings,
      dbHealthy: true,
    };
  } catch (error) {
    // خطای دیتابیس هرگز خاموش نیست — برای مانیتورینگ ثبت می‌شود
    console.error("[getSiteData] database unavailable:", error);
    return { products: DEFAULT_PRODUCTS, settings: DEFAULT_SETTINGS, dbHealthy: false };
  }
}

// ===========================================================================
// ساختار داده سئوی معنایی (Schema.org JSON-LD) — هم‌سو با محتوای صفحه
// ===========================================================================
function buildJsonLd(products: Product[], settings: SiteSettings) {
  const sameAs = [settings.linkedin, settings.instagram, settings.telegram].filter(
    Boolean
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: settings.siteName,
        alternateName: settings.siteShortName,
        url: SITE_URL,
        description: settings.tagline,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: "تهران",
          addressCountry: "IR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: settings.phone,
          email: settings.email,
          contactType: "sales",
          availableLanguage: ["fa", "en"],
        },
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: settings.siteName,
        inLanguage: "fa-IR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        name: "محصولات و راهکارها",
        itemListElement: products.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareApplication",
            name: p.title,
            description: p.summary || p.description,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            ...(p.subtitle ? { alternateName: p.subtitle } : {}),
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_CONTENT.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

// ===========================================================================
// صفحه اصلی
// ===========================================================================
export default async function HomePage() {
  const { products, settings } = await getSiteData();
  const jsonLd = buildJsonLd(products, settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <SiteShell initialProducts={products} initialSettings={settings} />
    </>
  );
}
