-- Add source_brand to bookings for explicit page/brand routing
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS source_brand TEXT;

-- Backfill source_brand for existing rows using business type
UPDATE public.bookings b
SET source_brand = CASE biz.type::text
  WHEN 'coworking' THEN 'hive'
  WHEN 'event_center' THEN 'summit'
  WHEN 'photo_booth' THEN 'photo_booth_360'
  WHEN 'voice_vault' THEN 'voice_vault'
  ELSE NULL
END
FROM public.businesses biz
WHERE biz.id = b.business_id
  AND b.source_brand IS NULL;

-- Scheduled reminders need to target both staff + customer
ALTER TABLE public.scheduled_reminders
ADD COLUMN IF NOT EXISTS recipient_type TEXT NOT NULL DEFAULT 'customer';

-- Ensure reminder uniqueness per booking + type + recipient
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'scheduled_reminders_booking_type_recipient_uidx'
  ) THEN
    CREATE UNIQUE INDEX scheduled_reminders_booking_type_recipient_uidx
      ON public.scheduled_reminders (booking_id, reminder_type, recipient_type);
  END IF;
END $$;
