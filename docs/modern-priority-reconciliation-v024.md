# v0.24 — Modern priority v2 reconciliation into main Atlas views

This release moves defensible parts of the 1501–2026 CE priority research v2 collection out of the separate Discover research drawer and into the Story timeline, Compare, technology tree and Conflicts reader. The v0.23 canonical gzip pack remains unchanged.

## Crosswalk: what was actually reconciled

The generator `scripts/build-modern-v2-reconciliation.mjs` reads the v2 archive, the original modern event pack and the v0.22 modern expansion import. It uses exact event IDs first, or an unambiguous normalized-title-plus-year match. No fuzzy title similarity is treated as identity.

| Event classification | Count | Treatment |
| --- | ---: | --- |
| Existing research identity | 33 | Preserve original entry, attach v2 source URLs, verified claim IDs and review scope without overwriting its dated history |
| Unique, one-year POINT candidate | 10 | Add to Story and Compare; attach to Map only where an already-dated society can be linked without inventing a lifespan |
| Broad/uncertain/context record | 15 | Keep in source-linked Discover, not false one-year chronology |
| Collision/ambiguous identity | 39 | Preserve for review in Discover; do not create duplicate timeline entries |
| **Total** | **97** | All accounted for, none lost |

The ten eligible single-year v2 records are the 1846 anaesthesia demonstration; 1945 Trinity nuclear test; 1949 transfer of sovereignty to Indonesia; 1953 Korean Armistice; 1954 Obninsk power station; 1956 Suez Crisis; 1962 Algerian independence recognition; 1979 Iranian Revolution; 2003 invasion of Iraq; and a 2022 China poverty assessment. **A point dated in the source does not mean the whole consequence or conflict was completed in that year.** Their descriptions retain this nuance.

The generator is reproducible. `node scripts/build-modern-v2-reconciliation.mjs --check` fails if the generated source crosswalk disagrees with either input research pack. Every promoted event includes claim IDs, source URLs and explicit non-independent-corroboration language.

## Technology: 28 observations reviewed

- Four matched observations enrich existing technology appearances with additional source-linked notes and claim IDs rather than producing duplicate markers (1969 lunar flight, 1954 Obninsk nuclear power, 1844 telegraph, 1945 Trinity).
- Five observations are broad historical evidence windows and remain contextual (Edo print commerce, human genomics, Meiji industry, wartime penicillin production and Potosí processing). None has an invented invention-year marker.
- Nineteen otherwise precisely dated observations reference institutions or research communities that are **not** independently dated political societies in the Atlas. These remain in Discover until their actor-to-society crosswalk is sourced; mapping a hospital, inventor or network consortium to an entire civilisation would be false attribution.

Technology appearances added here may only use existing historical societies with source-bounded lifespans and source-dated single-year evidence. An observation is never a universal first-invention claim merely because it is plotted.

## Conflicts: 26 records reconciled

Eight existing conflict/battle/settlement records were source-enriched. Eighteen additional distinct conflict, battle and treaty/settlement records became available on the main Conflicts screen. Conflict complexes and campaigns keep their hierarchy; battles and treaties remain separate types. Parent/participant role evidence and source-access statuses are carried over. Sensitive material requires the existing opt-in control.

The source offers no georeferenced routes, confirmed total casualty aggregations or verified historical border polygons. The app does not invent any.

## Research and uncertainty policy

- The original v2 source report records **zero independently corroborated claims**. Its SOURCE_CHECKED status is a source-review status, not a historical truth certificate.
- Broad EVIDENCE_WINDOW, COMPLEX_ENVELOPE, DURATION and ambiguous date scopes remain contextual. Inherited modern records are source-enriched, never overwritten with a speculative year.
- All 90 actor/society references in v2 lack authoritative polity spans and have `map_polity_bar_allowed=false`: **no new fabricated civilisation bars**.
- The v0.23 research reader remains the place for all 97 events, 28 technology observations, 18 conflicts and the associated source claims, including unresolved identity cases.
- The previous modern-era data retains its identity and source provenance. Adding the v2 evidence must not increase the recorded number of historical societies.

## Verification

`npm test` runs the full legacy regression suite, new generator-parity checks and `modern-v2-reconciliation-test.mjs`. GitHub Actions' Chromium audit tests all six views at desktop and mobile widths, and now verifies that the appropriate new source evidence actually appears in Story, Technology and Conflicts. No backend or authentication was introduced.

Future work: review the 39 ambiguous IDs individually against original source dates and wording, and resolve the 19 institution-to-society technology attribution cases only when evidence is available.
