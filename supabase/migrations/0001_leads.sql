create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  operative text not null,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp text,
  institute text,
  role text,
  objective text,
  objective_other text,
  force_size text,
  deploy_window text,
  vr_headsets text,
  live_demo text
);

alter table public.leads enable row level security;

create or replace function public.sanitise_lead()
returns trigger
language plpgsql
as $$
begin
  new.operative := left(regexp_replace(coalesce(new.operative, ''), '<[^>]*>', '', 'g'), 120);
  new.institute := left(regexp_replace(coalesce(new.institute, ''), '<[^>]*>', '', 'g'), 120);
  new.objective_other := left(regexp_replace(coalesce(new.objective_other, ''), '<[^>]*>', '', 'g'), 500);
  new.email := left(lower(coalesce(new.email, '')), 254);
  new.whatsapp := left(coalesce(new.whatsapp, ''), 20);
  new.role := left(coalesce(new.role, ''), 500);
  new.objective := left(coalesce(new.objective, ''), 500);
  new.force_size := left(coalesce(new.force_size, ''), 500);
  new.deploy_window := left(coalesce(new.deploy_window, ''), 500);
  new.vr_headsets := left(coalesce(new.vr_headsets, ''), 500);
  new.live_demo := left(coalesce(new.live_demo, ''), 500);
  return new;
end;
$$;

create or replace function public.check_rate_limit()
returns trigger
language plpgsql
as $$
declare
  recent_count integer;
begin
  select count(*)
  into recent_count
  from public.leads
  where email = new.email
    and created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;

  return new;
end;
$$;

drop trigger if exists a_sanitise_lead_before_insert on public.leads;
create trigger a_sanitise_lead_before_insert
before insert on public.leads
for each row
execute function public.sanitise_lead();

drop trigger if exists b_check_rate_limit_before_insert on public.leads;
create trigger b_check_rate_limit_before_insert
before insert on public.leads
for each row
execute function public.check_rate_limit();

drop policy if exists anon_insert_only on public.leads;
create policy anon_insert_only
on public.leads
for insert
to anon
with check (true);

