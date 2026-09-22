-- Descriptive titles and matching slugs, in place of the filenames the uploads came in with.
-- Slugs change too: the pages carry the wallpaper's subject in their URL, which is what search
-- engines read. Nothing was indexed under the old slugs yet.
update public.wallpapers as w set title = v.title, slug = v.slug
from (values
  ('sea-4k',            'Mediterranean Coastal Village 4K',     'mediterranean-coastal-village-4k'),
  ('mountainhouse-4k',  'Sunrise Over Rice Fields 4K',          'sunrise-over-rice-fields-4k'),
  ('lakehouse-4k',      'Red Cabin on an Alpine Lake 4K',       'red-cabin-alpine-lake-4k'),
  ('japanst-4k',        'Quiet Japanese Street in Summer 4K',   'quiet-japanese-street-summer-4k'),
  ('japan-street-4k',   'Japanese Street at Dusk 4K',           'japanese-street-at-dusk-4k'),
  ('car2-4k',           'Sports Car on a Country Road 4K',      'sports-car-country-road-4k'),
  ('mountain-beach-4k', 'Mediterranean Bay and Cliff Town 4K',  'mediterranean-bay-cliff-town-4k'),
  ('wall3-4k',          'Sunset Over Misty Hills 4K',           'sunset-over-misty-hills-4k'),
  ('wall6-4k',          'Cherry Blossom Tokyo Skyline 4K',      'cherry-blossom-tokyo-skyline-4k'),
  ('wall14-4k',         'Giant Tree Island 4K',                 'giant-tree-island-4k'),
  ('wall8-4k',          'Glowing Torii Gate in the Forest 4K',  'glowing-torii-gate-forest-4k'),
  ('wall17-4k',         'Samurai at Sunset in Wheat Fields 4K', 'samurai-sunset-wheat-fields-4k'),
  ('wall18-4k',         'Samurai by a Maple Waterfall 4K',      'samurai-maple-waterfall-4k'),
  ('wall18-4k-1',       'Sakura Shopping Street 4K',            'sakura-shopping-street-4k'),
  ('wall12-4k',         'Japanese Village at Night 4K',         'japanese-village-at-night-4k'),
  ('wall13-4k',         'Traveler and Dogs on a Green Street 4K','traveler-dogs-green-street-4k'),
  ('wall15-4k',         'Pirate Ship on a Tropical Beach 4K',   'pirate-ship-tropical-beach-4k'),
  ('wall5-4k',          'Pagoda Over a Cherry Blossom City 4K', 'pagoda-cherry-blossom-city-4k'),
  ('wall4-4k',          'Archer in a Bamboo Forest 4K',         'archer-bamboo-forest-4k')
) as v(old_slug, title, slug)
where w.slug = v.old_slug;

-- Categories for the five wallpapers uploaded after 0003.
update public.wallpapers set collections = array['anime-illustration', 'nature', 'architecture']
  where slug in ('mediterranean-coastal-village-4k', 'sunrise-over-rice-fields-4k', 'red-cabin-alpine-lake-4k');
update public.wallpapers set collections = array['anime-illustration', 'architecture']
  where slug in ('quiet-japanese-street-summer-4k', 'japanese-street-at-dusk-4k');
