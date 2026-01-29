

# Plan: Fix Worker Dropdown and Add Services Onboarding Step

## Problems Identified

1. **Workers not appearing in dropdown**: The `useActiveSpaWorkers` hook does not select the `slug` or `title` columns, so workers can't route to their booking pages
2. **Slug is null**: The worker "Dillon bowling" has `slug: null` - the backfill didn't run or happened before their creation
3. **Onboarding only prompts for schedule**: The wizard only covers availability hours, not services
4. **No services requirement**: Workers are marked as "onboarding complete" after just setting hours, but they need services too to have a booking page

## Solution Overview

Extend the onboarding flow to include a services step, fix the slug generation, and update the dropdown query to include all required fields.

---

## Technical Implementation

### Step 1: Update `useActiveSpaWorkers` Hook

Add `slug` and `title` to the query so the dropdown can properly route and display workers.

**File**: `src/hooks/useSpaWorkers.ts`

```typescript
// Line 72: Update the select query
const { data, error } = await supabase
  .from("spa_workers")
  .select("id, display_name, first_name, last_name, user_id, onboarding_complete, slug, title")
  //...
```

### Step 2: Add Slug Generation on Onboarding Complete

When a worker completes onboarding, auto-generate a slug from their display_name if one doesn't exist.

**File**: `src/hooks/useSpaWorkerAvailability.ts`

```typescript
// In saveScheduleMutation: Generate slug when marking onboarding complete
const slugValue = currentWorker?.display_name
  ?.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const { error: updateError } = await supabase
  .from("spa_workers")
  .update({ 
    onboarding_complete: true,
    slug: slugValue  // Auto-generate slug
  })
  .eq("id", effectiveWorkerId);
```

### Step 3: Update Onboarding Wizard - Add Services Step

Extend the wizard from 3 steps to 4 steps: Welcome → Schedule → Services → Confirm

**File**: `src/components/admin/SpaWorkerOnboardingWizard.tsx`

**New Steps**:
```text
1. Welcome - "Let's set up your profile"
2. Schedule - Set weekly availability hours
3. Services - Add at least one service with name, duration, price, description
4. Confirm - Review everything and activate
```

**Key Changes**:
- Import `useMyServices`, `useCreateService` from `useSpaWorkerServices`
- Add `step: "services"` to the state machine
- Add inline service creation form (simplified version of SpaWorkerServicesManager)
- Require at least 1 service before proceeding to confirmation
- Save schedule + services together at the end

### Step 4: Track Services Completion Separately

Update the "needsOnboarding" check to verify both:
1. Schedule is set (availability windows exist)
2. At least one service exists

**File**: `src/hooks/useSpaWorkerAvailability.ts`

Add query for services count:
```typescript
const { data: servicesCount } = useQuery({
  queryKey: ["spa-worker-services-count", effectiveWorkerId],
  queryFn: async () => {
    const { count, error } = await supabase
      .from("spa_worker_services")
      .select("*", { count: "exact", head: true })
      .eq("worker_id", effectiveWorkerId)
      .eq("is_active", true);
    return count || 0;
  },
  enabled: !!effectiveWorkerId,
});

// Update needsOnboarding check
const needsOnboarding = currentWorker && (!currentWorker.onboarding_complete || servicesCount === 0);
const needsScheduleOnly = currentWorker?.onboarding_complete && servicesCount === 0;
```

### Step 5: Update Dropdown to Filter by Services

Only show workers in the dropdown if they have at least one active service.

**File**: `src/hooks/useSpaWorkers.ts`

Option A (simple - just check onboarding_complete):
```typescript
// Keep current query but ensure slug/title are included
.eq("onboarding_complete", true)
```

Option B (strict - verify services exist via join):
```typescript
// Use a view or function to check services count
// This ensures workers without services don't appear
```

For simplicity, Option A is recommended since we're updating onboarding to require services before marking complete.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSpaWorkers.ts` | Add `slug`, `title` to `useActiveSpaWorkers` select |
| `src/hooks/useSpaWorkerAvailability.ts` | Add slug generation, add services count check |
| `src/components/admin/SpaWorkerOnboardingWizard.tsx` | Add "Services" step between schedule and confirm |
| Database Migration | Backfill slugs for existing workers with null slugs |

---

## Updated Onboarding Flow

**Step 1 - Welcome**
```text
"Welcome to Restoration Lounge, {Name}!"
"Let's set up your profile so customers can start booking with you."
What you'll set up:
- Your weekly working hours
- Your services and pricing
```

**Step 2 - Schedule**
(Existing schedule picker - no changes)

**Step 3 - Services** (NEW)
```text
"Add Your Services"
"Add at least one service to display on your booking page."

[+ Add Service]
Form fields:
- Service Name (required)
- Duration (dropdown)
- Price (required)
- Description (optional)

[Service list preview]
Swedish Massage | 60 min | $80 | [Edit] [Delete]
```

**Step 4 - Confirm**
```text
"Your Profile is Ready!"

Working Hours:
Monday: 9:00 AM - 6:00 PM
...

Services:
- Swedish Massage - 60 min - $80
- Deep Tissue - 90 min - $100

[Edit Schedule] [Edit Services] [Save & Go Live]
```

---

## User Flow After Implementation

1. New worker receives invite and creates account
2. On first login, sees onboarding wizard (cannot dismiss)
3. Sets weekly availability hours
4. Adds at least one service (name, duration, price)
5. Reviews and confirms
6. Worker marked as `onboarding_complete: true` and `slug` is generated
7. Worker now appears in "Book Massage" dropdown
8. Customer clicks worker name → routes to `/book-with/{slug}`
9. On subsequent logins, wizard does NOT appear again

---

## Edge Cases

- **Worker already completed schedule but no services**: Show wizard starting at services step
- **Worker tries to skip services**: Disable "Continue" button until at least 1 service added
- **Slug collision**: Add numeric suffix if slug already exists (e.g., `john-doe-2`)

