-- The resolution word is a badge derived from the pixels stored at upload, not part of the name.
-- Addresses stay as they are, including the trailing -4k.
update public.wallpapers
set title = regexp_replace(title, '[[:space:]]+(2K|4K|5K|8K)$', '')
where title ~ '[[:space:]]+(2K|4K|5K|8K)$';
