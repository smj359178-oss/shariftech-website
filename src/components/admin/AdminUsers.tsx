"use client";

// ===========================================================================
// مدیریت کاربران پنل: فهرست، ایجاد، ویرایش نقش/وضعیت، تعویض رمز و حذف
// پیام‌های خطای سرور (مثل حفظ حداقل یک مدیر فعال) عیناً نمایش داده می‌شوند
// ===========================================================================
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  delJSON,
  getJSON,
  postJSON,
  putJSON,
  SessionExpiredError,
} from "@/components/admin/api-client";
import { formatDateTimeFa, initialsFa } from "@/components/admin/format";
import { ROLE_LABELS } from "@/lib/permissions";
import { toFa } from "@/lib/types";
import type { AdminSessionUser, AdminUserRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ثابت‌ها و کمکی‌ها
// ---------------------------------------------------------------------------

const ROLES = ["ADMIN", "EDITOR", "SALES", "VIEWER"] as const;

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EDITOR: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SALES: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  VIEWER: "border-border bg-muted text-muted-foreground",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "دسترسی کامل به همه بخش‌های پنل",
  EDITOR: "مدیریت محتوا و محصولات سایت",
  SALES: "پیگیری و پاسخ پیام‌های تماس",
  VIEWER: "مشاهده اطلاعات بدون امکان تغییر",
};

function roleLabel(role: string): string {
  return (ROLE_LABELS as Record<string, string>)[role] ?? role;
}

const USERNAME_PATTERN = /^[a-z0-9._-]{3,}$/;
const PASSWORD_LETTER = /[A-Za-z]/;
const PASSWORD_DIGIT = /[0-9]/;

/** تولید رمز پیشنهادی مطابق سیاست سرور: حداقل ۸ کاراکتر شامل حرف و عدد */
function generatePassword(): string {
  // CSPRNG: Web Crypto API به‌جای Math.random (پیشنهاد رمز باید غیرقابل حدس باشد)
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  const buf = new Uint32Array(8);
  crypto.getRandomValues(buf);
  let tail = "";
  for (let i = 0; i < 6; i++) {
    tail += letters.charAt(buf[i] % letters.length);
  }
  tail += String(buf[6] % 90 + 10);
  return `Sharif-${tail}`;
}

