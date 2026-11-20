"use client";

// ===========================================================================
// TrustBar — نوار اعتماد و اعتبار زیر هیرو؛ پنج چیپ شیشه‌ای با آیکون
// ===========================================================================
import { Award, GraduationCap, Headset, Landmark, ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

interface TrustItem {
  icon: LucideIcon;
  label: string;
}

const TRUST_ITEMS: TrustItem[] = [
  { icon: GraduationCap, label: "مستند به دانش دانشگاه صنعتی شریف" },
  { icon: Landmark, label: "عضو پارک علم و فناوری" },
  { icon: ShieldCheck, label: "هم‌راستا با ISO/IEC 27001" },
  { icon: Headset, label: "پشتیبانی ۲۴/۷" },
  { icon: Award, label: "تیم دانشگاهی و متخصص صنعتی" },
];

export function TrustBar() {
  return (
    <section id="hero-next" aria-label="اعتماد و اعتبار" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <ul className="flex flex-wrap items-stretch justify-center gap-3">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="glass flex min-h-[44px] items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground/90"
                >
                  <Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
