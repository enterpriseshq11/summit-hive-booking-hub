const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    const targetDomain = domain || "a-zenterpriseshq.com";

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ verified: false, pending: false, message: "RESEND_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List all domains from Resend
    const domainsRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });

    if (!domainsRes.ok) {
      const errText = await domainsRes.text();
      console.error("Resend domains API error:", domainsRes.status, errText);
      return new Response(
        JSON.stringify({ verified: false, pending: false, message: `Resend API error: ${domainsRes.status}`, details: errText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domainsData = await domainsRes.json();
    const domains = domainsData.data || domainsData || [];

    // Find our domain
    const found = Array.isArray(domains)
      ? domains.find((d: any) => d.name === targetDomain)
      : null;

    if (!found) {
      return new Response(
        JSON.stringify({
          verified: false,
          pending: false,
          message: `Domain "${targetDomain}" not found in this Resend account. Make sure the API key belongs to the account where the domain was verified.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const status = found.status || "unknown";
    const isVerified = status === "verified" || status === "active";
    const isPending = status === "pending" || status === "not_started";

    // Get DNS records if not verified
    let dnsDetails = "";
    if (!isVerified && found.records) {
      dnsDetails = found.records
        .filter((r: any) => r.status !== "verified")
        .map((r: any) => `${r.type} ${r.name} → ${r.value} (${r.status})`)
        .join("\n");
    }

    return new Response(
      JSON.stringify({
        verified: isVerified,
        pending: isPending,
        status,
        message: isVerified
          ? `Domain "${targetDomain}" is verified and ready to send emails.`
          : `Domain "${targetDomain}" status: ${status}`,
        details: dnsDetails || undefined,
        region: found.region || undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-domain-verification error:", err);
    return new Response(
      JSON.stringify({ verified: false, pending: false, message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
