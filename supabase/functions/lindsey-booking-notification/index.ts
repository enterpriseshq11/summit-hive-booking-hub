import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LINDSEY-NOTIFICATION] ${step}${detailsStr}`);
};

// ============= GHL-ONLY MODE =============
// GoHighLevel is now the single source of truth for ALL spa automations.
// Lovable ONLY fires the GHL webhook on booking creation.
// All customer-facing emails, SMS, and reminders are handled by GHL.
// This prevents duplicate sends and centralizes automation logic.

interface BookingNotificationRequest {
  booking_id: string;
  type: "confirmed" | "cancelled" | "reminder" | "free_consultation" | "pay_on_arrival";
  stripe_session_id?: string;
  stripe_payment_intent?: string;
}

interface GHLWebhookPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  serviceName: string;
  serviceDuration: number;
  price: string;
  room: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  bookingId: string;
}

// Send webhook to GoHighLevel for CRM automation
async function sendGHLWebhook(payload: GHLWebhookPayload): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = Deno.env.get("GHL_LINDSEY_WEBHOOK_URL");
  
  if (!webhookUrl) {
    logStep("GHL webhook skipped - URL not configured");
    return { success: false, error: "GHL webhook URL not configured" };
  }

  // Validate URL format
  try {
    new URL(webhookUrl);
  } catch {
    logStep("GHL webhook skipped - invalid URL format", { url: webhookUrl.substring(0, 30) });
    return { success: false, error: "Invalid webhook URL format" };
  }

  try {
    logStep("Sending GHL webhook", { 
      url: webhookUrl.substring(0, 50) + "...", 
      payload: { ...payload, phone: "***", email: "***" } 
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    if (response.ok) {
      logStep("GHL webhook sent successfully", { status: response.status, response: responseText });
      return { success: true };
    } else {
      logStep("GHL webhook failed", { status: response.status, response: responseText });
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("GHL webhook error", { error: msg });
    return { success: false, error: msg };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { booking_id, type, stripe_session_id, stripe_payment_intent }: BookingNotificationRequest = await req.json();
    logStep("Request received", { booking_id, type, stripe_session_id });

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch full booking details with resources
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        booking_resources(*, resources(*)),
        booking_addons(*, addons(*)),
        payments(*)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      logStep("Booking fetch error", { error: bookingError });
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Booking fetched", { 
      guest_name: booking.guest_name, 
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      status: booking.status 
    });

    // Parse service details from notes
    const notesMatch = booking.notes?.match(/Service: ([^,]+), Duration: (\d+)/);
    const serviceName = notesMatch ? notesMatch[1] : "Massage Therapy";
    const duration = notesMatch ? parseInt(notesMatch[2], 10) : 60;

    // Format date/time for GHL
    const startDate = new Date(booking.start_datetime);
    const dateStr = startDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const timeStr = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Get room name if assigned
    const roomName = booking.booking_resources?.[0]?.resources?.name || "TBD";
    const roomCode = roomName.toLowerCase().includes("massage") || roomName.toLowerCase().includes("m1") ? "M1" : 
                     roomName.toLowerCase().includes("private") || roomName.toLowerCase().includes("p1") ? "P1" : roomName;

    // Parse guest name
    const nameParts = (booking.guest_name || "Guest").split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Get total price
    const totalAmount = Number(booking.total_amount || 0);
    const priceStr = `$${totalAmount.toFixed(2)}`;

    // ============= GHL WEBHOOK ONLY =============
    // All email/SMS automations are disabled for SPA.
    // GoHighLevel handles confirmations, reminders, and follow-ups.
    
    if (type === "confirmed" || type === "pay_on_arrival") {
      // Only fire GHL webhook for confirmed bookings (paid or pay-on-arrival)
      const allowedStatuses = new Set(["deposit_paid", "confirmed", "pending"]);
      if (!allowedStatuses.has(String(booking.status || ""))) {
        logStep("Skip GHL webhook - booking not in valid status", { status: booking.status });
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "booking_status_invalid" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Build GHL payload
      const ghlPayload: GHLWebhookPayload = {
        firstName,
        lastName,
        phone: booking.guest_phone || "",
        email: booking.guest_email || "",
        serviceName,
        serviceDuration: duration,
        price: priceStr,
        room: roomCode,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        timezone: "America/New_York",
        bookingId: booking.booking_number || booking.id.slice(0, 8).toUpperCase(),
      };

      const ghlResult = await sendGHLWebhook(ghlPayload);

      logStep("GHL-only mode complete", { 
        booking_id, 
        type,
        ghl_success: ghlResult.success,
        ghl_error: ghlResult.error,
        note: "Email/SMS disabled - GHL handles all automations"
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          ghl_webhook: ghlResult,
          automations_disabled: true,
          note: "Customer-facing emails/SMS disabled. GHL is the automation source."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // For other types (cancelled, reminder, free_consultation), skip entirely
    // GHL will handle these via status webhooks (to be implemented)
    logStep("Notification type skipped - GHL handles all automations", { type });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        skipped: true, 
        reason: "ghl_handles_automations",
        note: `${type} notifications are handled by GoHighLevel`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
