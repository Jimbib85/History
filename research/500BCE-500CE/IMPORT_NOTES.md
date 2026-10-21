# Atlas integration instructions — 500 BCE to 500 CE research pack

## Fit with the existing app

Repository inspected: <https://github.com/Jimbib85/History>. Current Atlas is a lightweight static HTML/JavaScript application. Its `public/data.js` defines `CIVILISATIONS`, `EVENTS`, `MOMENTS`, `MAPS` and `PLACES`, while `public/tech-data.js` defines `TECHNOLOGIES` and dated technology appearances; `public/entity-types.js` uses a curated empire/overview classification. **This staging pack has not changed GitHub, Cloudflare, or the live site.**

## The critical conversion: BCE

The research records use **astronomical years**: year `-499` is **500 BCE**, and astronomical `0` is **1 BCE**. The existing Atlas hand-authored `data.js` expects **negative BCE shorthand before its normalisation pass**, in which `-500` means 500 BCE, and then converts it by adding 1. This MUST NOT be applied a second time to research years.

When generating old-style `data.js` source objects (which will subsequently run the existing normaliser), use:

```javascript
// Astronomical => app source-file shorthand; perform this only at export.
const toAtlasSourceYear = y => y <= 0 ? y - 1 : y;

// Research dates are half-open; app source civilisation intervals may use an inclusive end.
const societyToExistingShape = row => ({
  id: row.legacy_id || row.id,
  name: row.name,
  region: row.region,
  start: toAtlasSourceYear(row.start_year),
  end: toAtlasSourceYear(row.end_year_exclusive - 1),
  at: toAtlasSourceYear(Math.max(row.start_year, -499)),
  summary: row.summary,
  source: row.source_urls?.[0],
  // Only add a map marker after independently selecting a defensible point.
});
```

Do not run this converter if consuming source JSON directly in the app after the old normalisation loop. Never represent an undefined exact year by flattening an approximate range without retaining `date_precision` and the original `date_label`.

## Merge sequence

1. Read `data/quality_report.json` and `csv/research_gaps.csv` first. Treat `LOW`, `DISPUTED`, or `source_access_status=reference_lead_not_individually_page_audited` as requiring review before public presentation without caveat.
2. Load `data/societies.json` to a staging model. Reuse `legacy_id` when present (`athens`, `rome`, `maurya`, `han`, `kush`, `teotihuacan`, `maya`, `aksum`, `gupta`, `byzantium`, etc). Distinct `roman_republic` and imperial `rome` period entries should not be relabelled a timeless Roman Empire.
3. Do not render `overview`, `cultural_region`, `archaeological_culture`, `historical_period`, `settlement_network` or similar nonpolitical records in the Empire graph. For political-entity date slices, preserve actual or approximate ranges and genuine overlaps.
4. Import `data/events.json` with stable IDs and preserve event-type and long-running date ranges. Display uncertainty where `date_precision` is not exact. For `evt_carthage_destroyed`, for example, do not also create a duplicate from a generic Punic-war row.
5. Import `data/technologies.json` and reconcile `existing_tech_id` into the current `TECHNOLOGIES` list. **Do not** create another `paper`, `iron`, `writing`, `bronze`, or `irrigation` topic if one already exists. Append development observations under existing topic, converting date fields only as required by the old `tech()` function.
6. Keep `development_type` visible: earliest attestation, documented use, adoption, independent tradition, transmission, improvement, or widespread use are not synonyms. The source user experience should never label all dates “invented in”.
7. Render `geo/historical_place_anchors.geojson` only as approximate archaeological/settlement **point markers**. Do not manufacture sovereign polygons. Only use dedicated scholarly road-line datasets after reviewing licence and location certainty. Indigenous cultural geography requires further community permission controls.
8. For the historical-worldview feature, `data/historical_maps.json` may display verified catalogue metadata but **no image automatically**; Mawangdui silk originals, later Ptolemaic cartography and the Peutinger medieval manuscript must have distinct status labels. Show geographic awareness descriptions without invented inferred polygons.
9. Cross-cultural `data/connections.json` records drive “Meanwhile, elsewhere…” cards. These cards expressly do not create relationship graph edges. Use `data/relationships.json` only for evidenced relations and show direction/evidence strength.
10. Read `source_register.csv` and `source_claims.csv` to provide citation links and editorial caveats in app details. Source access status is **not** a guarantee of specialist historical verification.

## The year-500 double-import problem

The new requested window `[−499, 501)` includes 500 CE, but the existing 500–1000 CE research pack starts `[500, 1000)`. Both contain year 500. Prefer treating **the older 500–1000 CE block as canonical owner of year 500** and dropping duplicate `start_year=500` events from this new import, while preserving unique source-backed corrections and entities crossing the boundary. Entity deduplication must key by stable society identity, not by batch filename.

## Test and review

- Run the repository's `node test.mjs`, `node tech-test.mjs`, `node tech-v03-test.mjs` and `node classification-test.mjs` where applicable; review changed content manually in Chrome/Edge.
- Date regression: **500 BCE** is research `-499`, source-file `-500`; **1 BCE** is research `0`, source-file `-1`; **1 CE** stays `1`; **500 CE** stays `500` and must not appear twice from batches.
- Regression: 476 CE terminates **western office** but **not** `byzantium`/Eastern Roman continuation.
- Regression: `hopewell`, `moche`, `nazca`, `aboriginal` are never shown as surveyed states. `old West Polynesia` records never trigger a 500 CE settlement date in Hawai‘i, Rapa Nui or New Zealand.
- Regression: original Han silk maps and later surviving Roman-related manuscript maps must have visibly different labels.
- Run record-level duplicate tests for legacy society IDs and technology topics; inspect spelling and approximate dates before publishing a sample.

Keep the design lightweight, static and enjoyable. No database, frameworks, authentication or services are required just to add these data.