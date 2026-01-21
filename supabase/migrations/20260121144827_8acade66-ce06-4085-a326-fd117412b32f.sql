-- Fix: avoid ON CONFLICT on non-unique columns by using deterministic IDs + conditional insert/update.

-- 1) Ensure a dedicated paid bookable type exists for Book with Lindsey (100% due at checkout)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.bookable_types WHERE id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb') THEN
    UPDATE public.bookable_types
    SET
      business_id = '4df48af2-39e4-4bd1-a9b3-963de8ef39d7',
      name = 'Massage with Lindsey (Pay in Full)',
      slug = 'lindsey-massage',
      description = 'Paid bookings for the Book with Lindsey flow. Full amount is collected at checkout.',
      is_active = true,
      requires_deposit = true,
      deposit_percentage = 100,
      deposit_fixed_amount = NULL,
      allow_guest_checkout = true,
      updated_at = now()
    WHERE id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb';
  ELSE
    INSERT INTO public.bookable_types (
      id,
      business_id,
      name,
      slug,
      description,
      is_active,
      requires_deposit,
      deposit_percentage,
      deposit_fixed_amount,
      allow_guest_checkout,
      created_at,
      updated_at
    ) VALUES (
      'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      '4df48af2-39e4-4bd1-a9b3-963de8ef39d7',
      'Massage with Lindsey (Pay in Full)',
      'lindsey-massage',
      'Paid bookings for the Book with Lindsey flow. Full amount is collected at checkout.',
      true,
      true,
      100,
      NULL,
      true,
      now(),
      now()
    );
  END IF;
END $$;

