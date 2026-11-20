"use client";

// ===========================================================================
// داشبورد مدیریت: کارت‌های KPI، نمودار هفتگی پیام‌ها و آخرین پیام‌ها
// ===========================================================================
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  MailOpen,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getJSON, SessionExpiredError } from "@/components/admin/api-client";
import { formatDateTimeFa, statusBadgeClass, timeAgoFa } from "@/components/admin/format";
import { MESSAGE_STATUS_LABELS, toFa } from "@/lib/types";
import type { AdminSessionUser, DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatCardDef {
  key: "productsTotal" | "messagesNew" | "messagesWeek" | "sessionsActive";
  label: string;
  icon: LucideIcon;
  chipClass: string;
  pulse?: boolean;
}

const STAT_CARDS: StatCardDef[] = [
  {
    key: "productsTotal",
    label: "محصولات کل",
    icon: Package,
    chipClass:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    key: "messagesNew",
    label: "پیام‌های جدید",
    icon: MailOpen,
    chipClass:
      "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    pulse: true,
  },
  {
    key: "messagesWeek",
    label: "پیام‌های ۷ روز اخیر",
    icon: TrendingUp,
    chipClass:
      "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    key: "sessionsActive",
    label: "نشست‌های فعال",
    icon: ShieldCheck,
    chipClass:
      "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  },
];

function statusLabel(status: string): string {
  return MESSAGE_STATUS_LABELS[status] ?? status;
}

// ---------------------------------------------------------------------------
// نمودار ستونی هفتگی — بدون کتابخانه خارجی (CSS خالص)
// ---------------------------------------------------------------------------
function WeeklyBarChart({ data }: { data: { day: string; count: number }[] }) {
  const bars = data.slice(0, 12);
  const max = Math.max(1, ...bars.map((item) => item.count));
  const maxItem = bars.reduce((best, item) => (item.count > best.count ? item : best), bars[0] ?? { day: "", count: 0 });

  if (bars.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">پیام‌های دریافتی در ۷ روز اخیر</p>
        {maxItem.count > 0 ? (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-300">
            بیشترین: {toFa(maxItem.count)} ({maxItem.day})
          </Badge>
        ) : null}
      </div>
      <div dir="ltr" className="flex h-44 items-end gap-1.5 sm:gap-2.5">
        {bars.map((item, index) => (
          <div key={`${item.day}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">
              {item.count > 0 ? toFa(item.count) : ""}
            </span>
            <div className="flex w-full min-w-4 flex-1 items-end overflow-hidden rounded-md bg-muted/60">
              <div
                className={cn(
                  "w-full rounded-md bg-gradient-to-t from-emerald-600/85 to-teal-400/95 transition-all duration-500",
                  item.count === 0 && "from-muted-foreground/30 to-muted-foreground/30"
                )}
                style={{ height: `${Math.max(4, (item.count / max) * 100)}%` }}
                role="presentation"
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard({
  user,
  onNavigateTab,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** جابه‌جایی به تب دیگر از طریق دسترسی سریع */
  onNavigateTab?: (tab: string) => void;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canWriteProducts = user.permissions.includes("products.write");
  const canReadMessages = user.permissions.includes("messages.read");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<{ stats: DashboardStats }>("/api/stats");
      setStats(data.stats);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت آمار داشبورد");
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const notifyLoadError = useCallback(() => {
    toast({
      title: "خطا در دریافت آمار",
      description: error ?? "لطفاً دوباره تلاش کنید",
      variant: "destructive",
    });
  }, [error, toast]);

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border bg-card p-6">
                <Skeleton className="size-11 rounded-xl" />
                <Skeleton className="mt-4 h-9 w-20" />
                <Skeleton className="mt-3 h-3.5 w-32" />
                <Skeleton className="mt-2 h-3.5 w-24" />
              </div>
            ))
          : STAT_CARDS.map((card, index) => {
              const value = stats ? stats[card.key] : 0;
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  <div className="rounded-2xl border bg-card p-6 transition-colors hover:border-emerald-500/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn("flex size-11 items-center justify-center rounded-xl border", card.chipClass)}>
                        <Icon className="size-5" aria-hidden />
                      </div>
                      {card.pulse && value > 0 ? (
                        <span className="relative flex size-2.5" aria-hidden>
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight">{toFa(value)}</p>
                    <p className="mt-1 text-sm font-medium">{card.label}</p>
                    {card.key === "productsTotal" && stats ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        منتشرشده: {toFa(stats.productsPublished)}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {card.key === "messagesNew"
                          ? "در انتظار بررسی"
                          : card.key === "messagesWeek"
                            ? "مجموع هفته جاری"
                            : "نشست‌های معتبر پنل"}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* حالت خطا */}
      {!loading && error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="size-8 text-destructive" aria-hidden />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="size-4" aria-hidden />
              تلاش مجدد
            </Button>
            <Button variant="ghost" size="sm" onClick={notifyLoadError}>
              نمایش جزئیات
            </Button>
          </div>
        </div>
      ) : null}

      {/* نمودار هفتگی */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-violet-500" aria-hidden />
            روند پیام‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : stats ? (
            <WeeklyBarChart data={stats.weeklyMessages} />
          ) : null}
        </CardContent>
      </Card>

      {/* دسترسی سریع */}
      {canWriteProducts || canReadMessages ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">دسترسی سریع:</span>
          {canWriteProducts ? (
            <Button
              size="sm"
              onClick={() => onNavigateTab?.("products")}
              className="h-10"
            >
              <Plus className="size-4" aria-hidden />
              محصول جدید
            </Button>
          ) : null}
          {canReadMessages ? (
            <Button variant="outline" size="sm" onClick={() => onNavigateTab?.("messages")} className="h-10">
              <MailOpen className="size-4" aria-hidden />
              مشاهده پیام‌ها
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* آخرین پیام‌ها */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MailOpen className="size-4 text-emerald-500" aria-hidden />
            آخرین پیام‌ها
          </CardTitle>
          {canReadMessages ? (
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.("messages")} className="h-9">
              همه پیام‌ها
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !stats || stats.recentMessages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <MailOpen className="size-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm text-muted-foreground">هنوز پیامی ثبت نشده است</p>
            </div>
          ) : (
            <div className="custom-scrollbar max-h-96 space-y-2 overflow-y-auto pe-1">
              {stats.recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 transition-colors sm:flex-nowrap",
                    message.status === "NEW"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {message.name}
                      {message.company ? (
                        <span className="font-normal text-muted-foreground"> — {message.company}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {message.subject || "بدون موضوع"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <time
                      dateTime={message.createdAt}
                      title={formatDateTimeFa(message.createdAt)}
                      className="hidden text-xs text-muted-foreground sm:inline"
                    >
                      {timeAgoFa(message.createdAt)}
                    </time>
                    <Badge variant="outline" className={statusBadgeClass(message.status)}>
                      {statusLabel(message.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
