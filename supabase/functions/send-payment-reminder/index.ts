import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PAYMENT-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Processing payment reminders");

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get upcoming payment schedules
    const { data: upcomingPayments, error: pError } = await supabase
      .from("payment_schedules")
      .select(`
        *,
        bookings(
          id,
          booking_number,
          customer_id,
          guest_email,
          guest_name,
          profiles:customer_id(email, first_name, last_name)
        )
      `)
      .eq("status", "pending")
      .lte("due_date", threeDaysFromNow.toISOString())
      .is("reminder_sent_at", null);

    if (pError) throw pError;

    logStep("Found pending payments", { count: upcomingPayments?.length || 0 });

    const reminders: any[] = [];

    for (const payment of upcomingPayments || []) {
      const booking = payment.bookings;
      if (!booking) continue;

      const email = booking.profiles?.email || booking.guest_email;
      const name = booking.profiles?.first_name || booking.guest_name || "Customer";

      if (!email) continue;

      const dueDate = new Date(payment.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let urgency = "reminder";
      if (daysUntilDue <= 1) urgency = "urgent";
      if (daysUntilDue < 0) urgency = "overdue";

      // Create notification record
      const { data: notification, error: nError } = await supabase
        .from("notifications")
        .insert({
          user_id: booking.customer_id,
          booking_id: booking.id,
          channel: "email",
          template_type: `payment_${urgency}`,
          subject: urgency === "overdue" 
            ? `OVERDUE: Payment of $${payment.amount} for booking ${booking.booking_number}`
            : `Payment reminder: $${payment.amount} due ${urgency === "urgent" ? "tomorrow" : `in ${daysUntilDue} days`}`,
          body: `Dear ${name},\n\nThis is a ${urgency} reminder that your payment of $${payment.amount.toFixed(2)} for booking ${booking.booking_number} is ${urgency === "overdue" ? "overdue" : `due on ${dueDate.toLocaleDateString()}`}.\n\nPlease complete your payment to avoid any issues with your booking.\n\nThank you.`,
          recipient_email: email,
          status: "pending",
        })
        .select()
        .single();

      if (!nError && notification) {
        reminders.push({
          payment_schedule_id: payment.id,
          notification_id: notification.id,
          urgency,
        });

        // Mark reminder as sent
        await supabase
          .from("payment_schedules")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", payment.id);
      }
    }

    // Handle overdue escalation
    const { data: overduePayments } = await supabase
      .from("payment_schedules")
      .select("*, bookings(id, status)")
      .eq("status", "pending")
      .lt("due_date", now.toISOString());

    for (const overdue of overduePayments || []) {
      const daysPastDue = Math.ceil((now.getTime() - new Date(overdue.due_date).getTime()) / (1000 * 60 * 60 * 24));

      // Escalation logic
      if (daysPastDue > 7 && overdue.bookings?.status !== "cancelled") {
        // Auto-cancel after 7 days overdue
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            cancellation_reason: "Payment overdue > 7 days - auto-cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", overdue.booking_id);

        await supabase.from("audit_log").insert([{
          entity_type: "booking",
          entity_id: overdue.booking_id,
          action_type: "auto_cancelled_overdue",
          after_json: { days_past_due: daysPastDue } as any,
        }]);

        logStep("Booking auto-cancelled", { bookingId: overdue.booking_id, daysPastDue });
      }
    }

    logStep("Reminders processed", { count: reminders.length });

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: reminders.length,
        details: reminders,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
