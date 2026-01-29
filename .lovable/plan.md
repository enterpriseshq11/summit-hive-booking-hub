
# Fix: Worker Invite Role Assignment Failure

## Problem Summary

The worker invite flow is failing because the database constraint `user_roles_user_id_role_department_key` is a 3-column unique constraint on `(user_id, role, department)`, but both the edge function and the database trigger are trying to use `ON CONFLICT (user_id, role)` which is only 2 columns.

**Error:** `"there is no unique or exclusion constraint matching the ON CONFLICT specification"`

### Current Flow (Broken)
1. Worker creates account (auth user created)
2. Edge function tries to update `spa_workers.user_id`
3. The `trigger_spa_worker_user_linked` fires
4. Trigger tries `INSERT INTO user_roles ... ON CONFLICT (user_id, role)` - FAILS
5. Entire update transaction rolls back
6. Worker has no role, redirects to customer dashboard

## Root Cause

The `user_roles` table has this constraint:
```sql
UNIQUE (user_id, role, department)  -- 3 columns
```

But the code uses:
```sql
ON CONFLICT (user_id, role)  -- Only 2 columns - doesn't match!
```

## Solution

Fix the trigger function and edge function to use the correct 3-column constraint reference.

### Option A: Use constraint name directly (Recommended)
```sql
ON CONFLICT ON CONSTRAINT user_roles_user_id_role_department_key DO UPDATE SET updated_at = now()
```

### Option B: Include department column
```sql
INSERT INTO user_roles (user_id, role, department)
VALUES (NEW.user_id, 'spa_worker', NULL)
ON CONFLICT (user_id, role, department) DO NOTHING
```

I recommend Option B since it's clearer and more explicit.

---

## Implementation Steps

### Step 1: Database Migration

Create a migration to update the trigger function `on_spa_worker_user_linked`:

```sql
CREATE OR REPLACE FUNCTION public.on_spa_worker_user_linked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Use all 3 columns in ON CONFLICT to match the constraint
    INSERT INTO public.user_roles (user_id, role, department)
    VALUES (NEW.user_id, 'spa_worker', NULL)
    ON CONFLICT (user_id, role, department) DO NOTHING;
    
    INSERT INTO public.audit_log (
      action_type,
      entity_type,
      entity_id,
      actor_user_id,
      after_json
    ) VALUES (
      'spa_worker_role_auto_assigned',
      'user_roles',
      NEW.id::text,
      NEW.user_id,
      jsonb_build_object(
        'worker_id', NEW.id,
        'user_id', NEW.user_id,
        'trigger', 'on_spa_worker_user_linked'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;
```

### Step 2: Update Edge Function

Update `supabase/functions/activate-spa-worker/index.ts`:

**Line 86-91** - Fix the role insert:
```typescript
// 4. Insert spa_worker role into user_roles (include department column)
const { error: roleError } = await supabase
  .from("user_roles")
  .insert({
    user_id: user_id,
    role: "spa_worker",
    department: null  // Explicitly include to match constraint
  });
```

### Step 3: Redeploy Edge Function

Deploy the updated `activate-spa-worker` function.

### Step 4: Testing

After the fix:
1. Create a new test worker invite from admin
2. Click the invite link
3. Set password and create account
4. Verify email
5. Sign in
6. Expected: Land on `/admin/my-schedule` (not customer dashboard)
7. Verify: Worker cannot see "Workers" tab in navigation

---

## Technical Details

### Files to Modify
| File | Change |
|------|--------|
| New SQL Migration | Fix trigger function to use 3-column conflict |
| `supabase/functions/activate-spa-worker/index.ts` | Add `department: null` to role insert |

### Database Objects Affected
- Function: `public.on_spa_worker_user_linked()` - Updated
- Trigger: `trigger_spa_worker_user_linked` - No change (uses the function)

---

## Post-Fix Cleanup

The existing test worker accounts (workflowtesting21@gmail.com, etc.) have auth users but no roles. You can either:

1. **Create a fresh invite** to test the complete flow (recommended)
2. **Manually fix** via SQL:
```sql
-- Link the existing user to the worker record
UPDATE spa_workers 
SET user_id = 'f97cbd14-94f2-43a4-b0e4-5080b975ca9c',
    invite_accepted_at = now(),
    invite_token = null
WHERE email = 'workflowtesting21@gmail.com';

-- Add the role
INSERT INTO user_roles (user_id, role, department)
VALUES ('f97cbd14-94f2-43a4-b0e4-5080b975ca9c', 'spa_worker', null)
ON CONFLICT DO NOTHING;
```

---

## Summary

The fix is straightforward: ensure all `ON CONFLICT` clauses reference the full 3-column unique constraint `(user_id, role, department)` by including `department` in the INSERT statements.

