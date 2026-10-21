# Research coverage versus historical lifespan (v0.13)

Research imports sometimes use the start or end of the studied batch as an entity's visible interval. Those endpoints are **not** necessarily the historical foundation or disappearance of the society.

The Atlas uses `periodScope`:
- `research-window`: display **Research coverage** and explicitly say it is not a complete lifespan.
- `source-range`: display **Source-dated range** and say a complete lifespan is not established by this range.
- missing: retain the pre-existing curated date display, which may itself be approximate.

`public/date-scope.js` generates these labels in World Map and Compare. This is a **presentation correction**, not an assertion that additional dates are known. Do not extend research intervals or derive missing chronology from another polity. The underlying period bounds remain useful for browsing the currently documented interval, but **absence outside those bounds is not evidence of historical absence**.

The new CI workflow runs the existing 14 test scripts and `date-scope-test.mjs`. Each import should continue to preserve source IDs, confidence, date precision, contested interpretations and the untouched source archive. The testing workflow does not independently verify research assertions.
