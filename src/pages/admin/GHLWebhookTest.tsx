import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, XCircle, AlertTriangle, Copy, RefreshCw } from "lucide-react";
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
    status?: string;
  };
}

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "showed", label: "Showed" },
  { value: "no_show", label: "No Show" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rescheduled", label: "Rescheduled" },
];

export default function GHLWebhookTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<TestResult | null>(null);
  const [testStatus, setTestStatus] = useState("showed");

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

  const sendStatusTestWebhook = async () => {
    setStatusLoading(true);
    setStatusResult(null);

    // Create a mock booking ID for testing
    const testBookingId = `TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Build test payload matching what spa-status-webhook would send
    const testPayload = {
      bookingId: testBookingId,
      status: testStatus,
      firstName: "Test",
      lastName: "StatusChange",
      phone: "5675559999",
      email: "status-test@example.com",
      serviceName: "Deep Tissue Massage",
      serviceDuration: 90,
      price: "$120.00",
      room: "P1",
      appointmentDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      appointmentTime: "3:30 PM",
      timezone: "America/New_York",
    };

    try {
      // We'll directly call the GHL webhook for testing status payloads
      const { data, error } = await supabase.functions.invoke("ghl-test-webhook", {
        method: "POST",
        body: { test_status: testStatus },
      });

      if (error) {
        setStatusResult({ success: false, error: error.message });
      } else {
        setStatusResult({ 
          ...data as TestResult, 
          payload_sent: { ...((data as TestResult).payload_sent || {}), status: testStatus } as TestResult["payload_sent"]
        });
      }
    } catch (err) {
      setStatusResult({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setStatusLoading(false);
    }
  };

  const copyPayload = (payload: TestResult["payload_sent"]) => {
    if (payload) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
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
                    <Button variant="ghost" size="sm" onClick={() => copyPayload(result.payload_sent)}>
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

        {/* Status Change Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Test Status Change Webhook
            </CardTitle>
            <CardDescription>
              Send a test status change payload. Use this to map status-based workflows in GHL 
              (showed, no_show, cancelled, rescheduled).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Test Status:</label>
              <Select value={testStatus} onValueChange={setTestStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={sendStatusTestWebhook} 
              disabled={statusLoading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {statusLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Status Test
                </>
              )}
            </Button>

            {statusResult && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusResult.success ? "default" : "destructive"}>
                    {statusResult.success ? "Success" : "Failed"}
                  </Badge>
                  {statusResult.response_status && (
                    <Badge variant="secondary">HTTP {statusResult.response_status}</Badge>
                  )}
                </div>
                {statusResult.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{statusResult.error}</AlertDescription>
                  </Alert>
                )}
                {statusResult.payload_sent && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Status Payload:</h4>
                      <Button variant="ghost" size="sm" onClick={() => copyPayload(statusResult.payload_sent)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(statusResult.payload_sent, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Payload Fields</CardTitle>
            <CardDescription>
              These are the fields sent to GHL for bookings and status changes.
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
                ["bookingId", "string", "AZ260115123456"],
                ["status", "string", "confirmed | showed | no_show | cancelled | rescheduled"],
                ["firstName", "string", "Jane"],
                ["lastName", "string", "Smith"],
                ["phone", "string", "5675551234"],
                ["email", "string", "jane@example.com"],
                ["serviceName", "string", "Swedish Massage"],
                ["serviceDuration", "number", "60"],
                ["price", "string", "$80.00"],
                ["room", "string", "M1 or P1"],
                ["appointmentDate", "string", "01/15/2026"],
                ["appointmentTime", "string", "2:00 PM"],
                ["timezone", "string", "America/New_York"],
              ].map(([field, type, example]) => (
                <div key={field} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                  <code className="text-primary">{field}</code>
                  <span className="text-muted-foreground">{type}</span>
                  <span className="text-muted-foreground text-xs">{example}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              <strong>Note:</strong> The <code>status</code> field is only included for status change webhooks. 
              New booking webhooks do not include status (they default to confirmed).
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
