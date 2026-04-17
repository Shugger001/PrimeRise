-- Default catalog: five blends featured on the marketing site (public/index.html collection).
-- Idempotent: only inserts rows when no product with the same name exists.

insert into public.products (name, description, price, image_url, category, stock)
select v.name, v.description, v.price, v.image_url, v.category, v.stock
from (
  values
    (
      'Hibiscus Bloom',
      'A light, refreshing botanical blend crafted to hydrate, restore, and gently energize your body.',
      6.99,
      '/images/hibiscus-bloom-bottles.png',
      'Prime Rise Collection',
      500
    ),
    (
      'Ginger Citrus',
      'A refreshing blend designed to awaken your body naturally. Ginger Citrus delivers clean, balanced energy without the harsh bite or artificial boost.',
      6.99,
      '/images/ginger-citrus-bottles.png',
      'Prime Rise Collection',
      500
    ),
    (
      'Carrot Vital',
      'A rich, nutrient-dense blend crafted to support vitality, strength, and overall wellness.',
      6.99,
      '/images/carrot-vital-bottles.png',
      'Prime Rise Collection',
      500
    ),
    (
      'Golden Restore',
      'Restore your balance. Reclaim your energy. Pineapple, turmeric, ginger, and lemon—naturally energizing refreshment.',
      6.99,
      '/images/golden-restore-bottles.png',
      'Prime Rise Collection',
      500
    ),
    (
      'Moringa Mint',
      'A clean, refreshing blend crafted to awaken your senses and support daily wellness.',
      6.99,
      '/images/moringa-mint-bottles.png',
      'Prime Rise Collection',
      500
    )
) as v(name, description, price, image_url, category, stock)
where not exists (
  select 1 from public.products p where p.name = v.name
);
