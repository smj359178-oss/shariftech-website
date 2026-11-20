// ===========================================================================
// تایپ‌های مشترک پروژه - شرکت فناوری اطلاعات دانشگاه صنعتی شریف
// ===========================================================================

export type ProductCategory = "AI_AGENT" | "DASHBOARD" | "SMART_SYSTEM" | "CUSTOM";

export type ProductStatus = "PUBLISHED" | "DRAFT";

export type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export type MessagePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

/** محصولات برجسته صنعتی برای صفحه جزئیات */
export interface ProductUseCase {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProductCategory | string;
  summary: string;
  description: string;
  /** آرایه‌ای از ویژگی‌های کلیدی محصول */
  features: string[];
  /** موارد استفاده واقعی به تفکیک صنعت */
  useCases: ProductUseCase[];
  /** فناوری‌های استفاده‌شده */
  techStack: string[];
  /** مسیر تصویر محصول داخل /public */
  image: string;
  icon: string;
  accent: string;
  featured: boolean;
  status: ProductStatus | string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  status: MessageStatus | string;
  priority: MessagePriority | string;
  note: string;
  createdAt: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteShortName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  instagram: string;
  telegram: string;
}

export interface AdminSessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface DashboardStats {
  productsTotal: number;
  productsPublished: number;
  messagesTotal: number;
  messagesNew: number;
  messagesWeek: number;
  sessionsActive: number;
  recentMessages: ContactMessage[];
  weeklyMessages: { day: string; count: number }[];
}

export interface ActivityEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  user: string;
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Pagination<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: "ایجنت‌های هوشمند صنعتی",
  DASHBOARD: "داشبوردهای مدیریتی",
  SMART_SYSTEM: "سیستم‌های هوشمند",
  CUSTOM: "راهکارهای سفارشی",
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  AI_AGENT: "ایجنت‌های خودکار مبتنی بر LLM برای اتوماسیون فرآیندهای صنعتی و پایش هوشمند",
  DASHBOARD: "داشبوردهای مدیریتی لحظه‌ای برای صنایع نفت، گاز، پتروشیمی و پالایشگاه",
  SMART_SYSTEM: "سیستم‌های پیش‌بینی، تشخیص عیب و بینایی ماشین مبتنی بر هوش مصنوعی",
  CUSTOM: "طراحی و توسعه نرم‌افزارهای سازمانی سفارشی متناسب با نیاز شما",
};

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  NEW: "جدید",
  READ: "خوانده‌شده",
  REPLIED: "پاسخ داده‌شده",
  ARCHIVED: "بایگانی",
};

export const MESSAGE_PRIORITY_LABELS: Record<string, string> = {
  LOW: "کم",
  NORMAL: "معمولی",
  HIGH: "بالا",
  URGENT: "فوری",
};

/** رمانتیز کردن اعداد به فارسی */
export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
