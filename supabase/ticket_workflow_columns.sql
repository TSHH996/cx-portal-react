alter table public.tickets
  add column if not exists complaint_at timestamptz,
  add column if not exists created_by_name text,
  add column if not exists created_by_email text,
  add column if not exists initial_action_taken text,
  add column if not exists initial_action_type text,
  add column if not exists initial_customer_contact_status text,
  add column if not exists initial_customer_satisfied text,
  add column if not exists initial_resolution_details text,
  add column if not exists initial_action_recorded_at timestamptz,
  add column if not exists resolution_action_type text,
  add column if not exists customer_contact_status text,
  add column if not exists customer_satisfied text,
  add column if not exists resolution_date timestamptz,
  add column if not exists resolution_handled_by text,
  add column if not exists resolution_details text,
  add column if not exists resolution_updated_at timestamptz;

update public.tickets
set complaint_at = created_at
where complaint_at is null;

update public.tickets
set initial_action_taken = 'No'
where initial_action_taken is null;
