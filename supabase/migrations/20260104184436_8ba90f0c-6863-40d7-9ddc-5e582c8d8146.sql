-- Add 'canceled' to the payment_status enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'canceled' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'voice_vault_payment_status')
  ) THEN
    ALTER TYPE voice_vault_payment_status ADD VALUE 'canceled';
  END IF;
END
$$;