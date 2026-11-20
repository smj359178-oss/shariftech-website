"use client";

// ===========================================================================
// مارکی بی‌نهایت صنایع هدف با توقف انیمیشن هنگام hover
// ===========================================================================
import {
  Anvil,
  Droplets,
  Factory,
  Flame,
  FlaskConical,
  Fuel,
  Mountain,
  Ship,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Industry {
  name: string;
  icon: LucideIcon;
  /** کلاس استاتیک رنگ آیکون */
  iconClass: string;
}

const INDUSTRIES: Industry[] = [
  { name: "نفت و گاز", icon: Flame, iconClass: "text-rose-300" },
  { name: "پتروشیمی", icon: FlaskConical, iconClass: "text-amber-300" },
  { name: "پالایشگاه", icon: Factory, iconClass: "text-emerald-300" },
  { name: "نیروگاه", icon: Zap, iconClass: "text-teal-300" },
  { name: "فولاد و معدن", icon: Mountain, iconClass: "text-violet-300" },
  { name: "آب و برق", icon: Droplets, iconClass: "text-cyan-300" },
  { name: "گازرسانی", icon: Fuel, iconClass: "text-amber-300" },
  { name: "کشتیرانی", icon: Ship, iconClass: "text-teal-300" },
  { name: "فولاد", icon: Anvil, iconClass: "text-rose-300" },
  { name: "حمل‌ونقل هوشمند", icon: Truck, iconClass: "text-emerald-300" },
];

function IndustryPill({ industry }: { industry: Industry }) {
  const Icon = industry.icon;
  return (
    <div className="glass flex items-center gap-2.5 rounded-full px-6 py-3 transition-colors duration-300 hover:border-emerald-400/40">
      <Icon className={cn("size-4", industry.iconClass)} aria-hidden="true" />
      <span className="whitespace-nowrap text-sm font-medium text-foreground/90">
        {industry.name}
      </span>
    </div>
  );
}

export function IndustriesMarquee() {
  return (
    <section id="industries" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* سربرگ بخش */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-300">صنایع هدف ما</p>
          <h2 className="text-3xl font-black sm:text-4xl">
            راهکارهای هوشمند برای <span className="text-gradient">صنایع زیرساختی</span>
          </h2>
        </div>

        {/* مارکی بی‌نهایت */}
        <div className="relative mt-12 overflow-hidden">
          {/* محو لبه‌ها */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28"
            aria-hidden="true"
          />
          <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
            {INDUSTRIES.map((industry) => (
              <IndustryPill key={industry.name} industry={industry} />
            ))}
            {/* کپی برای حلقه بی‌نهایت انیمیشن — از صفحه‌خوان و موتور جستجو پنهان */}
            <div aria-hidden="true" className="contents">
              {INDUSTRIES.map((industry, index) => (
                <IndustryPill key={`clone-${index}-${industry.name}`} industry={industry} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
