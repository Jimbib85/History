# World History Atlas

**Version 0.22.0 - Research expansion, map provenance and regional Compare**

World Map, Compare and Technology now use the Story timeline’s overview-first approach: scan a short heading, open a record, and read its evidence. See [the UX implementation notes](docs/compact-ux.md).

The Technology tree filters its families, topics and evidence to the selected society or empire. Search and Random use the same selection. Choose **All societies & empires** to compare the full collection; a society without linked technology research gets an explicit empty state.

Explore what different societies were doing at the same time. The application is a simple static website with no login, database, user accounts or paid map services. GitHub changes deploy through Cloudflare Workers Builds.

## Version 0.24 — Reconcile modern priority v2 into main Atlas

An explicit, repeatable ID crosswalk links the v2 modern research to original Atlas events without duplicate chronology. **33 modern events gain new citations, 10 sourced single-year event records become explorable in Story and Compare, and 15 broad / 39 ambiguous records remain in Discover.** The technology tree gains evidence on four existing appearances while 24 others remain contextual or require identity mapping. Conflicts gains 18 distinct sourced records and updates eight existing ones, preserving war/phase/battle/treaty hierarchy. No new fabricated society lifespans or territorial boundaries.

See [modern priority reconciliation notes](docs/modern-priority-reconciliation-v024.md).

## Version 0.23 — Modern priority research revision

The complete 1501–2026 CE priority research v2 ZIP has been preserved in a compact, on-demand source archive. In **Discover → Modern history — priority research v2**, explore 97 event/process records, 18 conflict records, 28 technology observations and the associated claims, citations, actors, impacts and research gaps. The new revision supplements rather than duplicates or overwrites the existing modern historical timeline. Missing source verification, uncertain dates and content notices remain explicit. See [v0.23 evidence integration notes](docs/modern-priority-v023.md).

## Version 0.22 - Research, maps and atlas-style Compare

The uploaded early/modern research packs are preserved with canonical checksums and source claims. The adapter accounts for 123 event records (59 new, 48 evidence enrichments, 16 contextual) and 61 technology observations (12 new linked appearances, 3 enrichments, 46 contextual). Existing society lifespans are unchanged; unknown dates never become invented polity spans. Full research remains searchable in the lazy Discover source catalogue.

Compare follows the supplied visual references: parchment/navy styling, regional colour rails and icons, aligned bars and selected-year reader; Era Bands uses a full-width eight-column linear overview. The images' historical examples are not copied into the dataset. Sources, filters, pins, row order and progressive detail remain available.

Their World includes 14 supplied map references: four viewable historical reproductions with zoom, ten metadata/source-only items pending provenance and reuse review. Fra Mauro and Kangnido are alternative reproductions, not duplicate historical map records. Speculative newspapers, modern software screenshots and mixed-period map labels are not historical boundaries.

See [v0.22 notes](docs/research-maps-compare-v022.md).

## Version 0.21 — Lightweight historical worldview

Their World now loads a reproducible 132 KB research-only index instead of the full 1.2+ MB research scripts and app adapters. It still exposes all **19 historical maps, 42 geographic-knowledge records and 127 relationship records** with the same source links and scope caveats. GitHub Chrome measured a reduction from roughly 1,473 KiB to 159 KiB of first-party local resource transfers for that screen. See [data-loading notes](docs/worldview-loading-v021.md).

## Version 0.20 — Classical research provenance and lightweight evidence

The two user-supplied 500-year classical research packs are preserved as compressed canonical, source-linked staging archives under `research/classical-split/`. A deduplicated set of **72 reviewed claim excerpts** is available on demand inside Discover, with precise dates, uncertainty, original source IDs and review scopes explicitly labelled. The existing combined classical dataset has **not** been overwritten with unreviewed seed material.

See [v0.20 classical staging and import notes](docs/classical-split-v020.md).

## Version 0.19 — Navigation continuity and browser usability

The seven main views now share a readable, swipeable navigation row on narrow screens. Story, Map, Compare, Technology and Their World retain a selected year and society when both views understand those fields; Discover keeps the year only, while Conflicts remains unfiltered rather than implying support for a year parameter.

