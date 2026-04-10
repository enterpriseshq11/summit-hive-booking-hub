-- Delete lead_intake_submissions referencing duplicate leads (keeping oldest per ghl_contact_id)
DELETE FROM lead_intake_submissions
WHERE lead_id IN (
  SELECT id FROM crm_leads
  WHERE ghl_contact_id IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (ghl_contact_id) id
    FROM crm_leads
    WHERE ghl_contact_id IS NOT NULL
    ORDER BY ghl_contact_id, created_at ASC
  )
);

-- Delete crm_activity_events referencing duplicate leads
DELETE FROM crm_activity_events
WHERE entity_id::text IN (
  SELECT id::text FROM crm_leads
  WHERE ghl_contact_id IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (ghl_contact_id) id
    FROM crm_leads
    WHERE ghl_contact_id IS NOT NULL
    ORDER BY ghl_contact_id, created_at ASC
  )
);

-- Delete the duplicate leads themselves
DELETE FROM crm_leads
WHERE ghl_contact_id IS NOT NULL
AND id NOT IN (
  SELECT DISTINCT ON (ghl_contact_id) id
  FROM crm_leads
  WHERE ghl_contact_id IS NOT NULL
  ORDER BY ghl_contact_id, created_at ASC
);