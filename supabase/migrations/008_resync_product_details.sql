-- Re-sync product detail copy in environments where migration 006 was missed.
-- Safe to run multiple times; updates by product name.

alter table public.products add column if not exists ingredients text;
alter table public.products add column if not exists highlights text;
alter table public.products add column if not exists serving_size text;

update public.products set price = 6.99;

update public.products
set
  price = 6.99,
  serving_size = '12 FL OZ (355 mL)',
  description = $d$
A light, refreshing botanical blend crafted to hydrate, restore, and gently energize your body.
$d$,
  ingredients = $i$
Filtered water
Hibiscus -> antioxidant-rich, supports heart health
Lemon -> cleansing and refreshing
Honey -> natural smooth sweetness
Dates -> balanced, natural energy
$i$,
  highlights = $h$
A timeless tradition for modern wellness
Light and refreshing
Naturally hydrating
Rich in antioxidants
Smooth, clean taste
$h$
where name = 'Hibiscus Bloom';

update public.products
set
  price = 6.99,
  serving_size = '12 FL OZ (355 mL)',
  description = $d$
A refreshing blend designed to awaken your body naturally. Ginger Citrus delivers clean, balanced energy without the harsh bite or artificial boost.
$d$,
  ingredients = $i$
Filtered water
Ginger -> supports circulation & digestion
Lemon -> detoxifying & refreshing
Orange -> natural sweetness + vitamin C
Honey & dates -> smooth, natural energy
$i$,
  highlights = $h$
Energize from within
Clean, natural energy
Supports digestion
Refreshing + uplifting
No artificial ingredients
$h$
where name = 'Ginger Citrus';

update public.products
set
  price = 6.99,
  serving_size = '12 FL OZ (355 mL)',
  description = $d$
A rich, nutrient-dense blend crafted to support vitality, strength, and overall wellness.
$d$,
  ingredients = $i$
Filtered water
Carrot -> rich in vitamin A & antioxidants
Lemon -> refreshing balance
Ginger -> digestive support
Honey & dates -> natural sweetness
$i$,
  highlights = $h$
Nourish & strengthen
Nutrient-rich
Supports immunity
Smooth & satisfying
Naturally energizing
$h$
where name = 'Carrot Vital';

update public.products
set
  price = 6.99,
  serving_size = '12 FL OZ (355 mL)',
  description = $d$
Prime Rise Golden Restore is a vibrant botanical blend crafted to support recovery, balance, and vitality. Infused with turmeric, pineapple, and ginger, it helps restore your body naturally from within.
$d$,
  ingredients = $i$
Filtered water, pineapple extract, turmeric root, ginger extract, lemon juice, natural sweetener (dates/honey).
$i$,
  highlights = $h$
Anti-inflammatory support
Supports immunity
Naturally energizing
100% natural ingredients
Drink with intention. Rise with purpose.
$h$
where name = 'Golden Restore';

update public.products
set
  price = 6.99,
  serving_size = '12 FL OZ (355 mL)',
  description = $d$
A clean, refreshing blend crafted to awaken your senses and support daily wellness.
$d$,
  ingredients = $i$
Filtered water
Moringa -> nutrient-dense superfood
Mint -> cooling & refreshing
Apple
Lemon -> cleansing
Honey & dates -> smooth sweetness
$i$,
  highlights = $h$
Revive from within
Fresh & light
Supports daily wellness
Clean hydration
Naturally refreshing
$h$
where name = 'Moringa Mint';
