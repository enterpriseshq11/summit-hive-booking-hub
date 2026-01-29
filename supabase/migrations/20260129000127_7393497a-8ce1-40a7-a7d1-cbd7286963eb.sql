-- Enable realtime for bookings table so calendar views auto-update when bookings are cancelled/created/modified
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;