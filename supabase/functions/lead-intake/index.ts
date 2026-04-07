const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const UNIT_DISPLAY: Record<string, string> = {
  summit: "The Summit Event Center",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  coworking: "The Hive Coworking",
  voice_vault: "Voice Vault Studio",
  elevated_by_elyse: "Elevated by Elyse",
  mobile_homes: "A-Z Mobile Homes",
};

const UNIT_SENDER: Record<string, { email: string; name: string }> = {
  summit: { email: "events@azenterpriseshq.com", name: "The Summit Event Center" },
  spa: { email: "spa@azenterpriseshq.com", name: "Restoration Lounge Spa" },
  fitness: { email: "fitness@azenterpriseshq.com", name: "A-Z Total Fitness" },
  coworking: { email: "hive@azenterpriseshq.com", name: "The Hive Coworking" },
  voice_vault: { email: "studio@azenterpriseshq.com", name: "Voice Vault Studio" },
  elevated_by_elyse: { email: "elyse@azenterpriseshq.com", name: "Elevated by Elyse" },
};

const UNIT_TOKENS: Record<string, { phone: string; email: string }> = {
  summit: { phone: "[SUMMIT_PHONE]", email: "[SUMMIT_EMAIL]" },
  spa: { phone: "[SPA_PHONE]", email: "[SPA_EMAIL]" },
  fitness: { phone: "[FITNESS_PHONE]", email: "[FITNESS_EMAIL]" },
  coworking: { phone: "[HIVE_PHONE]", email: "[HIVE_EMAIL]" },
  voice_vault: { phone: "[VOICEVAULT_PHONE]", email: "[VOICEVAULT_EMAIL]" },
  elevated_by_elyse: { phone: "[ELYSE_PHONE]", email: "[ELYSE_EMAIL]" },
};

