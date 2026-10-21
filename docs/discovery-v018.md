# v0.18 — Discovery & Refinement

## Intent
Make the Atlas enjoyable to explore without overbuilding it: four short editorial journeys, a genuinely *same-year* cultural snapshot, and a random **source-linked** human story. No generated historical narratives, fabricated contacts, logins, AI backend or database.

## Research contract
The indexed material comes from the original research archives:
- 25 classical cultural-practice records.
- 30 medieval cultural-practice records.
- 33 modern cultural-practice records.

`public/discovery-data.js` is a **generated presentation excerpt**. It preserves the source-provided title/summary/topic, society reference, **explicit start/end** when present, research confidence, source IDs and accessible source URLs (including verification/access status). Regenerate with `node scripts/build-discovery-data.mjs`. `npm test` checks that it matches the original research packs. Do not edit this excerpt manually or treat it as independently verified.

**Important limitation:** medieval cultural-practice rows do **not** include a specific start/end interval in the research source pack. Their dates are left `null`; the UI displays “Not dated in this research record.” They appear in theme journeys but **not** in a same-year comparison, where assigning a single year would be misleading.

## Journey curation

The four journeys use **explicit record IDs**, with checked existence:
- Daily life — Roman housing/water, Song cities, East African household life.
- Making and trade — Punic commerce, Chola and Goryeo craftsmanship, West African gold weights.
- Learning and writing — Mauryan inscriptions, Japanese and Korean scholarship, Timbuktu learning.
- Belief and community — South Asian monastic networks, Indian temple communities, Korean Buddhist patronage and Ethiopian manuscript traditions.

This is editorial juxtaposition, **not** a chronology of transmission. Unrelated traditions must not be portrayed as one evolution or a shared religion.

## Same-year and Random

Same-year cards require the raw record interval to include the chosen year (astronomical year numbering, 0 = 1 BCE). **These intervals are research coverage, not proof the described activity took place precisely in that selected year.** The initial example years are 200, 1600 and 1800 CE. The selection prefers diverse linked society IDs, without implying exchange or contact. Empty periods display a clear gap.

Random only selects records with a valid HTTP(S) source link and avoids the recent selection; a link to the exact selected record is put into the URL. The “registered source” is a research lead, not independent claim review.

## Performance measurement

The Discover page deliberately loads only five first-party files: its HTML, CSS, UI JS, model and the generated **45–55 KiB cultural excerpt**, rather than all three 1.2+ MiB research bundles. `asset-audit.mjs` enforces an uncompressed byte budget and reports comparison against the original packs. **This is an asset-size audit, not an actual network speed, paint, mobile memory or Lighthouse measurement.** Performance testing on devices remains useful before final release approval.

## Testing and release
`npm test` includes generated-index equality, journeys, undated gaps, repeated Random, BCE/CE conversion, new page boot and interaction checks, and a static asset budget alongside previous Atlas regression tests. The release PR goes **directly to `main`**; do not merge a follow-on branch into an already-merged branch.

Do not infer copyright permissions from catalogue URLs or reproduce photos of research objects without item-level rights review.
