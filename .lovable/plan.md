
# Plan: Dynamic Worker Booking Pages with Service Management

## Overview

This plan enables therapists to appear in the booking dropdown and have their own dedicated booking pages like Lindsey's. Workers will manage their services (massage types, pricing, descriptions) from their admin dashboard, and the system will auto-generate a public booking page matching Lindsey's design.

---

## Current State

1. **Dropdown**: `TherapistDropdown.tsx` already pulls from `useActiveSpaWorkers()` and routes to `/book-spa?therapist={id}`
2. **Worker visibility**: Only workers with `onboarding_complete=true` appear in the dropdown
3. **Missing**: No `/book-spa` page exists, no worker services table, no service management UI

## Target State

1. **Database**: New `spa_worker_services` table to store each worker's offered services and pricing
2. **Admin UI**: "My Services" section in worker dashboard to add/edit services
3. **Public Page**: Dynamic `/book-with/:workerSlug` page matching Lindsey's design
4. **Dropdown**: Routes updated to use worker slug for SEO-friendly URLs

---

## Technical Implementation

### Step 1: Database Migration

Create `spa_worker_services` table to store worker-specific services:

```sql
CREATE TABLE public.spa_worker_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES spa_workers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_mins integer NOT NULL,
  price numeric(10,2) NOT NULL,
  promo_price numeric(10,2),
  promo_ends_at timestamptz,
  is_free boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  icon_name text DEFAULT 'heart',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE spa_worker_services ENABLE ROW LEVEL SECURITY;

-- Workers can manage their own services
CREATE POLICY "Workers can manage own services"
ON spa_worker_services FOR ALL TO authenticated
USING (
  worker_id IN (
    SELECT id FROM spa_workers WHERE user_id = auth.uid()
  )
);

-- Public can read active services for bookable workers
CREATE POLICY "Public can read active services"
ON spa_worker_services FOR SELECT TO anon, authenticated
USING (
  is_active = true AND
  worker_id IN (
    SELECT id FROM spa_workers 
    WHERE is_active = true 
    AND onboarding_complete = true 
    AND deleted_at IS NULL
  )
);
```

Also add a `slug` column to `spa_workers` for SEO-friendly URLs:

```sql
ALTER TABLE spa_workers 
ADD COLUMN slug text UNIQUE;

-- Backfill slugs from display_name (lowercase, hyphenated)
UPDATE spa_workers 
SET slug = lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
```

### Step 2: Create Hooks

**New file**: `src/hooks/useSpaWorkerServices.ts`

```typescript
// CRUD operations for spa_worker_services
// - useWorkerServices(workerId) - fetch services for a worker
// - useMyServices() - fetch current logged-in worker's services
// - useCreateService() - add new service
// - useUpdateService() - edit service
// - useDeleteService() - remove service
// - useSpaWorkerBySlug(slug) - fetch worker by URL slug
```

### Step 3: Admin UI - "My Services" Tab

**New file**: `src/components/admin/SpaWorkerServicesManager.tsx`

Add a new section/tab in the worker's admin dashboard (ProviderSchedule.tsx) that allows them to:

- View list of their services in a table/card format
- Add new service with form:
  - Service Name (e.g., "Swedish Massage")
  - Description (short text)
  - Duration (dropdown: 30, 45, 60, 90, 120 mins)
  - Price ($)
  - Optional: Promo Price + End Date
  - Icon (dropdown of available icons)
- Edit existing services inline
- Toggle active/inactive
- Reorder via drag or sort_order

**UI Layout in ProviderSchedule.tsx**:
```text
TABS:
[Hours] [Time Off] [Appointments] [My Services] [Settings]

MY SERVICES TAB:
+------------------------+
| + Add Service          |
+------------------------+
| Swedish Massage        | 30 min | $45 | Active | [Edit] [Delete]
| Deep Tissue            | 60 min | $80 | Active | [Edit] [Delete]
| ... 
```

### Step 4: Dynamic Public Booking Page

**New file**: `src/pages/BookWithWorker.tsx`

Create a page at `/book-with/:slug` that:

1. Fetches worker by slug using `useSpaWorkerBySlug(slug)`
2. Fetches worker's services using `useWorkerServices(workerId)`
3. Renders the same layout as `BookWithLindsey.tsx`:
   - Hero with "Book With {DisplayName}"
   - Subtitle: "Licensed Massage Therapist" (or custom from worker profile)
   - Same honeycomb background pattern
   - Dynamic service list pulled from database
   - Booking calendar (reuse `LindseyAvailabilityCalendar` with worker filtering)
4. Falls back to 404 if worker not found or inactive

**Route updates in App.tsx**:
```typescript
<Route path="/book-with/:slug" element={<BookWithWorker />} />
```

### Step 5: Update TherapistDropdown Routes

Change the routing from query param to slug-based:

```typescript
// Before
route: `/book-spa?therapist=${w.id}#availability-calendar`

// After
route: `/book-with/${w.slug || w.id}#availability-calendar`
```

### Step 6: Extend LindseyAvailabilityCalendar for Worker Support

Modify `LindseyAvailabilityCalendar.tsx` to accept an optional `workerId` prop:

```typescript
interface LindseyAvailabilityCalendarProps {
  workerId?: string; // If provided, show this worker's availability/services
  onBookingComplete?: () => void;
}
```

When `workerId` is passed:
- Fetch services from `spa_worker_services` instead of hardcoded `SERVICES`
- Check availability against that worker's schedule (`spa_worker_availability`)
- Route checkout to the appropriate edge function with `spa_worker_id`

### Step 7: Update Booking Flow

Ensure bookings created through worker pages include `spa_worker_id`:
- Update `lindsey-checkout` edge function or create a generic `spa-checkout` that accepts `worker_id`
- Store `spa_worker_id` on the booking record

---

## Files Summary

| File | Action |
|------|--------|
| New SQL Migration | Create `spa_worker_services` table, add `slug` to `spa_workers` |
| `src/hooks/useSpaWorkerServices.ts` | New hook for service CRUD |
| `src/components/admin/SpaWorkerServicesManager.tsx` | New admin UI for managing services |
| `src/pages/admin/ProviderSchedule.tsx` | Add "My Services" tab |
| `src/pages/BookWithWorker.tsx` | New dynamic booking page |
| `src/App.tsx` | Add route `/book-with/:slug` |
| `src/components/booking/TherapistDropdown.tsx` | Update route to use slug |
| `src/components/booking/LindseyAvailabilityCalendar.tsx` | Add worker support |
| `supabase/functions/lindsey-checkout/index.ts` | Add `spa_worker_id` support |

---

## User Flow After Implementation

**Admin (Worker)**:
1. Log in as worker
2. Navigate to "My Schedule" → "My Services" tab
3. Click "Add Service"
4. Enter: Swedish Massage, 30 min, $45, description
5. Save → Service now visible in their booking dropdown

**Customer**:
1. Visit /spa → Click "Book Massage"
2. Dropdown shows: Lindsey, [New Worker Name]
3. Click worker name → Redirected to `/book-with/worker-name`
4. Page shows: "Book With {Name}", their services, their calendar
5. Complete booking → Booking assigned to that worker

---

## Notes

- Lindsey's existing hardcoded page at `/book-with-lindsey` can remain for backwards compatibility, or be migrated to the dynamic system
- Each worker's subtitle/title can be stored in `spa_workers` table (optional enhancement: add `title` column)
- Icons can be stored as lucide icon names and mapped in the component