A separate **real Chromium browser audit** runs on UI pull requests, checking six views at desktop and phone widths and publishing screenshots, navigation timings and layout regressions as build artifacts. It measures a local static server, not production network performance. See [v0.19 notes](docs/usability-v019.md).

## Version 0.18 — Discovery & Refinement

[Discover](public/discover.html) offers four curated journeys through everyday lives, craftsmanship, learning and belief, plus a **same-year comparison** of source-dated cultural practices and a non-repeating **Surprise me** sourced excerpt. Each card opens the registered source and, where associated, its historical society. Undated medieval examples are labelled and excluded from exact-year comparisons rather than assigned invented dates.

The new page loads a compact, reproducible excerpt of 88 existing cultural-practice records instead of all three research archives. The original historical data is untouched. The repository includes a generator freshness check, UI and data regression tests, and an uncompressed asset-size audit. See [v0.18 implementation notes](docs/discovery-v018.md).

## Version 0.17 — The world through their eyes

Open [Their World](public/worldview.html) directly or follow **Explore surviving maps, geographical knowledge and recorded connections** beneath the interactive World Map. It provides a compact reader for **19 historical map records, 42 geographical knowledge records and 127 historical relationships** across the classical, medieval and modern research imports.

The reader explicitly separates original and later-copy map records; attested, inferred and unsupported claims; and direct contact, regional or indirect exchange and contemporaneity without contact. Only three previously curated, externally hosted image references appear inline. Bibliographic research records never imply automatic image rights or verified territorial geometry.

Choose a society, search the research, optionally compare records within about 125 years of a selected year, and return to its World Map, Story or Compare context. Unsupported geographic knowledge assertions are excluded from normal results. No new routes, territories, user accounts or backend services are introduced. See [source and interpretation notes](docs/worldview-v017.md).

## Start using it

1. Extract the zip somewhere on your computer.
2. Open `public/story.html` in Chrome, Edge or Firefox. It runs directly from the folder.
3. If your browser restricts local files, run `py -m http.server 5173 --directory public` from the repository root on Windows and visit `http://localhost:5173`.
4. For public hosting, `npx wrangler deploy` publishes the `public/` assets to the existing `history` Worker. Run `npm test` first. No application build step or environment variables are required.

The world map, text and chronology work offline. Archived historical map images open from Wikimedia Commons and need an internet connection.

## Things you can do

- **Choose a year:** Use the broad timeline slider, featured year chips, hundred-year controls, previous/next historical moment buttons, or type a year such as `500 BCE`, `200 CE`, or `-499` (astronomical year numbering).
- **Choose a society:** Click a point on the map, select a civilisation from the left list, or search by name.
- **See who lived concurrently:** The bottom timelines show societies whose periods overlap with the selected year. The marker is a representative geographic centre, *not* a reconstructed political border.
- **Actual world:** A current-geography basemap with historical centre markers.
- **Their world map:** A preserved historical map, later copy or clearly identified reconstruction when a suitable example is curated. If there is no map, the application says so rather than making one up.
- **World they knew:** A modest view of illustrative known geographic contacts or historical geographical knowledge. It does *not* purport to show a definitive area of knowledge.
- **Surprise me:** Select a random date and a contemporary society. Use the dropdown for a different society at the same date or a different period for the currently selected society.
- **Back:** Return to a previous discovery.
- **Share:** Copy the browser address bar URL; it encodes the year, chosen civilisation and map view.

## Add your own history

Edit `public/data.js`, which contains:

- `CIVILISATIONS`: society/state names, approximate periods, location, introduction, source URL, region and optional historic map ID.
- `EVENTS`: notable events linked to societies.
- `MOMENTS`: featured global points in time and introductory text.
- `MAPS`: curated historic image metadata and links to original image records.
- `PLACES`: optional example locations used in the `World they knew` view.

The source file uses negative whole years for **BCE** as an easy-to-edit shorthand, for example `-500` means `500 BCE`; at runtime the records are converted to astronomical year numbering, where `0 = 1 BCE` and `-499 = 500 BCE`. Positive values are CE. Dates should be labelled approximate when that is all historical evidence supports.

Do **not** add modern country boundary geometries for ancient polities as if those were historical boundaries. Historical maps and links can have copyright and Indigenous cultural permissions attached to them, so preserve attribution and rights conditions for any new additions.

