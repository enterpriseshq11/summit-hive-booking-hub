-- Backfill slugs for existing workers with collision handling
DO $$
DECLARE
  worker_rec RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INT;
BEGIN
  FOR worker_rec IN 
    SELECT id, display_name 
    FROM spa_workers 
    WHERE slug IS NULL AND display_name IS NOT NULL
  LOOP
    base_slug := lower(regexp_replace(regexp_replace(worker_rec.display_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));
    final_slug := base_slug;
    counter := 1;
    
    -- Check for collision and add suffix if needed
    WHILE EXISTS (SELECT 1 FROM spa_workers WHERE slug = final_slug) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    UPDATE spa_workers SET slug = final_slug WHERE id = worker_rec.id;
  END LOOP;
END $$;