function buildConfirmationHtml(firstName: string, businessUnit: string, formFields: Record<string, any>): string {
  const unitName = UNIT_DISPLAY[businessUnit] || businessUnit;
  const tokens = UNIT_TOKENS[businessUnit] || { phone: "(567) 429-9924", email: "dylan@a-zenterpriseshq.com" };
  const serviceType = formFields?.event_type || formFields?.service_interest || formFields?.membership_type || "General Inquiry";
  const preferredDate = formFields?.preferred_date || "Not specified";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:20px">
<tr><td style="background:#18181b;padding:24px;text-align:center;border-radius:8px 8px 0 0">
<h1 style="color:#f59e0b;margin:0;font-size:22px">${unitName}</h1>
<p style="color:#a1a1aa;margin:8px 0 0;font-size:14px">Powered by A-Z Enterprises</p>
</td></tr>
<tr><td style="background:#ffffff;padding:24px;border:1px solid #e4e4e7;border-top:none">
<h2 style="color:#18181b;margin:0 0 16px;font-size:18px">Thank you, ${firstName}!</h2>
<p style="color:#52525b;font-size:14px;line-height:1.6;margin:0 0 16px">We received your submission and our team will follow up within <strong>24 hours</strong>.</p>
<table width="100%" style="background:#f4f4f5;border-radius:8px;padding:16px;margin:0 0 16px">
<tr><td style="padding:8px 16px">
<p style="color:#71717a;font-size:12px;margin:0">Service / Event Type</p>
<p style="color:#18181b;font-size:14px;font-weight:600;margin:4px 0 0">${serviceType}</p>
</td></tr>
<tr><td style="padding:8px 16px">
<p style="color:#71717a;font-size:12px;margin:0">Preferred Date</p>
<p style="color:#18181b;font-size:14px;font-weight:600;margin:4px 0 0">${preferredDate}</p>
</td></tr>
</table>
<p style="color:#52525b;font-size:14px;line-height:1.6;margin:0 0 8px"><strong>Questions?</strong> Reach us at:</p>
<p style="color:#52525b;font-size:14px;margin:0 0 4px">Phone: ${tokens.phone}</p>
<p style="color:#52525b;font-size:14px;margin:0 0 16px">Email: ${tokens.email}</p>
</td></tr>
<tr><td style="background:#f4f4f5;padding:16px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
<p style="color:#a1a1aa;font-size:12px;margin:0">10 W Auglaize St, Wapakoneta, Ohio 45895</p>
<p style="color:#a1a1aa;font-size:12px;margin:4px 0 0">&copy; ${new Date().getFullYear()} A-Z Enterprises</p>
</td></tr></table></body></html>`;
}

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
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
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

    // Map form source values to valid enum values
    const SOURCE_MAP: Record<string, string> = {
      google_search: "website", facebook: "social_media", instagram: "social_media",
      tiktok: "social_media", referral: "referral", drive_by: "walk_in",
      wedding_wire: "website", the_knot: "website", other: "other", website: "website",
      phone: "phone", email: "email", event: "event", walk_in: "walk_in",
      social_media: "social_media",
    };
    const mappedSource = SOURCE_MAP[source || "website"] || "other";

    // 1. Create lead in crm_leads
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .insert({
        lead_name: `${first_name} ${last_name}`,
        email,
        phone,
        business_unit,
        source: mappedSource as any,
        status: "new",
        temperature: "warm",
        follow_up_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
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
          // Consume response body to prevent resource leak
          await ghlRes.text();
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

    // 2b. Find or create GHL contact via API and save ghl_contact_id
    const ghlApiKey = Deno.env.get("GHL_API_KEY");
    const ghlLocationId = Deno.env.get("GHL_LOCATION_ID");

    if (ghlApiKey && ghlLocationId && lead?.id) {
      try {
        console.log("[lead-intake] Finding/creating GHL contact for", email);
        const GHL_API = "https://services.leadconnectorhq.com";
        const ghlHeaders = {
          "Authorization": `Bearer ${ghlApiKey}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json",
        };

        let ghlContactId: string | null = null;

        // Search by email
        const searchRes = await fetch(`${GHL_API}/contacts/search`, {
          method: "POST",
          headers: ghlHeaders,
          body: JSON.stringify({
            locationId: ghlLocationId,
            pageLimit: 1,
            filters: [{ field: "email", operator: "eq", value: email }],
          }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const contacts = searchData?.contacts || [];
          if (contacts.length > 0) {
            ghlContactId = contacts[0].id;
            console.log("[lead-intake] Found existing GHL contact:", ghlContactId);
          }
        } else {
          const errText = await searchRes.text();
          console.log("[lead-intake] GHL search failed, will create:", errText);
        }

        // Create if not found
        if (!ghlContactId) {
          const createRes = await fetch(`${GHL_API}/contacts/`, {
            method: "POST",
            headers: ghlHeaders,
            body: JSON.stringify({
              locationId: ghlLocationId,
              firstName: first_name || "",
              lastName: last_name || "",
              email,
              phone: phone || "",
              source: "A-Z Command",
              tags: [business_unit || "general"],
            }),
          });

          if (createRes.ok) {
            const createData = await createRes.json();
            ghlContactId = createData?.contact?.id || null;
            console.log("[lead-intake] Created GHL contact:", ghlContactId);
          } else {
            const errText = await createRes.text();
            console.log("[lead-intake] GHL create failed:", errText);
            // Try to extract ID from duplicate error (400 or 422)
            if (createRes.status === 400 || createRes.status === 422) {
              try {
                const errJson = JSON.parse(errText);
                ghlContactId = errJson?.meta?.contactId || errJson?.contact?.id || errJson?.contactId || null;
                if (ghlContactId) {
                  console.log("[lead-intake] Extracted contact ID from duplicate error:", ghlContactId);
                }
              } catch (_) { /* ignore */ }
            }
          }
        }

        // Save to lead record
        if (ghlContactId) {
          await supabase.from("crm_leads")
            .update({ ghl_contact_id: ghlContactId })
            .eq("id", lead.id);

          await supabase.from("crm_activity_events").insert({
            event_type: "status_change" as any,
            entity_type: "lead",
            entity_id: lead.id,
            event_category: "lead_updated",
            metadata: {
              action: "ghl_contact_linked",
              description: `GHL contact linked via API — ID: ${ghlContactId}`,
              ghl_contact_id: ghlContactId,
            },
          });

          console.log("[lead-intake] ghl_contact_id saved to lead", lead.id);

          // Create GHL Opportunity for this contact
          try {
            const supabaseFunctionsUrl = `${supabaseUrl}/functions/v1/ghl-create-opportunity`;
            const oppRes = await fetch(supabaseFunctionsUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({
                leadId: lead.id,
                ghlContactId: ghlContactId,
                leadName: `${first_name} ${last_name}`,
                businessUnit: business_unit,
              }),
            });
            const oppData = await oppRes.json();
            console.log("[lead-intake] GHL opportunity result:", JSON.stringify(oppData));
          } catch (oppErr) {
            console.error("[lead-intake] GHL opportunity creation error:", oppErr);
          }
        } else {
          console.log("[lead-intake] Could not obtain GHL contact ID for lead", lead.id);
        }
      } catch (ghlErr) {
        console.error("[lead-intake] GHL find/create error:", ghlErr);
        // Non-fatal: lead is still created, just missing GHL link
      }
    } else {
      console.log("[lead-intake] GHL API credentials not configured — skipping contact link");
    }

    // 3. Send confirmation email via Resend
    let confirmationEmailStatus = "pending";
    let confirmationEmailSentAt: string | null = null;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const sender = UNIT_SENDER[business_unit] || { email: "noreply@azenterpriseshq.com", name: "A-Z Enterprises" };
        const unitName = UNIT_DISPLAY[business_unit] || business_unit;
        const htmlBody = buildConfirmationHtml(first_name, business_unit, form_fields || {});

        const emailRes = await resend.emails.send({
          from: `${sender.name} <${sender.email}>`,
          to: [email],
          subject: `${unitName} — Inquiry Confirmation`,
          html: htmlBody,
          reply_to: "dylan@a-zenterpriseshq.com",
        });

        if (emailRes.data?.id) {
          confirmationEmailStatus = "sent";
          confirmationEmailSentAt = new Date().toISOString();
          console.log("Confirmation email sent to", email, "id:", emailRes.data.id);
        } else {
          console.error("Email send failed:", emailRes.error);
          const errMsg = JSON.stringify(emailRes.error || {});
          if (errMsg.includes("verify") || errMsg.includes("domain")) {
            confirmationEmailStatus = "pending_domain_verification";
          } else {
            confirmationEmailStatus = "failed";
          }
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        confirmationEmailStatus = "failed";
      }
    } else {
      console.warn("Resend not configured — RESEND_API_KEY missing");
      confirmationEmailStatus = "not_configured";
    }

    // 4. Log intake submission
    await supabase.from("lead_intake_submissions").insert({
      business_unit,
      form_data: { first_name, last_name, email, phone, source, ...form_fields },
      source: source || "website",
      lead_id: lead.id,
      ghl_webhook_status: ghlStatus,
      ghl_webhook_response: ghlResponse,
      ghl_webhook_fired_at: ghlStatus === "fired" ? new Date().toISOString() : null,
      confirmation_email_status: confirmationEmailStatus,
      confirmation_email_sent_at: confirmationEmailSentAt,
    });

    // 5. Fire alert to assigned team members
    const alertTargets: Record<string, string[]> = {
      summit: ["victoria@a-zenterpriseshq.com", "mark@a-zenterpriseshq.com"],
      spa: ["nasiya@a-zenterpriseshq.com"],
      fitness: ["victoria@a-zenterpriseshq.com", "rose@a-zenterpriseshq.com"],
      coworking: ["victoria@a-zenterpriseshq.com", "rose@a-zenterpriseshq.com"],
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

    // 6. Log to audit
    await supabase.from("audit_log").insert({
      action_type: "lead_intake_submitted",
      entity_type: "crm_leads",
      entity_id: lead.id,
      after_json: {
        business_unit, name: `${first_name} ${last_name}`,
        ghl_status: ghlStatus,
        email_status: confirmationEmailStatus,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        ghl_status: ghlStatus,
        confirmation_email_status: confirmationEmailStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error("Intake form error:", err);

    // Log to edge_function_errors
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);
      await sb.from("edge_function_errors").insert({
        function_name: "lead-intake",
        error_message: errorMessage,
        stack_trace: errorStack || null,
        payload: { note: "Error during intake form processing" },
      });
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
