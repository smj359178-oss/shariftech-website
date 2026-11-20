"use client";

// ===========================================================================
// Reveal — انیمیشن ورود امن و مقاوم (Progressive Enhancement)
//
// طراحی مقاوم در برابر خطا:
//   1. محتوا در HTML اولیه (SSR) کاملاً پیداست — اگر JS اجرا نشود،
//      هیچ محتوایی هرگز مخفی نمی‌ماند.
//   2. فقط وقتی JS فعال است (کلاس html.js که در layout تزریق می‌شود)
//      عناصر زیر صفحه تا ورود به دید مخفی می‌شوند.
//   3. اگر IntersectionObserver پشتیبانی نشود یا به هر دلیلی فعال نشود،
//      یک تایمر اطمینان همه عناصر را حداکثر تا چند ثانیه بعد آشکار می‌کند.
//   4. با prefers-reduced-motion انیمیشن‌ها کاملاً غیرفعال می‌شوند.
// ===========================================================================
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** تایمر اطمینان سراسری: اگر Reveal به هر دلیلی آشکار نشد، بعد از این مدت آشکار می‌شود */
const FAILSAFE_MS = 2000;

interface RevealProps {
  children: React.ReactNode;
  /** کلاس‌های اضافی روی خود عنصر */
  className?: string;
  /** تاخیر انیمیشن (میلی‌ثانیه) برای ورود پلکانی */
  delay?: number;
  /** استایل ورود: بالا (پیش‌فرض) یا مقیاس */
  variant?: "up" | "scale";
}

export function Reveal({ children, className, delay = 0, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // تایمر اطمینان: در بدترین حالت عنصر پس از FAILSAFE_MS آشکار می‌شود
    const failsafe = window.setTimeout(() => el.classList.add("is-visible"), FAILSAFE_MS + delay);

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return () => window.clearTimeout(failsafe);
    }

    // اگر عنصر از قبل در دید است (مثلاً لود در وسط صفحه) بلافاصله آشکار شود
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn("reveal", variant === "scale" && "reveal-scale", className)}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
