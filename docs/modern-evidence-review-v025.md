# v0.25 — Evidence-based historical identity review

## 39 event identity collisions resolved

The 39 records labelled `ambiguous_id` by v0.24 were not 39 missing historical events. Each supplied v2 record reused an ID **already present in both** `ATLAS_MODERN_PACK.events` and the modern subset of `AtlasExpansionData.packs`. The original event names sometimes differ (e.g. an event versus a movement, the start versus the broader process), but their **ID and initial year agree** across all three source packs.

The crosswalk now labels these as `shared_id_same_year`. Each v2 source claim is attached to **both older catalogue variants**, retaining the original names, descriptions, interval scopes, evidence and source identifiers. No new event is invented and no earlier historical account is silently replaced.

**Event audit after reconciliation:**

| Classification | Before | After |
| --- | ---: | ---: |
| Source-enriched existing events | 33 | **72** |
| New unique dated events | 10 | **10** |
| Broad / uncertain period evidence | 15 | **15** |
| Ambiguous IDs requiring catalogue resolution | 39 | **0** |
| Total | 97 | 97 |

A shared ID is a *catalogue identity*, not proof that the wording of two claims is fully interchangeable. For example, the French Revolution and the Declaration of the Rights of Man are related but not the same event, and Akbar's accession is not a synonym for all subsequent Mughal consolidation. Their specific source dates and distinct wording remain available under the shared identity. We do not present them as 39 extra individual events.

The rule is narrow: `ids.length>1` is accepted only if all corresponding prior entries have the **exact same initial year** as v2 and each has a distinct canonical record ID. Different years continue to require review. The reconciliation generator and its regression tests defend this constraint.

## 19 institution-only technology observations

The source records support specific observed events at institutions, companies, universities, laboratories or scientific networks. They **do not establish civilisation-wide adoption**, which means attributing the invention or adoption to a selected empire solely because an institution was located there would be misleading. The v2 technology observations include:

- BASF and the industrial ammonia process
- Massachusetts General Hospital and ether anaesthesia
- ARPANET / network-research institutions, the Internet and TCP/IP
- 19th-century British science, engineering, medicine, printing and rail institutions
- U.S. electronics, electricity and research organisations
- WHO's recognition of global smallpox eradication
- AI research groups developing the transformer architecture
- CERN and the creation/release of the Web

**All 19 single-year, source-linked observations are now visible in the Technology explorer** via a new expandable *Research institutions and historical technology* section, grouped by technology topic. Cards contain the original date, actor IDs, source links, claim IDs, and review limitations.

**Crucially, the section appears only when the Technology society selector is set to All societies & empires.** It is not treated as evidence that any specific society invented or adopted a technology; selecting a society hides the unattributed records. The 4 previously matched society-linked technology appearances remain source-enriched, and the 5 broad technological evidence windows remain in Discover.

## Limitations

The uploaded v2 research reports **zero independently corroborated claims**. SOURCE_CHECKED is a source-review status, not a guarantee of scholarly agreement or independent verification. The original archive is preserved. No civilisation lifespans, geographical borders, transmission routes, first-invention dates, or national claims were inferred from unsupported institution-to-society relationships.

The remaining 19 records now have a clear **institutional attribution and browsable technology context**, but **do not have sourced society-wide adoption links**. That part cannot be claimed as resolved without additional evidence. The remaining 15 broad/uncertain event records are also intentionally contextual.

## Verification

- `node scripts/build-modern-v2-reconciliation.mjs --check` validates exact reproduction from the uploaded modern pack and original imported research.
- `modern-v2-reconciliation-test.mjs` tests 72 existing-event enrichments, 10 new single-year events, 15 contextual records and 0 unresolved shared-ID collisions.
- `modern-v2-identity-review-test.mjs` verifies all 39 shared identities have two preserved catalogue targets and 19 institution-only research cards are hidden in society-filtered views.
- The Chromium browser audit exercises six screens at desktop/mobile widths and verifies institutional cards appear only under the all-societies technology selection.

No backend, new API service or additional source archive downloads have been introduced.
