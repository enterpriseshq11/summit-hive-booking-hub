

# Fix: Worker Calendars Page Crashing

## Problem
The page crashes because Radix UI's `<SelectItem>` component does not allow empty string values. The current code has:
```tsx
<SelectItem value="" disabled>Loading workers...</SelectItem>
<SelectItem value="" disabled>No active workers</SelectItem>
```

## Solution
Replace the disabled `<SelectItem>` elements with plain `<div>` elements for loading/empty states, since these aren't meant to be selectable anyway.

## Changes

**File: `src/pages/admin/WorkerCalendars.tsx`**

Replace lines 188-203:
```tsx
<SelectContent className="bg-popover border-border">
  {workersLoading ? (
    <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading workers...</div>
  ) : workers.filter(w => w.is_active).length === 0 ? (
    <div className="px-2 py-1.5 text-sm text-muted-foreground">No active workers</div>
  ) : (
    workers.filter(w => w.is_active).map(worker => (
      <SelectItem 
        key={worker.id} 
        value={worker.id}
        className="text-foreground focus:bg-accent"
      >
        {worker.display_name}
      </SelectItem>
    ))
  )}
</SelectContent>
```

This removes the invalid empty-value SelectItems and uses non-interactive div elements for the loading and empty states instead.

