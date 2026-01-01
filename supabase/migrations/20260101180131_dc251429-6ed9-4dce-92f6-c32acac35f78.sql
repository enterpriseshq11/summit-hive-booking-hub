-- Update VIP prizes with non-zero free_weight so free users can land on them
UPDATE prizes SET free_weight = 8 WHERE name = 'VIP Prize #1 (High Value)';
UPDATE prizes SET free_weight = 4 WHERE name = 'VIP Prize #2 (Very High Value)';
UPDATE prizes SET free_weight = 2 WHERE name = 'VIP Prize #3 (Mega Prize)';

-- Add is_vip_locked_hit column to spins table to track when free users land on VIP prizes
ALTER TABLE spins ADD COLUMN IF NOT EXISTS is_vip_locked_hit boolean DEFAULT false;

-- Tighten RLS on claims - only allow insert if spin belongs to user and not already claimed
DROP POLICY IF EXISTS "Users can insert their own claims" ON claims;
CREATE POLICY "Users can insert their own claims" ON claims
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM spins 
      WHERE spins.id = spin_id 
      AND spins.user_id = auth.uid()
      AND NOT EXISTS (SELECT 1 FROM claims c2 WHERE c2.spin_id = spins.id)
      AND (NOT spins.is_vip_locked_hit OR spins.is_vip_locked_hit IS NULL)
    )
  );