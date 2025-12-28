import { supabase } from "@/integrations/supabase/client";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  stack?: string;
}

// Log error to console and optionally to audit log
export async function logError(error: AppError, logToAudit = false) {
  console.error(`[${error.severity.toUpperCase()}] ${error.message}`, {
    code: error.code,
    context: error.context,
    stack: error.stack,
  });

  if (logToAudit) {
    try {
      await supabase.from("audit_log").insert({
        entity_type: "error",
        action_type: `error_${error.severity}`,
        after_json: {
          message: error.message,
          code: error.code,
          context: error.context,
          timestamp: new Date().toISOString(),
        } as any,
      });
    } catch (e) {
      console.error("Failed to log error to audit:", e);
    }
  }
}

// Payment error handler
export function handlePaymentError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "Unknown payment error";
  
  logError({
    message: `Payment Error: ${message}`,
    code: "PAYMENT_ERROR",
    severity: "high",
    context,
    stack: error instanceof Error ? error.stack : undefined,
  }, true);
}

// Booking error handler
export function handleBookingError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "Unknown booking error";
  
  logError({
    message: `Booking Error: ${message}`,
    code: "BOOKING_ERROR",
    severity: "medium",
    context,
    stack: error instanceof Error ? error.stack : undefined,
  }, true);
}

// Stripe webhook error handler
export function handleWebhookError(error: unknown, eventType: string) {
  const message = error instanceof Error ? error.message : "Unknown webhook error";
  
  logError({
    message: `Webhook Error (${eventType}): ${message}`,
    code: "WEBHOOK_ERROR",
    severity: "critical",
    context: { eventType },
    stack: error instanceof Error ? error.stack : undefined,
  }, true);
}

// Authentication error handler
export function handleAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown auth error";
  
  logError({
    message: `Auth Error: ${message}`,
    code: "AUTH_ERROR",
    severity: "high",
    stack: error instanceof Error ? error.stack : undefined,
  }, false); // Don't log auth errors to audit by default
}
