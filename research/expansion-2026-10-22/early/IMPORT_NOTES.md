# Atlas integration instructions - 8000 BCE-500 BCE

## Status

This is **staging research**, not a drop-in replacement for `public/data.js` and not a tested live import. No repository files were edited, committed or deployed.

Read-only reference revision: `bbf4191d4f2a3a0e8a91dc3b2858d20e591f6f5e`. Inspected this pass: main reference; base `public/data.js` lines 1-45; `public/tech-data.js` lines 1-42; full `public/research-1500-2026-tech.js`. The complete repository was not checked out, and its full test suite was not executed. Earlier source-pack files were used only for identity-reconciliation leads, not silently promoted into verified research.

## Dates and the requested boundary

This window is [-7999, -498), containing 7501 numbered years. It is an authorised macro-window. The 500 BCE endpoint overlaps the previously delivered 500 BCE-1 BCE pack. Reuse identities and reconcile individual events; do not shift an actual event by one year to eliminate a packaging overlap.

Astronomical conversion: 8000 BCE=-7999, 500 BCE=-499, 1 BCE=0, 1 CE=1. Human labels remain BCE/CE. New exports are **already astronomical**: do not apply the old negative-BCE shorthand conversion again. A UI using inclusive integer endpoints can use end=end_year_exclusive-1 only for a genuinely bounded interval, not an unknown endpoint.

`DATE_WINDOW` and `APPROXIMATE_DATE` are uncertainty, not event duration. `UNDATED_CONTEXT` stays unplaced. `OBSERVATION_WINDOW` describes the recorded scope, not the life of the whole institution or system. `observed_through` is a cutoff, not an end to an ongoing process. Never substitute 22 October 2026 as a historical ending.

## Identity reconciliation

`data/entity_reconciliation.json` contains observed base-ID matches, matches to the supplied earlier modern pack and unresolved candidates. Literal reuse of an existing ID is not permission to overwrite its content. Known runtime technology construction in the inspected modern adapter uses `existing_tech_id` where applicable, otherwise `m1500-` plus the old topic ID; its development identifiers also use an `m1500-` prefix. Such candidates are not proof a row is currently displayed.

Most society rows in this release are **identity/contribution references with null lifespans**. Match them to curated Atlas identities where the meaning truly agrees. A research collaboration, colonial administration, community and empire are not interchangeable. Keep unmatched identities in research cards rather than inventing a polity bar or geographic centre.

Preserve every `society_ids` participant link. A technology must not appear for a society just because both occupy the same region or century. Selected-society filtering should use explicit linked observations. Absence of an observation means unresearched/not recorded, not that the society lacked the technology.

Compare overlapping records by identity, title, dates, object and observation type. A source recheck may correct an old row; it must not silently create a second invention event. Retain disagreement and the original source attribution.

## Display and evidence

Use the event summary as the basic card and the editorial importance rationale as an explanation of selection. Do not label every `CORE` selection as universally the most important event. Evidence access, confidence, uncertainty and review status are separate fields.

A `SEARCH_EXTRACT` source is not full-text consultation. No rows are marked independently corroborated. The claim register has explicit summary-level assertions, not a completed atom-by-atom audit of all metadata. These distinctions should survive any UI simplification.

The point geometries locate public heritage properties only. They are not historical borders, precise battlefield sites, origins of technologies or inferred routes. Do not generate political polygons from these coordinates. No source images are redistributed, and the map catalogue does not authorise image reuse.

## Staging procedure

1. Preserve the existing app and source packs; load this release into a separate staging collection.
2. Review `entity_reconciliation`, especially overlapping event and topic identifiers.
3. Keep all null chronology and uncertainty fields. Do not force values merely to satisfy the old UI schema.
4. Link sources and claims before adding summary cards or technology appearances.
5. Run the included validator and staging merger. The merger preserves existing rows and reports disagreements instead of overwriting.
6. Run the actual repository tests and browser interaction checks before a separately authorised deployment.

## Tests performed and not performed

Export-level schema, reference, chronology and serialization checks: results in `data/quality_report.json`.
Manifest hashes and ZIP bytes: checked in the separate release validation record.
Repeat-load staging merge: `review/staging_merge_test.json`.
Full repository regression: **NOT_RUN**.
Browser integration: **NOT_RUN**.
Production import/deployment: **NOT_RUN**.

A staging merge test does not certify compatibility with every current application consumer.
