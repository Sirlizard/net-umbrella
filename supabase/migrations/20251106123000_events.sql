-- Create events table and event_tags (event_participants)

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  date timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.event_tags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  friend_id uuid references public.friends(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_events_user on public.events(user_id);
create index if not exists idx_event_tags_event on public.event_tags(event_id);
create index if not exists idx_event_tags_friend on public.event_tags(friend_id);

-- Enable Row Level Security and policies so users only access their own events
alter table if exists public.events enable row level security;
create policy if not exists events_owner on public.events for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table if exists public.event_tags enable row level security;
create policy if not exists event_tags_owner on public.event_tags for all using (
  exists (select 1 from public.events e where e.id = public.event_tags.event_id and e.user_id = auth.uid())
) with check (
  exists (select 1 from public.events e where e.id = public.event_tags.event_id and e.user_id = auth.uid())
);

