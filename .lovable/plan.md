
Goal: Cancelled (and denied/no-show) appointments must stop blocking time slots everywhere. The “Booked” label in the public Lindsey calendar (and any other availability views) should immediately flip back to “Open” after cancellation, while still respecting hours, overrides, blackouts, and capacity.

What’s happening now (based on your screenshot + backend data)
- The Lindsey booking page is not using the shared availability engine; it uses `useLindseyAvailability`.
- That hook currently fetches bookings with a “NOT IN” filter that is unreliable in our client query style, and it only excludes `cancelled` / `no_show` (it does not exclude `denied`).
- In your example date (Jan 31, 2026), the backend has bookings at those times with statuses `cancelled` and `denied`, which should NOT block slots, but they are still being included in the “busy” list → UI shows “Booked”.

Implementation approach
A) Standardize which booking statuses “block” a timeslot
- Create one shared list of blocking statuses (an allowlist) and use it everywhere availability is computed.
- Blocking statuses should include the “active” pipeline states, and exclude anything that should free the slot:
  - Block: `pending`, `pending_payment`, `pending_documents`, `approved`, `confirmed`, `in_progress`, `reschedule_requested`, `rescheduled`
  - Do NOT block: `cancelled`, `denied`, `no_show`, `completed` (completed is historical)

B) Fix Lindsey public calendar (the screenshot issue)
Files:
- `src/hooks/useLindseyAvailability.ts`
Changes:
1) Replace the current `.not("status", "in", ...)` filter with an allowlist:
   - Use `.in("status", BLOCKING_BOOKING_STATUSES)` so cancelled/denied/no_show never come back in the bookings query.
2) Keep the rest of the logic intact (hours, blackout checks, slot-fit logic), so cancellation only removes the “busy” block.

Expected result:
- Those 10:30, 11:00, 1:00, 1:30, 2:00 slots that are only blocked by `cancelled`/`denied` records will become “Open” immediately after refetch.

C) Fix provider availability (prevents “phantom busy” for staff assignment)
Files:
- `src/hooks/useProviders.ts` (function `useAvailableProviders`)
Changes:
1) Replace `.not("status", "in", ...)` with the same allowlist `.in("status", BLOCKING_BOOKING_STATUSES)`
2) This ensures a cancelled/denied booking does not mark a provider as unavailable.

D) Harden the global availability engine (applies to Spa/360/Voice Vault/etc.)
Files:
- `supabase/functions/check-availability/index.ts`
Changes:
1) Update the booking status filter to use the same allowlist (currently it only blocks 4 statuses, and it should block additional active states like `pending_payment`, `approved`, `reschedule_requested`, etc.).
2) Improve the date overlap logic (recommended):
   - Right now it filters by `start_datetime` within the range only.
   - Safer: fetch any booking that overlaps the range:
     - `start_datetime <= range_end` AND `end_datetime >= range_start`
   - This prevents edge cases where a booking starts before the date boundary but overlaps into it.

E) Verification checklist (acceptance criteria)
1) Create a booking at 2:00 PM.
2) Cancel it (admin cancellation flow).
3) Without refreshing the page:
   - Lindsey public booking calendar shows 2:00 PM as Open again.
   - Admin Schedule removes the event (already supported by realtime invalidation).
4) Repeat the test on another business using the shared availability engine (e.g., Photo Booth / Voice Vault) to confirm:
   - Cancelled booking disappears from “busy” and the time slot reopens.
5) Confirm the slot still respects:
   - day-level overrides
   - blackouts
   - staff hours
   - buffer rules

Notes / edge cases we will handle
- “Denied” should not block time. We’ll ensure it’s excluded everywhere by using the allowlist.
- Multiple cancelled duplicates at the same time will no longer matter because they won’t be returned by the availability queries.
- This change does not relax business-hour rules; it only fixes which booking records are considered “busy”.

Files to change
- `src/hooks/useLindseyAvailability.ts`
- `src/hooks/useProviders.ts`
- `supabase/functions/check-availability/index.ts`

Out of scope (unless you want it next)
- Converting Lindsey availability to use the unified availability engine with resources/capacity per room (right now Lindsey is “single calendar”; it doesn’t model two rooms as parallel capacity). If you want “one room booked but the other still open,” that’s a follow-up enhancement.
