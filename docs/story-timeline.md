# Story Timeline - v0.10.0

This is a readability release, not a new historical import or replacement database.

## Reader experience

The clean homepage now opens `story.html`. Explicit map URLs, query-string date links and comparison links continue to open the original views. Both existing pages gain a Story timeline navigation link. The technology hash route opens the existing technology dialog instead of leaving the reader at an inert fragment.

Story mode presents six date groups per page along a vertical, alternating timeline. Each group contains collapsed, labelled subject icons with record counts. Opening an icon brings up a native side dialog; opening a record inside it reveals the imported text, original category, date precision, confidence and links to its sources. Lists initially show at most eight records, with an explicit more-records button. Subject overview offers the same content grouped by theme.

The nine subject families are editorial display categories, derived from each record's existing category field, not inferred causal relationships. The original category remains visible in the record. Grouping by year, decade, half-century or century, plus region/entity/type filters, search, compact icons, random discovery and URL state are supported. Category chips include accessible names; Escape closes the drawer and returns focus. Mobile uses a single-sided timeline.

## Data handling

`story-model.js` reads the current `CIVILISATIONS`, `EVENTS` and all four research-event arrays after their existing adapters. No source record, entity, date, classification, map or localStorage lane order is overwritten. The model is tested against the current 511-entity dataset and yields 533 display records. Native mirrors are suppressed, and 12 exact normalized title/start/end duplicate cards are combined while alternate descriptions, source URLs and provenance remain inspectable. This is display deduplication, not historical entity reconciliation.

Half-open intervals and astronomical year zero are retained. One record appears only once per selected window, not once for each century it spans. A continuing interval may appear in the first group of a window; its original dates remain visible. The vertical spacing is explicitly a reading layout, not a linear scale of duration. No importance scores, causal links, territory polygons or new historical narratives are invented.

## Files

- `public/story.html`, `public/story.css`: interface and responsive layout.
- `public/story-model.js`: normalization, chronology, grouping and filters.
- `public/story-app.js`: view state, disclosure, record detail and navigation URLs.
- `public/story-navigation.js`: small bridge on the existing map/comparison pages.
- `story-test.mjs`: Node data and routing assertions; added to `npm test`.
- `tests/story-browser.py`: reproducible Playwright interaction and screenshot harness.

## Testing performed for this release

50 Node assertions passed, covering the real dataset, BCE/CE boundaries, preservation of input arrays, duplicate-card provenance, filters, date grouping and the navigation bridge. The deployed data-file SHA hashes were matched to the locally tested files.

73 Chromium interaction checks passed with zero page JavaScript errors. They cover disclosure, Escape/focus return, filters, year inputs, pagination, compact mode, empty-state recovery, random selections and layouts from 320px to 1440px. A search/blur rerender that swallowed an empty-state reset click was found and fixed.

The browser harness uses locally inlined production assets because this environment's managed Chromium blocks URL navigation, including localhost. History writes are captured rather than exercised against a real HTTP origin. The harness therefore does not certify public routing, browser history navigation or remote source availability. Cloudflare deployment and public-page smoke tests must be reported separately. The pre-existing complete repository test suite was not rerun as part of these targeted local checks.

## Deliberately not in this increment

No new map/timeline split-screen renderer, no automated story generation, no new technology dependency graph, and no restyling of the existing detailed Compare lanes. Those remain accessible as they are. Imported historical claims retain the research packs' verification limitations.
