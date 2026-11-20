"use client";

// ===========================================================================
// FaqSection — پیش‌نمایش پرسش‌های متداول در صفحه اصلی (۴ مورد اول)
// منبع محتوا: FAQ_CONTENT در src/lib/faq-content.ts (دقیقاً همان متن)
// ===========================================================================
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_CONTENT } from "@/lib/faq-content";
import { navigate } from "@/lib/navigation";
import { Reveal } from "./Reveal";

export function FaqSection() {
  const items = FAQ_CONTENT.slice(0, 4);

  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            پرسش‌های متداول
          </p>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            پاسخ پرسش‌های <span className="text-gradient">شما</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <Accordion type="single" collapsible className="mx-auto mt-10 max-w-3xl">
            {items.map((item) => (
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

        <Reveal delay={180} className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate({ name: "faq" })}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-400/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            مشاهده همه پرسش‌ها
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
