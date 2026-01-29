
Goal
- After a worker sets hours + adds at least 1 service (with price/description/duration) and finishes onboarding, they should:
  - Stop being prompted again (wizard only on first login until complete)
  - Immediately appear in the “Book Massage” dropdown under Lindsey
  - Have a working public page at /book-with/:slug

What’s actually broken right now (confirmed)
1) Worker isn’t appearing in the dropdown because they are not being marked onboarding_complete=true.
- In the database, the current active worker “Dillon bowling” has:
  - is_active = true
  - slug = dillon-bowling-6 (already set)
  - availability exists (6 days)
  - services exist (2 services)
  - onboarding_complete = false  ← this is why dropdown stays “Lindsey only”
2) The onboarding wizard keeps prompting because ProviderSchedule opens the wizard whenever needsOnboarding is true.
- needsOnboarding is currently defined as: currentWorker && !currentWorker.onboarding_complete
- Since onboarding_complete never flips to true, it keeps popping up.
3) The UI currently tries to update spa_workers from the worker account during “Save & Go Live”, but RLS does not allow workers to update spa_workers.
- spa_workers policies allow updates only for owner/manager/spa_lead.
- Workers can SELECT their own row, but cannot UPDATE it.
- So the “complete onboarding” update is blocked silently/with error, leaving onboarding_complete false.

Security issue we should fix while touching this (important)
- There is currently a public SELECT policy on spa_workers: “Public can view active workers for booking” using (is_active=true).
- spa_workers contains sensitive columns (email, phone, invite_token, etc).
- With row-level security, if public can read a row, public can read every column in that row. This is not acceptable for a public site.
- We must remove public read access from spa_workers and serve public-safe worker data another way.

Implementation Plan

A) Fix onboarding completion so it works for workers (and stops repeated prompts)
1) Add a backend function (server-side) “spa-worker-complete-onboarding”
   - Runs with elevated privileges (service role) so it can update spa_workers safely.
   - Uses the authenticated user from the request token (req Authorization header) to find their spa_workers row by user_id.
   - Validates:
     - Worker is active, not deleted, and linked to this user.
     - Worker has at least 1 active availability window.
     - Worker has at least 1 active service.
   - Generates slug if missing, with collision handling:
     - Start from display_name slugified
     - If slug already exists, append -2, -3, etc
   - Updates spa_workers:
     - onboarding_complete = true
     - slug = computed slug (if null)
     - title default if missing (optional)
   - Returns: { success: true, worker_id, slug }

2) Update the client hook useSpaWorkerAvailability()
   - Replace the direct supabase.from("spa_workers").update(...) call with an invoke to “spa-worker-complete-onboarding”.
   - Fix react-query invalidations:
     - current worker query key currently is ["current-spa-worker", user?.id] but invalidation uses ["current-spa-worker"] (mismatch).
     - Update invalidations to match exact keys:
       - ["current-spa-worker", user?.id]
       - ["spa_workers", "active", "bookable"] (this is TherapistDropdown’s hook key)
   - This ensures:
     - needsOnboarding becomes false immediately after completion
     - wizard stops appearing after the first successful completion
     - dropdown refetches and shows the worker

3) (Optional but recommended) Improve onboarding wizard state persistence
   - If the user closes/reopens the wizard before finishing:
     - Initialize the schedule UI from existing saved availability instead of DEFAULT_SCHEDULE.
     - This prevents confusion and reduces repeated steps.
   - Also adjust the “Back” behavior on Services step to go to Schedule (not Welcome), since that’s more intuitive.

4) One-time data correction for current workers stuck in “complete but not complete”
   - Add a migration to mark onboarding_complete=true for any worker who:
     - is_active = true
     - deleted_at is null
     - user_id is not null (real worker account)
     - has >= 1 active availability row
     - has >= 1 active service row
   - This instantly fixes workers like Dillon without requiring them to re-run the wizard.

