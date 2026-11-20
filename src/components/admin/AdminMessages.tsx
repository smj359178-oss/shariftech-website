"use client";

// ===========================================================================
// مدیریت پیام‌های تماس: فهرست صفحه‌بندی‌شده، فیلتر وضعیت، جزئیات،
// یادداشت داخلی، تغییر وضعیت/اولویت و حذف
// ===========================================================================
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MailOpen,
  Save,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  delJSON,
  getJSON,
  putJSON,
  SessionExpiredError,
} from "@/components/admin/api-client";
import {
  formatDateTimeFa,
  priorityDotClass,
  statusBadgeClass,
} from "@/components/admin/format";
import {
  MESSAGE_PRIORITY_LABELS,
  MESSAGE_STATUS_LABELS,
  toFa,
} from "@/lib/types";
import type { AdminSessionUser, ContactMessage, Pagination } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "همه" },
  { key: "NEW", label: "جدید" },
  { key: "READ", label: "خوانده‌شده" },
  { key: "REPLIED", label: "پاسخ داده‌شده" },
  { key: "ARCHIVED", label: "بایگانی" },
];

const EMPTY_HINTS: Record<string, string> = {
  ALL: "پیامی وجود ندارد",
  NEW: "پیام جدیدی در انتظار بررسی نیست",
  READ: "پیام خوانده‌شده‌ای وجود ندارد",
  REPLIED: "پیام پاسخ‌داده‌شده‌ای وجود ندارد",
  ARCHIVED: "پیام بایگانی‌شده‌ای وجود ندارد",
};

function statusLabel(status: string): string {
  return MESSAGE_STATUS_LABELS[status] ?? status;
}

function priorityLabel(priority: string): string {
  return MESSAGE_PRIORITY_LABELS[priority] ?? priority;
}

