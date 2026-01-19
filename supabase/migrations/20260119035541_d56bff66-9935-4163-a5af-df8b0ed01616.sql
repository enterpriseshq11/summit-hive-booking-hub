-- Add username column to profiles table for username-based login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text;

-- Create unique index for case-insensitive username lookups
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx 
ON public.profiles (LOWER(username));

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx 
ON public.profiles (username);

-- Add check constraint for valid username format (alphanumeric, underscores, 3-30 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    LENGTH(username) >= 3 AND 
    LENGTH(username) <= 30 AND 
    username ~ '^[a-zA-Z0-9_]+$'
  )
);