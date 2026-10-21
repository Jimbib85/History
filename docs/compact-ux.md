# Compact exploration — v0.12

World Map, Compare and Technology follow the Story view’s reading pattern: a short overview, a chosen record, then supporting evidence. Expansion is separate from the historical date, selected entity, chart scale and saved row order.

## World Map

The catalogue starts with eight matching entities at the selected date. Other periods, era shortcuts and refinement controls expand when needed. A selected entity stays reachable. The reader keeps identity, dates, location and overview visible; Events, People & daily life, Maps & geographical knowledge, Connections, contemporaries and Sources open individually. Each topic shows eight record headings initially and allows one record body at a time. Reader search covers the full loaded topic collection, including later batches. Record links reveal their containing topic.

The two mini timeline groups expand independently and add rows without changing their common date scale. Map identity, date, source and representation caveats remain visible.

## Compare

Overlap and regional charts retain a linear shared time ruler. Groups can collapse; selection and pin navigation reveal the appropriate group. Saved Society/Empire ordering continues to use `world-history-atlas-compare-order-v1`. Reading evidence does not move the date or reorder lanes.

Events start with eight dated headings, support search across all records in the selected window and continue beyond the former 200-record limit. Era cells open their complete matching list in the reader. Meanwhile, nearby events and sources expand independently. The chart may scroll horizontally inside its container on small screens; the page and reader fit the available width.

## Technology

The selected society or empire filters both the technology tree and its evidence. Only families with matching topics appear, and all counts, search results, timeline rows, map locations and Random choices use the same selection. Matching uses existing civilisation IDs on evidence records. It does not infer technologies from a broad cultural relationship or similar name.

**All societies & empires** restores the full comparison. A selection with no linked research clears the previous topic and record and explains the gap. Changing society clears the search and batch limits, retains an eligible topic where possible, and chooses evidence from the new selection. Reopening the tree preserves its selection until the society chosen on the main Map changes.

Each plotted milestone retains its original record key, so separate milestones for the same society remain individually selectable. The chosen evidence body opens inline, with other records batched by eight. The full date range for the current selection stays fixed when more rows appear. A single milestone is shown as a dated point. Geographic points and curated connections retain their approximation notes; routes require evidence for both endpoints in the current view.

## Navigation and evidence

Primary navigation uses Story, World Map, Compare, Technology and Conflicts. Supported transitions carry the current year and entity; Story uses `entity`, while Map and Compare use `civ`. Year zero remains 1 BCE. The clean homepage still enters Story, and existing Map/Technology links remain valid. No historical datasets, claim registries or conflict sensitivity defaults are changed.

## Verification

`npm test` runs the existing research, Story and conflict checks plus complete-data Map, Compare reader and Technology regressions. These cover batching, hidden-record search, record identity, dates, scale and non-mutation of research data. `tests/responsive.html` is copied into branch previews only, for checking the real app in 1440, 1024, 768, 390 and 320 pixel frames. It is not included in production assets.
