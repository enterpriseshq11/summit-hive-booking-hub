-- Fix type mismatch: entity_id is uuid, not text
-- Remove the ::text cast from NEW.id

CREATE OR REPLACE FUNCTION public.on_spa_worker_user_linked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when user_id changes from NULL to a value
  IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Use all 3 columns in ON CONFLICT to match the constraint (user_id, role, department)
    INSERT INTO public.user_roles (user_id, role, department)
    VALUES (NEW.user_id, 'spa_worker', NULL)
    ON CONFLICT (user_id, role, department) DO NOTHING;
    
    -- Log the auto-assignment (entity_id is uuid, so pass NEW.id directly)
    INSERT INTO public.audit_log (
      action_type,
      entity_type,
      entity_id,
      actor_user_id,
      after_json
    ) VALUES (
      'spa_worker_role_auto_assigned',
      'user_roles',
      NEW.id,
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