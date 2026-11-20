"use client";

// ===========================================================================
// HomePage — صفحه اصلی: هیرو + نوار اعتماد + مارکی صنایع + بخش‌های محتوایی
// ترتیب: Hero3D → TrustBar → IndustriesMarquee → Products → Architecture
//        → Stats → WhyUs → Process → Security → FAQ → CTA
// ===========================================================================
import type { Product, SiteSettings } from "@/lib/types";
import { Hero3D } from "./Hero3D";
import { TrustBar } from "./TrustBar";
import { IndustriesMarquee } from "./IndustriesMarquee";
import { ProductsSection } from "./ProductsSection";
import { ArchitectureSection } from "./ArchitectureSection";
import { StatsSection } from "./StatsSection";
import { WhyUsSection } from "./WhyUsSection";
import { ProcessSection } from "./ProcessSection";
import { SecuritySection } from "./SecuritySection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";

export interface HomePageProps {
  products: Product[];
  settings: SiteSettings;
}

export function HomePage({ products, settings }: HomePageProps) {
  return (
    <>
      <Hero3D settings={settings} />
      <TrustBar />
      <IndustriesMarquee />
      <ProductsSection products={products} />
      <ArchitectureSection />
      <StatsSection />
      <WhyUsSection />
      <ProcessSection />
      <SecuritySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
