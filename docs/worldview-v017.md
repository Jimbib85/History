# v0.17 — The world through their eyes

This release introduces `public/worldview.html` as an evidence browser, reachable from the World Map. It does not reconstruct any society's complete mental map or claim that modern coordinates reproduce historical territorial borders.

## The three categories are separate

1. **Historical maps / physical objects:** 19 research records from the classical (5), medieval (6) and modern (8) research packs. Their source-provided composition date, type, physical copy/object note, research confidence and source-register links are shown distinctly. An ancient composition represented by a later copy must not be described as a surviving ancient original.
2. **Geographical knowledge:** 42 research entries (7 classical, 19 medieval, 16 modern). Source-defined evidence layers are classified as `attested`, `inferred` or `unsupported`. Unsupported assertions are excluded from standard discovery; absence of a record is *not* evidence that the people lacked knowledge. A scholar, navigator, court or community never represents the knowledge of every inhabitant.
3. **Relationships:** 127 source-registered research entries (41 classical, 47 medieval, 39 modern). `direct_contact_proven: true` or `direction_evidence: direct` identifies explicitly recorded direct contact. Other records are indirect/regional, generic recorded relationships (without a proven route), or contemporaneity-only, based on the source packet's actual fields. Do not draw routes or imply societies had direct contact simply because of proximity or same dates.

The interface defaults to a society-specific view when passed `?civ=...`; users can broaden to all records. Date filters use a +/-125-year **discovery window** rather than the claim that a map was made or a relationship occurred in the user's selected calendar year. The entire source register remains available through the respective research archives.

## Imagery and licensing

Only the three already-curated display references (`MAPS.ptolemy`, `MAPS.kangnido`, `MAPS['fra-mauro']`) may appear as external inline images. The raw research records do **not** confer reproduction rights. All other map records show titles, object/source descriptions and register links; images must not be copied into the repository without item-level rights review. Even curated sources should be checked periodically for working URLs and attribution.

The Ptolemy image is a later reconstruction of ancient material; Kangnido is represented through a later surviving copy; the curated Fra Mauro image is identified as a later copy. These categories are not interchangeable.

## No invented geometry or contact

This is a static **reading UI**, not a georeferenced reconstruction. Geographical accounts lack verified `polygon` / `geometry` data; no polygon is synthesized. Relationship records have no invented itineraries or transmission arrows. Native research status fields and source-access notes remain visible, including unreviewed leads.

## Implementation

- `worldview-model.js`: pure normalization/filtering, source lookups, explicit time and evidence labels.
- `worldview.js`: compact collapsible cards, searched/source-filtered societies, time windows, progressive record batches, deep links to Map / Story / Compare.
- `worldview.css`: responsive layout and accessible controls.
- `worldview-test.mjs`: asserts provenance, evidence categories, rights-limited images, link preservation, deep-link scaffolding and data totals.
- `public/app.js` and `index.html`: context-aware entry point from the historical map.

The Atlas remains static and account-free. Automated GitHub tests verify the data and code paths; a manual phone/desktop visual smoke test remains appropriate before final release approval.
