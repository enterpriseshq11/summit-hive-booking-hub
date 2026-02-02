import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SPA-STATUS-WEBHOOK] ${step}${detailsStr}`);
};

interface StatusChangeRequest {
  booking_id: string;
  new_status: "confirmed" | "showed" | "no_show" | "cancelled" | "rescheduled";
}

interface GHLStatusPayload {
  bookingId: string;
  status: string;
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

    const { booking_id, new_status }: StatusChangeRequest = await req.json();
    logStep("Request received", { booking_id, new_status });

    if (!booking_id || !new_status) {
      return new Response(JSON.stringify({ error: "booking_id and new_status are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate status
    const validStatuses = ["confirmed", "showed", "no_show", "cancelled", "rescheduled"];
    if (!validStatuses.includes(new_status)) {
      return new Response(JSON.stringify({ error: "Invalid status value" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking details with resources
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        booking_resources(*, resources(*)),
        businesses(name, type)
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

    // Verify this is a spa booking
    if (booking.businesses?.type !== "spa" && booking.source_brand !== "restoration") {
      logStep("Not a spa booking, skipping webhook", { type: booking.businesses?.type });
      return new Response(JSON.stringify({ error: "Status webhook only available for spa bookings" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const previousStatus = booking.status;
    logStep("Current booking status", { previousStatus, new_status });

    // Update the booking status in the database
    const updateData: Record<string, unknown> = { status: new_status };
    if (new_status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking_id);

    if (updateError) {
      logStep("Status update error", { error: updateError });
      return new Response(JSON.stringify({ error: "Failed to update booking status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Booking status updated in DB", { booking_id, new_status });

    // Log to audit
    await supabase.from("audit_log").insert({
      action_type: `spa_status_changed_to_${new_status}`,
      entity_type: "bookings",
      entity_id: booking_id,
      before_json: { status: previousStatus },
      after_json: { status: new_status },
    });

    // Build GHL payload
    const guestName = booking.guest_name || "Guest";
    const nameParts = guestName.split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Parse service from notes
    const notesMatch = booking.notes?.match(/Service: ([^,]+), Duration: (\d+)/);
    const serviceName = notesMatch ? notesMatch[1] : "Massage Therapy";
    const duration = notesMatch ? parseInt(notesMatch[2], 10) : 60;

    // Format date/time
    const startDate = new Date(booking.start_datetime);
    const appointmentDate = startDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const appointmentTime = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Get room
    const roomResource = booking.booking_resources?.[0]?.resources;
    let roomCode = "TBD";
    if (roomResource?.name) {
      if (roomResource.name.includes("M1") || roomResource.name.toLowerCase().includes("main")) {
        roomCode = "M1";
      } else if (roomResource.name.includes("P1") || roomResource.name.toLowerCase().includes("private")) {
        roomCode = "P1";
      } else {
        roomCode = roomResource.name;
      }
    }

    const totalAmount = Number(booking.total_amount || 0);

    const payload: GHLStatusPayload = {
      bookingId: booking.booking_number || booking.id.slice(0, 8).toUpperCase(),
      status: new_status,
      firstName,
      lastName,
      phone: booking.guest_phone || "",
      email: booking.guest_email || "",
      serviceName,
      serviceDuration: duration,
      price: `$${totalAmount.toFixed(2)}`,
      room: roomCode,
      appointmentDate,
      appointmentTime,
      timezone: "America/New_York",
    };

    // Send to GHL
    const webhookUrl = Deno.env.get("GHL_LINDSEY_WEBHOOK_URL");
    
    if (!webhookUrl) {
      logStep("GHL webhook URL not configured");
      return new Response(JSON.stringify({ 
        success: true, 
        status_updated: true,
        webhook_sent: false,
        reason: "GHL webhook URL not configured"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate URL
    try {
      new URL(webhookUrl);
    } catch {
      logStep("Invalid GHL webhook URL format");
      return new Response(JSON.stringify({ 
        success: true, 
        status_updated: true,
        webhook_sent: false,
        reason: "Invalid webhook URL format"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Sending GHL status webhook", { 
      url: webhookUrl.substring(0, 50) + "...", 
      payload: { ...payload, phone: "***", email: "***" } 
    });

    const ghlResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const ghlResponseText = await ghlResponse.text();
    
    logStep("GHL response", { 
      status: ghlResponse.status, 
      ok: ghlResponse.ok,
      body: ghlResponseText.substring(0, 200)
    });

    return new Response(JSON.stringify({ 
      success: true, 
      status_updated: true,
      previous_status: previousStatus,
      new_status,
      webhook_sent: ghlResponse.ok,
      webhook_status: ghlResponse.status,
      webhook_response: ghlResponseText
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("Error", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
