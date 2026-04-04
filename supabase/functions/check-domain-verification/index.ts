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

    // Log all domains for debugging
    const allDomainNames = Array.isArray(domains) ? domains.map((d: any) => ({ name: d.name, status: d.status, id: d.id })) : [];
    console.log("All domains in account:", JSON.stringify(allDomainNames));

    // Find our domain - try both with and without hyphen
    const found = Array.isArray(domains)
      ? domains.find((d: any) => d.name === targetDomain || d.name === targetDomain.replace("a-z", "az"))
      : null;

    if (!found) {
      return new Response(
        JSON.stringify({
          verified: false,
          pending: false,
          message: `Domain "${targetDomain}" not found in this Resend account. Domains in this account: ${allDomainNames.map((d: any) => d.name).join(", ") || "none"}`,
          available_domains: allDomainNames,
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
