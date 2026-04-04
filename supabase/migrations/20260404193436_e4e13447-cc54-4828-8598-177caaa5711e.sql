-- Facebook Ad Campaigns
CREATE TABLE IF NOT EXISTS public.facebook_ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text UNIQUE NOT NULL,
  campaign_name text NOT NULL,
  date date NOT NULL,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  leads integer DEFAULT 0,
  cost_per_lead numeric,
  platform text DEFAULT 'facebook',
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.facebook_ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage facebook ads" ON public.facebook_ad_campaigns
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Ads lead can view facebook ads" ON public.facebook_ad_campaigns
  FOR SELECT USING (public.has_role(auth.uid(), 'ads_lead'));

-- Google Ad Campaigns
CREATE TABLE IF NOT EXISTS public.google_ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text UNIQUE NOT NULL,
  campaign_name text NOT NULL,
  date date NOT NULL,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  leads integer DEFAULT 0,
  cost_per_lead numeric,
  platform text DEFAULT 'google',
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.google_ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage google ads" ON public.google_ad_campaigns
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Ads lead can view google ads" ON public.google_ad_campaigns
  FOR SELECT USING (public.has_role(auth.uid(), 'ads_lead'));

-- PandaDoc Template Tags
CREATE TABLE IF NOT EXISTS public.pandadoc_template_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  business_unit text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, business_unit)
);

ALTER TABLE public.pandadoc_template_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage template tags" ON public.pandadoc_template_tags
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Manager can view template tags" ON public.pandadoc_template_tags
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Add UTM fields to crm_leads
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS utm_term text;