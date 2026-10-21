# Atlas integration instructions — 500–1000 CE pack

## Project fit

Repository inspected: https://github.com/Jimbib85/History (`main`, 21 October 2026). The current app is static HTML/CSS/JavaScript with curated arrays in `public/data.js` (`CIVILISATIONS`, `EVENTS`, `MOMENTS`, `MAPS`, `PLACES`), technology topics and appearances in `public/tech-data.js`, and historical display classification in `public/entity-types.js`. No server, data warehouse, authentication or paid API is required for this pack.

**This pack is a staging dataset, not a file replacement for `public/data.js`.** Do not paste JSON objects over the app's existing JavaScript definitions. Import/merge into a staging copy, then test on the site.

## Recommended minimal adapter

1. Load `data/societies.json` (only appropriate display groups) and map `id`, `name`, `region`, `start_year`, `end_year_exclusive`, `summary` into the existing society schema. Preserve existing IDs where `legacy_id` is provided. Exclude global cultural region entries from the Empire graph.
2. UI code currently has its own BCE shorthand and normalises to astronomical years. This file only includes CE integer dates. For a society display interval, convert `end_year_exclusive` to inclusive integer `end=end_year_exclusive-1` **only after checking the consuming application function's conventions**. Avoid off-by-one boundary errors.
3. Append `data/events.json` with stable IDs and source links, not duplicate events already present. For alternative dates, show date text and uncertainty rather than drawing a continuous 24-year event bar.
4. Technology `data/technologies.json` links to `data/technology_developments.json` using `technology_id`. If an `existing_tech_id` exists, append new appearances to the existing topic instead of creating a parallel technology topic. Keep the appearance `status` in labels and explanatory notes.
5. `societies.kind` is more detailed than the current binary `EMPIRE_IDS` set. Political `empire` records may display in the Empire graph, but kingdoms, networks and archaeological traditions belong in Society or a distinct cultural view. `historical_period` is not an Empire.
6. The locations in GeoJSON are site anchors. Do **not** render them as verified national or ancient polity borders. Keep time-specific routes and polygons disabled until researched.
7. `historical_maps.json` includes composition time and surviving-copy metadata; do not show the Dunhuang star atlas as a historical globe map.
8. `geographical_knowledge.json` has no inferred world polygons, by design. Display the evidence list and source link, not an invented territory map.
9. Add a source detail link for all cards. Mark `DISPUTED`, `LOW` and approximate dating visibly, and don't call this dataset comprehensive or independently verified.
10. Run `node test.mjs`, `node tech-test.mjs` and existing classification tests plus manual interaction checks before deployment. Nothing here has been merged to or tested inside the live site.

## Data dictionary

- `societies`: stable identity, classification, broad historical active interval and source.
- `events`: dates, themes, linked participants; `start_year`, `end_year_exclusive`, `date_precision`.
- `technologies`: topic metadata, `existing_tech_id` where applicable.
- `technology_developments`: civilisation-specific milestones; `status` is not an invention claim.
- `figures`: historical biography seeds; life intervals often approximate.
- `places`: a small set of verified UNESCO **modern site anchors**.
- `relationships`: relationships with type, direction, confidence and active period.
- `historical_maps`: surviving item date versus map intellectual composition.
- `geographical_knowledge`: attested/inferred place or route knowledge; `polygon:null`.
- `connections`: contemporaneous comparisons that **do not imply contact**.
- `cultural_practices`: documented arts, trade, craft and everyday traditions.
- `source_register`: bibliography, URLs, basic reuse notices.
- `quality_report`, `research_gaps`: audit summaries, scope and uncertainty.

## Confidence versus verification

Editorial HIGH/MEDIUM/LOW/DISPUTED/UNKNOWN labels are provisional research assessments. They are not measures of percentage certainty, and one strong institutional source is not identical to two independent source confirmations. Region-wide chronologies are discovery references; use specialised primary sources or archaeology when adding spatial boundaries and precise assertions.

## Practical naming

The research filenames are separate by type. Future batches can follow `research/0500-0999`, `research/1000-1499`, etc., with only one canonical record per civilisation ID. Historical years and statuses remain full-resolution inside these batch containers.