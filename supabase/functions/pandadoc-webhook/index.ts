import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PANDADOC-WEBHOOK] ${step}${d}`);
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
    const body = await req.json();
    logStep("Webhook received", { event: body?.event });

    const webhookKey = Deno.env.get("PANDADOC_WEBHOOK_KEY");
    const headerKey = req.headers.get("x-pandadoc-signature");
    if (webhookKey && headerKey && headerKey !== webhookKey) {
      logStep("WARNING: Webhook signature mismatch - proceeding but flagging");
    }
    if (!webhookKey) {
      logStep("WARNING: PANDADOC_WEBHOOK_KEY not set, requests are unverified");
    }

    const eventType = body?.event || body?.type || "unknown";
    const documentId = body?.data?.id || body?.document_id || null;

    // Log every event
    await supabase.from("pandadoc_webhook_events").insert({
      event_type: eventType,
      document_id: documentId,
      payload: body,
      processed: false,
    });

    // Handle document.completed
    if (eventType === "document_completed" || eventType === "document.completed") {
      logStep("Document completed", { documentId });

      if (documentId) {
        const { data: lead } = await supabase
          .from("crm_leads")
          .select("id, lead_name, business_unit, status, assigned_employee_id, pandadoc_status, ghl_sync_in_progress")
          .eq("pandadoc_document_id", documentId)
          .maybeSingle();

        if (lead) {
          // Update pandadoc_status
          await supabase.from("crm_leads")
            .update({ pandadoc_status: "completed" })
            .eq("id", lead.id);

          // Move to deposit_pending if currently at contract_sent
          if (lead.status === "contract_sent") {
            await supabase.from("crm_leads")
              .update({ status: "deposit_pending" })
              .eq("id", lead.id);

            // Fire GHL webhook for deposit_pending stage — query ghl_pipeline_stage_webhooks
            if (!lead.ghl_sync_in_progress) {
              try {
                const { data: webhookConfig } = await supabase
                  .from("ghl_pipeline_stage_webhooks")
                  .select("webhook_url, is_active")
                  .eq("stage_name", "deposit_pending")
                  .maybeSingle();

                if (webhookConfig?.webhook_url && webhookConfig.is_active) {
                  const ghlRes = await fetch(webhookConfig.webhook_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "pipeline_stage_changed",
                      lead_id: lead.id,
                      lead_name: lead.lead_name,
                      business_unit: lead.business_unit,
                      previous_stage_key: "contract_sent",
                      previous_stage_name: "Contract Out",
                      new_stage_key: "deposit_pending",
                      new_stage_name: "Deposit Received",
                      trigger: "pandadoc_signed",
                      timestamp: new Date().toISOString(),
                    }),
                  });

                  const statusText = `HTTP ${ghlRes.status}`;
                  await supabase.from("crm_activity_events").insert({
                    event_type: "lead_updated" as any,
                    entity_type: "lead",
                    entity_id: lead.id,
                    metadata: {
                      action: ghlRes.ok ? "ghl_webhook_fired" : "ghl_webhook_failed",
                      message: `GHL webhook ${ghlRes.ok ? "fired" : "FAILED"} — stage moved to Deposit Received — ${statusText}`,
                    },
                  });
                } else {
                  await supabase.from("crm_activity_events").insert({
                    event_type: "lead_updated" as any,
                    entity_type: "lead",
                    entity_id: lead.id,
                    metadata: {
                      action: "ghl_webhook_skipped",
                      message: "GHL webhook skipped — no URL configured or inactive for deposit_pending stage",
                    },
                  });
                }
              } catch (e) {
                logStep("GHL webhook failed", { error: String(e) });
                await supabase.from("crm_activity_events").insert({
                  event_type: "lead_updated" as any,
                  entity_type: "lead",
                  entity_id: lead.id,
                  metadata: {
                    action: "ghl_webhook_failed",
                    message: `GHL webhook FAILED — Error: ${String(e)}`,
                  },
                });
              }
            } else {
              logStep("GHL webhook skipped — ghl_sync_in_progress is true", { leadId: lead.id });
            }
          }

          // Log to timeline
          await supabase.from("crm_activity_events").insert({
            event_type: "status_change" as any,
            entity_type: "lead",
            entity_id: lead.id,
            entity_name: lead.lead_name,
            event_category: "document_uploaded",
            metadata: {
              action: "contract_signed",
              pandadoc_document_id: documentId,
              description: `Contract signed via PandaDoc — all parties have signed`,
            },
          });

          // Create alert
          await supabase.from("crm_alerts").insert({
            alert_type: "commission_pending",
            title: `Contract Signed — ${lead.lead_name}`,
            description: `Contract signed by ${lead.lead_name} — ${lead.business_unit} — ready for deposit`,
            entity_type: "lead",
            entity_id: lead.id,
            severity: "info",
            target_roles: ["owner", "manager"],
          });

          // Send notification email to Dylan with lead detail link
          try {
            const resendKey = Deno.env.get("RESEND_API_KEY");
            if (resendKey) {
              let baseUrl = "https://summit-hive-booking-hub.lovable.app";
              const { data: baseUrlSetting } = await supabase
                .from("admin_settings")
                .select("value")
                .eq("key", "base_url")
                .maybeSingle();
              if (baseUrlSetting?.value) baseUrl = baseUrlSetting.value;

              const leadDetailUrl = `${baseUrl}/admin/leads/${lead.id}`;

              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${resendKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "A-Z Command <notifications@azenterpriseshq.com>",
                  to: ["dylan@a-zenterpriseshq.com"],
                  reply_to: "dylan@a-zenterpriseshq.com",
                  subject: `Contract Signed — ${lead.lead_name}`,
                  html: `
                    <h2>Contract Signed</h2>
                    <p><strong>${lead.lead_name}</strong> has signed the contract.</p>
                    <p>Business Unit: ${lead.business_unit}</p>
                    <p>PandaDoc Document ID: ${documentId}</p>
                    <p>Lead is now ready for deposit collection.</p>
                    <p><a href="${leadDetailUrl}" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">View Lead Detail</a></p>
                  `,
                }),
              });
            }
          } catch (e) {
            logStep("Email notification failed", { error: String(e) });
          }

          logStep("Document completed processed for lead", { leadId: lead.id });
        } else {
          logStep("WARNING: No matching lead found for document", { documentId });
          await supabase.from("pandadoc_webhook_events")
            .update({ payload: { ...body, _warning: "No matching lead found for this document ID" } })
            .eq("document_id", documentId)
            .eq("event_type", eventType);
        }
      }
    }

    // Handle document.declined
    if (eventType === "document_declined" || eventType === "document.declined") {
      logStep("Document declined", { documentId });

      if (documentId) {
        const { data: lead } = await supabase
          .from("crm_leads")
          .select("id, lead_name, business_unit, assigned_employee_id")
          .eq("pandadoc_document_id", documentId)
          .maybeSingle();

        if (lead) {
          await supabase.from("crm_leads")
            .update({ pandadoc_status: "declined" })
            .eq("id", lead.id);

          await supabase.from("crm_activity_events").insert({
            event_type: "status_change" as any,
            entity_type: "lead",
            entity_id: lead.id,
            entity_name: lead.lead_name,
            event_category: "document_uploaded",
            metadata: {
              action: "contract_declined",
              pandadoc_document_id: documentId,
              description: `Contract declined via PandaDoc`,
            },
          });

          await supabase.from("crm_alerts").insert({
            alert_type: "follow_up_overdue",
            title: `Contract Declined — ${lead.lead_name}`,
            description: `${lead.lead_name} declined the contract — ${lead.business_unit}`,
            entity_type: "lead",
            entity_id: lead.id,
            severity: "warning",
            target_roles: ["owner", "manager"],
          });

          logStep("Document declined processed for lead", { leadId: lead.id });
        } else {
          logStep("WARNING: No matching lead found for declined document", { documentId });
        }
      }
    }

    // Mark as processed
    if (documentId) {
      await supabase.from("pandadoc_webhook_events")
        .update({ processed: true })
        .eq("document_id", documentId)
        .eq("event_type", eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    // Always return 200 to prevent PandaDoc retries on errors
    return new Response(JSON.stringify({ received: true, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
