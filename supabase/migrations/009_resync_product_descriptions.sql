-- Re-sync product descriptions to the latest approved copy.
-- Safe to re-run: updates by product name.

update public.products
set description = 'A light, refreshing botanical blend crafted to hydrate, restore, and gently energize your body.'
where name = 'Hibiscus Bloom';

update public.products
set ingredients = E'Filtered water\nHibiscus -> antioxidant-rich, supports heart health\nLemon -> cleansing and refreshing\nHoney -> natural smooth sweetness\nDates -> balanced, natural energy',
    highlights = E'A timeless tradition for modern wellness\nLight and refreshing\nNaturally hydrating\nRich in antioxidants\nSmooth, clean taste'
where name = 'Hibiscus Bloom';

update public.products
set description = 'A refreshing blend designed to awaken your body naturally. Ginger Citrus delivers clean, balanced energy without the harsh bite or artificial boost.'
where name = 'Ginger Citrus';

update public.products
set ingredients = E'Filtered water\nGinger -> supports circulation & digestion\nLemon -> detoxifying & refreshing\nOrange -> natural sweetness + vitamin C\nHoney & dates -> smooth, natural energy',
    highlights = E'Energize from within\nClean, natural energy\nSupports digestion\nRefreshing + uplifting\nNo artificial ingredients'
where name = 'Ginger Citrus';

update public.products
set description = 'A rich, nutrient-dense blend crafted to support vitality, strength, and overall wellness.'
where name = 'Carrot Vital';

update public.products
set ingredients = E'Filtered water\nCarrot -> rich in vitamin A & antioxidants\nLemon -> refreshing balance\nGinger -> digestive support\nHoney & dates -> natural sweetness',
    highlights = E'Nourish & strengthen\nNutrient-rich\nSupports immunity\nSmooth & satisfying\nNaturally energizing'
where name = 'Carrot Vital';

update public.products
set description = 'Prime Rise Golden Restore is a vibrant botanical blend crafted to support recovery, balance, and vitality. Infused with turmeric, pineapple, and ginger, it helps restore your body naturally from within.'
where name = 'Golden Restore';

update public.products
set description = 'A clean, refreshing blend crafted to awaken your senses and support daily wellness.'
where name = 'Moringa Mint';

update public.products
set ingredients = E'Filtered water\nMoringa -> nutrient-dense superfood\nMint -> cooling & refreshing\nApple\nLemon -> cleansing\nHoney & dates -> smooth sweetness',
    highlights = E'Revive from within\nFresh & light\nSupports daily wellness\nClean hydration\nNaturally refreshing'
where name = 'Moringa Mint';
