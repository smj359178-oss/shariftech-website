"use client";

// ===========================================================================
// مدیریت محصولات: فهرست، جستجو، فیلتر وضعیت، ویرایشگر کامل، انتشار سریع و حذف
// ========================================================================
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  delJSON,
  getJSON,
  postJSON,
  putJSON,
  SessionExpiredError,
} from "@/components/admin/api-client";
import { PRODUCT_ICONS, ProductIcon } from "@/components/site/icon-map";
import { CATEGORY_LABELS, toFa } from "@/lib/types";
import type { AdminSessionUser, Pagination, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ثابت‌ها
// ---------------------------------------------------------------------------

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

const ACCENTS = ["emerald", "amber", "violet", "rose", "cyan", "teal"] as const;

const ACCENT_DOT_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
};

const ACCENT_CHIP_CLASSES: Record<string, string> = {
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  teal: "border-teal-500/25 bg-teal-500/10 text-teal-600 dark:text-teal-300",
};

const STATUS_FILTERS = [
  { key: "ALL", label: "همه" },
  { key: "PUBLISHED", label: "منتشرشده" },
  { key: "DRAFT", label: "پیش‌نویس" },
];

const MAX_FEATURES = 12;
const MAX_TECH = 12;
const MAX_USE_CASES = 6;

// ---------------------------------------------------------------------------
// فرم محصول
// ---------------------------------------------------------------------------

interface ProductFormState {
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  accent: string;
  icon: string;
  image: string;
  summary: string;
  description: string;
  featured: boolean;
  status: string;
  sort: string;
  features: string[];
  techStack: string[];
  useCases: { title: string; description: string }[];
}

function emptyForm(): ProductFormState {
  return {
    title: "",
    slug: "",
    subtitle: "",
    category: "AI_AGENT",
    accent: "emerald",
    icon: "Cpu",
    image: "",
    summary: "",
    description: "",
    featured: false,
    status: "PUBLISHED",
    sort: "",
    features: [""],
    techStack: [""],
    useCases: [],
  };
}

function formFromProduct(product: Product): ProductFormState {
  return {
    title: product.title,
    slug: product.slug,
    subtitle: product.subtitle,
    category: CATEGORY_KEYS.includes(product.category) ? product.category : "CUSTOM",
    accent: (ACCENTS as readonly string[]).includes(product.accent) ? product.accent : "emerald",
    icon: product.icon || "Cpu",
    image: product.image,
    summary: product.summary,
    description: product.description,
    featured: product.featured,
    status: product.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    sort: String(product.sort),
    features: product.features.length > 0 ? product.features : [""],
    techStack: product.techStack.length > 0 ? product.techStack : [""],
    useCases: product.useCases.map((item) => ({ title: item.title, description: item.description })),
  };
}

interface ProductsResponse extends Pagination<Product> {
  products: Product[];
}

// ---------------------------------------------------------------------------
// کامپوننت اصلی
// ---------------------------------------------------------------------------

