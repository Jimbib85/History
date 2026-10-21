# v0.16 geography: reference layers, not reconstructed historical borders

## Why these map symbols are deliberately modest

The bundled `world.svg` is a **modern-geography coastline reference**, not a map of any historic period. The imported `CIVILISATIONS` entries contain approximate representative latitude/longitude pairs; these are *not* authoritative georeferenced historical borders, political capitals for every era or archaeological site positions.

In the **Actual world** tab, v0.16 groups nearby reference points at the current zoom level. A grouped count says how many Atlas entries share a small *display cell*; it is **not** a territorial area, settlement count or political alliance. The chosen society remains a separate clickable point. Click or keyboard-activate a grouped marker to zoom; at maximum zoom, click again to reveal individual markers. The **Group nearby / Show nearby groups** control can expose individual points at any zoom.

**Coordinate grid** adds optional present-day latitude/longitude reference lines. It is a navigational aid over the modern coastline, **not** evidence for historical cartography. The coordinate layer does not render over historical-map artwork.

## Existing geographic views and caveats

- **Actual world**: modern coastline with approximate representative society markers and the optional reference grid.
- **Their world map**: independently sourced historic cartography, with date, edition, type and source link. No false projection alignment with the present-day basemap.
- **World they knew**: illustrative `PLACES` contacts curated for particular societies; those points are not a geographic boundary of collective knowledge.

The selected society's location, date scope and background source are shown with a warning that background historical reading **does not independently verify the map marker coordinate**. Unknown / invalid coordinates are excluded from the new clustered layer. No territorial geometry has been added or inferred.

## Technical notes

- `public/geo-layers.js`: pure display projection, validity filter, deterministic visual grouping, optional grid. All generated map lines are longitude/latitude reference lines, not research claims.
- `public/app.js`: responsive marker choices, zoom to cluster, safe accessible keyboard activation, selected-society provenance notes.
- `geo-layers-test.mjs`: tests valid coordinates, grouping, selected focus, geographic controls, URL state, and map-mode separation. Existing `map-ux-test.mjs` validates imported data stays unchanged.

Map preferences are shareable in the page URL using `geo=points` (default groups) and `grid=1` (default off). The app remains offline-capable.

## Future source-backed boundaries

A historical territory overlay needs **individually sourced geometry**, dates of validity, type of evidence and certainty level (controlled core, disputed claim, approximate sphere, later reconstruction), plus licensing review. A society's centre coordinate or current national borders are **never sufficient**. No such polygons ship in this increment.