-- 2) Create/update packages used by the Lindsey UI (stable IDs for frontend mapping)
DO $$
BEGIN
  -- Swedish 30
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = '4ad3f498-9b2f-4f7a-8a7c-0d438a4102a0') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Swedish Massage (30 min)',
      slug = 'lindsey-swedish-30',
      description = 'Relaxation focused, light to medium pressure.',
      duration_mins = 30,
      base_price = 45,
      is_active = true,
      sort_order = 10,
      updated_at = now()
    WHERE id = '4ad3f498-9b2f-4f7a-8a7c-0d438a4102a0';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('4ad3f498-9b2f-4f7a-8a7c-0d438a4102a0','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Swedish Massage (30 min)','lindsey-swedish-30','Relaxation focused, light to medium pressure.',30,45,true,10,now(),now());
  END IF;

  -- Swedish 60
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = '92cf8cba-7c2d-4a2b-b7c0-0d12e7b8a8f1') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Swedish Massage (60 min)',
      slug = 'lindsey-swedish-60',
      description = 'Relaxation focused, light to medium pressure.',
      duration_mins = 60,
      base_price = 80,
      is_active = true,
      sort_order = 20,
      updated_at = now()
    WHERE id = '92cf8cba-7c2d-4a2b-b7c0-0d12e7b8a8f1';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('92cf8cba-7c2d-4a2b-b7c0-0d12e7b8a8f1','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Swedish Massage (60 min)','lindsey-swedish-60','Relaxation focused, light to medium pressure.',60,80,true,20,now(),now());
  END IF;

  -- Deep Tissue 30
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = '09ad9a61-4b2a-4457-b260-1c7d98b0c1c2') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Deep Tissue Massage (30 min)',
      slug = 'lindsey-deep-tissue-30',
      description = 'Focused therapeutic work, deeper pressure.',
      duration_mins = 30,
      base_price = 55,
      is_active = true,
      sort_order = 30,
      updated_at = now()
    WHERE id = '09ad9a61-4b2a-4457-b260-1c7d98b0c1c2';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('09ad9a61-4b2a-4457-b260-1c7d98b0c1c2','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Deep Tissue Massage (30 min)','lindsey-deep-tissue-30','Focused therapeutic work, deeper pressure.',30,55,true,30,now(),now());
  END IF;

  -- Ashiatsu 60
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'a0c9e0c1-7f3f-4e2f-8b4f-9cfe0a6c5e7d') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Ashiatsu (60 min)',
      slug = 'lindsey-ashiatsu-60',
      description = 'Barefoot massage using overhead bars for balance; deep pressure for full body relief.',
      duration_mins = 60,
      base_price = 60,
      is_active = true,
      sort_order = 40,
      updated_at = now()
    WHERE id = 'a0c9e0c1-7f3f-4e2f-8b4f-9cfe0a6c5e7d';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('a0c9e0c1-7f3f-4e2f-8b4f-9cfe0a6c5e7d','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Ashiatsu (60 min)','lindsey-ashiatsu-60','Barefoot massage using overhead bars for balance; deep pressure for full body relief.',60,60,true,40,now(),now());
  END IF;

  -- Ashiatsu 90
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'b6bcb28e-9070-4dfc-9b0a-2a6bb1f5a2f4') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Ashiatsu (90 min)',
      slug = 'lindsey-ashiatsu-90',
      description = 'Barefoot massage using overhead bars for balance; deep pressure for full body relief.',
      duration_mins = 90,
      base_price = 90,
      is_active = true,
      sort_order = 50,
      updated_at = now()
    WHERE id = 'b6bcb28e-9070-4dfc-9b0a-2a6bb1f5a2f4';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('b6bcb28e-9070-4dfc-9b0a-2a6bb1f5a2f4','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Ashiatsu (90 min)','lindsey-ashiatsu-90','Barefoot massage using overhead bars for balance; deep pressure for full body relief.',90,90,true,50,now(),now());
  END IF;

  -- Couples 60 standard
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'c2dcedd2-7a5b-4db1-9c2b-e6d8f7d9e6a1') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Couples Massage (60 min)',
      slug = 'lindsey-couples-60',
      description = 'Side-by-side couples session. Standard pricing.',
      duration_mins = 60,
      base_price = 85,
      is_active = true,
      sort_order = 60,
      updated_at = now()
    WHERE id = 'c2dcedd2-7a5b-4db1-9c2b-e6d8f7d9e6a1';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('c2dcedd2-7a5b-4db1-9c2b-e6d8f7d9e6a1','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Couples Massage (60 min)','lindsey-couples-60','Side-by-side couples session. Standard pricing.',60,85,true,60,now(),now());
  END IF;

  -- Couples 90 standard
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'd1c1a3a2-4c5e-4f0a-8b0f-6a1f3c8e9b22') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Couples Massage (90 min)',
      slug = 'lindsey-couples-90',
      description = 'Side-by-side couples session. Standard pricing.',
      duration_mins = 90,
      base_price = 125,
      is_active = true,
      sort_order = 70,
      updated_at = now()
    WHERE id = 'd1c1a3a2-4c5e-4f0a-8b0f-6a1f3c8e9b22';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('d1c1a3a2-4c5e-4f0a-8b0f-6a1f3c8e9b22','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Couples Massage (90 min)','lindsey-couples-90','Side-by-side couples session. Standard pricing.',90,125,true,70,now(),now());
  END IF;

  -- Couples 60 promo
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'e5a0f2d1-1c61-4c73-8f1c-2c6a7c33e1d0') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Couples Massage (60 min) - Promo',
      slug = 'lindsey-couples-60-promo',
      description = 'Side-by-side couples session. Promo pricing (when active).',
      duration_mins = 60,
      base_price = 70,
      is_active = true,
      sort_order = 80,
      updated_at = now()
    WHERE id = 'e5a0f2d1-1c61-4c73-8f1c-2c6a7c33e1d0';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('e5a0f2d1-1c61-4c73-8f1c-2c6a7c33e1d0','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Couples Massage (60 min) - Promo','lindsey-couples-60-promo','Side-by-side couples session. Promo pricing (when active).',60,70,true,80,now(),now());
  END IF;

  -- Couples 90 promo
  IF EXISTS (SELECT 1 FROM public.packages WHERE id = 'f4b4b1c0-0d7e-4e21-9a0a-3c7e6b8d9f10') THEN
    UPDATE public.packages SET
      bookable_type_id = 'f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb',
      name = 'Couples Massage (90 min) - Promo',
      slug = 'lindsey-couples-90-promo',
      description = 'Side-by-side couples session. Promo pricing (when active).',
      duration_mins = 90,
      base_price = 95,
      is_active = true,
      sort_order = 90,
      updated_at = now()
    WHERE id = 'f4b4b1c0-0d7e-4e21-9a0a-3c7e6b8d9f10';
  ELSE
    INSERT INTO public.packages (id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order, created_at, updated_at)
    VALUES ('f4b4b1c0-0d7e-4e21-9a0a-3c7e6b8d9f10','f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb','Couples Massage (90 min) - Promo','lindsey-couples-90-promo','Side-by-side couples session. Promo pricing (when active).',90,95,true,90,now(),now());
  END IF;
END $$;