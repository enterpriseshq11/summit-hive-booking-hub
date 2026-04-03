
# A-Z Command Platform — Full Backend Rebuild Plan

## Current State Assessment
- **Dylan** has `owner` + `manager (summit)` roles
- **Victoria** has `owner` role  
- **Mark** has `manager (summit)` role
- **Nasiya** has `spa_lead` role
- **"null null" bug**: profiles table has NULL first_name/last_name for all users — this causes the activity log actor display issue
- **GHL**: Already have `GHL_LINDSEY_WEBHOOK_URL` secret for Spa bookings. Need GHL API key for full bidirectional sync
- **Stripe**: Connected and working
- **No GHL connector available** in Lovable — will need API key + webhook approach

---

## PHASE 1: Foundation Fixes (Sessions 1-2)

### 1A: Fix "null null" Actor Bug
- Update `profiles` table: populate first_name/last_name for all existing users
- Update `handle_new_user()` trigger to capture names on signup
- Update all activity log / audit log queries to pull actor name from profiles
- Ensure every insert into audit_log / crm_activity_events includes `actor_user_id`

### 1B: Superadmin Access for Dylan
- Create a `superadmin` concept (owner role already exists, but add dashboard customization storage)
- Create `dashboard_layouts` table to store per-user widget configurations
- Dylan gets full CRUD on all records, all business units, all settings

### 1C: Fix Profile Data
- Prompt you to provide first/last names for: Dylan, Victoria, Mark, Nasiya
- Update profiles so actor names display correctly everywhere

---

## PHASE 2: Navigation Simplification (Session 2-3)

### Rebuild Admin Sidebar
New structure with collapsible groups:
- **COMMAND CENTER**: Dashboard, Alerts, Activity Log
- **SALES**: Leads, Pipeline, Approvals
- **OPERATIONS**: Schedule, Resources, Packages, Blackouts, Documents
- **TEAM**: Employees, Payroll, Commissions, Career Applications
- **REVENUE**: Revenue Tracker, Pricing Rules, Stripe Integration
- **BUSINESSES** (expandable per unit): Summit, Spa, Fitness, Hive, Voice Vault, Mobile Homes — each with Leads, Bookings, Revenue, Settings
- **SETTINGS** (superadmin only): Users & Roles, Payment Settings, Integrations, Audit Log, Assumptions

No functionality removed — just reorganized.

---

## PHASE 3: Customizable Dashboard with KPI Tiles (Sessions 3-5)

### Database
- `dashboard_layouts` table: stores widget positions, sizes, visibility per user
- `dashboard_widgets` registry: defines all available KPI tiles

### KPI Tiles (all pulling live data)
- Total Revenue Today / This Month (from Stripe + manual entries)
- Revenue by Business Unit
- Active Leads / Leads Contacted Today / Overdue Follow-Ups
- Pending Approvals / Bookings Today / This Week
- Active Memberships (Fitness)
- Commission Pending / Approved Unpaid
- Stripe Payments Today
- Open Office Listings (Hive)
- New Leads This Week (with source breakdown)

### Drag-and-Drop
- Use @dnd-kit (already installed) for full widget repositioning
- Owner (Dylan): full add/remove/resize/reorder
- Other roles: read-only fixed view based on their role

### Role-Based Views
- Owner: everything
- Operations Manager (Victoria): leads, pipeline, schedule, revenue summary
- Sales/Events (Mark): leads, pipeline, their commission
- Spa Lead (Nasiya): spa schedule, worker calendars, spa revenue, spa commission
- VA/Support: leads intake, follow-up queue, documents only

---

## PHASE 4: Leads & Pipeline Rebuild (Sessions 5-8)

### Pipeline Stages (Merged)
Keep existing 12 stages + add any missing from your proposed list:
- Current: New Lead, Contact Attempted, Responded, Warm Lead, Hot Lead, Proposal Sent, Contract Sent, Deposit Pending, Booked, Follow Up Needed, No Response, Lost
- Your proposed additions: "Completed" stage → add this
- Final: 13 stages total

