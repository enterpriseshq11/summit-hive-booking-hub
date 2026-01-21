import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SUMMIT-REQUEST] ${step}${detailsStr}`);
};

type SummitRequestBody = {
  business_id: string;
  bookable_type_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string | null;
  guest_count?: number | null;
  start_datetime: string;
  end_datetime: string;
  notes?: string | null;
};

function minutesBetween(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function getLocalTimeParts(date: Date, timeZone: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return { hour: Number(map.hour), minute: Number(map.minute) };
}

function isWithinSummitHours(start: Date, end: Date, timeZone: string) {
  const s = getLocalTimeParts(start, timeZone);
  const e = getLocalTimeParts(end, timeZone);
  const startHour = s.hour + s.minute / 60;
  const endHour = e.hour + e.minute / 60;
  return startHour >= 9 && endHour <= 21;
}

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.trim().length <= 255;
}

function normalizePhoneToE164US(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;

  // Already E.164
  if (/^\+\d{10,15}$/.test(trimmed)) return trimmed;

  // Common US formats -> +1XXXXXXXXXX
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return null;
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    const msg = anyErr.message;
    if (typeof msg === "string") return msg;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const body = (await req.json()) as Partial<SummitRequestBody>;
    logStep("Request received", { hasBody: !!body });

    if (!isUuid(body.business_id) || !isUuid(body.bookable_type_id)) {
      return new Response(JSON.stringify({ error: "Invalid business_id or bookable_type_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof body.guest_name !== "string" || !body.guest_name.trim() || body.guest_name.trim().length > 120) {
      return new Response(JSON.stringify({ error: "Guest name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isEmail(body.guest_email)) {
      return new Response(JSON.stringify({ error: "Valid guest email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const start = typeof body.start_datetime === "string" ? new Date(body.start_datetime) : null;
    const end = typeof body.end_datetime === "string" ? new Date(body.end_datetime) : null;
    if (!start || !end || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      return new Response(JSON.stringify({ error: "Invalid start/end datetime" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce required time period: 1–8 hours
    const durationMins = minutesBetween(start, end);
    if (durationMins < 60 || durationMins > 8 * 60) {
      return new Response(JSON.stringify({ error: "Duration must be between 1 and 8 hours" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Summit hours: 9:00 AM – 9:00 PM daily (enforced in business timezone)
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("timezone")
      .eq("id", body.business_id)
      .maybeSingle();
    if (bizErr) {
      logStep("Business lookup failed", { error: bizErr.message });
      return new Response(JSON.stringify({ error: "Unable to validate business hours" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timeZone = biz?.timezone || "America/New_York";
    if (!isWithinSummitHours(start, end, timeZone)) {
      return new Response(JSON.stringify({ error: "Requested time must be between 9:00 AM and 9:00 PM" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const guestPhone = normalizePhoneToE164US(body.guest_phone);
    const guestCount = typeof body.guest_count === "number" && Number.isFinite(body.guest_count) ? Math.max(1, Math.min(500, Math.floor(body.guest_count))) : null;
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 4000) : null;

    const insertPayload = {
      business_id: body.business_id,
      bookable_type_id: body.bookable_type_id,
      customer_id: null,
      guest_name: body.guest_name.trim(),
      guest_email: body.guest_email.trim().toLowerCase(),
      guest_phone: guestPhone,
      guest_count: guestCount,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      notes,
      status: "pending",
      subtotal: 0,
      total_amount: 0,
      source_brand: "summit",
      // booking_number is set by DB trigger when NULL
      booking_number: null,
    };

    logStep("Inserting booking", { business_id: body.business_id, bookable_type_id: body.bookable_type_id });

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !booking?.id) {
      const msg = insertError?.message || safeErrorMessage(insertError);
      logStep("Insert failed", { error: msg, insertError });
      return new Response(JSON.stringify({ error: `Insert failed: ${msg}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invoke the centralized notification pipeline (non-blocking for end-user success)
    let notify: { success: boolean; error?: string } = { success: true };
    try {
      const { error: notifyError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          booking_id: booking.id,
          notification_type: "request",
          channels: ["email", "sms"],
          recipients: ["customer", "staff"],
        },
      });
      if (notifyError) {
        notify = { success: false, error: notifyError.message || safeErrorMessage(notifyError) };
        logStep("Notification invoke failed", { booking_id: booking.id, notifyError });
      }
    } catch (e) {
      notify = { success: false, error: safeErrorMessage(e) };
      logStep("Notification invoke error", { booking_id: booking.id, error: notify.error });
    }

    return new Response(JSON.stringify({ success: true, booking_id: booking.id, notify }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = safeErrorMessage(e);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
