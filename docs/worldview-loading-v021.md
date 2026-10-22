# v0.21 — Research-only loading for The World Through Their Eyes

The previously completed v0.17 historical worldview explorer worked, but imported the full core `data.js` and three large classical/medieval/modern research packs plus their application adapters. That is unnecessary for a reader showing only maps, source-described geographic knowledge, and recorded relationships.

## Change

`scripts/build-worldview-slim.mjs` regenerates `public/worldview-slim-data.js` from the existing, unchanged source files. The generated page-specific dataset contains:
- the original 19 historical maps;
- the original 42 geographic-knowledge records;
- the original 127 relationship records;
- original source-register entries actually cited by these records, with source IDs, titles, URLs and access status;
- a compact society ID/name index and the same three rights-curated image links.

It does **not** overwrite the research archives, change historical date semantics, invent locations or claim that map reproductions are original artefacts. The WorldView model and UI remain unchanged; the source is simply smaller.

The generated file is a static page asset that works offline. `node scripts/build-worldview-slim.mjs --check` compares the full normalized generated data against the original packs and fails if any record, source or society reference goes stale. The browser and existing worldview tests still verify rendering, sources, dates and query deep links.

## Measured result

Actual GitHub Actions Chrome browser loads (separate local static-server runs):

| View | Previously | New | Change |
| --- | ---: | ---: | ---: |
| Their World desktop first-party transfers | approximately 1,473 KiB | approximately 159 KiB | approximately 89% fewer raw bytes |
| Their World mobile first-party transfers | approximately 1,473 KiB | approximately 159 KiB | approximately 89% fewer raw bytes |

These are **local, uncompressed** first-party transfer metrics in GitHub Actions, not field performance or actual Cloudflare network metrics. They do not prove a proportional improvement in user-perceived loading time; however, they demonstrate the removal of unnecessary modules.

## Technical guardrails

- Keep model source-link access-status labels; filtered source-register records are selected by their source ID references, not source popularity.
- Never conflate composition and surviving-object dates or infer intersociety contact from two records with matching years.
- No original archive fields changed; this is a loading/readership optimization only.
- Do not add accounts, backend persistence or a framework to implement an entirely static reader.

`npm test` includes slim-index parity and byte-budget checks. GitHub Actions browser audit covers all six views at desktop and 390px mobile widths.
