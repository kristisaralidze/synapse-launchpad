create table public.targets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  company text,
  role text,
  created_at timestamptz not null default now()
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.targets(id) on delete cascade,
  score integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create index scores_target_id_idx on public.scores(target_id);

alter table public.targets enable row level security;
alter table public.scores enable row level security;

create policy "targets readable by anyone" on public.targets for select using (true);
create policy "targets insertable by anyone" on public.targets for insert with check (true);

create policy "scores readable by anyone" on public.scores for select using (true);
create policy "scores insertable by anyone" on public.scores for insert with check (true);

alter publication supabase_realtime add table public.scores;
alter publication supabase_realtime add table public.targets;
alter table public.scores replica identity full;
alter table public.targets replica identity full;