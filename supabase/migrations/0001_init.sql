-- Wallpeace schema: metadata in Postgres, files in Storage.

create table public.wallpapers (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 120),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  file_url      text not null,
  width         int  not null check (width > 0),
  height        int  not null check (height > 0),
  featured      boolean not null default false,
  blur_data_url text,
  created_at    timestamptz not null default now()
);

create index wallpapers_created_idx on public.wallpapers (created_at desc);
create index wallpapers_featured_idx on public.wallpapers (created_at desc) where featured;

-- Admin allowlist. Add yourself once after first sign-in:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

alter table public.wallpapers enable row level security;
alter table public.admins enable row level security; -- no policies: invisible to clients

create policy "Wallpapers are public" on public.wallpapers
  for select using (true);

create policy "Admins manage wallpapers" on public.wallpapers
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Storage: public-read bucket, admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wallpapers', 'wallpapers', true, 104857600, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins read wallpaper objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'wallpapers' and (select public.is_admin()));

create policy "Admins upload wallpaper objects" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'wallpapers' and (select public.is_admin()));

create policy "Admins update wallpaper objects" on storage.objects
  for update to authenticated
  using (bucket_id = 'wallpapers' and (select public.is_admin()));

create policy "Admins delete wallpaper objects" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wallpapers' and (select public.is_admin()));
