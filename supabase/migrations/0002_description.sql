-- Optional human-written description per wallpaper: shown on its page and used for search snippets.
alter table public.wallpapers
  add column description text check (description is null or char_length(description) between 1 and 300);