export function AdminMessages({
  user,
  onMessagesChanged,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** پس از تغییر وضعیت پیام‌ها برای تازه‌سازی نشان اعلان پوسته فراخوانی می‌شود */
  onMessagesChanged?: () => void;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const { toast } = useToast();
  const canWrite = user.permissions.includes("messages.write");
  const canDelete = user.permissions.includes("messages.delete");

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [newCount, setNewCount] = useState(0);

  // جزئیات پیام
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPriority, setSavingPriority] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- دریافت شمارنده پیام‌های جدید (برای نشان تب «جدید») ---
  const loadNewCount = useCallback(async () => {
    try {
      const data = await getJSON<Pagination<ContactMessage>>(
        "/api/messages?status=NEW&pageSize=1"
      );
      setNewCount(data.total);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
      }
    }
  }, [onSessionExpired]);

  // --- دریافت فهرست پیام‌ها ---
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusQuery = filter === "ALL" ? "" : `&status=${filter}`;
      const data = await getJSON<Pagination<ContactMessage>>(
        `/api/messages?page=${page}&pageSize=${PAGE_SIZE}${statusQuery}`
      );
      setMessages(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت پیام‌ها");
    } finally {
      setLoading(false);
    }
  }, [filter, page, onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadNewCount();
  }, [loadNewCount]);

  function applyUpdatedMessage(updated: ContactMessage) {
    setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  // --- باز کردن جزئیات + علامت‌گذاری خودکار به‌عنوان خوانده‌شده ---
  async function openMessage(message: ContactMessage) {
    setSelected(message);
    setNoteDraft(message.note);
    if (message.status === "NEW" && canWrite) {
      try {
        const data = await putJSON<{ message: ContactMessage }>(
          `/api/messages/${message.id}`,
          { status: "READ" }
        );
        applyUpdatedMessage(data.message);
        setNewCount((prev) => Math.max(0, prev - 1));
        onMessagesChanged?.();
      } catch {
        // علامت‌گذاری به‌عنوان خوانده‌شده حیاتی نیست؛ بی‌صدا رد می‌شود
      }
    }
  }

  // --- ذخیره یادداشت داخلی ---
  async function handleSaveNote() {
    if (!selected || savingNote) return;
    setSavingNote(true);
    try {
      const data = await putJSON<{ message: ContactMessage }>(
        `/api/messages/${selected.id}`,
        { note: noteDraft }
      );
      applyUpdatedMessage(data.message);
      toast({ title: "یادداشت ذخیره شد" });
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      toast({
        title: "ذخیره یادداشت ناموفق بود",
        description: err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  }

  // --- تغییر وضعیت ---
  async function handleSaveStatus(status: string) {
    if (!selected || savingStatus) return;
    setSavingStatus(true);
    try {
      const data = await putJSON<{ message: ContactMessage }>(
        `/api/messages/${selected.id}`,
        { status }
      );
      applyUpdatedMessage(data.message);
      if (selected.status === "NEW" && status !== "NEW") {
        setNewCount((prev) => Math.max(0, prev - 1));
      }
      toast({ title: "وضعیت پیام بروزرسانی شد", description: statusLabel(status) });
      onMessagesChanged?.();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      toast({
        title: "تغییر وضعیت ناموفق بود",
        description: err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSavingStatus(false);
    }
  }

  // --- تغییر اولویت ---
  async function handleSavePriority(priority: string) {
    if (!selected || savingPriority) return;
    setSavingPriority(true);
    try {
      const data = await putJSON<{ message: ContactMessage }>(
        `/api/messages/${selected.id}`,
        { priority }
      );
      applyUpdatedMessage(data.message);
      toast({ title: "اولویت پیام بروزرسانی شد", description: priorityLabel(priority) });
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      toast({
        title: "تغییر اولویت ناموفق بود",
        description: err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSavingPriority(false);
    }
  }

  // --- حذف پیام ---
  async function handleDelete() {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      await delJSON<{ success: boolean }>(`/api/messages/${selected.id}`);
      toast({ title: "پیام حذف شد", description: selected.name });
      if (selected.status === "NEW") {
        setNewCount((prev) => Math.max(0, prev - 1));
      }
      setSelected(null);
      setDeleteOpen(false);
      await load();
      onMessagesChanged?.();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      toast({
        title: "حذف ناموفق بود",
        description: err instanceof Error ? err.message : "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  function changeFilter(next: string) {
    setFilter(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* فیلتر وضعیت */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeFilter(item.key)}
            aria-pressed={filter === item.key}
            className={cn(
              "flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === item.key
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
            {item.key === "NEW" && newCount > 0 ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"
              >
                {toFa(newCount)}
              </Badge>
            ) : null}
          </button>
        ))}
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

      {/* اسکلت بارگذاری */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* فهرست پیام‌ها */}
      {!loading && !error && messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => void openMessage(message)}
              className={cn(
                "flex w-full flex-wrap items-center gap-3 rounded-2xl border p-4 text-right transition-colors hover:border-emerald-500/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-nowrap",
                message.status === "NEW"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border bg-card"
              )}
            >
              <span
                className={cn("size-2.5 shrink-0 rounded-full", priorityDotClass(message.priority))}
                aria-label={`اولویت: ${priorityLabel(message.priority)}`}
                title={`اولویت: ${priorityLabel(message.priority)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-semibold">
                  {message.name}
                  {message.company ? (
                    <span className="flex items-center gap-1 font-normal text-xs text-muted-foreground">
                      <Building2 className="size-3" aria-hidden />
                      {message.company}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {message.subject || "بدون موضوع"}
                </p>
              </div>
              <Badge variant="outline" className={statusBadgeClass(message.status)}>
                {statusLabel(message.status)}
              </Badge>
              <time
                dateTime={message.createdAt}
                title={formatDateTimeFa(message.createdAt)}
                className="hidden shrink-0 text-xs text-muted-foreground sm:inline"
              >
                {formatDateTimeFa(message.createdAt)}
              </time>
            </button>
          ))}
        </div>
      ) : null}

      {/* حالت خالی */}
      {!loading && !error && messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
          <MailOpen className="size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium">{EMPTY_HINTS[filter] ?? "پیامی وجود ندارد"}</p>
        </div>
      ) : null}

      {/* صفحه‌بندی */}
      {!loading && !error && total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            مجموع: {toFa(total)} پیام — صفحه {toFa(page)} از {toFa(totalPages)}
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

      {/* گفتگوی جزئیات پیام */}
      <Dialog open={selected !== null} onOpenChange={(open) => (open ? undefined : setSelected(null))}>
        <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span
                    className={cn("size-2.5 rounded-full", priorityDotClass(selected.priority))}
                    aria-hidden
                  />
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  {selected.company || "بدون شرکت"} — {formatDateTimeFa(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* اطلاعات تماس */}
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <a
                    href={`mailto:${selected.email}`}
                    dir="ltr"
                    className="flex items-center justify-between gap-2 rounded-xl border bg-muted/30 p-3 text-left font-mono text-xs transition-colors hover:bg-muted sm:col-span-2"
                  >
                    <span className="font-sans text-muted-foreground">ایمیل:</span>
                    {selected.email}
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </a>
                  {selected.phone ? (
                    <a
                      href={`tel:${selected.phone}`}
                      dir="ltr"
                      className="flex items-center justify-between gap-2 rounded-xl border bg-muted/30 p-3 text-left font-mono text-xs transition-colors hover:bg-muted"
                    >
                      <span className="font-sans text-muted-foreground">تلفن:</span>
                      {selected.phone}
                    </a>
                  ) : null}
                  {selected.company ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border bg-muted/30 p-3 text-xs">
                      <span className="text-muted-foreground">شرکت:</span>
                      {selected.company}
                    </div>
                  ) : null}
                </div>

                {/* متن پیام */}
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">متن پیام:</p>
                  <p className="whitespace-pre-wrap text-sm leading-7">{selected.message}</p>
                </div>

                {/* یادداشت داخلی */}
                {canWrite ? (
                  <div className="space-y-2">
                    <label htmlFor="message-note" className="text-xs font-medium text-muted-foreground">
                      یادداشت داخلی (برای تیم فروش)
                    </label>
                    <Textarea
                      id="message-note"
                      rows={3}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="یادداشت همکاران درباره پیگیری این پیام"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleSaveNote()}
                      disabled={savingNote}
                      className="h-11"
                    >
                      {savingNote ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Save className="size-4" aria-hidden />
                      )}
                      ذخیره یادداشت
                    </Button>
                  </div>
                ) : null}

                {/* وضعیت و اولویت */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {canWrite ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">وضعیت پیام</label>
                      <div className="flex gap-2">
                        <Select
                          value={selected.status}
                          onValueChange={(value) => void handleSaveStatus(value)}
                        >
                          <SelectTrigger aria-label="وضعیت پیام" className="h-11 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["NEW", "READ", "REPLIED", "ARCHIVED"] as const).map((status) => (
                              <SelectItem key={status} value={status}>
                                {MESSAGE_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {savingStatus ? (
                          <Loader2 className="my-auto size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">وضعیت پیام</span>
                      <div>
                        <Badge variant="outline" className={statusBadgeClass(selected.status)}>
                          {statusLabel(selected.status)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {canWrite ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">اولویت</label>
                      <div className="flex gap-2">
                        <Select
                          value={selected.priority}
                          onValueChange={(value) => void handleSavePriority(value)}
                        >
                          <SelectTrigger aria-label="اولویت پیام" className="h-11 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["LOW", "NORMAL", "HIGH", "URGENT"] as const).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {MESSAGE_PRIORITY_LABELS[priority]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {savingPriority ? (
                          <Loader2 className="my-auto size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">اولویت</span>
                      <div>
                        <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                          {priorityLabel(selected.priority)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* حذف */}
                {canDelete ? (
                  <div className="flex justify-end border-t border-border pt-3">
                    <Button
                      variant="ghost"
                      onClick={() => setDeleteOpen(true)}
                      className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      حذف پیام
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* تأیید حذف پیام */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف پیام</AlertDialogTitle>
            <AlertDialogDescription>
              پیام ثبت‌شده توسط «{selected?.name}» برای همیشه حذف می‌شود. این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  در حال حذف...
                </>
              ) : (
                "حذف پیام"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
