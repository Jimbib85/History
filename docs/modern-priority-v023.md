# v0.23 — Modern priority research revision 2 (1501–2026 CE)

## Import decision

The uploaded `World_History_Atlas_1501-2026_CE_Priority_Research_Pack_v2(1).zip` is a source-checked **revision** of the modern priority research, not a clean independent batch of new events. The ZIP states that it was prepared from a read-only inspection of an earlier repository revision and that **full runtime ID reconciliation, independent corroboration, and application deployment were not performed**. It therefore must not overwrite v0.22 research arrays blindly.

This release preserves its entire canonical table collection as the static gzip archive `public/modern-v2-data.js`, loaded **only when the new Modern priority v2 panel in Discover is opened**. The archive retains its interval metadata, quality report and typed tables.

## What is available

| Source table | Records |
| --- | ---: |
| Events/processes/observations | 97 |
| Historical conflicts | 18 |
| Conflict participations | 56 |
| Technology developments | 28 |
| Technology topics | 25 |
| Claims | 123 |
| Source citations | 90 |
| Society/actor identity references | 90 |
| Historical figures | 13 |
| Discovery cards | 10 |
| Social impacts | 12 |
| Prior-baseline review queue | 47 |

Other supplied tables (statistical observations, treaties, relationships, dependencies, aliases, evidence links, coverage records, etc.) are retained in the archive. Searchable evidence categories expose the main human-readable types. Source URLs and original source ID references are resolved when reading each entry.

Source provenance: 79 selected webpage excerpts, 9 search extracts and 2 abstracts. **Independent corroboration count is zero.** A HIGH confidence flag or SOURCE_CHECKED label records the pack authors' source-based judgement, not an independent historic audit.

## Deduplication and date semantics

The source report compares this revision to a local 77-event baseline: **63 event IDs reused** and **34 additional or differently scoped IDs**. Those 34 are *not* automatically 34 new historical events; they require current runtime reconciliation and some may rename existing observations. The ZIP also retains a 47-record baseline review queue as evidence of earlier entries that must not be deleted.

The app leaves the established World Map/Story/Compare/Technology data unchanged in this increment. The new panel serves as a versioned, searchable and source-linked supplement; it does **not** double-count the 97 modern v2 records as fresh events, invent polity lifespans from the 90 actor records, or overwrite events by title similarity. Future evidence review can promote claims with explicit canonical ID mapping.

Point events with exactly one documented source year link to their historical year in Story. Broad windows, long conflicts, measured social impacts and uncertain data remain context records, not falsely precise timeline markers. The war/conflict hierarchy prevents treating an intervention, a campaign, battles and whole-population impacts as one simple event.

Records marked `DISTURBING_NON_GRAPHIC` or `default_discovery: false` are excluded by default and can be explicitly included with a checkbox. No gruesome images or material are bundled.

## No unverifiable map or route data

The archive declares zero historical-map images and zero historical geometry features. It does not license third-party images, provide campaign routes or justify drawing present-day territorial boundaries as past ones.

## Testing

`modern-v2-test.mjs` decompresses the committed canonical payload and verifies table counts, sources, claim links, default content filtering, temporal distinctions and loader-on-demand behavior. The GitHub Chromium workflow exercises Discover at desktop and mobile widths, opens the modern revision from a deep link, confirms the lazy archive loads, checks source links, and switches to the 18 conflict records.

This is a deliberate staged merge of evidence, not a claim that every new row is now a standalone main timeline record.
