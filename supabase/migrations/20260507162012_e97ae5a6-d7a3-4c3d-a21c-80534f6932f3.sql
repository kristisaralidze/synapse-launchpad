create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references public.targets(id) on delete set null,
  scenario text,
  demo_mode boolean not null default true,
  status text not null default 'running',
  created_at timestamptz not null default now()
);

create table public.agent_thoughts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  step integer not null default 0,
  reasoning text,
  action text,
  observation text,
  created_at timestamptz not null default now()
);

create index agent_thoughts_campaign_idx on public.agent_thoughts(campaign_id, step);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index events_campaign_idx on public.events(campaign_id, created_at);

alter table public.campaigns enable row level security;
alter table public.agent_thoughts enable row level security;
alter table public.events enable row level security;

create policy "campaigns readable by anyone" on public.campaigns for select using (true);
create policy "campaigns insertable by anyone" on public.campaigns for insert with check (true);

create policy "agent_thoughts readable by anyone" on public.agent_thoughts for select using (true);
create policy "agent_thoughts insertable by anyone" on public.agent_thoughts for insert with check (true);

create policy "events readable by anyone" on public.events for select using (true);
create policy "events insertable by anyone" on public.events for insert with check (true);

alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.agent_thoughts;
alter publication supabase_realtime add table public.events;
alter table public.campaigns replica identity full;
alter table public.agent_thoughts replica identity full;
alter table public.events replica identity full;