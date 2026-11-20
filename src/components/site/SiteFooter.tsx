"use client";

// ===========================================================================
// SiteFooter — فوتر چهارستونه با ناوبری hash، تماس و ورود پنل مدیریت
// pb-24 در موبایل تا محتوا زیر نوار ناوبری پایین پنهان نشود
// ===========================================================================
import { Instagram, Linkedin, LockKeyhole, Mail, MapPin, Phone, Send } from "lucide-react";
import { CATEGORY_LABELS, type SiteSettings } from "@/lib/types";
import { navigate, type SiteRoute } from "@/lib/navigation";
import { Logo } from "./Logo";

const QUICK_LINKS: { route: SiteRoute; label: string }[] = [
  { route: { name: "home" }, label: "خانه" },
  { route: { name: "products" }, label: "محصولات" },
  { route: { name: "industries" }, label: "صنایع" },
  { route: { name: "about" }, label: "درباره ما" },
  { route: { name: "faq" }, label: "پرسش‌های متداول" },
  { route: { name: "contact" }, label: "تماس با ما" },
];

const CATEGORY_LINKS = [
  CATEGORY_LABELS.AI_AGENT,
  CATEGORY_LABELS.DASHBOARD,
  CATEGORY_LABELS.SMART_SYSTEM,
  CATEGORY_LABELS.CUSTOM,
];

const FOOTER_LINK_CLASS =
  "inline-flex min-h-[44px] w-fit items-center rounded-lg px-1 text-sm text-muted-foreground transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300";

export function SiteFooter({
  settings,
  onAdminClick,
}: {
  settings: SiteSettings;
  onAdminClick?: () => void;
}) {
  const socials = [
    { href: settings.linkedin, label: "لینکدین شریف‌تک", icon: Linkedin },
    { href: settings.instagram, label: "اینستاگرام شریف‌تک", icon: Instagram },
    { href: settings.telegram, label: "تلگرام شریف‌تک", icon: Send },
  ].filter((social) => social.href);

  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-6">
        {/* شبکه اصلی فوتر */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* برند */}
          <div className="flex flex-col gap-4">
            <Logo siteName={settings.siteName} siteShortName={settings.siteShortName} />
            <p className="text-sm leading-7 text-muted-foreground">{settings.tagline}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socials.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-emerald-400/40 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300"
                    >
                      <SocialIcon className="size-4" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* دسترسی سریع */}
          <nav aria-label="دسترسی سریع" className="flex flex-col gap-1">
            <h3 className="font-bold">دسترسی سریع</h3>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => navigate(link.route)}
                className={FOOTER_LINK_CLASS}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* محصولات */}
          <nav aria-label="دسته‌بندی محصولات" className="flex flex-col gap-1">
            <h3 className="font-bold">محصولات</h3>
            {CATEGORY_LINKS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate({ name: "products" })}
                className={FOOTER_LINK_CLASS}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* تماس */}
          <div className="flex flex-col gap-1">
            <h3 className="font-bold">تماس</h3>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300"
            >
              <Phone className="size-4 shrink-0 text-emerald-600/70 dark:text-emerald-300/70" aria-hidden="true" />
              <span dir="ltr" className="font-mono">
                {settings.phone}
              </span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-300"
            >
              <Mail className="size-4 shrink-0 text-emerald-600/70 dark:text-emerald-300/70" aria-hidden="true" />
              <span dir="ltr" className="font-mono">
                {settings.email}
              </span>
            </a>
            <p className="flex items-start gap-2 py-1.5 text-sm leading-6 text-muted-foreground">
              <MapPin className="mt-1 size-4 shrink-0 text-emerald-600/70 dark:text-emerald-300/70" aria-hidden="true" />
              {settings.address}
            </p>
          </div>
        </div>

        {/* نوار پایانی */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-center text-xs leading-6 text-muted-foreground sm:text-right">
            © ۱۴۰۵ {settings.siteShortName} — شرکت فناوری اطلاعات دانشگاه صنعتی شریف. تمامی حقوق
            محفوظ است.
          </p>
          <button
            type="button"
            onClick={onAdminClick}
            aria-label="ورود به پنل مدیریت"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground transition-colors hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-amber-300"
          >
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            پنل مدیریت
          </button>
        </div>
      </div>
    </footer>
  );
}
