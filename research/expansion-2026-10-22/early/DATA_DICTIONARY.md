# Data dictionary

The canonical representation is the JSON array in `data/<table>.json`; JSONL and CSV are equivalent exports, not extra records. CSV is UTF-8; arrays/objects use JSON inside a quoted cell, null is an empty cell, booleans are true/false. Integers are not Excel date serials.

## Dates

`start_year`, `end_year_exclusive`: astronomical integers; a bounded interval includes start and excludes end. `original_date_text` preserves the readable qualification. `date_precision` is separate from `confidence`. `temporal_kind` distinguishes POINT, DURATION, DATE_WINDOW, APPROXIMATE_DATE, ATTESTED_BY, OBSERVATION_WINDOW and UNDATED_CONTEXT. A date window is not a long-running event. Null means unknown or intentionally unplaced, never zero.

`exact_date` is a checked ISO date where supplied. `observed_through` separates an observation cutoff from the lifetime of a historical process. `context_only` and `crosses_batch_boundary` prevent research membership from truncating history.

## Evidence

`source_ids`: references to source_register. `claim_ids`: references to explicit summary assertions. `source_claims` states what returned material supports, with an evidence locator and access level; the summary is paraphrased, not a long quotation. Multiple links are not automatically independent corroboration.

`confidence`: HIGH, MEDIUM, LOW, DISPUTED or UNKNOWN. These are editorial assessments, not numerical probabilities. `review_status` does not claim human review or scholarly peer review. `independently_corroborated` is false throughout this release.

`material_consulted` includes indexed excerpts; `source_page_opened` means webpage text was actually obtained and inspected. `complete_source_reviewed` is false. Unknown licences remain UNKNOWN, and asset rights are separate from factual summaries.

## Tables

| Table | Meaning |
|---|---|
| events | Selected events, long processes, archaeological phases and contemporary observations. |
| technology_developments | Dated or contextual observations linked to topics and event evidence; not all are inventions. |
| technologies | Editorial topic definitions with linked evidence; no universal invention date. |
| societies | Community, polity, institution and network identity references, not full lifespans. |
| figures | Scoped contributions, not complete biographies; null life dates deliberately remain null. |
| relationships | Evidence-linked contact, control, succession or other relationships, with scoped dates. |
| technology_transmission | Positive evidence for transfer; null origin and null route are allowed. |
| technology_dependencies | Context-specific enabling/component relationships, not chronology alone. |
| places | Rounded public property anchors with coordinate role and uncertainty notes. |
| historical_maps | Composition vs surviving item dates, catalogue attribution, rights and image-inspection status. |
| geographical_knowledge | Attributed knowledge claims, not fabricated knowledge polygons. |
| cultural_practices | Social and everyday practices embedded in the selected evidence. |
| connections | Editorial comparisons of sourced records; simultaneity does not imply contact. |
| statistical_observations | Attributed measures with units, scope and method. No summing incompatible categories. |
| source_register | Consulted materials, URLs, access levels, limitations and reuse metadata. |
| claims | Explicit summary assertions; not a full atomic audit of every field. |
| source_claims | Evidence locators and support/context links for those assertions. |
| research_gaps | Named deficiencies; not historical absences. |
| coverage_matrix | Period-region cells; counts can overlap and cannot be summed as unique events. |
| entity_reconciliation | Read-only identity matches and manual-review candidates, not a tested app import. |

## Geography

GeoJSON uses longitude, latitude. Point coordinates are modern public UNESCO reference anchors rounded to three decimals. This is not a measured historical error radius. Valid historical borders and routes are not supplied. No inferred polygons are created.

## Significance

`importance_rationale` and `importance_tier` are editorial selections, not facts measured on an impact scale. Reference counts and source-access status must not be mistaken for importance or completeness.
