# E³ Launch Validation Script

This checklist covers the full end-to-end pipeline. Run all steps after any significant change.

## Prerequisites
- Admin account with `owner` role
- At least 2 coordinator accounts (one with `referred_by` set)
- At least 1 venue with halls and time blocks configured
- Document templates uploaded and active

---

## 1. Booking Creation + Conflict Check
- [ ] Log in as coordinator
- [ ] Create a booking (red hold) with 1+ halls
- [ ] Verify red hold timer appears
- [ ] Try to create overlapping booking on same hall/date/time block → expect conflict error
- [ ] Verify audit log entry created

## 2. Red Hold Limit
- [ ] Create bookings up to max_active_red_holds (default 2)
- [ ] Attempt 3rd → expect "Hold limit reached" error
- [ ] Verify coordinator-level `max_holds_override` works if set

## 3. Document Upload + Yellow Transition
- [ ] Upload all required documents (contract, cleaning, building_rules, damage_policy, cancellation_policy)
- [ ] If has_alcohol = true, also upload alcohol_policy
- [ ] Click "Submit Contract Package" → verify transition to yellow_contract
- [ ] Verify deposit deadline is set
- [ ] Verify coordinator can no longer edit halls/time block

## 4. Missed Deposit → Revert
- [ ] Wait for deposit deadline to pass (or run automations manually)
- [ ] Verify booking reverts to red_hold with new 24h timer
- [ ] Verify audit log entry for auto_reverted_deposit_missed

## 5. Deposit Approval → Green
- [ ] As admin, approve deposit on yellow_contract booking
- [ ] Verify booking transitions to green_booked
- [ ] Verify financial_snapshot_json is populated
- [ ] Verify commission_snapshot_percent is set
- [ ] Verify coordinator cannot edit any fields after green

## 6. Complete + Paid → Commission Auto-Created
- [ ] As admin, mark booking as completed (booking_state = completed)
- [ ] Update payment_status to paid_in_full
- [ ] Verify e3_commissions record created with status = pending
- [ ] Verify commission_amount matches snapshot (not live calculation)
- [ ] Verify notification outbox row created (commission_created)

## 7. Referral Overrides
- [ ] Verify Level 1 override created (5% of commission) for referred_by coordinator
- [ ] If Level 2 referrer exists, verify Level 2 override (2%)
- [ ] Verify overrides have status = pending

## 8. Approve + Pay Commission
- [ ] As admin, approve commission → status = approved
- [ ] Verify override cannot be approved until base commission is approved ✓
- [ ] Approve override → status = approved
- [ ] Mark commission paid → status = paid, paid_at set
- [ ] Verify overrides auto-marked paid
- [ ] Verify audit log entries for all actions

## 9. Export Reports → Verify Numbers
- [ ] Go to /e3/admin/reports
- [ ] Export Payout Report → verify commission amounts match dashboard
- [ ] Export Monthly Performance → verify coordinator totals
- [ ] Export Booking Ledger → verify financial snapshot data

## 10. System Health
- [ ] Go to /e3/admin/health
- [ ] Verify all health checks show current counts
- [ ] Run automations → verify expired/reverted counts
- [ ] Verify no bookings with missing docs in yellow/green

## 11. Coordinator Management
- [ ] Go to /e3/admin/coordinators
- [ ] Suspend a coordinator → verify they cannot create new bookings
- [ ] Verify suspended coordinator can still view existing bookings
- [ ] Reactivate → verify they can create bookings again
- [ ] Set referred_by → verify audit log entry

## 12. Calendar
- [ ] Verify hall-level entries display correctly
- [ ] Filter by hall → only that hall's bookings show
- [ ] Filter by state → only matching states show
- [ ] Double-click a day → routes to submit form
- [ ] Click a booking chip → navigates to booking details

---

## Pass Criteria
All boxes checked = ready for production.
Any failure = fix and re-run from that step.
