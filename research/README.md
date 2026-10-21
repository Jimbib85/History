# Imported World History Atlas research (2026-10-21)

This archive retains the uploaded, user-curated history research documents and the three **actually supplied** structured datasets. It is preserved in source form alongside the website's *additive* `public/research-*` import adapters; no existing history records were replaced.

## Supplied machine-readable content

- `events-500-999.csv`: **93** medieval historical-event / research-note entries, their date precision, original regions, linked society IDs, confidence and source pointers.
- `technology-developments-500-999.csv`: **51** technology development observations, including adopted/widespread/attested statuses, not invention claims.
- `source-register-500-999.csv`: **67** bibliography entries with source URL, access date and licence/reuse notes.
- `quality-report-500-999.json`: first-pass data-quality report; reflects checking within the research package, **not** independent verification of all claims.

The 500–999 CE `RESEARCH_REPORT` describes **115** society records, but **its `societies.csv` or `societies.json` was not attached**. Likewise, the 1500–2026 report refers to structured material that was not included. The importer therefore adds 61 conservative manually curated society/polity anchors from the supplied reports, plus 37 dated modern-history research anchors. It does **not** claim to have loaded the missing datasets.

## How the Atlas uses the research

- `public/research-sources.js` and `public/research-events-*.js` preserve all attached source metadata and event content.
- `public/research-civilisations.js` provides usable, source-linked, approximate reference-point entries for the map and society/empire graphs. Many 500 CE start dates describe **the researched 500–999 CE slice**, not the beginning of a culture or people.
- `public/research-apply.js` links only records with an identifiable existing or explicitly added polity; unrelated global events remain visible in the Compare **Events** view without a fake society attribution.
- `public/research-tech-records.js` and `public/research-tech.js` adapt source-specific evidence observations into the technology tree. When a matching society is absent or dates do not intersect, the original evidence record remains in the preserved dataset, not a fabricated milestone. In the current repository, 49 of the 51 medieval technology records are mapped; two remain research-only.
- The 1500–2026 modern anchors are **provisional summaries extracted from a prose report**, not the absent 60-row modern CSV. Source link points to the report in this repository.

No borders, maps, images or reconstructed relationships were manufactured. A plotted point is an approximate geographical reference, **not the historic extent of any polity**. Evidence confidence and date precision are preserved, and may need additional independent review. These datasets are for a personal historical exploration project; source and image licences still apply.