## Current boundaries / honest limitations

This is a first interactive sample, not a comprehensive history encyclopedia. It has a hand-curated sample of important states and societies across different periods and regions. The data reflects selective examples, not a measurement of which cultures existed at every date. The absence of a marker does not mean a region was uninhabited.

The basemap uses present-day geography generated locally from Basemap/GSHHS coarse coastline data. Markers are illustrative cities or regions; territorial polygons are not yet included. Historical world maps are loaded on demand from Wikimedia Commons and may occasionally be unavailable. The app has not yet been tested across every device/browser combination.

## Files

- `index.html`: page and UI structure
- `styles.css`: atlas appearance and responsive layout
- `data.js`: editable starter historical data
- `app.js`: synchronised timeline, views, search, map interaction and randomisation logic
- `world.svg`: bundled basemap; no external tile provider
- `start-windows.bat`: convenience Windows launcher

## Historical map image attributions and reference links

- Ptolemy's *Geography*, later printed map (1482): [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ptolemy_map_15th_century.jpg), public domain. This is not a surviving original Roman map.
- Korean Kangnido, created 1402, later surviving copy: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:GeneralMapOfDistancesAndHistoricCapitals.jpg). Consult the file for reproduction rights.
- Fra Mauro map, c.1450, later 1806 copy: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Fra_Mauro_World_Map,_c.1450_(1806_copy).jpg), public domain according to Commons.
- General historical descriptions link to further reading pages from *Encyclopaedia Britannica*, Te Ara or AIATSIS where relevant. These are starting references, not substitutes for specialist scholarship.

### Why there is no database or React setup yet

The priority is to enjoy exploring history and add to the toy when it feels fun. Static HTML/CSS/JavaScript keeps the project exceptionally easy to open and change. A framework or database can be introduced later if the historical content grows enough to justify it.


## Cloudflare Pages deployment

1. Push these files to `Jimbib85/History` on the `main` branch.
2. In Cloudflare Workers & Pages, create a Pages project and connect `Jimbib85/History`.
3. Framework preset: None; build command: leave blank; output directory: `/` (repository root).
4. After the initial deployment, under Custom domains add `history.bibbybots.ai`. Cloudflare will guide you through the DNS record and certificate.
5. Subsequent pushes to `main` redeploy automatically.

The app is entirely static and does not require environment variables.

## Version 0.2: Content and comparative technology tree

The atlas now includes **61 societies and communities**, **51 historical events**, and **12 technology topics with 42 dated examples**. The collection covers early farming communities, the Caral–Supe region, Bronze Age states, Sasanian Iran, Srivijaya, Song China, Goryeo Korea, the Swahili coast, Cahokia, the Kingdom of Benin and more.

Select **Technology tree** from the top bar. Choose any historical society and a technology such as papermaking, iron production, writing, navigation or movable type. The viewer compares selected dated evidence among societies and provides links to background sources. Use **Explore this year** to jump back to the main historical map. The tree has its own Random technology button.

The technology diagram deliberately avoids a false technology ladder: adoption, independent development and further refinement are distinct. Dates are approximate evidence points, not claims of exclusive invention. A society without a milestone is simply not documented in this small dataset.

Files: `public/tech-data.js`, `public/technology-tree.js`, `public/technology-tree.css`. Content expansions live in `public/data.js`. Run `npm test` for chronology and content-reference checks.

The repository currently has `wrangler.jsonc` configured for Cloudflare Workers static asset hosting from `./public`, not the repository root. It is a personal passion project, with no login, advertising, database or subscriptions.


## Version 0.3: When & where technologies spread

The **Technology tree** now includes two modes: **Time** places curated milestones on a common chronological scale, while **World map** plots approximate geographical reference points. Societies are colour-coded by independent development, adoption or transmission, further development, and other evidence.

A separate `public/tech-pathways.js` file stores **explicitly curated** connections. The diagram draws dashed conceptual links only when a connection is included in that file with an explanatory note and source URL. These are not reconstructed routes or claims of direct person-to-person transmission. Topics with no evidenced connection show separate dots.

