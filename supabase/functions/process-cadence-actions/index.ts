import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    console.log("[CADENCE-PROCESSOR] Starting run...");

    // Get all pending scheduled actions
    const { data: pendingActions, error: fetchErr } = await supabase
      .from("cadence_scheduled_actions")
      .select("*, cadences(*)")
      .eq("fired", false)
      .lte("scheduled_at", new Date().toISOString())
      .limit(100);

    if (fetchErr) throw fetchErr;
    if (!pendingActions || pendingActions.length === 0) {
      console.log("[CADENCE-PROCESSOR] No pending actions");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    let processed = 0;

    for (const action of pendingActions) {
      const cadence = action.cadences;
      if (!cadence || !cadence.active) {
        // Mark as fired if cadence is inactive
        await supabase.from("cadence_scheduled_actions")
          .update({ fired: true, fired_at: new Date().toISOString() })
          .eq("id", action.id);
        continue;
      }

      const steps = Array.isArray(cadence.steps) ? cadence.steps : [];
      const currentStep = steps[action.step_index];
      if (!currentStep) {
        await supabase.from("cadence_scheduled_actions")
          .update({ fired: true, fired_at: new Date().toISOString() })
          .eq("id", action.id);
        continue;
      }

      // Execute the action
      const actionType = currentStep.action_type;

      if (actionType === "Send Alert to Team") {
        await supabase.from("crm_alerts").insert({
          alert_type: "cadence_followup",
          title: `Follow-Up: ${cadence.name} (Step ${action.step_index + 1})`,
          description: `Automated follow-up triggered for lead. Cadence: ${cadence.name}`,
          entity_type: "lead",
          entity_id: action.lead_id,
          severity: "warning",
          target_roles: ["owner", "manager", "sales_acquisitions"],
        });
      } else if (actionType === "Log as Follow-Up Reminder") {
        await supabase.from("crm_activity_events").insert({
          event_type: "note_added" as any,
          entity_type: "lead",
          entity_id: action.lead_id,
          event_category: "cadence_reminder",
          entity_name: cadence.name,
          metadata: { step_index: action.step_index, action_type: actionType, cadence_name: cadence.name },
        });
      } else if (actionType === "Fire GHL Workflow") {
        // Log that GHL workflow should fire (actual firing happens in GHL)
        await supabase.from("crm_activity_events").insert({
          event_type: "note_added" as any,
          entity_type: "lead",
          entity_id: action.lead_id,
          event_category: "cadence_ghl",
          entity_name: `GHL Workflow: ${currentStep.ghl_workflow_name || "unnamed"}`,
          metadata: { step_index: action.step_index, ghl_workflow: currentStep.ghl_workflow_name },
        });
      }

      // Mark as fired
      await supabase.from("cadence_scheduled_actions")
        .update({ fired: true, fired_at: new Date().toISOString() })
        .eq("id", action.id);

      // Schedule next step if exists
      const nextIndex = action.step_index + 1;
      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        const delayMs = (nextStep.delay_value || 1) * (nextStep.delay_unit === "days" ? 86400000 : 3600000);
        const scheduledAt = new Date(Date.now() + delayMs).toISOString();

        await supabase.from("cadence_scheduled_actions").insert({
          lead_id: action.lead_id,
          cadence_id: cadence.id,
          step_index: nextIndex,
          scheduled_at: scheduledAt,
        });
      }

      processed++;
    }

    console.log(`[CADENCE-PROCESSOR] Processed ${processed} actions`);
    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CADENCE-PROCESSOR] ERROR:", msg);

    try {
      await supabase.from("edge_function_errors").insert({
        function_name: "process-cadence-actions",
        error_message: msg,
        stack_trace: error instanceof Error ? error.stack : null,
        payload: {},
      });
    } catch (_) {}

    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
