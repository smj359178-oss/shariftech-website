// ===========================================================================
// لوگوی اختصاصی شریف‌تک — مونوگرام S مداری در قاب شش‌ضلعی
// کاملاً SVG درون‌خطی؛ بدون فایل خارجی، قابل استفاده در هر تم
// ===========================================================================
import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("size-11", className)}
    >
      <defs>
        <linearGradient id="sitGradA" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="0.55" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="sitGradB" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.07" />
        </linearGradient>
      </defs>
      {/* قاب شش‌ضلعی با گرادیان زمردی→بنفش */}
      <path
        d="M24 2.5 41.5 12.6v20.8L24 45.5 6.5 33.4V12.6L24 2.5Z"
        fill="url(#sitGradB)"
        stroke="url(#sitGradA)"
        strokeWidth="2"
      />
      {/* مسیر مداری حرف S */}
      <path
        d="M31.5 14.5h-11a4.8 4.8 0 0 0 0 9.6h7a5.2 5.2 0 0 1 0 10.4h-12"
        stroke="url(#sitGradA)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* گره‌های مداری (کهربایی/فیروزه‌ای) */}
      <circle cx="31.5" cy="14.5" r="2.5" fill="#fbbf24" />
      <circle cx="15.5" cy="34.5" r="2.5" fill="#2dd4bf" />
    </svg>
  );
}

export interface LogoProps {
  siteName: string;
  siteShortName: string;
  className?: string;
  /** فقط نشان (بدون متن) — برای هدر کوچک/فوتر */
  markOnly?: boolean;
}

export function Logo({ siteName, siteShortName, className, markOnly }: LogoProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <LogoMark className="size-10 shrink-0 sm:size-11" />
      {!markOnly && (
        <span className="flex min-w-0 flex-col">
          <span className="text-base font-black leading-6 tracking-tight">
            {siteShortName}
          </span>
          <span className="max-w-[220px] truncate text-[11px] leading-4 text-muted-foreground">
            {siteName}
          </span>
        </span>
      )}
    </span>
  );
}
