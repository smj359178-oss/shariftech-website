"use client";

// ===========================================================================
// دکمه تغییر تم روشن/تیره — با انیمیشن چرخش آیکون و جلوگیری از hydration error
// ===========================================================================
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // تا قبل از mount (SSR) آیکون خنثی رندر می‌شود تا mismatch پیش نیاید
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تغییر به تم روشن" : "تغییر به تم تیره"}
      title={isDark ? "تم روشن" : "تم تیره"}
      className={cn(
        "glass relative inline-flex size-10 items-center justify-center overflow-hidden rounded-xl text-foreground transition-all duration-300 hover:border-emerald-400/50 hover:glow-primary focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute size-5 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-5 transition-all duration-300",
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
    </button>
  );
}