interface CreateFormState {
  username: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

interface EditFormState {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password: string;
}

const EMPTY_CREATE: CreateFormState = {
  username: "",
  name: "",
  email: "",
  role: "EDITOR",
  password: "",
};

function editFormFrom(record: AdminUserRecord): EditFormState {
  return {
    name: record.name,
    email: record.email,
    role: ROLES.includes(record.role as (typeof ROLES)[number]) ? record.role : "VIEWER",
    isActive: record.isActive,
    password: "",
  };
}

function validPassword(password: string): boolean {
  return password.length >= 8 && PASSWORD_LETTER.test(password) && PASSWORD_DIGIT.test(password);
}

// ---------------------------------------------------------------------------
// کامپوننت اصلی
// ---------------------------------------------------------------------------

export function AdminUsers({
  user,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const { toast } = useToast();
  const canWrite = user.permissions.includes("users.write");

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ایجاد کاربر
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // ویرایش کاربر
  const [editTarget, setEditTarget] = useState<AdminUserRecord | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // غیرفعال‌سازی و حذف
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<{ users: AdminUserRecord[] }>("/api/users");
      setUsers(data.users);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  // --- ایجاد کاربر ---
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    const username = createForm.username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(username)) {
      setCreateFormError("نام کاربری باید حداقل ۳ کاراکتر و فقط شامل حروف کوچک انگلیسی، عدد، نقطه و خط تیره باشد");
      return;
    }
    if (createForm.name.trim().length < 2) {
      setCreateFormError("نام باید حداقل ۲ کاراکتر باشد");
      return;
    }
    if (!validPassword(createForm.password)) {
      setCreateFormError("رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد");
      return;
    }

    setCreateFormError(null);
    setCreating(true);
    try {
      const data = await postJSON<{ user: AdminUserRecord }>("/api/users", {
        username,
        name: createForm.name.trim(),
        email: createForm.email.trim() || undefined,
        role: createForm.role,
        password: createForm.password,
      });
      toast({
        title: "کاربر ایجاد شد",
        description: `${data.user.name} (${data.user.username})`,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      await load();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      const message = err instanceof Error ? err.message : "خطا در ایجاد کاربر";
      setCreateFormError(message);
      toast({ title: "ایجاد کاربر ناموفق بود", description: message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  // --- ویرایش کاربر ---
  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTarget || !editForm || saving) return;

    if (editForm.name.trim().length < 2) {
      setEditFormError("نام باید حداقل ۲ کاراکتر باشد");
      return;
    }
    if (editForm.password !== "" && !validPassword(editForm.password)) {
      setEditFormError("رمز عبور جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد");
      return;
    }

    setEditFormError(null);
    setSaving(true);
    try {
      const roleChanged = editForm.role !== editTarget.role;
      const activeChanged = editForm.isActive !== editTarget.isActive;
      const data = await putJSON<{ user: AdminUserRecord }>(`/api/users/${editTarget.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
        password: editForm.password !== "" ? editForm.password : undefined,
      });
      setUsers((prev) => prev.map((item) => (item.id === data.user.id ? data.user : item)));
      setEditTarget(null);
      setEditForm(null);
      if (roleChanged || activeChanged) {
        toast({
          title: "کاربر به‌روزرسانی شد",
          description: "نشست‌های کاربر باطل شد",
        });
      } else if (editForm.password !== "") {
        toast({
          title: "کاربر به‌روزرسانی شد",
          description: "رمز عبور کاربر بروزرسانی شد",
        });
      } else {
        toast({ title: "کاربر به‌روزرسانی شد" });
      }
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      const message = err instanceof Error ? err.message : "خطا در بروزرسانی کاربر";
      setEditFormError(message);
      toast({ title: "بروزرسانی ناموفق بود", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // --- فعال/غیرفعال‌سازی ---
  async function setActive(record: AdminUserRecord, nextActive: boolean) {
    if (working) return;
    setWorking(true);
    try {
      const data = await putJSON<{ user: AdminUserRecord }>(`/api/users/${record.id}`, {
        isActive: nextActive,
      });
      setUsers((prev) => prev.map((item) => (item.id === data.user.id ? data.user : item)));
      toast({
        title: nextActive ? "کاربر فعال شد" : "کاربر غیرفعال شد",
        description: "نشست‌های کاربر باطل شد",
      });
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
      setWorking(false);
      setDeactivateTarget(null);
    }
  }

  function toggleActive(record: AdminUserRecord, nextActive: boolean) {
    if (!canWrite) return;
    if (record.id === user.id) return;
    if (nextActive) {
      void setActive(record, true);
    } else {
      setDeactivateTarget(record);
    }
  }

  // --- حذف کاربر ---
  async function handleDelete() {
    if (!deleteTarget || working) return;
    setWorking(true);
    try {
      await delJSON<{ success: boolean }>(`/api/users/${deleteTarget.id}`);
      toast({ title: "کاربر حذف شد", description: `${deleteTarget.name} (${deleteTarget.username})` });
      setDeleteTarget(null);
      await load();
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
      setWorking(false);
    }
  }

  // --- حالت بدون مجوز ---
  if (!user.permissions.includes("users.read")) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <Lock className="size-10 text-muted-foreground/50" aria-hidden />
        <p className="text-sm font-medium">دسترسی محدود</p>
        <p className="text-xs text-muted-foreground">
          شما به بخش مدیریت کاربران دسترسی ندارید؛ برای دریافت دسترسی با مدیر سیستم تماس بگیرید.
        </p>
      </div>
    );
  }

  const statusChip = (isActive: boolean) =>
    isActive ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
        <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
        فعال
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground/50" aria-hidden />
        غیرفعال
      </span>
    );

  const roleBadge = (role: string) => (
    <Badge variant="outline" className={ROLE_BADGE_CLASSES[role] ?? "border-border bg-muted text-muted-foreground"}>
      {roleLabel(role)}
    </Badge>
  );

  function selfTooltip(content: string, button: ReactNode) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-default">{button}</span>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    );
  }

  function rowActions(record: AdminUserRecord, size: "table" | "card") {
    if (!canWrite) return null;
    const isSelf = record.id === user.id;
    const btnClass = size === "table" ? "size-9" : "size-11";
    const editButton = (
      <Button
        variant="ghost"
        size="icon"
        aria-label="ویرایش کاربر"
        onClick={() => {
          setEditTarget(record);
          setEditForm(editFormFrom(record));
          setEditFormError(null);
          setShowEditPassword(false);
        }}
        disabled={isSelf}
        className={btnClass}
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
    );
    const deleteButton = (
      <Button
        variant="ghost"
        size="icon"
        aria-label="حذف کاربر"
        onClick={() => setDeleteTarget(record)}
        disabled={isSelf}
        className={cn(btnClass, "text-destructive hover:bg-destructive/10 hover:text-destructive")}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    );

    return (
      <div className="flex items-center gap-1">
        {isSelf ? (
          selfTooltip("حساب شما", editButton)
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>{editButton}</TooltipTrigger>
            <TooltipContent>ویرایش</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Switch
                checked={record.isActive}
                onCheckedChange={(checked) => toggleActive(record, checked)}
                disabled={isSelf || working}
                aria-label={record.isActive ? "غیرفعال‌سازی کاربر" : "فعال‌سازی کاربر"}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>{isSelf ? "حساب شما" : record.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}</TooltipContent>
        </Tooltip>
        {isSelf ? selfTooltip("حساب شما", deleteButton) : (
          <Tooltip>
            <TooltipTrigger asChild>{deleteButton}</TooltipTrigger>
            <TooltipContent>حذف</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* نوار ابزار */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-emerald-500" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {loading ? "در حال دریافت..." : `${toFa(users.length)} کاربر پنل`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="h-11">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden />
            تازه‌سازی
          </Button>
          {canWrite ? (
            <Button
              size="sm"
              onClick={() => {
                setCreateForm(EMPTY_CREATE);
                setCreateFormError(null);
                setShowCreatePassword(false);
                setCreateOpen(true);
              }}
              className="h-11"
            >
              <UserPlus className="size-4" aria-hidden />
              کاربر جدید
            </Button>
          ) : null}
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
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* جدول دسکتاپ */}
      {!loading && !error && users.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>آخرین ورود</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border">
                        <AvatarFallback className="bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                          {initialsFa(record.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{record.name}</p>
                        <p dir="ltr" className="truncate text-left text-xs font-mono text-muted-foreground">
                          @{record.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{roleBadge(record.role)}</TableCell>
                  <TableCell>{statusChip(record.isActive)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {record.lastLoginAt ? formatDateTimeFa(record.lastLoginAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">{rowActions(record, "table")}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* کارت موبایل */}
      {!loading && !error && users.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {users.map((record) => (
            <div key={record.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-10 border border-border">
                  <AvatarFallback className="bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                    {initialsFa(record.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{record.name}</p>
                  <p dir="ltr" className="truncate text-left text-xs font-mono text-muted-foreground">
                    @{record.username}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {roleBadge(record.role)}
                    {statusChip(record.isActive)}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    آخرین ورود: {record.lastLoginAt ? formatDateTimeFa(record.lastLoginAt) : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end border-t border-border pt-2">
                {rowActions(record, "card")}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* حالت خالی */}
      {!loading && !error && users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
          <Users className="size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium">کاربری ثبت نشده است</p>
        </div>
      ) : null}

      {/* گفتگوی ایجاد کاربر */}
      <Dialog open={createOpen} onOpenChange={(open) => (open ? undefined : setCreateOpen(false))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>کاربر جدید</DialogTitle>
            <DialogDescription>حساب دسترسی جدید برای اعضای تیم پنل</DialogDescription>
          </DialogHeader>

          {createFormError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{createFormError}</p>
            </div>
          ) : null}

          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-username">نام کاربری *</Label>
                <Input
                  id="user-username"
                  dir="ltr"
                  value={createForm.username}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  placeholder="username"
                  aria-label="نام کاربری"
                  autoComplete="off"
                  spellCheck={false}
                  className="text-left"
                />
                <p className="text-[11px] text-muted-foreground">
                  فقط حروف کوچک انگلیسی، عدد، نقطه و خط تیره — حداقل ۳ کاراکتر
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-name">نام و نام خانوادگی *</Label>
                <Input
                  id="user-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="مثلاً سارا محمدی"
                  aria-label="نام و نام خانوادگی"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">ایمیل (اختیاری)</Label>
              <Input
                id="user-email"
                dir="ltr"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="name@shariftech.ir"
                aria-label="ایمیل"
                className="text-left"
                spellCheck={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">نقش</Label>
              <Select
                value={createForm.role}
                onValueChange={(value) => setCreateForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger id="user-role" aria-label="نقش کاربر">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <span className="flex flex-col gap-0.5 py-0.5">
                        <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">رمز عبور *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="user-password"
                    dir="ltr"
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="حداقل ۸ کاراکتر شامل حرف و عدد"
                    aria-label="رمز عبور کاربر جدید"
                    autoComplete="new-password"
                    className="pe-9 text-left"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreatePassword((v) => !v)}
                  aria-label={showCreatePassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  className="h-11 w-11 shrink-0 px-0"
                >
                  {showCreatePassword ? <Lock className="size-4" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCreateForm((prev) => ({ ...prev, password: generatePassword() }))
                  }
                  className="h-11 shrink-0"
                >
                  پیشنهاد رمز
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                className="h-11"
              >
                انصراف
              </Button>
              <Button type="submit" disabled={creating} className="h-11">
                {creating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    در حال ایجاد...
                  </>
                ) : (
                  "ایجاد کاربر"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* گفتگوی ویرایش کاربر */}
      <Dialog
        open={editTarget !== null && editForm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {editTarget && editForm ? (
            <>
              <DialogHeader>
                <DialogTitle>ویرایش کاربر</DialogTitle>
                <DialogDescription>
                  {editTarget.name} — @{editTarget.username}
                </DialogDescription>
              </DialogHeader>

              {editFormError ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>{editFormError}</p>
                </div>
              ) : null}

              <form onSubmit={handleEdit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-name">نام و نام خانوادگی</Label>
                    <Input
                      id="edit-user-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                      aria-label="نام و نام خانوادگی"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-email">ایمیل</Label>
                    <Input
                      id="edit-user-email"
                      dir="ltr"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                      aria-label="ایمیل"
                      className="text-left"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-role">نقش</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm((prev) => (prev ? { ...prev, role: value } : prev))}
                  >
                    <SelectTrigger id="edit-user-role" aria-label="نقش کاربر">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          <span className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                            <span className="text-[11px] font-normal text-muted-foreground">
                              {ROLE_DESCRIPTIONS[role]}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                  <Switch
                    id="edit-user-active"
                    checked={editForm.isActive}
                    onCheckedChange={(checked) => setEditForm((prev) => (prev ? { ...prev, isActive: checked } : prev))}
                    aria-label="وضعیت فعال بودن کاربر"
                  />
                  <div>
                    <Label htmlFor="edit-user-active" className="cursor-pointer">
                      حساب فعال
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      غیرفعال‌سازی، همه نشست‌های این کاربر را باطل می‌کند
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-user-password">رمز عبور جدید (اختیاری)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-user-password"
                      dir="ltr"
                      type={showEditPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, password: e.target.value } : prev))}
                      placeholder="خالی = بدون تغییر"
                      aria-label="رمز عبور جدید"
                      autoComplete="new-password"
                      className="flex-1 text-left"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditPassword((v) => !v)}
                      aria-label={showEditPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                      className="h-11 w-11 shrink-0 px-0"
                    >
                      {showEditPassword ? <Lock className="size-4" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditForm((prev) => (prev ? { ...prev, password: generatePassword() } : prev))}
                      className="h-11 shrink-0"
                    >
                      پیشنهاد رمز
                    </Button>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditTarget(null);
                      setEditForm(null);
                    }}
                    disabled={saving}
                    className="h-11"
                  >
                    انصراف
                  </Button>
                  <Button type="submit" disabled={saving} className="h-11">
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        در حال ذخیره...
                      </>
                    ) : (
                      "ذخیره تغییرات"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* تأیید غیرفعال‌سازی */}
      <AlertDialog open={deactivateTarget !== null} onOpenChange={(open) => (open ? undefined : setDeactivateTarget(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>غیرفعال‌سازی کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              حساب «{deactivateTarget?.name}» (@{deactivateTarget?.username}) غیرفعال می‌شود و امکان
              ورود او به پنل قطع خواهد شد. نشست‌های فعال این کاربر باطل می‌شوند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (deactivateTarget) void setActive(deactivateTarget, false);
              }}
              disabled={working}
              className="bg-amber-600 text-white hover:bg-amber-600/90"
            >
              {working ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  در حال اجرا...
                </>
              ) : (
                "غیرفعال‌سازی"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* تأیید حذف */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              کاربر «{deleteTarget?.name}» (@{deleteTarget?.username}) برای همیشه حذف می‌شود. این
              عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={working}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {working ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  در حال حذف...
                </>
              ) : (
                "حذف کاربر"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
