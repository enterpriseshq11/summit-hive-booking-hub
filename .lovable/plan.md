
# Fix: Worker Invite Role Assignment - Type Mismatch Bug

## Problem Summary

The worker invite flow is completely broken due to a **type mismatch error** in the database trigger. When a worker creates their account:

1. The `activate-spa-worker` edge function tries to update `spa_workers.user_id`
2. This triggers `on_spa_worker_user_linked()` 
3. The trigger tries to insert `NEW.id::text` into `audit_log.entity_id` which is a `uuid` column
4. PostgreSQL throws: `column "entity_id" is of type uuid but expression is of type text`
5. The entire transaction rolls back
6. Worker has no `user_id` linked, no role assigned
7. Login routing treats them as a customer

**Evidence from logs:**
```
ERROR Failed to update worker: {
  code: "42804",
  message: 'column "entity_id" is of type uuid but expression is of type text'
}
```

**Current database state:** All test workers have `user_id: null` and `role: null` - the activation never completed.

---

## Solution

Fix the type mismatch in both the database trigger and the edge function by removing the `::text` cast.

---

## Technical Implementation

### Step 1: Database Migration - Fix Trigger Function

Update `on_spa_worker_user_linked()` to use `NEW.id` directly (it's already a uuid):

```sql
CREATE OR REPLACE FUNCTION public.on_spa_worker_user_linked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, department)
    VALUES (NEW.user_id, 'spa_worker', NULL)
    ON CONFLICT (user_id, role, department) DO NOTHING;
    
    INSERT INTO public.audit_log (
      action_type,
      entity_type,
      entity_id,           -- uuid column
      actor_user_id,
      after_json
    ) VALUES (
      'spa_worker_role_auto_assigned',
      'user_roles',
      NEW.id,              -- Remove ::text cast - already uuid
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

Fix `supabase/functions/activate-spa-worker/index.ts` line 124 - the `entity_id` should not have the `worker.id` wrapped in any way, just pass it as-is since it's already a uuid:

```typescript
// Line 122-133: No change needed - worker.id is already a uuid string
// The edge function passes it correctly, the issue is only in the trigger
```

Actually, reviewing the edge function - it passes `worker.id` directly which is correct. The only fix needed is the database trigger.

### Step 3: Redeploy Edge Function

After the trigger is fixed, redeploy the edge function (or just test - the fix is in the database).

---

## Files to Modify

| File | Action |
|------|--------|
| New SQL Migration | Fix `on_spa_worker_user_linked()` - remove `::text` cast |
| No edge function changes needed | The function itself is correct |

---

## Testing After Fix

1. Create a **new worker invite** from Admin → Workers
2. Open invite link → Create Account → Set password
3. Verify email (click link in email)
4. Sign in with worker credentials
5. **Expected**: Land on `/admin/my-schedule` (restricted worker dashboard)
6. **Verify**: Worker does NOT see "Workers" tab, only their own schedule

---

## Root Cause Summary

The trigger function was incorrectly casting a uuid to text before inserting into a uuid column:
- **Wrong**: `NEW.id::text` → text type
- **Correct**: `NEW.id` → uuid type (matches `audit_log.entity_id`)
