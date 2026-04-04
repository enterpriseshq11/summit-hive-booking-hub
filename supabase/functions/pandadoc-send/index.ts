import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PANDADOC-SEND] ${step}${d}`);
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
    const apiKey = Deno.env.get("PANDADOC_API_KEY");
    if (!apiKey) throw new Error("PANDADOC_API_KEY not set");

    const body = await req.json();
    const { action } = body;

    // List templates
    if (action === "list_templates") {
      logStep("Listing templates");
      const res = await fetch("https://api.pandadoc.com/public/v1/templates", {
        headers: { "Authorization": `API-Key ${apiKey}` },
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`PandaDoc API error: ${err}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create and send document
    if (action === "send_document") {
      const { template_id, recipient_name, recipient_email, message, lead_id } = body;
      logStep("Creating document", { template_id, recipient_email, lead_id });

      // Create document from template
      const createRes = await fetch("https://api.pandadoc.com/public/v1/documents", {
        method: "POST",
        headers: {
          "Authorization": `API-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Contract for ${recipient_name}`,
          template_uuid: template_id,
          recipients: [{
            email: recipient_email,
            first_name: recipient_name.split(" ")[0] || recipient_name,
            last_name: recipient_name.split(" ").slice(1).join(" ") || "",
            role: "Client",
          }],
          message_to_recipient: message || "Please review and sign the attached contract at your earliest convenience.",
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`PandaDoc document creation failed: ${err}`);
      }

      const doc = await createRes.json();
      const documentId = doc.id;
      logStep("Document created", { documentId });

      // Wait for document to be ready then send
      // PandaDoc needs a moment to process the document before sending
      await new Promise(resolve => setTimeout(resolve, 3000));

      const sendRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}/send`, {
        method: "POST",
        headers: {
          "Authorization": `API-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message || "Please review and sign the attached contract at your earliest convenience.",
          subject: `Contract from A-Z Enterprises`,
        }),
      });

      if (!sendRes.ok) {
        const err = await sendRes.text();
        logStep("Document send failed, may still be processing", { error: err });
        // Document was created even if send fails - return the ID
      }

      // Update lead record
      if (lead_id) {
        await supabase.from("crm_leads").update({
          pandadoc_document_id: documentId,
          pandadoc_status: "sent",
        }).eq("id", lead_id);

        // Log to activity
        const { data: lead } = await supabase
          .from("crm_leads")
          .select("lead_name, status")
          .eq("id", lead_id)
          .single();

        await supabase.from("crm_activity_events").insert({
          event_type: "status_change" as any,
          entity_type: "lead",
          entity_id: lead_id,
          entity_name: lead?.lead_name || "Unknown",
          event_category: "document_uploaded",
          metadata: {
            action: "contract_sent",
            pandadoc_document_id: documentId,
            recipient_email,
            description: `Contract sent via PandaDoc to ${recipient_email} — Document ID: ${documentId}`,
          },
        });

        // Move to contract_out if not already past that stage
        const preContractStages = ["new", "contact_attempted", "responded", "warm_lead", "hot_lead", "proposal_sent"];
        if (lead && preContractStages.includes(lead.status)) {
          await supabase.from("crm_leads")
            .update({ status: "contract_out" })
            .eq("id", lead_id);
        }

        // Fire GHL webhook
        try {
          const ghlUrl = await supabase
            .from("admin_settings")
            .select("value")
            .eq("key", "ghl_webhook_url")
            .maybeSingle();

          if (ghlUrl?.data?.value) {
            await fetch(ghlUrl.data.value, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lead_id,
                lead_name: lead?.lead_name,
                new_stage_key: "contract_out",
                new_stage_name: "Contract Out",
                trigger: "pandadoc_contract_sent",
                timestamp: new Date().toISOString(),
              }),
            });
          }
        } catch (e) {
          logStep("GHL webhook failed", { error: String(e) });
        }
      }

      return new Response(JSON.stringify({ document_id: documentId, status: "sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resend document reminder
    if (action === "resend_reminder") {
      const { document_id } = body;
      logStep("Resending reminder", { document_id });

      const res = await fetch(`https://api.pandadoc.com/public/v1/documents/${document_id}/send`, {
        method: "POST",
        headers: {
          "Authorization": `API-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Friendly reminder: please review and sign the attached contract at your earliest convenience.",
          subject: "Reminder: Contract from A-Z Enterprises",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`PandaDoc resend failed: ${err}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
