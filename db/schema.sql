create extension if not exists pgcrypto;

create table if not exists collaburo_app_config (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists collaburo_submissions (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default '',
  client_email text not null default '',
  event_space text not null default '',
  status text not null default 'In Discussion',
  total numeric(12, 2) not null default 0,
  payload jsonb not null,
  fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists collaburo_submissions_created_at_idx
  on collaburo_submissions (created_at desc);

create index if not exists collaburo_submissions_client_name_idx
  on collaburo_submissions (client_name);

create index if not exists collaburo_submissions_status_idx
  on collaburo_submissions (status);

create unique index if not exists collaburo_submissions_fingerprint_idx
  on collaburo_submissions (fingerprint)
  where fingerprint is not null;

-- Booking and contract links look records up by id or booking code inside payload.
create index if not exists collaburo_submissions_payload_id_idx
  on collaburo_submissions ((payload->>'id'));

create index if not exists collaburo_submissions_payload_booking_code_idx
  on collaburo_submissions ((payload->>'bookingCode'));

-- Append-only audit trail for admin/system actions and public milestones.
-- App code only INSERT + SELECT; no update/delete API.
create table if not exists collaburo_audit_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_type text not null,          -- admin | client | system
  actor_id text not null default '', -- username, email, or "system"
  action text not null,              -- e.g. booking.submitted
  resource_type text not null default '', -- booking | config | account | email | session
  resource_id text not null default '',
  outcome text not null default 'success', -- success | failure
  request_id text not null default '',
  ip text not null default '',
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists collaburo_audit_events_created_at_idx
  on collaburo_audit_events (created_at desc);

create index if not exists collaburo_audit_events_action_idx
  on collaburo_audit_events (action);

create index if not exists collaburo_audit_events_resource_idx
  on collaburo_audit_events (resource_type, resource_id);
