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
