-- Add 'showed' status to booking_status enum for spa appointment tracking
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'showed';
