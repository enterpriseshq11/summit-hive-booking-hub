-- Fix the orphaned empty booking_number record
UPDATE public.bookings 
SET booking_number = 'AZ' || to_char(created_at, 'YYMMDD') || lpad(floor(random() * 1000000)::text, 6, '0')
WHERE booking_number = '';

-- Create the missing pending booking for Denise Raney's special claim
INSERT INTO public.bookings (
  business_id, bookable_type_id, status, guest_name, guest_email, guest_phone,
  start_datetime, end_datetime, subtotal, total_amount, notes,
  internal_notes, source_brand, booking_number
) VALUES (
  '7b31629d-69a1-47d7-83e5-a7cff7c46a5e',
  '6a1986fc-b50c-4c61-8076-c95554ca8fdb',
  'pending',
  'Denise Raney',
  'denise@telserco.com',
  '4192047275',
  now() + interval '24 hours',
  now() + interval '25 hours',
  0, 0,
  'SPECIAL REQUEST: Baby Shower Events',
  'REQUEST MODE — Special claim submission (manually backfilled)',
  'summit',
  'AZ' || to_char(now(), 'YYMMDD') || lpad(floor(random() * 1000000)::text, 6, '0')
);