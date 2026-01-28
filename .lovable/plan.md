
# Simplified Admin Navigation for Lindsey (Spa Lead Role)

## Overview

Create a streamlined admin view for Lindsey where she only sees the pages relevant to Spa/Restoration operations. This is purely a UX improvement — not a security restriction.

## Current State

- Lindsey has the `owner` role, which shows all admin sections
- The `spa_lead` role exists in the database but is not yet used for nav filtering
- The AdminLayout navigation already supports `adminOnly` and `ownerOnly` flags

## Solution

### Step 1: Change Lindsey's Role from `owner` to `spa_lead`

Run this SQL in the database (or update via Users & Roles page):

```text
-- Remove owner role
DELETE FROM user_roles 
WHERE user_id = 'c1793168-1822-40f2-a227-9d8cb54bfe1b' 
AND role = 'owner';

-- Add spa_lead role
INSERT INTO user_roles (user_id, role) 
VALUES ('c1793168-1822-40f2-a227-9d8cb54bfe1b', 'spa_lead')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 2: Update AdminLayout Navigation Filtering

Add role-based filtering to the navigation configuration. For users with `spa_lead` role (and not `owner`/`manager`), only show:

**Visible Sections for `spa_lead`:**
- Spa (Restoration Lounge) section
  - My Schedule
- Booking Operations (filtered)
  - Schedule
  - Approvals
  - Blackouts

**Hidden Sections for `spa_lead`:**
- Command Center (Leads, Pipeline, Employees, Revenue, etc.)
- Voice Vault
- Coworking (The Hive)
- Hiring
- Marketing
- System

### Technical Implementation

Update `src/components/admin/AdminLayout.tsx`:

1. Add `allowedRoles` property to navigation items/sections:

```text
// Navigation sections with role visibility
const navSections = [
  {
    label: "Command Center",
    visibleToRoles: ["owner", "manager"],  // Only full admins
    items: [...],
  },
  {
    label: "Booking Operations",
    items: [
      { title: "Schedule", href: "/admin/schedule", icon: CalendarDays },
      { title: "Approvals", href: "/admin/approvals", icon: ClipboardList },
      { title: "Resources", href: "/admin/resources", visibleToRoles: ["owner", "manager"] },
      { title: "Packages", href: "/admin/packages", visibleToRoles: ["owner", "manager"] },
      { title: "Pricing Rules", href: "/admin/pricing-rules", visibleToRoles: ["owner", "manager"] },
      { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
      { title: "Documents", href: "/admin/documents", visibleToRoles: ["owner", "manager"] },
      { title: "Reviews", href: "/admin/reviews", visibleToRoles: ["owner", "manager"] },
      { title: "Leads & Waitlists", href: "/admin/leads-waitlists", visibleToRoles: ["owner", "manager"] },
    ],
  },
  {
    label: "Spa (Restoration Lounge)",
    visibleToRoles: ["owner", "manager", "spa_lead"],  // Spa section visible to spa_lead
    items: [
      { title: "My Schedule", href: "/admin/my-schedule", icon: CalendarDays },
    ],
  },
  // Other sections hidden from spa_lead...
];
```

2. Add filtering logic in the render:

```text
const userRoles = authUser?.roles || [];
const isSpaLeadOnly = userRoles.includes("spa_lead") && 
                      !userRoles.includes("owner") && 
                      !userRoles.includes("manager");

// Filter sections based on roles
const visibleSections = navSections.filter(section => {
  if (!section.visibleToRoles) return true; // No restriction
  return section.visibleToRoles.some(role => userRoles.includes(role));
});
```

### Result for Lindsey

After implementation, Lindsey's admin sidebar will only show:

```text
┌─────────────────────────┐
│  A-Z Command            │
├─────────────────────────┤
│  BOOKING OPERATIONS     │
│    • Schedule           │
│    • Approvals          │
│    • Blackouts          │
├─────────────────────────┤
│  SPA (RESTORATION)      │
│    • My Schedule        │
└─────────────────────────┘
```

## Files to Modify

1. `src/components/admin/AdminLayout.tsx` — Add role-based visibility filtering to navigation

## Database Change

Update Lindsey's role from `owner` to `spa_lead` (can be done via SQL or the Users & Roles admin page)

## Notes

- This is a UX improvement only — Lindsey can still technically access other pages via URL if needed
- If you want Lindsey to keep owner privileges but just have a simpler view, an alternative approach would be adding a "simple view" toggle or a separate "My Dashboard" landing page
- The `spa_lead` role already has access to the admin area (per AuthContext)
