
# Filter Schedule Page Business Dropdown for Spa Lead Role

## Problem

When Lindsey (with `spa_lead` role) visits Admin → Schedule, she sees all business units in the dropdown filter:
- 360 Photo Booth
- The Hive Coworking
- The Hive Restoration Lounge (← the only one she needs)
- The Summit
- Total Fitness by A-Z
- Voice Vault by The Hive

She only needs to see and manage **The Hive Restoration Lounge** (Spa).

## Solution

Update the Schedule page to detect the user's role and filter the business dropdown accordingly. For users with only the `spa_lead` role (and not `owner` or `manager`), the page will:

1. **Auto-select** the Spa business instead of "All Businesses"
2. **Hide** the business dropdown entirely (since there's only one option)
3. **Show** only Spa bookings on the calendar

## Technical Implementation

### File: `src/pages/admin/Schedule.tsx`

**Changes:**

1. Import `useAuth` to access user roles
2. Add role-based logic to determine if user is "spa-only"
3. Auto-set the Spa business ID as the default selection for spa_lead users
4. Conditionally hide the business dropdown for spa_lead users

```text
// Add import
import { useAuth } from "@/contexts/AuthContext";

// Inside the component
const { authUser } = useAuth();

// Determine if user is spa-only (has spa_lead but not owner/manager)
const isSpaLeadOnly = useMemo(() => {
  const roles = authUser?.roles || [];
  return roles.includes("spa_lead") && 
         !roles.includes("owner") && 
         !roles.includes("manager");
}, [authUser?.roles]);

// Find Spa business ID
const spaBusinessId = useMemo(() => {
  return businesses?.find(b => b.type === "spa")?.id;
}, [businesses]);

// For spa_lead, force selection to Spa business
useEffect(() => {
  if (isSpaLeadOnly && spaBusinessId && selectedBusiness === "all") {
    setSelectedBusiness(spaBusinessId);
  }
}, [isSpaLeadOnly, spaBusinessId, selectedBusiness]);

// In the render, conditionally show the dropdown:
{!isSpaLeadOnly && (
  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
    ...
  </Select>
)}
```

## Result for Lindsey

After this change, when Lindsey visits the Schedule page:

```text
┌─────────────────────────────────────────────┐
│  Schedule                                   │
│  View and manage all bookings               │
│                                             │
│  [Week] [Month]  ← No business dropdown     │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Calendar shows ONLY Spa bookings   │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

- No "All Businesses" dropdown clutter
- Calendar pre-filtered to Restoration Lounge
- Day-click availability management still works (since Spa is selected)

## Files to Modify

1. `src/pages/admin/Schedule.tsx` — Add role-based business filtering

## Notes

- Owners and managers continue to see all businesses as before
- This is a UX improvement only — Lindsey could theoretically access other businesses via URL parameters if needed
- The Approvals page already has similar filtering since we just added role-based navigation
