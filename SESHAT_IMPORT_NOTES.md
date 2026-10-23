# Seshat Cliopatria data integration (World History Atlas)

**Source:** Seshat Global History Databank, *Cliopatria – A geospatial database of world-wide political entities from 3400 BCE to 2024 CE*, release **v0.2.1** (3 October 2026). Authors/editors include Ed Chalstrey and James Bennett. https://doi.org/10.5281/zenodo.23128623

**Licence:** Creative Commons Attribution 4.0 International (CC BY 4.0). https://creativecommons.org/licenses/by/4.0/

**Source repository:** https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1

**What this project changes:** From the original EPSG:4326 GeoJSON archive, the build filters to explicitly reviewed `POLITY` names and, when provided, Wikidata identifiers; converts source BCE years to the Atlas's astronomical year notation (0 = 1 BCE); simplifies polygon vertices; rounds coordinates; and emits lightweight, identity-scoped JSON files in `public/seshat/`. This transformation is **not an independent archaeological or cartographic verification**.

**Scope:** The first crosswalk targets 33 existing atlas entities, but a target appears in the generated manifest only when the pinned upstream dataset actually contains a confidently matched, dated `POLITY` geometry. The `scripts/cliopatria-matches.json` list is a review list, **not a claim that all 33 matches or all historical phases are available**. Source geopolitics, disputed boundaries, missing polities, non-state cultures and uncertain timelines must be clearly disclosed.

**Temporal rule:** A polygon is shown only while the selected Atlas year lies within a source feature's inclusive `FromYear`–`ToYear` window. This means the data does not show smooth boundary animations between unsupported years.

**Interpretation:** Cliopatria shapes are approximate reconstructions of political entities and overlap can be meaningful. Historical entities were not necessarily contiguous or homogenous; geopolitical boundaries and exact chronology can be contested. Atlas centre-point clouds remain illustrative and are suppressed only for specific societies and dates when sourced polygons can be drawn. The separately sourced University of Minnesota imperial snapshots remain a fallback where available.

## Refreshing

Run `npm run import:seshat` with Python 3 available. The command fetches the pinned source archive if not in `.cache/`, then writes **generated** `public/seshat/index.json` and per-society assets. The Cloudflare deployment's `npm test` runs the same import before unit checks so all generated data is actually present in deployed Workers static assets. This imports the large source at **build time, never into the user's browser**. Import logs report which entities matched or were unmatched.

The generated assets and upstream archive are excluded from Git to avoid checking in a large dataset. The pinned source version, SHA-256 hash and coverage counts are embedded in the runtime manifest.

## Building safely

- Do not infer empire borders from the approximate centre point or from another named empire.
- Do not map `RELATION` composite entities into `POLITY` territory without a documented mapping review.
- Preserve the source's date ranges; do not infer missing shapes for an intermediate year.
- Review aliases and Wikidata IDs before expanding the crosswalk.
- Keep Seshat provenance and licence accessible in the map legend.
- The displayed simplified polygons can diverge visibly from source shapes, especially small islands and narrow corridors; use the original source for precise research.

Historical attribution and limitations should remain visible when a shape is selected or shared.
