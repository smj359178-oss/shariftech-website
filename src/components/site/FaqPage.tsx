"use client";

// ===========================================================================
// FaqPage — صفحه کامل پرسش‌های متداول
// محتوا دقیقاً از FAQ_CONTENT (منبع واحد حقیقت) + نوار تماس
// ===========================================================================
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_CONTENT } from "@/lib/faq-content";
import type { SiteSettings } from "@/lib/types";
import { Reveal } from "./Reveal";
import { ContactSection } from "./ContactSection";

export function FaqPage({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {/* سربرگ صفحه */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pb-14">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="aurora-blob -top-24 start-[-8%] size-80 bg-violet-500/25"
          aria-hidden="true"
        />
        <div
          className="aurora-blob top-6 end-[-6%] size-72 bg-emerald-500/20"
          aria-hidden="true"
          style={{ animationDelay: "-8s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              پرسش‌های متداول
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-snug sm:text-5xl">
              پاسخ پرسش‌های <span className="text-gradient">متداول</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              آنچه مشتریان ما پیش از شروع همکاری می‌پرسند؛ اگر پرسش شما اینجا نیست، از طریق صفحه
              تماس بپرسید.
            </p>
          </Reveal>
        </div>
      </section>

      {/* آکاردئون کامل */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="mx-auto max-w-3xl">
              {FAQ_CONTENT.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="glass mb-3 rounded-2xl border-b-0 px-5 transition-colors hover:border-emerald-400/40"
                >
                  <AccordionTrigger className="py-5 text-right text-sm font-semibold leading-7 hover:no-underline sm:text-[15px]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* نوار تماس */}
      <ContactSection settings={settings} />
    </>
  );
}