B) Make public dropdown + public worker pages safe (no PII exposure)
Because public SELECT on spa_workers is currently exposing sensitive columns, we will:

1) Create a new public-safe table: spa_workers_public
   - Columns only:
     - worker_id (uuid, PK / unique)
     - display_name
     - slug
     - title
     - is_active
     - onboarding_complete
     - updated_at
   - Enable RLS.
   - Public SELECT policy:
     - is_active = true AND onboarding_complete = true
   - Authenticated admin/lead policies:
     - owner/manager/spa_lead can manage (optional)
   - No email/phone/invite tokens exist in this table.

2) Add a trigger on spa_workers to keep spa_workers_public in sync
   - On INSERT/UPDATE of spa_workers:
     - Upsert into spa_workers_public with safe fields
   - On soft delete or deactivation:
     - Update spa_workers_public is_active/onboarding_complete accordingly or remove row

3) Update existing RLS policies that currently reference spa_workers for public read logic
   - spa_worker_services “Public can read active services” currently checks spa_workers in a subquery.
   - spa_worker_availability “Public can view active worker availability” currently checks spa_workers.
   - Update both to reference spa_workers_public instead.
   - Then remove/disable the public SELECT policy on spa_workers entirely.
   - Result: public pages still work, but public cannot read spa_workers PII anymore.

4) Update frontend queries to use spa_workers_public for public flows
   - TherapistDropdown’s useActiveSpaWorkers() should query spa_workers_public instead of spa_workers.
   - useSpaWorkerBySlug() should query spa_workers_public by slug and return the safe worker profile.
   - BookWithWorker.tsx will continue to load services via spa_worker_services (public policy already exists and will be updated to reference spa_workers_public).

C) Verification checklist (what we’ll test after implementation)
1) Worker flow (first login)
   - Log in as spa_worker
   - Wizard shows once
   - Save hours → add a service → Save & Go Live
   - Refresh page / log out & back in:
     - Wizard does not show again
2) Public flow
   - Open /spa
   - Click Book Massage
   - Dropdown shows Lindsey + the worker underneath
   - Select worker → routes to /book-with/:slug and loads
   - Services list and calendar render properly
3) Security regression
   - Confirm public (anon) cannot select spa_workers directly anymore (PII protected)
   - Confirm public can still read:
     - spa_workers_public (safe fields only)
     - spa_worker_services for completed workers
     - spa_worker_availability for completed workers

Files / areas that will change
- Backend:
  - New backend function: supabase/functions/spa-worker-complete-onboarding/index.ts
- Database migration:
  - Create spa_workers_public table + RLS
  - Create trigger function + trigger on spa_workers
  - Update RLS policies on spa_worker_services and spa_worker_availability to reference spa_workers_public
  - Remove/replace public SELECT policy on spa_workers
  - One-time backfill:
    - populate spa_workers_public from spa_workers
    - set onboarding_complete=true for eligible “already configured” workers (optional but recommended)
- Frontend:
  - src/hooks/useSpaWorkerAvailability.ts (call backend function + fix invalidations)
  - src/hooks/useSpaWorkers.ts (read from spa_workers_public for dropdown)
  - src/hooks/useSpaWorkerServices.ts (useSpaWorkerBySlug reads spa_workers_public)
  - (Optional UX polish) src/components/admin/SpaWorkerOnboardingWizard.tsx (hydrate schedule from saved availability)

Why this will fix your exact issues
- The repeated prompts stop because onboarding_complete will actually be set to true (workers currently can’t update that field).
- Names appear in the dropdown because the dropdown query requires onboarding_complete=true and the query will be invalidated/refetched correctly.
- Public booking pages remain accessible without exposing worker emails/phones/invite tokens.

Rollout note
- After we apply these changes, any currently stuck worker (like Dillon) should immediately appear in the dropdown if we include the one-time “mark complete if schedule+services exist” migration. Otherwise, they will appear the moment they click “Save & Go Live” again.

