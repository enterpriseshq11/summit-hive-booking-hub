
# Fix Plan: Spa Confirmation Emails + Approvals Tab

## Problem Summary

### Bug 1: No confirmation emails for pay-on-arrival Spa bookings
When the admin toggles Spa payments OFF, customers complete bookings but receive no confirmation email. The booking is created correctly, but the notification fails silently.

**Root cause**: The `lindsey-booking-notification` edge function only handles two types: `confirmed` and `free_consultation`. When `lindsey-checkout` calls it with `type: "pay_on_arrival"`, the function returns early with "No action for this type" and no email is sent.

### Bug 2: Restoration approvals missing from Approvals tab
Spa bookings no longer appear in Admin > Approvals when payments are OFF.

**Root cause**: When payments are disabled, `lindsey-checkout` sets `status: "confirmed"` immediately, bypassing the approval queue. The Approvals tab only queries for `status = 'pending'`.

---

## Solution

### Part 1: Add pay-on-arrival email template to lindsey-booking-notification

Add a new handler block in `supabase/functions/lindsey-booking-notification/index.ts` for `type === "pay_on_arrival"` that:

1. Sends customer a confirmation email with:
   - Service name, date, time, duration, room
   - "Amount due on arrival: $X"
   - No deposit wording
   - Location and cancellation policy

2. Sends Lindsey/staff an email with:
   - Customer details
   - "PAY ON ARRIVAL" badge
   - Full booking details

3. Sends SMS to Lindsey (if Twilio configured)

4. Updates idempotency markers on the booking record

### Part 2: Determine business rule for Spa approvals

There are two possible approaches for how Spa bookings should work with payments OFF:

**Option A (Recommended): Keep current behavior - auto-confirm**
- When payments are OFF, Spa bookings are immediately confirmed (no approval needed)
- This makes sense because the customer is committing to show up and pay on arrival
- The Approvals tab correctly shows no pending Spa items because they are already confirmed
- The "Confirmed" tab will show these bookings

**Option B: Require approval even with payments OFF**
- Change `lindsey-checkout` to set `status: "pending"` instead of `status: "confirmed"`
- Spa bookings would then require manual admin approval
- After approval, send the "pay on arrival" confirmation email

Based on typical business operations, **Option A is recommended** because:
- Reduces admin overhead
- Customers expect immediate confirmation when booking
- Pay-on-arrival is a trust-based model anyway
- The Confirmed tab already shows these for visibility

If you prefer Option B (require approval), let me know and I will adjust the plan.

---

## Technical Changes

### File 1: `supabase/functions/lindsey-booking-notification/index.ts`

Add a new section after the `free_consultation` handler (around line 675) to handle `pay_on_arrival`:

```text
// ============= PAY ON ARRIVAL BOOKING =============
if (type === "pay_on_arrival") {
  logStep("Processing pay-on-arrival notification");

  // Build email content with "Amount due on arrival" messaging
  // Similar structure to "confirmed" but:
  // - Badge shows "PAY ON ARRIVAL" instead of "PAID"
  // - No deposit/payment section
  // - Clear "Amount due on arrival: $X" callout
  
  // Send:
  // 1. SMS to Lindsey
  // 2. Email to Lindsey
  // 3. Email to customer
  
  // Update idempotency markers
}
```

The email templates will:
- **Customer email**: Confirm appointment, show service details, state "Amount due on arrival: $X", include location and arrival instructions
- **Staff email**: Show booking details with "PAY ON ARRIVAL" badge, customer contact info, admin dashboard link

### File 2: No changes needed for Approvals (Option A)

The Approvals tab is working correctly. Spa bookings with payments OFF are auto-confirmed and appear in the "Confirmed" tab. The "Restoration" filter on the Confirmed tab will show these bookings.

---

## Testing Checklist

After implementation:

1. Toggle Spa payments OFF in Admin > Payment Settings
2. Book a Spa appointment on the Lindsey page
3. Verify customer receives confirmation email with "Amount due on arrival"
4. Verify Lindsey receives staff notification (email + SMS if configured)
5. Check notification_logs table for successful send status
6. Verify the booking appears in Admin > Schedule
7. Verify the booking appears in Admin > Approvals > Confirmed tab > Restoration filter
8. Toggle Spa payments ON and book another appointment
9. Verify the paid flow still works (deposit collected, confirmation email sent)

---

## Files to be Modified

1. `supabase/functions/lindsey-booking-notification/index.ts` - Add pay_on_arrival handler with email/SMS templates
