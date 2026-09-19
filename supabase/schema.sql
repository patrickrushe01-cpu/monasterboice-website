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
