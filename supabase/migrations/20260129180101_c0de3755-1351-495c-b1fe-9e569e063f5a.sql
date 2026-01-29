-- Create a trigger function that automatically assigns spa_worker role when user_id is linked
CREATE OR REPLACE FUNCTION public.on_spa_worker_user_linked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when user_id changes from NULL to a value
  IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Insert spa_worker role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'spa_worker')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the auto-assignment
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

-- Create the trigger on spa_workers table
DROP TRIGGER IF EXISTS trigger_spa_worker_user_linked ON public.spa_workers;
CREATE TRIGGER trigger_spa_worker_user_linked
  AFTER UPDATE ON public.spa_workers
  FOR EACH ROW
  EXECUTE FUNCTION public.on_spa_worker_user_linked();