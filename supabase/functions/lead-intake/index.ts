const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      business_unit,
      first_name, last_name, email, phone,
      source, form_fields,
    } = body;

    if (!business_unit || !first_name || !last_name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Create lead in crm_leads
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .insert({
        lead_name: `${first_name} ${last_name}`,
        email,
        phone,
        business_unit,
        source: source || "website",
        status: "new",
        temperature: "warm",
        follow_up_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead creation failed:", leadError);
      return new Response(
        JSON.stringify({ error: "Failed to create lead", details: leadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fire GHL webhook
    let ghlStatus = "pending";
    let ghlResponse = null;

    const { data: ghlConfig } = await supabase
      .from("ghl_webhook_config")
      .select("webhook_url, is_active")
      .eq("business_unit", business_unit)
      .single();

    if (ghlConfig?.webhook_url && ghlConfig.is_active) {
      try {
        const webhookPayload = {
          first_name, last_name, email, phone,
          business_unit, source: source || "website",
          submission_timestamp: new Date().toISOString(),
          ...form_fields,
        };

        const ghlRes = await fetch(ghlConfig.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });

        if (ghlRes.ok) {
          ghlStatus = "fired";
          ghlResponse = `HTTP ${ghlRes.status}`;
        } else {
          ghlStatus = "failed";
          ghlResponse = `HTTP ${ghlRes.status}: ${await ghlRes.text()}`;
        }
      } catch (err) {
        ghlStatus = "failed";
        ghlResponse = String(err);
      }
    } else {
      ghlStatus = "pending";
      ghlResponse = "No webhook URL configured";
    }

    // 3. Log intake submission
    await supabase.from("lead_intake_submissions").insert({
      business_unit,
      form_data: { first_name, last_name, email, phone, source, ...form_fields },
      source: source || "website",
      lead_id: lead.id,
      ghl_webhook_status: ghlStatus,
      ghl_webhook_response: ghlResponse,
      ghl_webhook_fired_at: ghlStatus === "fired" ? new Date().toISOString() : null,
    });

    // 4. Fire alert to assigned team members
    const alertTargets: Record<string, string[]> = {
      summit: ["victoria@a-zenterpriseshq.com", "mark@a-zenterpriseshq.com"],
      spa: ["nasiya@a-zenterpriseshq.com"],
      fitness: ["victoria@a-zenterpriseshq.com", "operations@a-zenterpriseshq.com"],
      coworking: ["victoria@a-zenterpriseshq.com", "operations@a-zenterpriseshq.com"],
      voice_vault: ["victoria@a-zenterpriseshq.com"],
      elevated_by_elyse: ["elyse@a-zenterpriseshq.com"],
    };

    const targets = alertTargets[business_unit] || ["victoria@a-zenterpriseshq.com"];

    for (const targetEmail of targets) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", targetEmail)
        .single();

      if (profile) {
        await supabase.from("crm_alerts").insert({
          alert_type: "new_lead",
          title: `New ${business_unit.replace(/_/g, " ")} Lead: ${first_name} ${last_name}`,
          description: `${email} | ${phone} | Source: ${source || "website"}`,
          severity: "info",
          target_user_id: profile.id,
          entity_type: "lead",
          entity_id: lead.id,
        });
      }
    }

    // 5. Log to audit
    await supabase.from("audit_log").insert({
      action_type: "lead_intake_submitted",
      entity_type: "crm_leads",
      entity_id: lead.id,
      after_json: {
        business_unit, name: `${first_name} ${last_name}`,
        ghl_status: ghlStatus,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        ghl_status: ghlStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Intake form error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
