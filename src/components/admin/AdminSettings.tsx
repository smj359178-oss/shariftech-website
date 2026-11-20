"use client";

// ===========================================================================
// تنظیمات سایت: هویت، بخش هیرو، اطلاعات تماس و شبکه‌های اجتماعی
// ذخیره‌سازی با PUT /api/settings — اعتبارسنجی نهایی سمت سرور انجام می‌شود
// ===========================================================================
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
  Lock,
  Phone,
  RefreshCw,
  Save,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getJSON, putJSON, SessionExpiredError } from "@/components/admin/api-client";
import type { AdminSessionUser, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// اعتبارسنجی سمت کلاینت لینک‌های اجتماعی (مطابق allowlist سرور)
// ---------------------------------------------------------------------------

const SOCIAL_ALLOWED_HOSTS = [
  "linkedin.com",
  "instagram.com",
  "t.me",
  "telegram.me",
  "x.com",
  "twitter.com",
  "youtube.com",
  "github.com",
  "aparat.com",
];

/** خالی = مجاز (حذف لینک) | در غیر این‌صورت باید https و دامنه مجاز باشد */
function isValidSocialUrl(value: string): boolean {
  const raw = value.trim();
  if (raw === "") return true;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return SOCIAL_ALLOWED_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

const SOCIAL_HELPER_TEXT =
  "آدرس https معتبر؛ دامنه‌های مجاز: linkedin.com، instagram.com، t.me، telegram.me، x.com، twitter.com، youtube.com، github.com و aparat.com — خالی گذاشتن یعنی حذف لینک";

type SettingsForm = Omit<SiteSettings, "id">;

/** تبدیل پاسخ سرور به فرم بدون فیلد id */
function toSettingsForm(settings: SiteSettings): SettingsForm {
  return {
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
  };
}

const EMPTY_FORM: SettingsForm = {
  siteName: "",
  siteShortName: "",
  tagline: "",
  heroTitle: "",
  heroSubtitle: "",
  phone: "",
  email: "",
  address: "",
  linkedin: "",
  instagram: "",
  telegram: "",
};

interface SectionDef {
  title: string;
  description: string;
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  {
    title: "هویت سایت",
    description: "نام و شعار نمایش‌داده‌شده در هدر و فوتر سایت",
    icon: Building2,
  },
  {
    title: "بخش هیرو",
    description: "تیتر و زیرتیتر معرفی در بالای صفحه اصلی",
    icon: LayoutTemplate,
  },
  {
    title: "اطلاعات تماس",
    description: "راه‌های ارتباطی نمایش‌داده‌شده در بخش تماس و فوتر",
    icon: Phone,
  },
  {
    title: "شبکه‌های اجتماعی",
    description: "لینک‌های رسمی سازمان در شبکه‌های اجتماعی",
    icon: Share2,
  },
];

export function AdminSettings({
  user,
  onSiteDataChanged,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** پس از ذخیره تنظیمات برای همگام‌سازی سایت فراخوانی می‌شود */
  onSiteDataChanged: () => void;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const { toast } = useToast();
  const canRead = user.permissions.includes("settings.read");
  const canWrite = user.permissions.includes("settings.write");

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [loaded, setLoaded] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<{ settings: SiteSettings }>("/api/settings");
      const next = toSettingsForm(data.settings);
      setForm(next);
      setLoaded(next);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت تنظیمات");
    } finally {
      setLoading(false);
    }
  }, [canRead, onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useCallback((patchFields: Partial<SettingsForm>) => {
    setForm((prev) => ({ ...prev, ...patchFields }));
  }, []);

  // --- نشانگر تغییرات ذخیره‌نشده ---
  const isDirty = useMemo(() => {
    if (!loaded) return false;
    return (Object.keys(EMPTY_FORM) as (keyof SettingsForm)[]).some(
      (key) => form[key] !== loaded[key]
    );
  }, [form, loaded]);

  const hasInvalidSocial = useMemo(
    () =>
      !isValidSocialUrl(form.linkedin) ||
      !isValidSocialUrl(form.instagram) ||
      !isValidSocialUrl(form.telegram),
    [form.linkedin, form.instagram, form.telegram]
  );

  // --- ذخیره ---
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const data = await putJSON<{ settings: SiteSettings }>("/api/settings", form);
      const next = toSettingsForm(data.settings);
      setForm(next);
      setLoaded(next);
      toast({
        title: "تنظیمات ذخیره شد",
        description: "تغییرات بلافاصله در سایت اعمال می‌شود",
      });
      onSiteDataChanged();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      toast({
        title: "ذخیره تنظیمات ناموفق بود",
        description: err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // --- حالت بدون مجوز ---
  if (!canRead) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <Lock className="size-10 text-muted-foreground/50" aria-hidden />
        <p className="text-sm font-medium">دسترسی محدود</p>
        <p className="text-xs text-muted-foreground">
          شما به بخش تنظیمات سایت دسترسی ندارید؛ برای دریافت دسترسی با مدیر سیستم تماس بگیرید.
        </p>
      </div>
    );
  }

  // --- پیش‌نمایش زنده لینک اجتماعی ---
  function socialPreview(value: string) {
    const raw = value.trim();
    if (raw === "") return null;
    if (isValidSocialUrl(raw)) {
      return (
        <span
          dir="ltr"
          className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-left text-[11px] text-emerald-700 dark:text-emerald-300"
        >
          <LinkIcon className="size-3 shrink-0" aria-hidden />
          {raw}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-destructive">
        <AlertTriangle className="size-3 shrink-0" aria-hidden />
        آدرس باید با https:// شروع شود و به یکی از دامنه‌های مجاز تعلق داشته باشد
      </span>
    );
  }

  const socialFields: { key: keyof SettingsForm; label: string; placeholder: string }[] = [
    { key: "linkedin", label: "لینکدین", placeholder: "https://linkedin.com/company/shariftech" },
    { key: "instagram", label: "اینستاگرام", placeholder: "https://instagram.com/shariftech" },
    { key: "telegram", label: "تلگرام", placeholder: "https://t.me/shariftech" },
  ];

  return (
    <div className="space-y-6">
      {/* بارگذاری */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border bg-card p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-4 h-11 w-full" />
              <Skeleton className="mt-3 h-11 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {/* خطا */}
      {!loading && error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="size-8 text-destructive" aria-hidden />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="size-4" aria-hidden />
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      {/* فرم تنظیمات */}
      {!loading && !error
        ? SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="rounded-2xl border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-4 text-emerald-500" aria-hidden />
                    {section.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.title === "هویت سایت" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="settings-site-name">نام کامل سایت</Label>
                        <Input
                          id="settings-site-name"
                          value={form.siteName}
                          onChange={(e) => patch({ siteName: e.target.value })}
                          placeholder="شرکت فناوری اطلاعات دانشگاه صنعتی شریف"
                          aria-label="نام کامل سایت"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-site-short">نام کوتاه / برند</Label>
                        <Input
                          id="settings-site-short"
                          value={form.siteShortName}
                          onChange={(e) => patch({ siteShortName: e.target.value })}
                          placeholder="شریف‌تک"
                          aria-label="نام کوتاه برند"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-tagline">شعار سایت</Label>
                        <Input
                          id="settings-tagline"
                          value={form.tagline}
                          onChange={(e) => patch({ tagline: e.target.value })}
                          placeholder="مثلاً تحول دیجیتال صنایع با هوش مصنوعی"
                          aria-label="شعار سایت"
                        />
                      </div>
                    </div>
                  ) : null}

                  {section.title === "بخش هیرو" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="settings-hero-title">تیتر اصلی</Label>
                        <Textarea
                          id="settings-hero-title"
                          rows={2}
                          value={form.heroTitle}
                          onChange={(e) => patch({ heroTitle: e.target.value })}
                          placeholder="تیتر بزرگ بالای صفحه اصلی"
                          aria-label="تیتر اصلی بخش هیرو"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-hero-subtitle">زیرتیتر معرفی</Label>
                        <Textarea
                          id="settings-hero-subtitle"
                          rows={3}
                          value={form.heroSubtitle}
                          onChange={(e) => patch({ heroSubtitle: e.target.value })}
                          placeholder="معرفی کوتاه شرکت در چند خط"
                          aria-label="زیرتیتر بخش هیرو"
                        />
                      </div>
                    </div>
                  ) : null}

                  {section.title === "اطلاعات تماس" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="settings-phone">تلفن تماس</Label>
                        <Input
                          id="settings-phone"
                          dir="ltr"
                          value={form.phone}
                          onChange={(e) => patch({ phone: e.target.value })}
                          placeholder="021-66000000"
                          aria-label="تلفن تماس"
                          className="text-left"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-email">ایمیل</Label>
                        <Input
                          id="settings-email"
                          dir="ltr"
                          value={form.email}
                          onChange={(e) => patch({ email: e.target.value })}
                          placeholder="info@shariftech.ir"
                          aria-label="ایمیل"
                          className="text-left"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="settings-address">آدرس</Label>
                        <Textarea
                          id="settings-address"
                          rows={2}
                          value={form.address}
                          onChange={(e) => patch({ address: e.target.value })}
                          placeholder="نشانی دفتر مرکزی"
                          aria-label="آدرس دفتر مرکزی"
                        />
                      </div>
                    </div>
                  ) : null}

                  {section.title === "شبکه‌های اجتماعی" ? (
                    <div className="space-y-4">
                      <p className="text-xs leading-5 text-muted-foreground">{SOCIAL_HELPER_TEXT}</p>
                      {socialFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={`settings-${field.key}`}>{field.label}</Label>
                          <Input
                            id={`settings-${field.key}`}
                            dir="ltr"
                            value={form[field.key]}
                            onChange={(e) => patch({ [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            aria-label={field.label}
                            className="text-left"
                            spellCheck={false}
                          />
                          {socialPreview(form[field.key])}
                        </div>
                      ))}
                      {hasInvalidSocial ? (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"
                        >
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          <p>
                            برخی آدرس‌های اجتماعی نامعتبر هستند؛ ذخیره ممکن است با خطای سرور مواجه شود.
                            اعتبار نهایی توسط سرور بررسی می‌شود.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        : null}

      {/* نوار ذخیره */}
      {!loading && !error && canWrite ? (
        <div
          className={cn(
            "sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80",
            isDirty && "border-amber-500/40"
          )}
        >
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                <span className="size-2 rounded-full bg-amber-500" aria-hidden />
                تغییرات ذخیره‌نشده دارید
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">همه تغییرات ذخیره شده‌اند</span>
            )}
            {hasInvalidSocial && isDirty ? (
              <span className="text-xs text-destructive">— آدرس اجتماعی نامعتبر</span>
            ) : null}
          </div>
          <Button onClick={() => void handleSave()} disabled={saving} className="h-11">
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                ذخیره تنظیمات
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
