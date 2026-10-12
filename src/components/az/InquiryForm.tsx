import { FormEvent, useId, useState } from "react";
import { SITE_CONFIG } from "@/config/siteConfig";
import {
  GYM_OPTIONS,
  InquiryErrors,
  InquiryKind,
  LANES,
  START_WINDOWS,
  consentTextFor,
  submitInquiry,
  validateInquiry,
} from "@/lib/buildingInquiry";

interface InquiryFormProps {
  kind: InquiryKind;
  submitLabel?: string;
}

const inputBase =
  "w-full min-h-[48px] rounded-md border bg-white px-3.5 text-[16px] text-az-ink placeholder:text-[#8B8173] focus:outline-none focus-visible:ring-2 focus-visible:ring-az-golddark";

export function InquiryForm({ kind, submitLabel }: InquiryFormProps) {
  const uid = useId();
  const [values, setValues] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    lane: "",
    startWindow: "",
    message: "",
    consent: false,
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  const set = (k: keyof typeof values) => (v: string | boolean) => setValues((s) => ({ ...s, [k]: v }));
  const id = (k: string) => `${uid}-${k}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const input = {
      kind,
      fullName: values.fullName,
      businessName: values.businessName,
      phone: values.phone,
      email: values.email,
      lane: values.lane,
      startWindow: values.startWindow,
      message: values.message,
      consent: values.consent,
    };
    const v = validateInquiry(input);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0];
      document.getElementById(id(first))?.focus();
      return;
    }
    // Honeypot: bots fill hidden fields. Show success, save nothing.
    if (values.website.trim()) {
      setStatus("done");
      return;
    }
    setStatus("sending");
    const res = await submitInquiry(input);
    setStatus(res.ok ? "done" : "failed");
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-xl border border-az-paperline bg-az-paper2 p-8 md:p-10">
        <p className="az-display text-[44px] text-az-ink md:text-[56px]">Got it.</p>
        <p className="mt-4 text-[18px] leading-relaxed text-az-onpaper">
          {kind === "build"
            ? "A real person from A-Z will call you. Thank you for thinking about building here."
            : kind === "gym"
              ? "You are on the list for Zero Gravity Fitness. A real person from A-Z will reach out."
              : "We will reach out when The Spa is ready. Thank you."}
        </p>
      </div>
    );
  }

  const err = (k: keyof InquiryErrors) =>
    errors[k] ? (
      <span id={id(`${k}-err`)} className="text-[14px] font-medium text-[#A3261B]">
        {errors[k]}
      </span>
    ) : null;
  const border = (k: keyof InquiryErrors) => (errors[k] ? "border-[#A3261B]" : "border-[#B9AE9B]");
  const described = (k: keyof InquiryErrors) => (errors[k] ? id(`${k}-err`) : undefined);

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative grid gap-5 rounded-xl border border-az-paperline bg-az-paper2 p-6 sm:grid-cols-2 md:p-9"
      aria-label={kind === "build" ? "Tell us what you want to build" : kind === "gym" ? "Get on the gym list" : "Tell me when The Spa is ready"}
    >
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("fullName")}>Full name</label>
        <input id={id("fullName")} className={`${inputBase} ${border("fullName")}`} autoComplete="name" value={values.fullName}
          onChange={(e) => set("fullName")(e.target.value)} aria-invalid={!!errors.fullName} aria-describedby={described("fullName")} maxLength={80} />
        {err("fullName")}
      </div>

      {kind === "build" ? (
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("businessName")}>Business name (optional)</label>
          <input id={id("businessName")} className={`${inputBase} ${border("businessName")}`} autoComplete="organization" value={values.businessName}
            onChange={(e) => set("businessName")(e.target.value)} maxLength={120} />
          {err("businessName")}
        </div>
      ) : kind === "spa" ? (
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("email")}>Email</label>
          <input id={id("email")} type="email" className={`${inputBase} ${border("email")}`} autoComplete="email" value={values.email}
            onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors.email} aria-describedby={described("email")} />
          {err("email")}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("phone")}>{kind === "spa" ? "Mobile phone (optional)" : "Mobile phone"}</label>
        <input id={id("phone")} type="tel" inputMode="tel" className={`${inputBase} ${border("phone")}`} autoComplete="tel" value={values.phone}
          onChange={(e) => set("phone")(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={described("phone")} />
        {err("phone")}
      </div>

      {kind !== "spa" && (
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("email")}>Email</label>
          <input id={id("email")} type="email" className={`${inputBase} ${border("email")}`} autoComplete="email" value={values.email}
            onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors.email} aria-describedby={described("email")} />
          {err("email")}
        </div>
      )}

      {kind === "gym" && (
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("lane")}>Which one fits you?</label>
          <select id={id("lane")} className={`${inputBase} ${border("lane")}`} value={values.lane}
            onChange={(e) => set("lane")(e.target.value)} aria-invalid={!!errors.lane} aria-describedby={described("lane")}>
            <option value="">Pick one</option>
            {GYM_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {err("lane")}
        </div>
      )}

      {kind === "build" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("lane")}>What do you want to do here?</label>
            <select id={id("lane")} className={`${inputBase} ${border("lane")}`} value={values.lane}
              onChange={(e) => set("lane")(e.target.value)} aria-invalid={!!errors.lane} aria-describedby={described("lane")}>
              <option value="">Pick one</option>
              {LANES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            {err("lane")}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("startWindow")}>When do you want to start?</label>
            <select id={id("startWindow")} className={`${inputBase} ${border("startWindow")}`} value={values.startWindow}
              onChange={(e) => set("startWindow")(e.target.value)} aria-invalid={!!errors.startWindow} aria-describedby={described("startWindow")}>
              <option value="">Pick one</option>
              {START_WINDOWS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {err("startWindow")}
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-[14px] font-semibold text-az-ink" htmlFor={id("message")}>What do you need?</label>
            <textarea id={id("message")} rows={4} maxLength={1000} placeholder="Space size, days and hours, equipment, anything we should know."
              className={`${inputBase} ${border("message")} py-3`} value={values.message} onChange={(e) => set("message")(e.target.value)}
              aria-describedby={described("message")} />
            {err("message")}
          </div>
        </>
      )}

      {/* Honeypot, hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website")(e.target.value)} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={id("consent")} className="flex items-start gap-3 text-[14px] leading-relaxed text-az-onpaper">
          <input id={id("consent")} type="checkbox" className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-[#0C0B09]" checked={values.consent}
            onChange={(e) => set("consent")(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={described("consent")} />
          <span>{consentTextFor(kind)}</span>
        </label>
        <div className="mt-2">{err("consent")}</div>
      </div>

      <div className="flex flex-col gap-3 sm:col-span-2">
        <button type="submit" disabled={status === "sending"}
          className="inline-flex min-h-[54px] w-full items-center justify-center rounded-md bg-az-ink px-8 text-[17px] font-semibold text-az-goldlight transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:self-start">
          {status === "sending" ? "Sending" : submitLabel ?? (kind === "build" ? "Send it" : kind === "gym" ? "Put me on the list" : "Tell me when it is ready")}
        </button>
        {status === "failed" && (
          <p role="alert" className="text-[15px] font-medium text-[#A3261B]">
            That did not go through. Call {SITE_CONFIG.contact.phone} and we will take it by phone.
          </p>
        )}
      </div>
    </form>
  );
}
