create extension if not exists pg_net with schema extensions;

create or replace function public.fire_pipeline_stage_webhooks()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  cfg record;
  payload jsonb;
  request_id bigint;
  stage_labels jsonb := jsonb_build_object(
    'new', 'New Lead',
    'contact_attempted', 'Contact Attempted',
    'responded', 'Responded',
    'warm_lead', 'Warm Lead',
    'hot_lead', 'Hot Lead',
    'proposal_sent', 'Proposal Sent',
    'contract_sent', 'Contract Out',
    'deposit_pending', 'Deposit Received',
    'booked', 'Booked',
    'won', 'Completed',
    'completed', 'Completed',
    'lost', 'Lost',
    'follow_up_needed', 'Follow Up Needed',
    'no_response', 'No Response'
  );
begin
  if NEW.status is null then
    return NEW;
  end if;
  if OLD.status is not distinct from NEW.status then
    return NEW;
  end if;

  for cfg in
    select id, webhook_url
    from public.ghl_outbound_webhook_config
    where is_active = true
      and stage_key = NEW.status::text
      and webhook_url is not null
      and length(trim(webhook_url)) > 0
  loop
    payload := jsonb_build_object(
      'event', 'pipeline_stage_changed',
      'lead_id', NEW.id,
      'lead_name', NEW.lead_name,
      'email', NEW.email,
      'phone', NEW.phone,
      'business_unit', NEW.business_unit,
      'previous_stage_key', OLD.status,
      'previous_stage_name', stage_labels->>OLD.status::text,
      'new_stage_key', NEW.status,
      'new_stage_name', stage_labels->>NEW.status::text,
      'ghl_contact_id', NEW.ghl_contact_id,
      'source', NEW.source,
      'timestamp', now()
    );

    begin
      select net.http_post(
        url := cfg.webhook_url,
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := payload
      ) into request_id;

      update public.ghl_outbound_webhook_config
        set last_fired_at = now(),
            last_tested_at = now(),
            last_status = 'sent'
      where id = cfg.id;
    exception when others then
      update public.ghl_outbound_webhook_config
        set last_fired_at = now(),
            last_tested_at = now(),
            last_status = 'failed'
      where id = cfg.id;
    end;
  end loop;

  return NEW;
end;
$$;

drop trigger if exists trg_fire_pipeline_stage_webhooks on public.crm_leads;

create trigger trg_fire_pipeline_stage_webhooks
after update of status on public.crm_leads
for each row
when (OLD.status is distinct from NEW.status)
execute function public.fire_pipeline_stage_webhooks();