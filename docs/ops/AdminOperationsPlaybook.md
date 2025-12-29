# Admin Operations Playbook

> Last updated: 2024-12-29  
> Status: PRODUCTION READY

This document defines how to operate the A-Z Booking Hub system on a daily basis.

---

## Daily Admin Checklist

### Morning (Start of Business)

| Task | Where | What to Look For |
|------|-------|------------------|
| Check today's bookings | Admin → Schedule | Confirmed bookings for the day |
| Review pending approvals | Admin → Approvals | Event requests awaiting review |
| Check failed payments | Admin → Dashboard (alerts) | Any payment failures overnight |
| Review waitlist activity | Admin → Leads/Waitlists | New waitlist entries |

### Throughout the Day

| Task | Where | Frequency |
|------|-------|-----------|
| Process new event requests | Admin → Approvals | As they arrive |
| Respond to lease inquiries | Admin → Leads/Waitlists | Within 24 hours |
| Monitor upcoming balances | Admin → Dashboard | Check for due dates |

### End of Day

| Task | Where | What to Verify |
|------|-------|----------------|
| Confirm tomorrow's schedule | Admin → Schedule | No conflicts, resources assigned |
| Check for unresolved alerts | Admin → Dashboard | Clear any pending items |

---

## Processing Event Requests (Summit)

### When a new event request arrives:

1. **Review in Approvals queue**
   - Check: Event type, date, guest count, contact info
   - Verify: Availability for requested date

2. **Decision options:**
   - **Approve** → Booking moves to `confirmed`, customer notified
   - **Request changes** → Contact customer for adjustments
   - **Decline** → Booking moves to `cancelled`, customer notified

3. **Post-approval:**
   - Deposit invoice generated automatically
   - Balance due date set (typically 14 days before event)
   - Customer receives confirmation email

### Timeline expectations:
- Response within 24 hours (trust promise)
- Proposal delivery within 48 hours for complex events

---

## Processing Waitlist Entries

### When a waitlist entry is created:

1. **Review in Leads/Waitlists**
   - Check: Preferred date, time window, contact info
   - Note: VIP flag (if applicable)

2. **When availability opens:**
   - Contact customer (email/phone based on preferences)
   - Set claim expiration (typically 24-48 hours)
   - If claimed → convert to booking
   - If expired → move to next waitlist entry

3. **Priority order:**
   - VIP members first
   - Then by position (first-in, first-out)

---

## Handling Failed Payments

### When a payment fails:

1. **Check Admin → Dashboard alerts**
   - Identify: Booking number, customer, amount

2. **Automated actions (already triggered):**
   - Payment reminder email sent
   - Balance marked as overdue

3. **Manual follow-up:**
   - Contact customer within 24 hours
   - Offer alternative payment method
   - If unresolved after 7 days → escalate to manager

4. **Resolution options:**
   - Retry payment (customer updates card)
   - Apply gift card / wallet credit
   - Cancel booking (last resort)

---

## What "Normal" Looks Like

| Metric | Normal Range | Concern Threshold |
|--------|--------------|-------------------|
| Daily bookings | 5-15 | <3 or >25 |
| Pending approvals | 0-5 | >10 unreviewed |
| Failed payments | 0-1 per week | >3 in one day |
| Waitlist entries | 2-8 per day | 0 (no demand) or >20 (capacity issue) |
| Average approval time | <24 hours | >48 hours |

---

## What "Problem" Looks Like

### Capacity Issues
- **Signal:** Waitlist entries spike, "fully booked" on multiple days
- **Action:** Review resource capacity, consider extending hours

### Payment Processing Issues
- **Signal:** Multiple failed payments in short period
- **Action:** Check Stripe dashboard for patterns, contact Stripe support if systemic

### Scheduling Conflicts
- **Signal:** Double-booking alerts, overlapping resources
- **Action:** Review booking_resources table, check buffer settings

### Lead Quality Issues
- **Signal:** High decline rate on event requests
- **Action:** Review intake form, consider pre-qualification questions

---

## Responding to Specific Scenarios

### Scenario: Fully Booked for Popular Date

1. Enable waitlist for that date
2. Check if any pending bookings can be rescheduled
3. If recurring issue → consider premium/surge pricing (future phase)

### Scenario: Customer Wants to Cancel

1. Review cancellation policy (per bookable type)
2. Process refund according to policy:
   - Full refund if outside policy window
   - Partial refund if within policy window
   - No refund if no-show
3. Update booking status to `cancelled`
4. Log reason in audit trail

### Scenario: Duplicate Requests

1. Identify duplicates in Leads/Waitlists
2. Merge into single lead (keep earliest)
3. Contact customer to confirm intent
4. Archive duplicates (do not delete for audit)

### Scenario: Payment Reminder Due

1. Check payment_schedules for upcoming due dates
2. System sends automated reminder 3 days before
3. Manual follow-up if payment not received by due date

---

## Escalation Path

| Issue Type | First Response | Escalate To | Timeframe |
|------------|----------------|-------------|-----------|
| Booking conflict | Staff | Manager | Immediate |
| Payment failure | Automated email | Staff call | 24 hours |
| Customer complaint | Staff | Manager | Same day |
| System error | Check logs | Technical support | Immediate |
| Security concern | Stop action | Owner + Technical | Immediate |

---

## Key Locations Reference

| Task | Admin Route |
|------|-------------|
| View today's schedule | `/admin/schedule` |
| Process approvals | `/admin/approvals` |
| Manage leads/waitlists | `/admin/leads-waitlists` |
| View audit log | `/admin/audit-log` |
| Manage resources | `/admin/resources` |
| Configure pricing rules | `/admin/pricing-rules` |
| Manage blackout dates | `/admin/blackouts` |

---

## Emergency Procedures

### System Outage
1. Check Supabase status
2. Check Stripe status
3. Contact technical support
4. Communicate to customers via alternate channel

### Data Breach Suspicion
1. Do not attempt to fix
2. Document what was observed
3. Contact owner immediately
4. Preserve all logs

### Stripe Live Mode Issues
1. Check webhook logs in Stripe dashboard
2. Verify Edge Function logs in Supabase
3. If payment stuck, do NOT retry manually without verification
