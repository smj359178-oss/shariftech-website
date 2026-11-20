"use client";

// ===========================================================================
// لاگ فعالیت‌ها: فیلتر موجودیت، جستجو و صفحه‌بندی رخدادهای پنل
// ===========================================================================
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  History,
  LogIn,
  LogOut,
  MailOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getJSON, SessionExpiredError } from "@/components/admin/api-client";
import { formatDateTimeFa, timeAgoFa } from "@/components/admin/format";
import { toFa } from "@/lib/types";
import type { AdminSessionUser, ActivityEntry, Pagination } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const ENTITY_FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "همه" },
  { key: "Product", label: "محصولات" },
  { key: "ContactMessage", label: "پیام‌ها" },
  { key: "AdminUser", label: "کاربران" },
  { key: "SiteSetting", label: "تنظیمات" },
];

const ENTITY_LABELS: Record<string, string> = {
  Product: "محصول",
  ContactMessage: "پیام",
  AdminUser: "کاربر",
  SiteSetting: "تنظیمات",
};

/** نگاشت نوع رخداد به آیکون و برچسب رنگی */
function actionMeta(action: string): { icon: LucideIcon; chipClass: string } {
  if (action.includes("ورود")) {
    return { icon: LogIn, chipClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" };
  }
  if (action.includes("خروج")) {
    return { icon: LogOut, chipClass: "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300" };
  }
  if (action.includes("ایجاد")) {
    return { icon: Plus, chipClass: "border-teal-500/25 bg-teal-500/10 text-teal-600 dark:text-teal-300" };
  }
  if (action.includes("حذف")) {
    return { icon: Trash2, chipClass: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300" };
  }
  if (action.includes("ویرایش")) {
    return { icon: Pencil, chipClass: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300" };
  }
  if (action.includes("به‌روزرسانی")) {
    return { icon: RefreshCw, chipClass: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300" };
  }
  if (action.includes("دریافت")) {
    return { icon: MailOpen, chipClass: "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300" };
  }
  return { icon: Activity, chipClass: "border-border bg-muted text-muted-foreground" };
}

export function AdminActivity({
  user,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const canRead = user.permissions.includes("activity.read");

  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- جستجوی تأخیری (debounce) ---
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (entity !== "ALL") params.set("entity", entity);
      if (query !== "") params.set("q", query);
      const data = await getJSON<Pagination<ActivityEntry>>(`/api/activity?${params.toString()}`);
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت لاگ فعالیت");
    } finally {
      setLoading(false);
    }
  }, [canRead, entity, query, page, onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  // --- حالت بدون مجوز ---
  if (!canRead) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <History className="size-10 text-muted-foreground/50" aria-hidden />
        <p className="text-sm font-medium">دسترسی محدود</p>
        <p className="text-xs text-muted-foreground">
          شما به لاگ فعالیت‌ها دسترسی ندارید؛ برای دریافت دسترسی با مدیر سیستم تماس بگیرید.
        </p>
      </div>
    );
  }

  function actionIcon(entry: ActivityEntry) {
    const meta = actionMeta(entry.action);
    const Icon = meta.icon;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
              meta.chipClass
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        </TooltipTrigger>
        <TooltipContent>{ENTITY_LABELS[entry.entity] ?? entry.entity}</TooltipContent>
      </Tooltip>
    );
  }

  function userChip(name: string) {
    return (
      <Badge
        variant="outline"
        className="max-w-[9rem] truncate border-border bg-muted text-[11px] font-normal text-muted-foreground"
      >
        {name}
      </Badge>
    );
  }

  const hasFilters = entity !== "ALL" || query !== "";

  return (
    <div className="space-y-6">
      {/* نوار ابزار */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {ENTITY_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => {
                setEntity(filter.key);
                setPage(1);
              }}
              aria-pressed={entity === filter.key}
              className={cn(
                "min-h-[44px] rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                entity === filter.key
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در رخدادها..."
            aria-label="جستجو در لاگ فعالیت"
            className="h-11 pe-9"
          />
        </div>
      </div>

      {/* حالت خطا */}
      {!loading && error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="size-8 text-destructive" aria-hidden />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      {/* اسکلت */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* جدول دسکتاپ */}
      {!loading && !error && items.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">رخداد</TableHead>
                <TableHead>اقدام</TableHead>
                <TableHead className="hidden lg:table-cell">جزئیات</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead className="text-left">زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{actionIcon(entry)}</TableCell>
                  <TableCell>
                    <p className="font-medium">{entry.action}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ENTITY_LABELS[entry.entity] ?? entry.entity}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-xs lg:table-cell">
                    <p className="line-clamp-2 text-xs text-muted-foreground">{entry.details || "—"}</p>
                  </TableCell>
                  <TableCell>{userChip(entry.user)}</TableCell>
                  <TableCell>
                    <div className="text-left">
                      <time
                        dateTime={entry.createdAt}
                        title={formatDateTimeFa(entry.createdAt)}
                        className="block text-xs text-muted-foreground"
                      >
                        {timeAgoFa(entry.createdAt)}
                      </time>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                        {formatDateTimeFa(entry.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* کارت موبایل */}
      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-2 md:hidden">
          {items.map((entry) => (
            <div key={entry.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                {actionIcon(entry)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{entry.action}</p>
                    {userChip(entry.user)}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {ENTITY_LABELS[entry.entity] ?? entry.entity}
                  </p>
                  {entry.details ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entry.details}</p>
                  ) : null}
                  <time
                    dateTime={entry.createdAt}
                    title={formatDateTimeFa(entry.createdAt)}
                    className="mt-1.5 block text-[11px] text-muted-foreground/80"
                  >
                    {formatDateTimeFa(entry.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* حالت خالی */}
      {!loading && !error && items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
          <History className="size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium">
            {hasFilters ? "رخدادی مطابق جستجو یافت نشد" : "هنوز رخدادی ثبت نشده است"}
          </p>
          {hasFilters ? (
            <p className="text-xs text-muted-foreground">فیلتر موجودیت یا عبارت جستجو را تغییر دهید</p>
          ) : null}
        </div>
      ) : null}

      {/* صفحه‌بندی */}
      {!loading && !error && total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            مجموع: {toFa(total)} رخداد — صفحه {toFa(page)} از {toFa(totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="h-11"
            >
              <ChevronRight className="size-4" aria-hidden />
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="h-11"
            >
              بعدی
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
