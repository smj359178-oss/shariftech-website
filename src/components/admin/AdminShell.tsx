"use client";

// ===========================================================================
// پوسته پنل مدیریت شریف‌تک
// - احراز هویت با کوکی نشست (بدون توکن در جاوااسکریپت)
// - ستون کناری دسکتاپ + منوی Sheet موبایل، با گیت مجوزها (RBAC)
// - ناوبری بین شش بخش: داشبورد، محصولات، پیام‌ها، تنظیمات، کاربران، لاگ فعالیت
// ===========================================================================
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminActivity } from "@/components/admin/AdminActivity";
import { getJSON, postJSON } from "@/components/admin/api-client";
import { initialsFa } from "@/components/admin/format";
import { ROLE_LABELS } from "@/lib/permissions";
import type { DashboardStats, AdminSessionUser } from "@/lib/types";
import { toFa } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "dashboard"
  | "products"
  | "messages"
  | "settings"
  | "users"
  | "activity";

interface NavItemDef {
  key: AdminSection;
  label: string;
  icon: LucideIcon;
  permission: string;
  /** نمایش شمارنده پیام‌های جدید روی آیتم منو */
  newBadge?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard, permission: "dashboard.read" },
  { key: "products", label: "محصولات", icon: Package, permission: "products.read" },
  { key: "messages", label: "پیام‌ها", icon: Mail, permission: "messages.read", newBadge: true },
  { key: "settings", label: "تنظیمات", icon: Settings, permission: "settings.read" },
  { key: "users", label: "کاربران", icon: Users, permission: "users.read" },
  { key: "activity", label: "لاگ فعالیت", icon: History, permission: "activity.read" },
];

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: "داشبورد مدیریت",
  products: "مدیریت محصولات",
  messages: "پیام‌های تماس",
  settings: "تنظیمات سایت",
  users: "مدیریت کاربران",
  activity: "لاگ فعالیت",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EDITOR: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SALES: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  VIEWER: "border-border bg-muted text-muted-foreground",
};

function roleLabel(role: string): string {
  return (ROLE_LABELS as Record<string, string>)[role] ?? role;
}

