
-- Drop old storage bucket and its policies
DELETE FROM storage.objects WHERE bucket_id = 'e3-documents';
DROP POLICY IF EXISTS "Authenticated users can upload e3 documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view e3 documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete e3 documents" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'e3-documents';

-- Create proper bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'e3-booking-documents',
  'e3-booking-documents',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf','image/png','image/jpeg','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS: Coordinators upload only to their own bookings
CREATE POLICY "e3_coordinators_upload_own_docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'e3-booking-documents'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.e3_bookings b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.coordinator_id = public.e3_get_coordinator_id(auth.uid())
    )
  )
);

-- Coordinators read only their own booking docs; admins read all
CREATE POLICY "e3_read_own_or_admin_docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'e3-booking-documents'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.e3_bookings b
      WHERE b.id::text = (storage.foldername(name))[1]
        AND b.coordinator_id = public.e3_get_coordinator_id(auth.uid())
    )
  )
);

-- Admins can delete
CREATE POLICY "e3_admins_delete_docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'e3-booking-documents'
  AND public.is_admin(auth.uid())
);

-- Add document_type column to templates for mapping
ALTER TABLE public.e3_document_templates
ADD COLUMN IF NOT EXISTS doc_type_key text;

-- Set doc_type_key values for each template
UPDATE public.e3_document_templates SET doc_type_key = 'contract' WHERE template_name = 'Master Event Contract';
UPDATE public.e3_document_templates SET doc_type_key = 'cleaning' WHERE template_name = 'Cleaning Agreement';
UPDATE public.e3_document_templates SET doc_type_key = 'building_rules' WHERE template_name = 'Building Rules & Policies';
UPDATE public.e3_document_templates SET doc_type_key = 'alcohol_policy' WHERE template_name = 'Alcohol Policy';
UPDATE public.e3_document_templates SET doc_type_key = 'damage_policy' WHERE template_name = 'Damage Policy';
UPDATE public.e3_document_templates SET doc_type_key = 'cancellation_policy' WHERE template_name = 'Cancellation Policy';

-- Update e3_advance_to_yellow to enforce ALL required docs
CREATE OR REPLACE FUNCTION public.e3_advance_to_yellow(p_booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_booking record;
  v_deposit_hours integer;
  v_coordinator_id uuid;
  v_required_types text[];
  v_uploaded_types text[];
  v_missing text[];
BEGIN
  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());
  IF (v_coordinator_id IS NULL OR v_coordinator_id != v_booking.coordinator_id)
     AND NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  IF v_booking.booking_state != 'red_hold' THEN
    RETURN jsonb_build_object('error', 'Booking must be in red_hold state');
  END IF;

  -- Get all required document types (exclude alcohol_policy - conditional)
  v_required_types := ARRAY['contract', 'cleaning', 'building_rules', 'damage_policy', 'cancellation_policy'];

  -- Get uploaded document types for this booking
  SELECT array_agg(DISTINCT document_type) INTO v_uploaded_types
  FROM public.e3_booking_documents
  WHERE booking_id = p_booking_id;

  IF v_uploaded_types IS NULL THEN
    v_uploaded_types := ARRAY[]::text[];
  END IF;

  -- Find missing required docs
  SELECT array_agg(rt) INTO v_missing
  FROM unnest(v_required_types) AS rt
  WHERE rt != ALL(v_uploaded_types);

  IF v_missing IS NOT NULL AND array_length(v_missing, 1) > 0 THEN
    RETURN jsonb_build_object(
      'error', 'Missing required documents: ' || array_to_string(v_missing, ', '),
      'missing_docs', to_jsonb(v_missing)
    );
  END IF;

  -- Verify each uploaded doc is tied to an active template version
  IF EXISTS (
    SELECT 1 FROM public.e3_booking_documents bd
    WHERE bd.booking_id = p_booking_id
      AND bd.template_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.e3_document_templates dt
        WHERE dt.id = bd.template_id AND dt.is_active = true
      )
  ) THEN
    RETURN jsonb_build_object('error', 'One or more documents reference an inactive template version. Please re-upload.');
  END IF;

  v_deposit_hours := COALESCE((public.e3_config_value('yellow_deposit_deadline_hours'))::int, 72);

  UPDATE public.e3_bookings
  SET booking_state = 'yellow_contract',
      deposit_due_at = now() + (v_deposit_hours || ' hours')::interval,
      expires_at = NULL
  WHERE id = p_booking_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('booking', p_booking_id, 'state_to_yellow_contract', auth.uid(),
    jsonb_build_object('state', 'red_hold'),
    jsonb_build_object('state', 'yellow_contract'));

  RETURN jsonb_build_object('success', true, 'deposit_due_at', now() + (v_deposit_hours || ' hours')::interval);
END;
$function$;
