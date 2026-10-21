# Global conflicts research pack

Data source: uploaded `World_History_Atlas_Global_Conflicts_Research_Pack(1).zip`; cutoff 2026-10-21.

`structured-pack.json` preserves all canonical JSON tables: conflicts, battles, participants, figures, social impacts, claims and sources. The original ZIP additionally contained independent schemas, reports, CSV and JSONL representations; this archive does not create extra event counts by including duplicate export formats.

Conflict hierarchies remain distinct: 31 individual profiles within 45 conflict-register entries; 22 battles/sieges; 13 other events; 3 phases; 3 campaigns; 5 treaties; 86 sources; 399 claims and 514 claim-to-source edges. Ongoing records retain null end dates and `observed_through`; no inferred routes or boundary polygons are created.

The `public/conflicts-data.js` projection is an optional standalone research explorer. Only dated non-graphic general events with source links are added to Story Timeline subject discovery by `public/conflicts-story.js`. Sensitivity and NEEDS_REVIEW records require opt-in inside the conflicts explorer and do not enter the ordinary Story stream. Source access and confidence labels are not peer review.