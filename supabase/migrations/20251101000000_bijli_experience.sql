-- Bijli Experience core schema

create table if not exists bijli_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  loyalty_score integer not null default 0,
  streak_days integer not null default 0,
  streak_updated_at timestamptz,
  last_mood text check (last_mood in ('roast','hype','care')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists bijli_highlights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references bijli_sessions(id) on delete cascade,
  category text not null check (category in ('punchline','support','vibe')),
  quote text not null,
  caption text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bijli_snippet_shares (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references bijli_sessions(id) on delete cascade,
  highlight_id uuid references bijli_highlights(id) on delete set null,
  share_channel text,
  consent boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bijli_loyalty_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references bijli_sessions(id) on delete cascade,
  event_type text not null,
  value integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bijli_daily_recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  recap_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, recap_date)
);

create table if not exists bijli_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  threshold integer not null default 0,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists bijli_user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  badge_id uuid not null references bijli_badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_bijli_sessions_user on bijli_sessions(user_id);
create index if not exists idx_bijli_sessions_match on bijli_sessions(match_id);
create index if not exists idx_bijli_highlights_session on bijli_highlights(session_id);
create index if not exists idx_bijli_highlights_category on bijli_highlights(category);
create index if not exists idx_bijli_snippets_session on bijli_snippet_shares(session_id);
create index if not exists idx_bijli_loyalty_session on bijli_loyalty_events(session_id);
create index if not exists idx_bijli_loyalty_type on bijli_loyalty_events(event_type);
create index if not exists idx_bijli_recaps_user on bijli_daily_recaps(user_id);
create index if not exists idx_bijli_user_badges_user on bijli_user_badges(user_id);

alter table bijli_sessions enable row level security;
alter table bijli_highlights enable row level security;
alter table bijli_snippet_shares enable row level security;
alter table bijli_loyalty_events enable row level security;
alter table bijli_daily_recaps enable row level security;
alter table bijli_badges enable row level security;
alter table bijli_user_badges enable row level security;

-- Policies
create policy if not exists "bijli sessions owner select" on bijli_sessions
  for select using (auth.uid() = user_id);
create policy if not exists "bijli sessions owner insert" on bijli_sessions
  for insert with check (auth.uid() = user_id);
create policy if not exists "bijli sessions owner modify" on bijli_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "bijli sessions owner delete" on bijli_sessions
  for delete using (auth.uid() = user_id);

create policy if not exists "bijli highlights owner select" on bijli_highlights
  for select using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_highlights.session_id
    )
  );
create policy if not exists "bijli highlights owner insert" on bijli_highlights
  for insert with check (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_highlights.session_id
    )
  );
create policy if not exists "bijli highlights owner modify" on bijli_highlights
  for update using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_highlights.session_id
    )
  ) with check (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_highlights.session_id
    )
  );
create policy if not exists "bijli highlights owner delete" on bijli_highlights
  for delete using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_highlights.session_id
    )
  );

create policy if not exists "bijli snippets owner select" on bijli_snippet_shares
  for select using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_snippet_shares.session_id
    )
  );
create policy if not exists "bijli snippets owner insert" on bijli_snippet_shares
  for insert with check (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_snippet_shares.session_id
    )
  );
create policy if not exists "bijli snippets owner modify" on bijli_snippet_shares
  for update using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_snippet_shares.session_id
    )
  ) with check (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_snippet_shares.session_id
    )
  );
create policy if not exists "bijli snippets owner delete" on bijli_snippet_shares
  for delete using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_snippet_shares.session_id
    )
  );

create policy if not exists "bijli loyalty owner select" on bijli_loyalty_events
  for select using (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_loyalty_events.session_id
    )
  );
create policy if not exists "bijli loyalty owner insert" on bijli_loyalty_events
  for insert with check (
    auth.uid() = (
      select s.user_id from bijli_sessions s where s.id = bijli_loyalty_events.session_id
    )
  );

create policy if not exists "bijli recaps owner select" on bijli_daily_recaps
  for select using (auth.uid() = user_id);
create policy if not exists "bijli recaps owner insert" on bijli_daily_recaps
  for insert with check (auth.uid() = user_id);
create policy if not exists "bijli recaps owner modify" on bijli_daily_recaps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "bijli recaps owner delete" on bijli_daily_recaps
  for delete using (auth.uid() = user_id);

create policy if not exists "bijli badges view" on bijli_badges
  for select using (true);

create policy if not exists "bijli user badges owner select" on bijli_user_badges
  for select using (auth.uid() = user_id);
create policy if not exists "bijli user badges owner insert" on bijli_user_badges
  for insert with check (auth.uid() = user_id);
create policy if not exists "bijli user badges owner delete" on bijli_user_badges
  for delete using (auth.uid() = user_id);

create or replace function bijli_touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger bijli_sessions_touch
  before update on bijli_sessions
  for each row execute function bijli_touch_updated_at();

create trigger bijli_highlights_touch
  before update on bijli_highlights
  for each row execute function bijli_touch_updated_at();

insert into bijli_badges (slug, label, description, threshold, category)
values
  ('certified-drama-queen', 'Certified Drama Queen', 'Earned for 10 savage roasts loved by matches', 10, 'roast'),
  ('calm-champ', 'Calm Champ', 'Earned for keeping three tense chats chill in a week', 3, 'care')
on conflict (slug) do nothing;
