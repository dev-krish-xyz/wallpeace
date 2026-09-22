-- Categories move from a hardcoded list in the code to rows you can manage in admin.
create table public.categories (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null check (char_length(name) between 1 and 60),
  blurb      text check (blurb is null or char_length(blurb) <= 200),
  position   int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are public" on public.categories
  for select using (true);

create policy "Admins manage categories" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.categories (slug, name, blurb, position) values
  ('minimal', 'Minimal', 'Quiet compositions with room to breathe around your icons.', 1),
  ('dark', 'Dark', 'Low-light scenes that stay easy on the eyes after sunset.', 2),
  ('nature', 'Nature', 'Coastlines, forests, fields and skies.', 3),
  ('anime-illustration', 'Anime & Illustration', 'Illustrated worlds, full of small details.', 4),
  ('abstract', 'Abstract', 'Color, shape and texture on their own.', 5),
  ('architecture', 'Architecture', 'Temples, streets and towns worth wandering.', 6),
  ('space', 'Space', 'Planets, stars and the dark between them.', 7);

-- The fixed set is gone, so a wallpaper's categories can no longer be checked against a constant.
alter table public.wallpapers drop constraint wallpapers_collections_check;

-- Deleting a category also clears it from every wallpaper. The function runs as its owner to get
-- past RLS, so it checks the caller is an admin itself.
create function public.detach_category(p_slug text) returns void
  language plpgsql volatile security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  update public.wallpapers set collections = array_remove(collections, p_slug) where collections @> array[p_slug];
end;
$$;

revoke execute on function public.detach_category(text) from public;
grant execute on function public.detach_category(text) to authenticated;
