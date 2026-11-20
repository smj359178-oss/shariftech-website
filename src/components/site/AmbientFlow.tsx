"use client";

// ===========================================================================
// AmbientFlow — پس‌زمینه متحرک «شبیه ویدیو» کاملاً بومی (Canvas 2D)
// جریان ذرات نور + موج‌های اورورا با رنگ‌های برند؛ بدون هیچ فایل ویدیو
// • صفر وابستگی خارجی — سبک (~3KB کد) و بهینه برای موبایل
// • با prefers-reduced-motion خاموش می‌شود
// • هنگام مخفی بودن تب (visibilitychange) متوقف می‌شود
// • رنگ‌ها از متغیرهای تم خوانده می‌شوند (سازگار با تم روشن/تیره)
// ===========================================================================
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number; // ایندکس رنگ از پالت
}

const PALETTE_LIGHT = ["16,185,129", "45,212,191", "139,92,246", "245,158,11"];
const PALETTE_DARK = ["52,211,153", "45,212,191", "167,139,250", "251,191,36"];

function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readPalette(dark: boolean): string[] {
  // پالت ثابت از پیش محاسبه‌شده — بدون خواندن getComputedStyle در هر فریم (کارایی)
  return dark ? PALETTE_DARK : PALETTE_LIGHT;
}

export function AmbientFlow({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isReducedMotion()) return; // بدون انیمیشن برای کاربران حساس به حرکت

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let t = 0;

    const detectDark = () =>
      document.documentElement.classList.contains("dark");

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // تعداد ذرات متناسب با مساحت (سقف محدود برای موبایل)
      const count = Math.min(46, Math.floor((width * height) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 2.2,
        hue: Math.floor(Math.random() * 4),
      }));
    };

    const drawBlob = (
      cx: number,
      cy: number,
      radius: number,
      rgb: string,
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const frame = () => {
      if (!running) return;
      t += 0.005;
      const dark = detectDark();
      const palette = readPalette(dark);
      const baseAlpha = dark ? 0.16 : 0.1;

      ctx.clearRect(0, 0, width, height);

      // موج‌های اورورا — سه لایه گرادیان متحرک
      const blobs = [
        {
          x: width * (0.72 + Math.sin(t * 1.7) * 0.09),
          y: height * (0.3 + Math.cos(t * 1.3) * 0.12),
          r: Math.max(width, height) * 0.42,
          c: palette[0],
          a: baseAlpha,
        },
        {
          x: width * (0.22 + Math.cos(t * 1.1) * 0.1),
          y: height * (0.68 + Math.sin(t * 1.5) * 0.1),
          r: Math.max(width, height) * 0.38,
          c: palette[2],
          a: baseAlpha * 0.75,
        },
        {
          x: width * (0.5 + Math.sin(t * 0.9 + 2) * 0.12),
          y: height * (0.12 + Math.cos(t * 0.8) * 0.08),
          r: Math.max(width, height) * 0.3,
          c: palette[3],
          a: baseAlpha * 0.6,
        },
      ];
      for (const b of blobs) drawBlob(b.x, b.y, b.r, b.c, b.a);

      // ذرات نورانی با خطوط اتصال نزدیک
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${palette[p.hue]},${dark ? 0.55 : 0.4})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // خطوط اتصال بین ذرات نزدیک (شبکه عصبی)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 13000) {
            const alpha = (1 - dist2 / 13000) * (dark ? 0.14 : 0.1);
            ctx.strokeStyle = `rgba(${palette[1]},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    // توقف انیمیشن وقتی canvas از دید خارج است (CPU/GPU صفر در اسکرول‌های دور)
    let inView = true;
    const setRunning = (next: boolean) => {
      const was = running;
      running = next && inView && !document.hidden;
      if (running && !was) raf = requestAnimationFrame(frame);
      else if (!running && was) cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        setRunning(inView);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      setRunning(!document.hidden);
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