export function AdminShell({
  user,
  onLogout,
  onExitSite,
  onSiteDataChanged,
}: {
  user: AdminSessionUser;
  onLogout: () => void;
  onExitSite: () => void;
  onSiteDataChanged: () => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const can = useCallback(
    (permission: string) => user.permissions.includes(permission),
    [user.permissions]
  );
  const canReadMessages = can("messages.read");

  // --- دریافت آمار برای نشان پیام‌های جدید (اگر مجوز messages.read باشد) ---
  const refreshStats = useCallback(async () => {
    if (!canReadMessages) return;
    try {
      const data = await getJSON<{ stats: DashboardStats }>("/api/stats");
      setStats(data.stats);
    } catch {
      // نشان اعلان غیرحیاتی است؛ خطا نادیده گرفته می‌شود
    }
  }, [canReadMessages]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  // --- خروج: ابطال نشست سرور + پاک‌سازی رابط کاربری ---
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await postJSON<{ success: boolean }>("/api/auth/logout", {});
    } catch {
      // حتی در صورت خطای شبکه، کاربر از رابط کاربری خارج می‌شود
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  }, [onLogout]);

  // --- انقضای نشست: خروج بدون فراخوانی API ---
  const handleSessionExpired = useCallback(() => {
    onLogout();
  }, [onLogout]);

  // --- همگام‌سازی داده‌های سایت پس از تغییر محصول/تنظیمات ---
  const handleSiteDataChanged = useCallback(() => {
    onSiteDataChanged();
  }, [onSiteDataChanged]);

  const navigate = useCallback((section: AdminSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
  }, []);

  // جابه‌جایی از طریق دسترسی سریع بخش‌ها (تب به‌صورت رشته از فرزند دریافت می‌شود)
  const handleNavigateTab = useCallback(
    (tab: string) => {
      const section = NAV_ITEMS.find((item) => item.key === tab)?.key;
      if (section) navigate(section);
    },
    [navigate]
  );

  const newMessagesCount = stats?.messagesNew ?? 0;

  // --- آیتم‌های منو (مشترک بین ستون کناری و Sheet موبایل) ---
  const renderNavItems = () => (
    <>
      {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => {
        const active = activeSection === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.key)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
            {item.newBadge && newMessagesCount > 0 ? (
              <Badge
                variant="outline"
                className="ms-auto border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"
              >
                {toFa(newMessagesCount)}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </>
  );

  const roleBadgeClass = ROLE_BADGE_CLASSES[user.role] ?? "border-border bg-muted text-muted-foreground";

  const avatarBlock = (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
      <Avatar className="size-9 shrink-0 border border-border">
        <AvatarFallback className="bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300">
          {initialsFa(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <Badge variant="outline" className={cn("mt-1 text-[10px]", roleBadgeClass)}>
          {roleLabel(user.role)}
        </Badge>
      </div>
      <ThemeToggle />
    </div>
  );

  const sidebarActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExitSite}
        className="h-10 flex-1"
      >
        <ExternalLink className="size-4" aria-hidden />
        مشاهده سایت
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
        aria-label="خروج از حساب"
        className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" aria-hidden />
        خروج
      </Button>
    </div>
  );

  // --- رندر بخش فعال ---
  function renderSection() {
    switch (activeSection) {
      case "dashboard":
        return (
          <AdminDashboard
            user={user}
            onNavigateTab={handleNavigateTab}
            onSessionExpired={handleSessionExpired}
          />
        );
      case "products":
        return (
          <AdminProducts
            user={user}
            onSiteDataChanged={handleSiteDataChanged}
            onSessionExpired={handleSessionExpired}
          />
        );
      case "messages":
        return (
          <AdminMessages
            user={user}
            onMessagesChanged={refreshStats}
            onSessionExpired={handleSessionExpired}
          />
        );
      case "settings":
        return (
          <AdminSettings
            user={user}
            onSiteDataChanged={handleSiteDataChanged}
            onSessionExpired={handleSessionExpired}
          />
        );
      case "users":
        return <AdminUsers user={user} onSessionExpired={handleSessionExpired} />;
      case "activity":
        return <AdminActivity user={user} onSessionExpired={handleSessionExpired} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ستون کناری دسکتاپ — در RTL سمت راست فیزیکی */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 flex-col border-l border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-5 py-4">
          <Logo siteName="شرکت فناوری اطلاعات دانشگاه صنعتی شریف" siteShortName="شریف‌تک" />
        </div>

        <nav
          aria-label="ناوبری پنل مدیریت"
          className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {renderNavItems()}
        </nav>

        <div className="space-y-2 border-t border-sidebar-border p-3">
          {avatarBlock}
          {sidebarActions}
        </div>
      </aside>

      {/* محتوای اصلی */}
      <div className="flex min-w-0 flex-1 flex-col lg:pr-64">
        <header className="glass-strong sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 px-4 sm:px-6">
          {/* منوی موبایل */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="باز کردن منوی مدیریت"
                className="lg:hidden"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-sidebar-border bg-sidebar p-0"
            >
              <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
              <SheetDescription className="sr-only">
                ناوبری بین بخش‌های پنل مدیریت شریف‌تک
              </SheetDescription>
              <div className="flex h-full flex-col">
                <div className="border-b border-sidebar-border px-5 py-4">
                  <Logo siteName="شرکت فناوری اطلاعات دانشگاه صنعتی شریف" siteShortName="شریف‌تک" />
                </div>
                <nav
                  aria-label="ناوبری پنل مدیریت"
                  className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4"
                >
                  {renderNavItems()}
                </nav>
                <div className="space-y-2 border-t border-sidebar-border p-3">
                  {avatarBlock}
                  {sidebarActions}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="truncate text-base font-bold sm:text-lg">
            {SECTION_TITLES[activeSection]}
          </h1>

          <div className="ms-auto flex items-center gap-2">
            {/* دکمه تغییر تم */}
            <ThemeToggle />

            {/* نشان اعلان پیام‌های جدید */}
            {canReadMessages ? (
              <button
                type="button"
                onClick={() => navigate("messages")}
                aria-label={
                  newMessagesCount > 0
                    ? `${toFa(newMessagesCount)} پیام جدید`
                    : "پیام‌های جدید"
                }
                title="پیام‌های جدید"
                className="glass relative inline-flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:border-emerald-400/50 hover:glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Bell className="size-5" aria-hidden />
                {newMessagesCount > 0 ? (
                  <span className="absolute -end-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-5 text-white">
                    {toFa(newMessagesCount)}
                  </span>
                ) : null}
              </button>
            ) : null}

            {/* منوی کاربر */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="منوی کاربر"
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-9 border border-border">
                    <AvatarFallback className="bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                      {initialsFa(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p dir="ltr" className="text-left text-xs font-normal text-muted-foreground">
                    @{user.username}
                  </p>
                  <Badge variant="outline" className={cn("mt-1.5 text-[10px]", roleBadgeClass)}>
                    {roleLabel(user.role)}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onExitSite}
                  className="cursor-pointer"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  مشاهده سایت
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4" aria-hidden />
                  خروج از حساب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mx-auto w-full max-w-6xl"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
