import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-REMINDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    logStep("Processing pending reminders");

    // Find all pending reminders that are due
    const now = new Date().toISOString();
    const { data: dueReminders, error: fetchError } = await supabase
      .from("scheduled_reminders")
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_for,
        bookings(status)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) {
      logStep("Fetch error", { error: fetchError });
      throw fetchError;
    }

    logStep("Found due reminders", { count: dueReminders?.length || 0 });

    const results: { success: number; failed: number; cancelled: number } = { success: 0, failed: 0, cancelled: 0 };

    for (const reminder of dueReminders || []) {
      try {
        // Check if booking is still valid (not cancelled)
        const bookingStatus = (reminder.bookings as { status?: string })?.status;
        if (bookingStatus === "cancelled" || bookingStatus === "no_show") {
          // Cancel the reminder
          await supabase
            .from("scheduled_reminders")
            .update({ status: "cancelled", processed_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.cancelled++;
          logStep("Reminder cancelled - booking not active", { id: reminder.id, bookingStatus });
          continue;
        }

        // Call the notification function
        const notificationUrl = `${supabaseUrl}/functions/v1/send-booking-notification`;
        const response = await fetch(notificationUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            booking_id: reminder.booking_id,
            notification_type: "reminder",
            channels: ["email", "sms"],
            recipients: ["customer"],
          }),
        });

        if (response.ok) {
          // Mark as sent
          await supabase
            .from("scheduled_reminders")
            .update({ status: "sent", processed_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.success++;
          logStep("Reminder sent", { id: reminder.id, booking_id: reminder.booking_id });
        } else {
          const errText = await response.text();
          await supabase
            .from("scheduled_reminders")
            .update({ status: "failed", processed_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.failed++;
          logStep("Reminder failed", { id: reminder.id, error: errText });
        }
      } catch (e) {
        await supabase
          .from("scheduled_reminders")
          .update({ status: "failed", processed_at: new Date().toISOString() })
          .eq("id", reminder.id);
        results.failed++;
        logStep("Reminder error", { id: reminder.id, error: String(e) });
      }
    }

    logStep("Processing complete", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
