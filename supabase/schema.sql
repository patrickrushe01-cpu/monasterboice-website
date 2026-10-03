-- News posts
create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  image_url text,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- Bulletins (rolling 4-week window enforced in the app query)
create table if not exists bulletins (
  id uuid primary key default gen_random_uuid(),
  issue_date date not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

-- Contact form submissions
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table news_posts enable row level security;
alter table bulletins enable row level security;
alter table contact_messages enable row level security;

-- Public can read news & bulletins
create policy "Public read news" on news_posts for select using (true);
create policy "Public read bulletins" on bulletins for select using (true);

-- Only signed-in (admin) users can write news & bulletins
create policy "Admins write news" on news_posts for insert with check (auth.role() = 'authenticated');
create policy "Admins update news" on news_posts for update using (auth.role() = 'authenticated');
create policy "Admins delete news" on news_posts for delete using (auth.role() = 'authenticated');

create policy "Admins write bulletins" on bulletins for insert with check (auth.role() = 'authenticated');
create policy "Admins update bulletins" on bulletins for update using (auth.role() = 'authenticated');
create policy "Admins delete bulletins" on bulletins for delete using (auth.role() = 'authenticated');

-- Anyone can submit a contact message; only admins can read them
create policy "Public submit contact" on contact_messages for insert with check (true);
create policy "Admins read contact" on contact_messages for select using (auth.role() = 'authenticated');

-- Storage bucket for bulletin PDFs and news photos (create in Supabase dashboard or via API):
-- bucket name: parish-media (public read, authenticated write)

-- ---------- In-page editing (site_content) ----------
-- Holds text/photo edits made via "Edit this page". Key = element id (e.g. "home.hero.title").
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid()
);
alter table public.site_content enable row level security;
create policy "Public read site_content" on public.site_content for select to anon, authenticated using (true);
create policy "Admins insert site_content" on public.site_content for insert to authenticated with check (true);
create policy "Admins update site_content" on public.site_content for update to authenticated using (true) with check (true);
create policy "Admins delete site_content" on public.site_content for delete to authenticated using (true);

-- ---------- Parish accounts (Support Us page) ----------
create table if not exists public.parish_accounts (
  id uuid primary key default gen_random_uuid(),
  year int not null unique check (year between 2000 and 2100),
  file_url text not null,
  created_at timestamptz not null default now()
);
alter table public.parish_accounts enable row level security;
create policy "Public read parish_accounts" on public.parish_accounts for select to anon, authenticated using (true);
create policy "Admins insert parish_accounts" on public.parish_accounts for insert to authenticated with check (true);
create policy "Admins update parish_accounts" on public.parish_accounts for update to authenticated using (true) with check (true);
create policy "Admins delete parish_accounts" on public.parish_accounts for delete to authenticated using (true);

-- ---------- News stories (full text) ----------
alter table public.news_posts
  add column if not exists slug text,
  add column if not exists body text,          -- story text as simple Markdown
  add column if not exists category text,
  add column if not exists source_id bigint;   -- WordPress post ID (used by the one-off import)
create unique index if not exists news_posts_slug_key on public.news_posts (slug);
create unique index if not exists news_posts_source_id_key on public.news_posts (source_id);
create index if not exists news_posts_published_at_idx on public.news_posts (published_at desc);

-- ---------- Weekly bulletin email sign-ups ----------
create table if not exists public.bulletin_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  constraint bulletin_subscribers_email_ok check (
    email = lower(email) and length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);
alter table public.bulletin_subscribers enable row level security;
create policy "Admins read subscribers" on public.bulletin_subscribers for select to authenticated using (true);
create policy "Admins update subscribers" on public.bulletin_subscribers for update to authenticated using (true) with check (true);
create policy "Admins delete subscribers" on public.bulletin_subscribers for delete to authenticated using (true);

-- The public signs up ONLY through this function (no direct table access, so nobody can read the list
-- or tell whether an address is already subscribed).
create or replace function public.subscribe_to_bulletin(p_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare e text := lower(trim(p_email));
begin
  if e is null or length(e) > 254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if (select count(*) from public.bulletin_subscribers where created_at > now() - interval '1 minute') > 60 then
    raise exception 'too many requests' using errcode = '53400';
  end if;
  insert into public.bulletin_subscribers (email) values (e) on conflict (email) do nothing;
end; $$;
revoke all on function public.subscribe_to_bulletin(text) from public;
grant execute on function public.subscribe_to_bulletin(text) to anon, authenticated;

-- ---------- Contact form: staff can delete messages; size limits ----------
create policy "Admins delete contact" on public.contact_messages for delete to authenticated using (true);
alter table public.contact_messages
  add constraint contact_name_len    check (char_length(name)    between 1 and 120),
  add constraint contact_email_len   check (char_length(email)   between 3 and 254),
  add constraint contact_subject_len check (char_length(subject) between 1 and 200),
  add constraint contact_message_len check (char_length(message) between 1 and 4000);