### Lead Intake Forms (per business unit)
Create public-facing intake forms for:
- **Summit**: event type, preferred date, guest count, budget range, contact info, source
- **Spa**: service type, preferred date/time, contact info, new/returning
- **Fitness**: membership interest, goals, preferred start date, contact info
- **Hive**: office type, desired start date, company name, contact info
- **Voice Vault**: session type, preferred date, contact info, project description

Each form submission:
- Creates lead in `crm_leads` with correct business_unit
- Enters pipeline at "new" stage
- Triggers alert to assigned team member
- Logs source and timestamps
- Calculates priority score

### Follow-Up System
- Every lead gets a follow-up date
- Overdue follow-ups flag on dashboard
- Pipeline sidebar shows: New Not Contacted, Overdue, Due Today, Hot No Contact 24h
- Log calls/emails/texts on lead record with timestamps

### Deposit → Booking Automation
- When lead reaches "deposit_pending" and payment confirmed:
  - Auto-create booking in Schedule
  - Auto-create revenue event
  - Attribute to correct business unit + employee
  - Trigger commission calculation

---

## PHASE 5: Go High Level Integration (Sessions 6-9)

### What I Need From You
1. **GHL API Key** — from your GHL account Settings → API Keys
2. **GHL Location/Sub-Account IDs** — one per business unit (Summit, Spa, Fitness, Hive, Voice Vault)
3. **GHL Pipeline IDs** — the pipeline ID for each business unit in GHL
4. **GHL Webhook URL** for inbound webhooks (GHL → A-Z Command)

### Architecture
```
Website Forms → A-Z Command (creates lead) → Webhook to GHL (creates contact + pipeline opportunity)
GHL Stage Change → Webhook to A-Z Command → Updates crm_leads status
A-Z Command Stage Change → Webhook to GHL → Updates GHL pipeline stage
```

### Implementation
- **Edge Function: `ghl-sync-lead`** — sends new leads to GHL via API
- **Edge Function: `ghl-inbound-webhook`** — receives GHL stage changes and updates A-Z Command
- **Edge Function: `ghl-trigger-workflow`** — triggers GHL workflows on specific pipeline events
- **Activity sync**: Pull last contact date/method from GHL into lead record
- **Source attribution**: Pass GHL source data (Facebook Ad, Google, etc.) into crm_leads

### Sync Rules
- GHL is master for communications (emails, SMS, sequences)
- A-Z Command is master for revenue and operations
- Bidirectional pipeline sync with conflict resolution (last-write-wins with timestamp)
- If full bidirectional isn't achievable, GHL is master for lead status

### Stripe Deduplication
- Tag all Stripe payments with a `source` field: "direct" (card reader) vs "ghl_funnel"
- Deduplicate by checking `stripe_payment_intent_id` before creating revenue events
- Both GHL funnel payments and direct reader payments feed into revenue without double-counting

---

## Execution Order

| Priority | What | Sessions |
|----------|------|----------|
| 1 | Fix null null bug + profile data | 1 |
| 2 | Superadmin access + permissions | 1 |
| 3 | Navigation rebuild | 2 |
| 4 | Dashboard tables + KPI tiles | 2-3 |
| 5 | Drag-and-drop dashboard | 3 |
| 6 | Lead intake forms (all units) | 4 |
| 7 | Pipeline merge + automation | 4-5 |
| 8 | Follow-up system | 5 |
| 9 | GHL integration (needs your API credentials) | 6-8 |
| 10 | Deposit → booking automation | 8 |

---

## What I Need From You Before Starting

1. **First and last names** for Dylan, Victoria, Mark, and Nasiya (to fix the null null bug)
2. **GHL API Key** from your GHL account
3. **GHL Sub-Account/Location IDs** for each business unit
4. **GHL Pipeline IDs** for each business unit
5. Confirmation that this plan matches your expectations

I'll start Phase 1 (foundation fixes) immediately upon approval. GHL integration work begins as soon as you provide the API credentials.
