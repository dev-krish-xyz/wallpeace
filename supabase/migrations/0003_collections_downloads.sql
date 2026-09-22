-- Collections: each wallpaper can sit in any of a fixed set (mirrors lib/collections.ts).
alter table public.wallpapers
  add column collections text[] not null default '{}'
    check (collections <@ array['minimal', 'dark', 'nature', 'anime-illustration', 'abstract', 'architecture', 'space']);

create index wallpapers_collections_idx on public.wallpapers using gin (collections);

-- Popularity: counted by the /w/[slug]/download route.
alter table public.wallpapers add column downloads int not null default 0 check (downloads >= 0);

-- Visitors can't update rows (RLS), so the counter goes through this narrow definer function.
create function public.count_download(p_slug text) returns void
  language sql volatile security definer set search_path = ''
as $$
  update public.wallpapers set downloads = downloads + 1 where slug = p_slug
$$;

revoke execute on function public.count_download(text) from public;
grant execute on function public.count_download(text) to anon, authenticated;

-- Starting collections for the launch library.
update public.wallpapers set collections = array['anime-illustration'];
update public.wallpapers set collections = collections || array['nature'] where slug in
  ('car2-4k', 'mountain-beach-4k', 'wall3-4k', 'wall14-4k', 'wall8-4k', 'wall17-4k', 'wall18-4k', 'wall13-4k', 'wall15-4k', 'wall4-4k');
update public.wallpapers set collections = collections || array['architecture'] where slug in
  ('mountain-beach-4k', 'wall6-4k', 'wall8-4k', 'wall18-4k-1', 'wall12-4k', 'wall5-4k', 'wall4-4k');
update public.wallpapers set collections = collections || array['dark'] where slug in ('wall12-4k');
