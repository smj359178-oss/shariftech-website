import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// ---------------------------------------------------------------------------
// فونت وزیرمتن به‌صورت کامل روی سرور میزبانی می‌شود (بدون هیچ درخواست خارجی)
// فونت Variable با یک فایل، همه وزن‌های ۱۰۰ تا ۹۰۰ را پوشش می‌دهد
// ---------------------------------------------------------------------------
const vazirmatn = localFont({
  variable: "--font-vazir",
  src: "./fonts/Vazirmatn-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

// یادداشت: فونت mono از System Stack استفاده می‌کند (globals.css) — بدون فایل خارجی

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shariftech.ir";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c1613" },
    { media: "(prefers-color-scheme: light)", color: "#f7f9f6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف | هوش مصنوعی صنعتی و داشبوردهای مدیریتی",
    template: "%s | شریف‌تک",
  },
  description:
    "شرکت فناوری اطلاعات دانشگاه صنعتی شریف؛ ارائه‌دهنده ایجنت‌های هوشمند صنعتی، داشبوردهای مدیریتی لحظه‌ای برای صنایع نفت، گاز، پتروشیمی و پالایشگاه، و سیستم‌های هوشمند مبتنی بر هوش مصنوعی با پیشرفته‌ترین فناوری‌های روز دنیا.",
  keywords: [
    "هوش مصنوعی صنعتی",
    "ایجنت هوشمند",
    "داشبورد مدیریتی",
    "پتروشیمی",
    "پالایشگاه",
    "صنایع نفت و گاز",
    "شرکت فناوری اطلاعات دانشگاه صنعتی شریف",
    "شریف‌تک",
    "نگهداری پیش‌بینانه",
    "بینایی ماشین",
    "دوقلوی دیجیتال",
    "SharifTech",
    "Industrial AI",
    "AI Agent",
    "Oil and Gas Dashboard",
  ],
  authors: [{ name: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف" }],
  creator: "شریف‌تک",
  publisher: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف",
  applicationName: "شریف‌تک",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف",
    title: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف | هوش مصنوعی صنعتی",
    description:
      "ایجنت‌های هوشمند صنعتی، داشبوردهای مدیریتی نفت و پتروشیمی و سیستم‌های هوش مصنوعی؛ تحول دیجیتال صنایع با شریف‌تک.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1344,
        height: 768,
        alt: "هوش مصنوعی صنعتی شریف‌تک در صنایع نفت، گاز و پتروشیمی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف",
    description:
      "هوش مصنوعی صنعتی، داشبوردهای مدیریتی نفت و پتروشیمی، سیستم‌های هوشمند",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: SITE_URL,
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} antialiased bg-background text-foreground font-sans`}
      >
        {/* علامت‌گذاری فعال بودن JS برای انیمیشن‌های تدریجی (Progressive Enhancement):
            اگر JS اجرا نشود، محتوای سایت همیشه بدون انیمیشن و کاملاً پیداست */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        {/* مدیریت تم روشن/تیره — بدون فلش اشتباه رنگ (no-flash) */}
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
