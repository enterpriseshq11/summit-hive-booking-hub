import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GHL-TEST-WEBHOOK] ${step}${detailsStr}`);
};

interface GHLTestPayload {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get("GHL_LINDSEY_WEBHOOK_URL");
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "GHL_LINDSEY_WEBHOOK_URL secret is not configured",
          configured: false 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid URL format. Current value starts with: "${webhookUrl.substring(0, 30)}..."`,
          configured: true,
          valid_url: false
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate test payload with sample data
    const now = new Date();
    const testDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const testPayload: GHLTestPayload = {
      firstName: "Test",
      lastName: "Customer",
      phone: "5675551234",
      email: "test@example.com",
      serviceName: "Swedish Massage",
      serviceDuration: 60,
      price: "$80.00",
      room: "M1",
      appointmentDate: testDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
      appointmentTime: "2:00 PM",
      timezone: "America/New_York",
      bookingId: "TEST-" + now.getTime().toString().slice(-8),
    };

    logStep("Sending test webhook", { 
      url: webhookUrl.substring(0, 50) + "...", 
      payload: testPayload 
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    
    if (response.ok) {
      logStep("Test webhook sent successfully", { status: response.status });
      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          valid_url: true,
          response_status: response.status,
          response_body: responseText.substring(0, 500),
          payload_sent: testPayload,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      logStep("Test webhook failed", { status: response.status, response: responseText });
      return new Response(
        JSON.stringify({
          success: false,
          configured: true,
          valid_url: true,
          error: `HTTP ${response.status}: ${responseText.substring(0, 200)}`,
          payload_sent: testPayload,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
