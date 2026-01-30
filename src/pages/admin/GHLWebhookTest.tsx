import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, XCircle, AlertTriangle, Copy } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  success: boolean;
  configured?: boolean;
  valid_url?: boolean;
  error?: string;
  response_status?: number;
  response_body?: string;
  payload_sent?: {
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
  };
}

export default function GHLWebhookTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const sendTestWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ghl-test-webhook", {
        method: "POST",
      });

      if (error) {
        setResult({ success: false, error: error.message });
      } else {
        setResult(data as TestResult);
      }
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    if (result?.payload_sent) {
      navigator.clipboard.writeText(JSON.stringify(result.payload_sent, null, 2));
      toast.success("Payload copied to clipboard");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">GoHighLevel Webhook Test</h1>
          <p className="text-muted-foreground mt-1">
            Send a test webhook to verify your GHL integration is working correctly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Webhook
            </CardTitle>
            <CardDescription>
              This will send a sample booking payload to your configured GHL webhook URL.
              Use this to map fields in GoHighLevel before going live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Before Testing</AlertTitle>
              <AlertDescription>
                Make sure you have set the <code className="bg-muted px-1 rounded">GHL_LINDSEY_WEBHOOK_URL</code> secret 
                in your project settings with your actual GoHighLevel webhook URL.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={sendTestWebhook} 
              disabled={loading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Webhook
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                Test Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
                {result.configured !== undefined && (
                  <Badge variant={result.configured ? "outline" : "destructive"}>
                    {result.configured ? "Secret Configured" : "Secret Not Set"}
                  </Badge>
                )}
                {result.valid_url !== undefined && (
                  <Badge variant={result.valid_url ? "outline" : "destructive"}>
                    {result.valid_url ? "Valid URL" : "Invalid URL Format"}
                  </Badge>
                )}
                {result.response_status && (
                  <Badge variant="secondary">
                    HTTP {result.response_status}
                  </Badge>
                )}
              </div>

              {result.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="font-mono text-sm">
                    {result.error}
                  </AlertDescription>
                </Alert>
              )}

              {result.response_body && (
                <div>
                  <h4 className="font-medium mb-2">GHL Response:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-32">
                    {result.response_body}
                  </pre>
                </div>
              )}

              {result.payload_sent && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Payload Sent:</h4>
                    <Button variant="ghost" size="sm" onClick={copyPayload}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.payload_sent, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Expected Payload Fields</CardTitle>
            <CardDescription>
              These are the fields that will be sent to GHL on every successful Lindsey booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <span className="font-medium">Field</span>
                <span className="font-medium">Type</span>
                <span className="font-medium">Example</span>
              </div>
              {[
                ["firstName", "string", "Jane"],
                ["lastName", "string", "Smith"],
                ["phone", "string", "5675551234"],
                ["email", "string", "jane@example.com"],
                ["serviceName", "string", "Swedish Massage"],
                ["serviceDuration", "number", "60"],
                ["price", "string", "$80.00"],
                ["room", "string", "M1"],
                ["appointmentDate", "string", "01/15/2026"],
                ["appointmentTime", "string", "2:00 PM"],
                ["timezone", "string", "America/New_York"],
                ["bookingId", "string", "AZ260115123456"],
              ].map(([field, type, example]) => (
                <div key={field} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                  <code className="text-primary">{field}</code>
                  <span className="text-muted-foreground">{type}</span>
                  <span className="text-muted-foreground">{example}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
