"use client";

// ===========================================================================
// ContactForm — فرم تماس مشترک با اعتبارسنجی هم‌سو با سرور (/api/messages)
// شامل Honeypot ضداسپم، پیام خطای سرور و پنل موفقیت
// ===========================================================================
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

type FieldKey = keyof ContactFormState;
type FormErrors = Partial<Record<FieldKey, string>>;

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

/** اعتبارسنجی سمت کاربر — دقیقاً هم‌سو با zod سرور */
function validate(form: ContactFormState): FormErrors {
  const errors: FormErrors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = "نام و نام خانوادگی الزامی است.";
  } else if (name.length < 2) {
    errors.name = "نام باید حداقل ۲ کاراکتر باشد.";
  } else if (name.length > 120) {
    errors.name = "نام نمی‌تواند بیش از ۱۲۰ کاراکتر باشد.";
  }

  const email = form.email.trim();
  if (!email) {
    errors.email = "ایمیل الزامی است.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "قالب ایمیل نامعتبر است.";
  }

  if (form.phone.trim().length > 40) {
    errors.phone = "شماره تماس نمی‌تواند بیش از ۴۰ کاراکتر باشد.";
  }
  if (form.company.trim().length > 160) {
    errors.company = "نام سازمان نمی‌تواند بیش از ۱۶۰ کاراکتر باشد.";
  }
  if (form.subject.trim().length > 200) {
    errors.subject = "موضوع نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.";
  }

  const message = form.message.trim();
  if (!message) {
    errors.message = "متن پیام الزامی است.";
  } else if (message.length < 10) {
    errors.message = "متن پیام باید حداقل ۱۰ کاراکتر باشد.";
  } else if (message.length > 5000) {
    errors.message = "متن پیام بیش از حد طولانی است.";
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="text-xs text-destructive">
      {message}
    </span>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const updateField =
    (field: FieldKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          // honeypot — ربات‌ها این فیلد پنهان را پر می‌کنند و در سرور رد می‌شوند
          website: honeypotRef.current?.value ?? "",
        }),
      });
      const data: { error?: string } | null = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.");
      }
      setSucceeded(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "خطای نامشخص رخ داده است. لطفاً بعداً دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setServerError(null);
    setSucceeded(false);
  };

  // --- پنل موفقیت ---
  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-black">پیام شما ثبت شد</h3>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          کارشناسان ما در کمتر از یک روز کاری پاسخ می‌دهند.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          className="min-h-[44px] rounded-full"
        >
          ثبت پیام جدید
        </Button>
      </div>
    );
  }

  const describedBy = (field: FieldKey, error?: string) =>
    error ? `contact-${field}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot ضداسپم — برای کاربر واقعی کاملاً نامرئی */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* خطای سرور */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm leading-6 text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* نام و نام خانوادگی */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">
            نام و نام خانوادگی <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            value={form.name}
            onChange={updateField("name")}
            maxLength={120}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name", errors.name)}
            placeholder="مثلاً علی رضایی"
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>

        {/* ایمیل */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">
            ایمیل <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            value={form.email}
            onChange={updateField("email")}
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email", errors.email)}
            placeholder="you@company.ir"
            className="text-left"
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </div>

        {/* شماره تماس */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">شماره تماس</Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={form.phone}
            onChange={updateField("phone")}
            maxLength={40}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone", errors.phone)}
            placeholder="0912 000 0000"
            className="text-left"
          />
          <FieldError id="contact-phone-error" message={errors.phone} />
        </div>

        {/* نام سازمان */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-company">نام شرکت / سازمان</Label>
          <Input
            id="contact-company"
            name="company"
            value={form.company}
            onChange={updateField("company")}
            maxLength={160}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy("company", errors.company)}
            placeholder="نام مجموعه شما"
          />
          <FieldError id="contact-company-error" message={errors.company} />
        </div>

        {/* موضوع */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-subject">موضوع</Label>
          <Input
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={updateField("subject")}
            maxLength={200}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={describedBy("subject", errors.subject)}
            placeholder="مثلاً استقرار داشبورد پایش پالایشگاه"
          />
          <FieldError id="contact-subject-error" message={errors.subject} />
        </div>

        {/* متن پیام */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-message">
            متن پیام <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={updateField("message")}
            maxLength={5000}
            rows={5}
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("message", errors.message)}
            placeholder="نیاز و چالش سازمان خود را در چند خط توضیح دهید..."
            className="min-h-28 resize-y leading-7"
          />
          <FieldError id="contact-message-error" message={errors.message} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="glow-primary min-h-[48px] w-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 text-base font-bold text-white transition-transform duration-300 hover:scale-[1.01] dark:text-emerald-950"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            در حال ارسال...
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            ارسال پیام
          </>
        )}
      </Button>

      {/* یادداشت محرمانگی */}
      <p className="flex items-center justify-center gap-2 text-center text-xs leading-6 text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
        اطلاعات شما محرمانه است و فقط برای پاسخگویی استفاده می‌شود.
      </p>
    </form>
  );
}
