# Import decisions

- Full original research records and claim/source links remain in `master.json`.
- This file uses astronomical integers and does not pass through the old negative-BCE normalizer.
- Dated civilisation records reuse existing Atlas IDs via `legacy_id`; existing hand-curated entries are not overwritten.
- `overview`, `historical_period`, and `cultural_region` are research-only records rather than graph bars. Non-imperial archaeological cultures remain distinguishable from empires.
- Map markers are added only for attributed research `places` rows as approximate modern site anchors, never inferred borders or culture territories.
- Original 83 events remain available in Compare > Events. Only events with compatible entity IDs are added to the core timeline; title/year duplicates are skipped. No year-500 duplicate event is added.
- Original 63 technology observations are retained. Only observations with a source URL, valid dated society, and interval overlap are plotted. Their original development status and date label are preserved; midpoint markers do not claim invention dates.
- `historical_maps` hold catalogue descriptions; no image or historical polygon is bundled. Source and image rights remain item-specific.
- The research pack declares many `source_claims` as reference leads rather than independent specialist verifications. Keep editorial confidence and caveats visible.