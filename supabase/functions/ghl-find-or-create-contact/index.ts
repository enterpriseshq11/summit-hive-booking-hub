import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";

// GHL custom field key for "Business Unit" dropdown
const GHL_BUSINESS_UNIT_FIELD_KEY = "business_interest";

// Map A-Z Command internal business_unit slugs → GHL dropdown option values
const BUSINESS_UNIT_TO_GHL: Record<string, string> = {
  summit: "The Summit Event Center",
  hive: "The Hive Coworking",
  coworking: "The Hive Coworking",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  photo_booth: "360 Photo Booth",
  voice_vault: "Voice Vault",
  elevated_by_elyse: "Elevated by Elyse",
};

const mapBusinessUnit = (bu?: string | null): string | null => {
  if (!bu) return null;
  const key = String(bu).toLowerCase().trim();
  return BUSINESS_UNIT_TO_GHL[key] || null;
};

const log = (step: string, details?: any) =>
  console.log(`[GHL-FIND-CREATE] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ghlApiKey = Deno.env.get("GHL_API_KEY") ?? "";
  const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") ?? "";

  if (!ghlApiKey || !ghlLocationId) {
    log("Missing GHL_API_KEY or GHL_LOCATION_ID");
    return new Response(
      JSON.stringify({ success: false, error: "GHL credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    const body = await req.json();
    const { leadId, email, firstName, lastName, phone, businessUnit } = body;

    if (!leadId || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "leadId and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 1: Search for existing contact by email
    log("Searching GHL for contact", { email });

    const searchRes = await fetch(`${GHL_API_BASE}/contacts/search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ghlApiKey}`,
        "Version": "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId: ghlLocationId,
        filters: [
          {
            field: "email",
            operator: "eq",
            value: email,
          },
        ],
      }),
    });

    let ghlContactId: string | null = null;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const contacts = searchData?.contacts || [];
      if (contacts.length > 0) {
        ghlContactId = contacts[0].id;
        log("Found existing GHL contact", { ghlContactId, email });
      }
    } else {
      const errText = await searchRes.text();
      log("GHL search failed, will try to create", { status: searchRes.status, error: errText });
    }

    const ghlBusinessUnitValue = mapBusinessUnit(businessUnit);
    if (businessUnit && !ghlBusinessUnitValue) {
      log("WARN: business_unit not mapped to GHL value", { businessUnit });
    }

    const customFieldsPayload = ghlBusinessUnitValue
      ? [{ key: GHL_BUSINESS_UNIT_FIELD_KEY, field_value: ghlBusinessUnitValue }]
      : [];

    // Step 2: If not found, create a new contact (with Business Unit custom field)
    if (!ghlContactId) {
      log("Creating new GHL contact", { email, firstName, lastName, ghlBusinessUnitValue });

      const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ghlApiKey}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: ghlLocationId,
          firstName: firstName || "",
          lastName: lastName || "",
          email: email,
          phone: phone || "",
          source: "A-Z Command",
          tags: [businessUnit || "general"],
          customFields: customFieldsPayload,
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        ghlContactId = createData?.contact?.id || null;
        log("Created GHL contact", { ghlContactId });
      } else {
        const errText = await createRes.text();
        log("GHL create failed", { status: createRes.status, error: errText });

        // If 422 duplicate, try to extract contact ID from error
        if (createRes.status === 422) {
          try {
            const errJson = JSON.parse(errText);
            // GHL sometimes returns the existing contact ID on duplicate
            ghlContactId = errJson?.contact?.id || errJson?.contactId || null;
            if (ghlContactId) {
              log("Extracted contact ID from duplicate error", { ghlContactId });
            }
          } catch (_) { /* ignore parse error */ }
        }

        if (!ghlContactId) {
          return new Response(
            JSON.stringify({ success: false, error: `GHL contact creation failed: ${errText}` }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Step 3: Save ghl_contact_id back to crm_leads
    const { error: updateError } = await supabase
      .from("crm_leads")
      .update({ ghl_contact_id: ghlContactId })
      .eq("id", leadId);

    if (updateError) {
      log("Failed to save ghl_contact_id to lead", { leadId, error: updateError.message });
      return new Response(
        JSON.stringify({ success: false, error: "Contact found/created but failed to save ID", ghl_contact_id: ghlContactId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 4: Log activity
    await supabase.from("crm_activity_events").insert({
      event_type: "lead_updated" as any,
      entity_type: "lead",
      entity_id: leadId,
      event_category: "ghl_contact_linked",
      metadata: {
        action: "ghl_contact_linked",
        description: `GHL contact linked — ID: ${ghlContactId}`,
        ghl_contact_id: ghlContactId,
        method: ghlContactId ? "search" : "create",
      },
    });

    log("Successfully linked GHL contact", { leadId, ghlContactId });

    return new Response(
      JSON.stringify({ success: true, ghl_contact_id: ghlContactId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });

    try {
      await supabase.from("edge_function_errors").insert({
        function_name: "ghl-find-or-create-contact",
        error_message: msg,
        stack_trace: error instanceof Error ? error.stack : null,
      });
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});