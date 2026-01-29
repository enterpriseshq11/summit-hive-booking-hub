

# Plan: Spa Worker Dashboard - Match Lindsey's View

## Overview

Give spa workers the same admin navigation and dashboard experience as Lindsey (spa_lead), minus the Workers management tab. Workers will see their own calendar, their own bookings in Approvals, and manage their own blackouts.

## Current State

**Lindsey (spa_lead) sees:**
- **Booking Operations**: Schedule, Approvals, Blackouts
- **My Spa**: My Schedule, Workers

**Spa workers currently see:**
- **My Spa**: My Schedule only

## Target State

**Spa workers will see:**
- **Booking Operations**: Schedule, Approvals, Blackouts
- **My Spa**: My Schedule only (no Workers tab)

All views will be filtered to show only the worker's own data.

---

## Technical Implementation

### Step 1: Update AdminLayout.tsx Navigation

Modify the navigation configuration to include `spa_worker` in the Booking Operations section, but restrict them to only Schedule, Approvals, and Blackouts:

```typescript
// Line 91-105: Add spa_worker to Booking Operations
{
  label: "Booking Operations",
  visibleToRoles: ["owner", "manager", "spa_lead", "spa_worker", ...],
  items: [
    { title: "Schedule", href: "/admin/schedule", icon: CalendarDays },
    { title: "Approvals", href: "/admin/approvals", icon: ClipboardList },
    // Resources, Packages, etc. remain owner/manager only
    { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
    // Other items filtered by visibleToRoles
  ],
}
```

**Specific item visibility:**
- Schedule: Add `spa_worker` 
- Approvals: Add `spa_worker`
- Blackouts: Add `spa_worker`
- Resources, Packages, Pricing Rules, Documents, Reviews, Leads & Waitlists: Remain owner/manager only

### Step 2: Update Schedule.tsx for Worker Filtering

Add logic to detect if the user is a `spa_worker` and filter bookings to only show their own:

```typescript
// Add helper similar to isSpaLeadOnly
const isSpaWorkerOnly = useMemo(() => {
  const roles = authUser?.roles || [];
  return roles.includes("spa_worker") && 
    !roles.includes("owner") && 
    !roles.includes("manager") &&
    !roles.includes("spa_lead");
}, [authUser?.roles]);

// Fetch current worker ID from spa_workers table
const { currentWorker } = useSpaWorkerAvailability();

// Filter bookings by spa_worker_id when in worker view
const filteredBookings = useMemo(() => {
  let filtered = (bookings || []).filter((b) => 
    b?.status !== "denied" && b?.status !== "cancelled"
  );
  
  // If spa_worker, only show their assigned bookings
  if (isSpaWorkerOnly && currentWorker?.id) {
    filtered = filtered.filter((b) => b.spa_worker_id === currentWorker.id);
  }
  
  return filtered;
}, [bookings, isSpaWorkerOnly, currentWorker?.id]);
```

**Additional changes:**
- Hide business filter dropdown for `spa_worker` (like we do for `spa_lead`)
- Auto-select Spa business
- Remove day-click availability management (they use My Schedule for that)

### Step 3: Update Approvals.tsx for Worker Filtering

Similar changes to filter bookings by the worker's `spa_worker_id`:

```typescript
// Add spa_worker detection
const isSpaWorkerOnly = useMemo(() => {
  const roles = authUser?.roles || [];
  return roles.includes("spa_worker") && 
    !roles.includes("owner") && 
    !roles.includes("manager") &&
    !roles.includes("spa_lead");
}, [authUser?.roles]);

// Fetch worker ID
const { currentWorker } = useSpaWorkerAvailability();

// Filter confirmed bookings to only show worker's own
const filteredConfirmed = useMemo(() => {
  let items = (confirmedBookings || [])
    .filter((b) => matchesUnit(b, businessUnit));
    
  // Spa workers only see their own bookings
  if (isSpaWorkerOnly && currentWorker?.id) {
    items = items.filter((b) => b.spa_worker_id === currentWorker.id);
  }
  
  return items.map((b) => ({ kind: "booking", booking: b }));
}, [confirmedBookings, businessUnit, isSpaWorkerOnly, currentWorker?.id]);
```

**Additional changes:**
- Hide business unit tabs for `spa_worker` (like `spa_lead`)
- Force `restoration` filter
- Show only Confirmed + Rescheduled tabs (remove Pending/Denied)

### Step 4: Update Blackouts.tsx for Worker Filtering

Workers should only see and manage their own blackout dates:

```typescript
// Add spa_worker detection
const isSpaWorkerOnly = useMemo(() => {
  const roles = authUser?.roles || [];
  return roles.includes("spa_worker") && 
    !roles.includes("owner") && 
    !roles.includes("manager") &&
    !roles.includes("spa_lead");
}, [authUser?.roles]);

// When creating blackouts, associate with worker's spa_worker_id
// When listing blackouts, filter to only show worker's own
```

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminLayout.tsx` | Add `spa_worker` to Booking Operations visibility for Schedule, Approvals, Blackouts |
| `src/pages/admin/Schedule.tsx` | Add worker detection + booking filter by `spa_worker_id`, hide business dropdown |
| `src/pages/admin/Approvals.tsx` | Add worker detection + booking filter by `spa_worker_id`, hide business tabs |
| `src/pages/admin/Blackouts.tsx` | Add worker detection + filter blackouts to worker's own |

---

## User Experience After Implementation

A spa worker logs in and sees:

**Sidebar Navigation:**
```text
BOOKING OPERATIONS
  📅 Schedule
  📋 Approvals  
  🗓️ Blackouts

MY SPA
  📅 My Schedule
```

**Schedule Page:**
- Shows only their assigned bookings on the calendar
- No business filter dropdown
- Auto-filtered to Restoration Lounge

**Approvals Page:**
- Shows Confirmed + Rescheduled tabs only
- Lists only bookings assigned to them
- Can initiate reschedule for their own confirmed bookings

**Blackouts Page:**
- Shows only their blackout dates
- Can add/remove their own time off

**My Schedule Page:**
- Remains the same (manage hours, time off, appointments, settings)