Two additional topics expand the catalogue to **14 technologies and 48 dated examples**: road and courier networks (Achaemenid Persia, Rome and Inca) and urban water engineering (Indus cities, Rome and Angkor). The examples use linked historical sources and are not exclusive claims of invention. The catalogue now includes four broad connections (papermaking diffusion, numeral scholarship and Chinese print continuity). Dates remain approximate.

### Source files

- `public/tech-extensions.js`: additional evidence-backed milestones and source metadata
- `public/tech-pathways.js`: source-backed conceptual links, with their uncertainty explicitly described
- `public/technology-tree.js`: interactive time and map views, comparison and atlas navigation
- `public/technology-viz.css`: responsive diagram styling
- `tech-v03-test.mjs`: checks records, links and UI state changes

### Cloudflare hosting

The current site runs on a Cloudflare Worker named `history` and serves the static files in `public/`, as configured by `wrangler.jsonc`. The hostname is `https://history.bibbybots.ai`. Build tools and databases are unnecessary for the atlas.


## Version 0.4: UI stability and separated society/empire timelines

This version prioritises debugging rather than adding more historical content.

- The main timeline has **two distinct graphs** on the same date scale: **Societies** (non-imperial polities and dated communities) and **Empires** (imperial states and major expansionist political formations). These are convenient editorial categories, not rankings.
- The sidebar has **All / Societies / Empires** filters, which now update the visible map markers and available selections as well as the list.
- The former single Australia-wide `aboriginal` entry is now an **undated cultural overview**, accessible via a collapsed Cultural background section. It no longer appears as a continuous, all-history society, empire or map marker. Its presence spans many nations and traditions rather than one state and should not be assigned a single lifespan.
- Changing years or regions now selects an appropriate contemporary entry when available. When the collection has a gap, the interface says so explicitly.
- The year slider has a consistent **Back** history, typed dates also commit on blur, and technology milestone navigation changes the selected society and date in a single update.
- Mobile navigation no longer causes header overflow, and mobile Back and randomisation options remain accessible.
- Asset URLs use `?v=0.4.0` to prevent HTML and JavaScript from different releases being mixed by caching.

This release intentionally does **not** expand historical content. Tests: `npm test`. The optional browser click-through test can be run using Python Playwright and Chromium if installed.

## v0.6 — Personal row ordering and sourced historical research

Drag Society and Empire rows on the Compare Overlap and Region Lanes views. Up/down arrows make ordering accessible with mouse, keyboard and touch; your preferred order persists in this browser using localStorage. Use **Reset row order** to return to automatic sorting. No account, database or cross-device sync is required.

The additive research import preserves **93** supplied medieval events (500–999 CE), **51** technology-development evidence records and **67** source-register entries. It also introduces **37** provisional timeline anchors extracted from the 1500–2026 prose report, and **61** conservative society/polity reference entries drawn from the supplied reports. Imported period bounds and evidence confidence are preserved; some date spans mark the researched window rather than the founding or end of an entire culture. The two technology evidence records without an appropriate date-and-society match remain available as raw research instead of being displayed as made-up innovations.

The 115-society structured catalogue and modern 60-event structured files mentioned by the reports were **not attached**. We have not claimed to import those absent datasets. Supplied reports and CSVs remain unchanged under [research](research/README.md) for future additions. Global events without one society association are visible in Compare → Events with their source and confidence. Neither a chronological overlap nor shared technology implies direct contact.

Run `npm test` to include `research-merge-test.mjs` after existing regression tests. The web app remains an uncomplicated static Cloudflare Worker deployment with no subscriptions or database.

## v0.7 — Verified 1000–1499 CE research import

This corrects a previously missing research-pack import. The supplied 1000–1499 CE ZIP is integrated additively via `public/research-1000-1499.js`, `public/research-1000-1499-apply.js` and `public/research-1000-1499-tech.js`. Existing society IDs (including 10 legacy crosswalks) and existing source claims are not replaced. The full original 193-society / 108-event / 39-technology / 71-technology-observation structured collection, plus figures, historical maps, relationships, geographical-knowledge records, 723 source claims, 95 source records and research gaps are preserved under [research/1000-1499](research/1000-1499/README.md).

