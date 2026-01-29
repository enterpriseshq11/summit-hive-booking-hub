
# Plan: Add Worker Calendars Tab for Lindsey (spa_lead)

## Overview

Add a new admin page "Worker Calendars" that allows Lindsey (spa_lead) to view any spa worker's confirmed bookings on a calendar. This helps her monitor worker availability and manage scheduling across the team.

## User Experience

1. Lindsey navigates to Admin → My Spa → Worker Calendars
2. She sees a dropdown to select a worker (e.g., "Dillon bowling")
3. The calendar displays that worker's confirmed bookings showing:
   - Date and time
   - Service name
   - Customer name
   - Duration
   - Status badge
4. She can switch between week/month views
5. She can click a booking to see full details

---

## Technical Implementation

### 1. Add Navigation Item

**File**: `src/components/admin/AdminLayout.tsx`

Add "Worker Calendars" to the "My Spa" section, visible only to spa_lead, owner, and manager:

```typescript
{
  label: "My Spa",
  visibleToRoles: ["owner", "manager", "spa_lead", "spa_worker"],
  items: [
    { title: "My Schedule", href: "/admin/my-schedule", icon: CalendarDays },
    { title: "Workers", href: "/admin/spa-workers", icon: Users, visibleToRoles: ["owner", "manager", "spa_lead"] },
    { title: "Worker Calendars", href: "/admin/worker-calendars", icon: CalendarRange, visibleToRoles: ["owner", "manager", "spa_lead"] }, // NEW
  ],
}
```

### 2. Create New Page

**File**: `src/pages/admin/WorkerCalendars.tsx`

Components:
- Worker selector dropdown (fetches from `useSpaWorkers()`)
- Week/Month view toggle
- Calendar grid (similar to Schedule.tsx)
- Booking detail modal

Key hooks to use:
- `useSpaWorkers()` - Get list of all active workers (admin-only, has PII access)
- `useBookings({ spa_worker_id })` - Filter bookings by selected worker
- Date-fns for calendar calculations

Data flow:
```text
1. Fetch all workers → populate dropdown
2. User selects worker → store workerId in state
3. Fetch bookings for that worker in date range
4. Display on calendar grid with booking cards
5. Click booking → show modal with full details
```

### 3. Add Route

**File**: `src/App.tsx`

Add route for the new page:
```typescript
<Route path="/admin/worker-calendars" element={<WorkerCalendars />} />
```

---

## Calendar Display Details

Each booking card on the calendar will show:
- Time (e.g., "2:00 PM")
- Service name from `booking.packages?.name` or booking notes
- Customer first name from `booking.customer_name`
- Status badge (Confirmed, Pending, etc.)
- Duration indicator

Color coding:
- Green: Confirmed
- Amber: Pending
- Orange: Reschedule Requested
- Blue: Completed

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/admin/WorkerCalendars.tsx` | CREATE - New page with calendar view |
| `src/components/admin/AdminLayout.tsx` | MODIFY - Add nav item for Worker Calendars |
| `src/App.tsx` | MODIFY - Add route |

---

## Filter Enhancements

The page will include:
1. **Worker Filter** - Dropdown of all active spa workers
2. **Date Navigation** - Previous/Next week/month buttons
3. **View Toggle** - Week vs Month view
4. **Quick Jump** - "Today" button to return to current week

When Lindsey selects a worker, the calendar will automatically update to show only that worker's bookings for the visible date range.

---

## Booking Detail Modal

When clicking a booking on the calendar, show:
- Customer full name
- Phone and email
- Service/package name
- Date and time
- Duration
- Total amount
- Status
- Any internal notes
- Quick actions: View full booking, mark status