export function AdminProducts({
  user,
  onSiteDataChanged,
  onSessionExpired,
}: {
  user: AdminSessionUser;
  /** پس از هر تغییر در محصولات برای همگام‌سازی سایت فراخوانی می‌شود */
  onSiteDataChanged: () => void;
  /** فراخوانی هنگام منقضی شدن نشست (پاسخ 401) */
  onSessionExpired?: () => void;
}) {
  const { toast } = useToast();
  const canWrite = user.permissions.includes("products.write");
  const canDelete = user.permissions.includes("products.delete");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ویرایشگر
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // عملیات ردیف
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<ProductsResponse>("/api/products?all=1&pageSize=100");
      setProducts(data.products ?? data.items);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در دریافت محصولات");
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter !== "ALL" && product.status !== statusFilter) return false;
      if (!query) return true;
      return [product.title, product.subtitle, product.slug].some((field) =>
        field.toLowerCase().includes(query)
      );
    });
  }, [products, search, statusFilter]);

  // --- ویرایشگر ---
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm(formFromProduct(product));
    setFormError(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
  }

  const patchForm = useCallback((patch: Partial<ProductFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  function updateFeature(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((item, i) => (i === index ? value : item)),
    }));
  }

  function updateTech(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.map((item, i) => (i === index ? value : item)),
    }));
  }

  function updateUseCase(index: number, patch: Partial<{ title: string; description: string }>) {
    setForm((prev) => ({
      ...prev,
      useCases: prev.useCases.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  // --- ذخیره (ایجاد/ویرایش) ---
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    if (title.length < 2) {
      setFormError("عنوان باید حداقل ۲ کاراکتر باشد");
      return;
    }
    const invalidFeature = form.features.map((f) => f.trim()).find((f) => f.length > 120);
    if (invalidFeature) {
      setFormError("هر ویژگی باید حداکثر ۱۲۰ کاراکتر باشد");
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      const parsedSort = Number.parseInt(form.sort, 10);
      const payload = {
        title,
        slug: form.slug.trim() || undefined,
        subtitle: form.subtitle.trim(),
        category: form.category,
        summary: form.summary.trim(),
        description: form.description.trim(),
        features: form.features.map((f) => f.trim()).filter(Boolean),
        techStack: form.techStack.map((t) => t.trim()).filter(Boolean),
        useCases: form.useCases
          .filter((item) => item.title.trim() !== "")
          .map((item) => ({ title: item.title.trim(), description: item.description.trim() })),
        image: form.image.trim(),
        icon: form.icon,
        accent: form.accent,
        featured: form.featured,
        status: form.status,
        sort: Number.isFinite(parsedSort) && parsedSort >= 0 ? Math.min(9999, parsedSort) : undefined,
      };

      if (editingId) {
        await putJSON<{ product: Product }>(`/api/products/${editingId}`, payload);
        toast({ title: "محصول ذخیره شد", description: "تغییرات با موفقیت اعمال شد" });
      } else {
        await postJSON<{ product: Product }>("/api/products", payload);
        toast({ title: "محصول ایجاد شد", description: "محصول جدید با موفقیت ثبت شد" });
      }
      setEditorOpen(false);
      await load();
      onSiteDataChanged();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        onSessionExpired?.();
        return;
      }
      const message = err instanceof Error ? err.message : "خطا در ذخیره محصول";
      setFormError(message);
      toast({ title: "ذخیره ناموفق بود", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // --- انتشار/توقف سریع ---
  async function toggleStatus(product: Product) {
    if (statusTogglingId) return;
    const next = product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setStatusTogglingId(product.id);
    try {
      await putJSON<{ product: Product }>(`/api/products/${product.id}`, { status: next });
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, status: next } : item))
      );
      toast({
        title: next === "PUBLISHED" ? "محصول منتشر شد" : "انتشار محصول متوقف شد",
        description: product.title,
      });
      onSiteDataChanged();
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
      setStatusTogglingId(null);
    }
  }

  // --- حذف ---
  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await delJSON<{ success: boolean }>(`/api/products/${deleteTarget.id}`);
      toast({ title: "محصول حذف شد", description: deleteTarget.title });
      setDeleteTarget(null);
      await load();
      onSiteDataChanged();
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

  function statusBadge(status: string) {
    const published = status === "PUBLISHED";
    return (
      <Badge
        variant="outline"
        className={
          published
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border bg-muted text-muted-foreground"
        }
      >
        {published ? "منتشرشده" : "پیش‌نویس"}
      </Badge>
    );
  }

  function iconChip(product: Product) {
    return (
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
          ACCENT_CHIP_CLASSES[product.accent] ?? ACCENT_CHIP_CLASSES.emerald
        )}
      >
        <ProductIcon name={product.icon} className="size-5" />
      </div>
    );
  }

  function rowActions(product: Product, size: "table" | "card") {
    const btnClass = size === "table" ? "size-9" : "size-11";
    return (
      <div className="flex items-center gap-1">
        {canWrite ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="ویرایش محصول"
                onClick={() => openEdit(product)}
                className={btnClass}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ویرایش</TooltipContent>
          </Tooltip>
        ) : null}
        {canWrite ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={product.status === "PUBLISHED" ? "توقف انتشار" : "انتشار محصول"}
                onClick={() => void toggleStatus(product)}
                disabled={statusTogglingId === product.id}
                className={btnClass}
              >
                {statusTogglingId === product.id ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : product.status === "PUBLISHED" ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {product.status === "PUBLISHED" ? "توقف انتشار" : "انتشار"}
            </TooltipContent>
          </Tooltip>
        ) : null}
        {canDelete ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="حذف محصول"
                onClick={() => setDeleteTarget(product)}
                className={cn(btnClass, "text-destructive hover:bg-destructive/10 hover:text-destructive")}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>حذف</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* نوار ابزار */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصول..."
              aria-label="جستجوی محصولات"
              className="h-11 pe-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                aria-pressed={statusFilter === filter.key}
                className={cn(
                  "min-h-[44px] rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  statusFilter === filter.key
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {canWrite ? (
          <Button onClick={openCreate} className="h-11">
            <Plus className="size-4" aria-hidden />
            محصول جدید
          </Button>
        ) : null}
      </div>

      {/* حالت خطا */}
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

      {/* اسکلت بارگذاری */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* جدول دسکتاپ */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">آیکون</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead className="hidden lg:table-cell">دسته</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="hidden sm:table-cell">ترتیب</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{iconChip(product)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-semibold">
                          {product.title}
                          {product.featured ? (
                            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="برجسته" />
                          ) : null}
                        </p>
                        {product.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">{product.subtitle}</p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </TableCell>
                  <TableCell>{statusBadge(product.status)}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {toFa(product.sort)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">{rowActions(product, "table")}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* کارت موبایل */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                {iconChip(product)}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {product.title}
                    {product.featured ? (
                      <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="برجسته" />
                    ) : null}
                  </p>
                  {product.subtitle ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.subtitle}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {statusBadge(product.status)}
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">ترتیب: {toFa(product.sort)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end border-t border-border pt-2">
                {rowActions(product, "card")}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* حالت خالی */}
      {!loading && !error && products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
          <Package className="size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium">هنوز محصولی ثبت نشده است</p>
          <p className="text-xs text-muted-foreground">
            برای افزودن اولین محصول از دکمه «محصول جدید» استفاده کنید
          </p>
          {canWrite ? (
            <Button size="sm" onClick={openCreate} className="mt-1 h-11">
              <Plus className="size-4" aria-hidden />
              محصول جدید
            </Button>
          ) : null}
        </div>
      ) : null}
      {!loading && !error && products.length > 0 && filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-10 text-center">
          <Search className="size-8 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium">نتیجه‌ای یافت نشد</p>
          <p className="text-xs text-muted-foreground">عبارت جستجو یا فیلتر وضعیت را تغییر دهید</p>
        </div>
      ) : null}

      {/* گفتگوی ویرایشگر محصول */}
      <Dialog open={editorOpen} onOpenChange={(open) => (open ? undefined : closeEditor())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "ویرایش محصول" : "محصول جدید"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "تغییرات بلافاصله پس از ذخیره در سایت اعمال می‌شود"
                : "اطلاعات محصول جدید را تکمیل کنید"}
            </DialogDescription>
          </DialogHeader>

          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{formError}</p>
            </div>
          ) : null}

          <form id="product-form" onSubmit={handleSubmit} className="contents" noValidate>
            <div className="custom-scrollbar max-h-[70vh] overflow-y-auto pe-3">
              <div className="space-y-5">
                {/* عنوان و اسلاگ */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="product-title">عنوان محصول *</Label>
                    <Input
                      id="product-title"
                      value={form.title}
                      onChange={(e) => patchForm({ title: e.target.value })}
                      placeholder="مثلاً ایجنت هوشمند پایش پالایشگاه"
                      aria-label="عنوان محصول"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-slug">اسلاگ (URL)</Label>
                    <Input
                      id="product-slug"
                      dir="ltr"
                      value={form.slug}
                      onChange={(e) => patchForm({ slug: e.target.value })}
                      placeholder="agent-suite"
                      aria-label="اسلاگ محصول"
                      className="text-left"
                      spellCheck={false}
                    />
                    <p className="text-[11px] text-muted-foreground">خالی = خودکار</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-subtitle">زیرعنوان</Label>
                    <Input
                      id="product-subtitle"
                      value={form.subtitle}
                      onChange={(e) => patchForm({ subtitle: e.target.value })}
                      placeholder="معرفی کوتاه محصول"
                      aria-label="زیرعنوان محصول"
                    />
                  </div>
                </div>

                {/* دسته، رنگ و آیکون */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-category">دسته‌بندی</Label>
                    <Select value={form.category} onValueChange={(value) => patchForm({ category: value })}>
                      <SelectTrigger id="product-category" aria-label="دسته‌بندی محصول">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_KEYS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {CATEGORY_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-accent">رنگ اکسنت</Label>
                    <Select value={form.accent} onValueChange={(value) => patchForm({ accent: value })}>
                      <SelectTrigger id="product-accent" aria-label="رنگ اکسنت محصول">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCENTS.map((accent) => (
                          <SelectItem key={accent} value={accent}>
                            <span className="flex items-center gap-2">
                              <span className={cn("size-2.5 rounded-full", ACCENT_DOT_CLASSES[accent])} />
                              {accent}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-icon">آیکون</Label>
                    <Select value={form.icon} onValueChange={(value) => patchForm({ icon: value })}>
                      <SelectTrigger id="product-icon" aria-label="آیکون محصول">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {Object.keys(PRODUCT_ICONS).map((key) => {
                          const Icon = PRODUCT_ICONS[key];
                          return (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <Icon className="size-4" aria-hidden />
                                {key}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* تصویر */}
                <div className="space-y-2">
                  <Label htmlFor="product-image">تصویر محصول</Label>
                  <Input
                    id="product-image"
                    dir="ltr"
                    value={form.image}
                    onChange={(e) => patchForm({ image: e.target.value })}
                    placeholder="/products/agent-suite.jpg"
                    aria-label="مسیر تصویر محصول"
                    aria-invalid={form.image.length > 0 && !form.image.startsWith("/")}
                    className="text-left"
                    spellCheck={false}
                  />
                  {form.image.length > 0 && !form.image.startsWith("/") ? (
                    <p role="alert" className="text-[11px] font-medium text-destructive">
                      مسیر تصویر باید با «/» شروع شود و داخل پوشه عمومی سایت باشد؛ URL بیرونی
                      پشتیبانی نمی‌شود.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      مسیر فایل داخل پوشه عمومی؛ مثلاً /products/agent-suite.jpg
                    </p>
                  )}
                </div>

                {/* خلاصه و توضیحات */}
                <div className="space-y-2">
                  <Label htmlFor="product-summary">خلاصه</Label>
                  <Textarea
                    id="product-summary"
                    rows={2}
                    value={form.summary}
                    onChange={(e) => patchForm({ summary: e.target.value })}
                    placeholder="خلاصه یک‌خطی برای کارت محصول"
                    aria-label="خلاصه محصول"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">توضیحات کامل</Label>
                  <Textarea
                    id="product-description"
                    rows={5}
                    value={form.description}
                    onChange={(e) => patchForm({ description: e.target.value })}
                    placeholder="شرح کامل محصول برای صفحه جزئیات"
                    aria-label="توضیحات کامل محصول"
                  />
                </div>

                {/* ویژگی‌های کلیدی */}
                <div className="space-y-2">
                  <Label>ویژگی‌های کلیدی</Label>
                  <div className="space-y-2">
                    {form.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={`ویژگی ${toFa(index + 1)}`}
                          aria-label={`ویژگی ${toFa(index + 1)}`}
                          maxLength={120}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="حذف ویژگی"
                          onClick={() =>
                            patchForm({ features: form.features.filter((_, i) => i !== index) })
                          }
                          className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => patchForm({ features: [...form.features, ""] })}
                    disabled={form.features.length >= MAX_FEATURES}
                    className="h-11"
                  >
                    <Plus className="size-4" aria-hidden />
                    افزودن ویژگی
                  </Button>
                </div>

                {/* فناوری‌ها */}
                <div className="space-y-2">
                  <Label>فناوری‌های مورد استفاده</Label>
                  <div className="space-y-2">
                    {form.techStack.map((tech, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={tech}
                          onChange={(e) => updateTech(index, e.target.value)}
                          placeholder={`فناوری ${toFa(index + 1)}`}
                          aria-label={`فناوری ${toFa(index + 1)}`}
                          maxLength={60}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="حذف فناوری"
                          onClick={() =>
                            patchForm({ techStack: form.techStack.filter((_, i) => i !== index) })
                          }
                          className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => patchForm({ techStack: [...form.techStack, ""] })}
                    disabled={form.techStack.length >= MAX_TECH}
                    className="h-11"
                  >
                    <Plus className="size-4" aria-hidden />
                    افزودن فناوری
                  </Button>
                </div>

                {/* موارد استفاده */}
                <div className="space-y-2">
                  <Label>موارد استفاده (به تفکیک صنعت)</Label>
                  <div className="space-y-3">
                    {form.useCases.map((useCase, index) => (
                      <div key={index} className="space-y-2 rounded-xl border bg-muted/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            مورد استفاده {toFa(index + 1)}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="حذف مورد استفاده"
                            onClick={() =>
                              patchForm({ useCases: form.useCases.filter((_, i) => i !== index) })
                            }
                            className="size-9 text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-4" aria-hidden />
                          </Button>
                        </div>
                        <Input
                          value={useCase.title}
                          onChange={(e) => updateUseCase(index, { title: e.target.value })}
                          placeholder="عنوان؛ مثلاً پایش خط تولید"
                          aria-label={`عنوان مورد استفاده ${toFa(index + 1)}`}
                          maxLength={120}
                        />
                        <Textarea
                          rows={2}
                          value={useCase.description}
                          onChange={(e) => updateUseCase(index, { description: e.target.value })}
                          placeholder="توضیح مورد استفاده"
                          aria-label={`توضیح مورد استفاده ${toFa(index + 1)}`}
                          maxLength={600}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchForm({ useCases: [...form.useCases, { title: "", description: "" }] })
                    }
                    disabled={form.useCases.length >= MAX_USE_CASES}
                    className="h-11"
                  >
                    <Plus className="size-4" aria-hidden />
                    افزودن مورد استفاده
                  </Button>
                </div>

                {/* وضعیت و تنظیمات */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-status">وضعیت انتشار</Label>
                    <Select value={form.status} onValueChange={(value) => patchForm({ status: value })}>
                      <SelectTrigger id="product-status" aria-label="وضعیت انتشار">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">منتشرشده</SelectItem>
                        <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-sort">ترتیب نمایش</Label>
                    <Input
                      id="product-sort"
                      dir="ltr"
                      inputMode="numeric"
                      value={form.sort}
                      onChange={(e) => patchForm({ sort: e.target.value.replace(/[^\d]/g, "") })}
                      placeholder="100"
                      aria-label="ترتیب نمایش"
                      className="text-left"
                    />
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <Switch
                      id="product-featured"
                      checked={form.featured}
                      onCheckedChange={(checked) => patchForm({ featured: checked })}
                      aria-label="نمایش برجسته"
                    />
                    <Label htmlFor="product-featured" className="cursor-pointer">
                      محصول برجسته
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEditor} disabled={saving} className="h-11">
              انصراف
            </Button>
            <Button type="submit" form="product-form" disabled={saving} className="h-11">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  در حال ذخیره...
                </>
              ) : (
                "ذخیره محصول"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              محصول «{deleteTarget?.title}» برای همیشه حذف می‌شود. این عملیات قابل بازگشت نیست.
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
                "حذف محصول"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
