"use client";

// ===========================================================================
// TiltCard — پوشش سه‌بعدی قابل‌استفاده مجدد
// با حرکت ماوس، چرخش rotateX/rotateY ملایم روی عنصر اعمال می‌شود.
// منتظرconsumer است که کلاس .card-3d (ترنزیشن CSS) را روی فرزند بگذارد.
// شرط غیرفعال‌سازی: prefers-reduced-motion | لمسی (pointer:coarse) | عرض < 640px
// ===========================================================================
import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** حداکثر زاویه چرخش (درجه) */
  max?: number;
}

export function TiltCard({ children, className, max = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  // فعال/غیرفعال بودن افکت فقط در محیط مناسب (دسکتاپ + بدون کاهش حرکت)
  useEffect(() => {
    const evaluate = () => {
      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarsePointer =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;
      enabledRef.current = !reduceMotion && !coarsePointer && window.innerWidth >= 640;
    };
    evaluate();
    window.addEventListener("resize", evaluate, { passive: true });
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const handleMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || !enabledRef.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * max).toFixed(2);
      const ry = (px * max).toFixed(2);
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    [max],
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("h-full", className)}
    >
      {children}
    </div>
  );
}
