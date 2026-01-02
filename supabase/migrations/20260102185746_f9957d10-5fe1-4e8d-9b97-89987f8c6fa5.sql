-- Drop existing wheel_segments and prizes if needed - we're rebuilding
-- First let's create the new entry-based system

-- Giveaway draws table (monthly drawings)
CREATE TABLE IF NOT EXISTS public.giveaway_draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_key TEXT NOT NULL, -- e.g. "2026-01"
  draw_date TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month' - interval '1 day'),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'locked', 'drawn', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Giveaway entry types
CREATE TABLE IF NOT EXISTS public.giveaway_entry_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- general, massage, pt, vip_bonus
  label TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default entry types
INSERT INTO public.giveaway_entry_types (code, label) VALUES
  ('general', 'General Entries'),
  ('massage', 'Massage Drawing Entries'),
  ('pt', 'Personal Training Drawing Entries'),
  ('vip_bonus', 'VIP Bonus Entries')
ON CONFLICT (code) DO NOTHING;

-- Giveaway entries (accumulates user entries)
CREATE TABLE IF NOT EXISTS public.giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL, -- e.g. "2026-01"
  entry_type TEXT NOT NULL, -- general, massage, pt, vip_bonus
  quantity INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'spin', -- spin, bonus, vip_multiplier, streak
  spin_id UUID REFERENCES public.spins(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Giveaway winners
CREATE TABLE IF NOT EXISTS public.giveaway_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES public.giveaway_draws(id),
  entry_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  winner_name_public TEXT, -- e.g. "Dylan L."
  announced_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Wheel config table for admin-editable segment weights
CREATE TABLE IF NOT EXISTS public.wheel_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_index INTEGER NOT NULL, -- 1-8
  label TEXT NOT NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('miss', 'entry', 'category_entry')),
  entry_type TEXT, -- null for miss, 'general' for entry, 'massage'/'pt' for category
  entry_quantity INTEGER DEFAULT 0,
  icon TEXT, -- emoji or icon name
  free_weight INTEGER NOT NULL DEFAULT 10,
  vip_weight INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(segment_index)
);

-- Insert default wheel segments (8 total)
INSERT INTO public.wheel_config (segment_index, label, outcome_type, entry_type, entry_quantity, icon, free_weight, vip_weight) VALUES
  (1, 'SO CLOSE', 'miss', NULL, 0, '❌', 18, 14),
  (2, '+1 Entry', 'entry', 'general', 1, '🎟️', 14, 20),
  (3, 'Almost!', 'miss', NULL, 0, '🔥', 18, 14),
  (4, '+2 Entries', 'entry', 'general', 2, '🎟️', 10, 16),
  (5, 'Not Today', 'miss', NULL, 0, '😅', 18, 14),
  (6, 'Massage Entry', 'category_entry', 'massage', 3, '💆', 2, 4),
  (7, 'Try Again', 'miss', NULL, 0, '🎰', 18, 14),
  (8, 'PT Entry', 'category_entry', 'pt', 3, '💪', 2, 4)
ON CONFLICT (segment_index) DO NOTHING;

-- App config for VIP multiplier
INSERT INTO public.app_config (key, value, description) VALUES
  ('vip_entry_multiplier', '2', 'Multiplier applied to VIP entry wins'),
  ('streak_bonus_days', '3', 'Days in a row needed for streak bonus'),
  ('streak_bonus_entries', '5', 'Entries awarded for free user streak'),
  ('vip_streak_bonus_entries', '10', 'Entries awarded for VIP user streak')
ON CONFLICT (key) DO NOTHING;

-- User streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  last_spin_date DATE,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.giveaway_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entry_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for giveaway_draws (public read, admin write)
CREATE POLICY "Anyone can view draws" ON public.giveaway_draws FOR SELECT USING (true);

-- RLS Policies for giveaway_entry_types (public read)
CREATE POLICY "Anyone can view entry types" ON public.giveaway_entry_types FOR SELECT USING (true);

-- RLS Policies for giveaway_entries
CREATE POLICY "Users can view their own entries" ON public.giveaway_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert entries" ON public.giveaway_entries FOR INSERT WITH CHECK (true);

-- RLS Policies for giveaway_winners (public read published only)
CREATE POLICY "Anyone can view announced winners" ON public.giveaway_winners FOR SELECT USING (announced_at IS NOT NULL);

-- RLS Policies for wheel_config (public read)
CREATE POLICY "Anyone can view wheel config" ON public.wheel_config FOR SELECT USING (true);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage streaks" ON public.user_streaks FOR ALL USING (true);

-- Index for faster entry queries
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user_month ON public.giveaway_entries(user_id, month_key);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_type_month ON public.giveaway_entries(entry_type, month_key);