

# Fix: Worker Invite Creates Customer Instead of spa_worker

## Problem Summary

When a worker accepts an invite and creates their account, they are treated as a regular customer instead of a spa worker because:

1. The client-side code cannot insert a row into `user_roles` (blocked by RLS policy - only owners can insert roles)
2. The client-side code cannot update `spa_workers.user_id` (blocked by RLS policy - only admins can update)
3. Without a role, the login routing treats them as a customer and sends them to "My Account"

## Solution

Move the role assignment and worker linking to a secure backend function that uses elevated (service role) privileges.

## Implementation Plan

### Step 1: Create Edge Function for Worker Account Activation

Create a new edge function `activate-spa-worker` that:
- Accepts the invite token and new user ID
- Uses service role to bypass RLS
- Links the user to their `spa_workers` record
- Inserts the `spa_worker` role into `user_roles`
- Marks the invite as accepted

### Step 2: Update WorkerSignup.tsx

Replace the direct Supabase calls with a call to the new edge function:
- After `supabase.auth.signUp()` succeeds, call `activate-spa-worker` edge function
- The edge function handles all the privileged operations securely

### Step 3: Add Fallback Database Trigger (Optional Safety Net)

Create a database trigger on `spa_workers` that automatically:
- When `user_id` changes from NULL to a value
- Inserts a corresponding `spa_worker` role if one doesn't exist

---

## Technical Details

### Edge Function: `activate-spa-worker`

```text
Location: supabase/functions/activate-spa-worker/index.ts

Input:
- invite_token: string
- user_id: string (the auth.users.id of the new account)

Actions (using service role):
1. Fetch spa_worker record by invite_token
2. Verify invite is valid (not expired, not already accepted)
3. Update spa_workers: set user_id, invite_accepted_at, clear invite_token
4. Insert into user_roles: { user_id, role: 'spa_worker' }
5. Upsert profile if needed
6. Return success

Security:
- Validates invite token before any privileged action
- Uses service role key (never exposed to client)
- Logs action to audit_log
```

### Changes to WorkerSignup.tsx

```text
Current (broken):
1. Create auth user
2. Update spa_workers (fails - RLS blocks)
3. Insert user_roles (fails - RLS blocks)
4. Create profile (may fail)

Fixed:
1. Create auth user
2. Call activate-spa-worker edge function with { invite_token, user_id }
3. Edge function does all privileged work securely
4. Show verify email screen
```

### Database Trigger (Safety Net)

```text
Trigger: on_spa_worker_user_linked
Table: spa_workers
Event: AFTER UPDATE
Condition: OLD.user_id IS NULL AND NEW.user_id IS NOT NULL

Action:
- Insert { user_id: NEW.user_id, role: 'spa_worker' } into user_roles
- ON CONFLICT DO NOTHING (idempotent)
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/activate-spa-worker/index.ts` | Create new edge function |
| `src/pages/WorkerSignup.tsx` | Replace direct DB calls with edge function call |
| Database migration | Add safety trigger for auto-role assignment |

---

## Post-Implementation Verification

1. Send a new worker invite from admin
2. Click invite link → should land on Create Account
3. Set password → account created, verify email screen shown
4. Verify email → sign in
5. Sign in → should land on `/admin/my-schedule` (worker dashboard)
6. Verify worker does NOT see "Workers" tab
7. Verify worker sees onboarding wizard to set availability

---

## Why This Approach?

- **Security**: Role assignment happens server-side with service role, not client-side
- **Reliability**: Single atomic operation handles all linking
- **Audit Trail**: All actions logged to audit_log
- **Fallback**: Database trigger provides safety net if edge function fails
- **No RLS Changes**: We don't need to weaken RLS policies (which would be a security risk)