The interactive map skips records without trustworthy reference-site coordinates rather than plotting fabricated markers. Broad Australian cultural research remains in the archive instead of generating an all-history dated Australian society. Dated observations show their sourced time intervals, and uncertainty notes should not be interpreted as precise invention dates. Multi-party or unlinked events remain available in Compare → Events. This research dataset is not a scholarly peer-reviewed historical GIS resource.

Run `npm test` to validate the import alongside previous regression checks.

## v0.8 — 1500–2026 CE structured research

An additive integration of the supplied research pack: 187 society records, 173 dated events, 53 technology definitions, 87 technology observations, and 117 bibliographic sources. The entire original structured dataset (including 861 claim-to-source links, 72 figures, 60 reference places, 8 historic-map candidates and contextual evidence) is preserved in [research/1500-2026/source-pack.json](research/1500-2026/source-pack.json). Existing atlas identities are reused where possible; original research periods are not assumed to establish entire cultural lifespans. Where an event or observation cannot be defensibly tied to one dated society, it stays in the research evidence rather than being given an artificial owner. The eight historical-map items are research references, not verified rights-cleared map images.

The separate uploaded [500 BCE–500 CE report](research/500BCE-500CE-report.md) is archived for the next structured import. It is research prose, not a newly attached machine-readable seed dataset; no 48-society import is claimed from it.

## v0.9 — 500 BCE–500 CE research pack

Added the complete structured classical-period research as an **additive** browser module and immutable source archive. The supplied dataset contains 153 society records, 83 events, 36 technology definitions, 63 technology observations, 50 historical figures, 30 place anchors, 41 relationships, 25 cultural practices, 12 synchronistic comparisons, five historical map catalogue entries, seven geographical knowledge records, 61 sources and 618 source-to-claim references. Full content and editorial caveats are in [research/500BCE-500CE](research/500BCE-500CE/README.md).

The importer does **not** reinterpret astronomical BCE years using the earlier hand-authored negative-year conversion. Existing society IDs are retained, non-state cultural overviews stay out of the political timeline, and source-linked modern location anchors are not historical boundaries. Compare → Events includes the 83 original research records even when an event has no unambiguous single society owner. Technology milestones preserve the source record's date precision and distinct evidence/development type; unmapped items remain in the source archive. The Atlas story panel can show ancient figures, cultural practices, manuscript-map catalogue metadata, and geographical knowledge where the source pack supports them. Surviving original maps, later manuscript copies and modern reconstructions are not conflated or automatically reproduced.

Run `npm test` (including the new `classical-merge-test.mjs`) for chronology, duplicate IDs, source links and cross-reference validation. The source register contains reference leads and is **not** independent peer review.

## v0.11: Conflict discovery and Story Timeline QA

The optional [Conflicts & Human Experience explorer](public/conflicts.html) adds sourced conflict profiles, distinct battle/campaign/phase levels, civilian impacts, uncertainty and a source-access register. The 2026-10-21 [global conflicts research pack](research/conflicts/README.md) is preserved in canonical JSON without inventing unlocated battles, marching routes, ending dates or casualty totals. A short, dated, general-audience subset appears as collapsed `War & conflict` subject capsules in Story. Sensitive or unsupported research is not shown in default discovery and requires explicit opt-in within the conflict explorer.

The Story Timeline's CE century/half-century bin offset is corrected (1-50 CE is a complete 50-year bucket) and browser Back/Forward navigation no longer overwrites destination URLs when a modal closes. Existing atlas data arrays and entity classifications remain unchanged. Run `npm test` for the combined suite and new `conflicts-test.mjs` checks.

## v0.12.2 — Conflicts explorer finishing touches

The conflict viewer now supports shareable record deep links, related-event navigation, source-access limits and jumps back to Story and Compare. Period filters include wars crossing a period boundary (for example, Aceh War across 1900), while UNKNOWN end dates never imply indefinite war. ONGOING records are bounded by their observed-through date for filtering, without pretending that observation is a peace date. Sensitive and provisional records stay opt-in, including via deep links. The underlying historical evidence is unchanged.

Conflict milestones in Story now link to the original research dossier. Pure filter/navigation regression cases are included in conflicts-reader-test.mjs and npm test.
