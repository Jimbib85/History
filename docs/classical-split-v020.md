# v0.20 — Split classical research import (reviewed and staged)

The two supplied research archives cover **500 BCE–1 BCE** and **1–500 CE**, representing astronomical half-open ranges `[-499,1)` and `[1,501)`. Year 0 is 1 BCE. Both source archives reported passing their own structural/staging and cross-batch identity tests, which **do not** constitute independent historical verification.

## What is merged

1. **Complete canonical staging packs** are archived in `research/classical-split/` as zlib/deflate-compressed, base64-encoded original `data/pack.json` objects. Each preserves all 20 typed tables, including source IDs, atomic claims, source/claim associations, review gaps, locations and research geometry caveats.
2. **72 distinct reviewed excerpts** are available in an on-demand, mobile-friendly section of Discover. They consist of 33 events, 20 technology observations, 14 cultural practices, 2 historical maps and 3 geographical-knowledge observations.
3. **Eight records occur in both batches.** Their identity is preserved once rather than appended as duplicates. The canonical archives retain both source records and batch memberships. There are 79 shared civilisation IDs across the two staging packs; those are **not 79 new civilisations**.
4. Only records with a non-empty `reviewed_summary`, `verified_claim_ids`, and `SOURCE_CHECKED`, `EXCERPT_CHECKED`, `ABSTRACT_CHECKED` or `PARTIALLY_SOURCE_CHECKED` status appear in the public evidence reader. `NEEDS_REVIEW` stays in the archive.

## Date and evidence rules

- **Precise markers**: only `POINT` and explicitly `CONVENTIONAL_MARKER` records with exactly one source year are eligible for a link into the ordinary Story year. There are 17 such reviewed event records.
- **Uncertain occurrence windows**: show their source's original date text and any bounds. Do *not* convert the middle of the window into a claimed year.
- **Broad period observations**: contextual descriptions, not instantaneous inventions, technology transmission, or territorial boundaries.
- **Undated evidence**: it remains undated even when the research pack concerns a particular 500-year block.
- **Partial checks**: the displayed text is the source's `reviewed_summary`, **never** the whole compound seed `summary`. The badge reports the actual review scope, not a global "verified history" claim.
- **Geometries**: archived point/reference caveats remain unchanged. Do not render those as ancient territorial polygons. Respect Indigenous permissions and cultural continuity.

The existing `ATLAS_CLASSICAL_PACK`, its event identities, tech appearances, society coverage, mapping and source data remain untouched. The new material is a **reviewed overlay**, not an automatic overwrite of the timeline or technology-tree observations. This avoids breaking the existing 153-society/83-event core classical import or duplicating inherited observations until each reconciliation is reviewed.

## Reading and generating the canonical packs

For example:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const b64=readFileSync('research/classical-split/500BCE-1BCE.pack.deflate.b64','utf8').replace(/\s/g,'');
writeFileSync('500BCE-1BCE.pack.json',inflateSync(Buffer.from(b64,'base64')));
```

Canonical source JSON SHA-256 hashes:
- BCE: `a53c31756868c24bb1708edfcefff082dbf9d20a08edad3ed506ddee4383565a`
- CE: `e6e246f7e7f51dab92ce39b8910670e9fd37aee57cb4668d8199f587dfb2ff23`

Original user ZIP SHA-256 values (the full ZIP includes more accompanying reviews, validation and README documentation than the canonical pack):
- BCE: `fdd180d98bbf640378732f5d3ea100e75d4a66fb5ebf877834d4a37f01c91335`
- CE: `bcb58cc73b0998564304c4d8f4102ac05e6f9bc677d5e9d45328ae2ab69edcd1`

`classical-reviewed-archive-test.mjs` checks archive integrity, table totals and that reviewed excerpts match their actual verified-claim sets. `classical-reviewed-test.mjs` guards against fake exact dates, duplicate IDs and source/link loss. The data payload is **10.4 KB compressed/base64** and is loaded only when users open the evidence section, not on normal Discover load.

## Later reconciliation

Any future promotion into World Map, Story, Compare or Technology must use a typed ID crosswalk, preserve original source lineage and comparison logic, and document when a corrected atomic claim displaces or qualifies an existing record. The stage validation and browser UI tests are necessary but do not replace historical review.
