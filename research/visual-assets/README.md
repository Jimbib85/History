# Living Atlas — researched visual asset shortlist (22 October 2026)

The historical app should distinguish source evidence (original objects and maps) from interpretation (our own illustrated scenes) and interface decoration (nonhistorical compass, paper, route graphics). **No source images have been downloaded or committed by this research pass.** Only use objects after file-level image rights checks; optimise and self-host licensed copies rather than hotlinking museum URLs.

## Recommended priority visual matches

| View | Object and date | Source |
|---|---|---|
| Compare: Abbasid | Luster Bowl with Four Camels, Iraq, tenth century | [Met 451768](https://www.metmuseum.org/art/collection/search/451768) |
| Compare: Song | Retreats in the Spring Hills, Chinese handscroll, first half twelfth century | [Met 40056](https://www.metmuseum.org/art/collection/search/40056) |
| Compare: Byzantine | Icon with Christ Pantokrator, 11th–12th c | [Met 464531](https://www.metmuseum.org/art/collection/search/464531) |
| Compare: Khmer | Pillar Fragment with Dancing Apsaras, late 12th–early 13th c | [Met 38303](https://www.metmuseum.org/art/collection/search/38303) |
| Compare: Wari | Wari tunic, 650–1000 CE | [Met 675980](https://www.metmuseum.org/art/collection/search/675980) |
| Compare: Maya | Chamá-style throne-scene vessel, 600–900 CE | [Met 318662](https://www.metmuseum.org/art/collection/search/318662) |
| Compare: Benin | Edo court plaque, equestrian oba, ca. 1540–70 | [Met 310752](https://www.metmuseum.org/art/collection/search/310752) |
| Interactions: Edo–Portuguese | Court plaque portraying Portuguese traders and manillas, ca. 1540–70 | [Met 316486](https://www.metmuseum.org/art/collection/search/316486) |
| Interactions: Iraq–Nishapur | Iraqi luster bowl excavated in Nishapur, 10th c | [Met 449723](https://www.metmuseum.org/art/collection/search/449723) |
| Interactions: Mughal–Christian imagery | Madonna and Child in a Domestic Interior, early 17th c | [Met 452104](https://www.metmuseum.org/art/collection/search/452104) |
| Technology: mechanical clocks | al-Jazari water clock illustrations, surviving manuscript dated 1315 CE | [Met 451300](https://www.metmuseum.org/art/collection/search/451300) and [451302](https://www.metmuseum.org/art/collection/search/451302) |
| Technology: colour printing | Ten Bamboo Studio manual, China, 1633 | [Met 63404](https://www.metmuseum.org/art/collection/search/63404) |
| Technology: scientific instruments | Astronomical table clock, 1568 | [Met 209211](https://www.metmuseum.org/art/collection/search/209211) |
| Their World: historical maps | Ortelius, Theatrum orbis terrarum, 1570 | [Library of Congress](https://www.loc.gov/item/2003683482/) |
| All maps: topography | Natural Earth II shaded relief (modern reference only) | [Natural Earth](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/) |

## Rights and historical safeguards

- **Met:** use official [Open Access API](https://metmuseum.github.io/) `/public/collection/v1/objects/{id}`; download only if `isPublicDomain===true` and the API supplies `primaryImage` or `primaryImageSmall`. Some public-domain object pages have no usable photo.
- **Natural Earth:** public-domain physical reference map, **not** ancient political borders.
- **Library of Congress:** item-level rights/advisory and correct map sheet/edition before copying.
- **Smithsonian:** object metadata and an individual photograph may carry different rights. Use only CC0-tagged media.
- **AIATSIS map:** cannot be reproduced, recoloured, cropped, overlaid with route/geography layers or republished in this Atlas without express approval. Do not import as a historical border layer.
- **All sources:** preserve object and depicted dates separately; do not portray a surviving printing example as its invention date. A work depicting a diplomatic reception is not automatic evidence of direct trade between two unrelated societies.
- **Cultural context:** Benin court artworks require contextual provenance and current-source descriptions, not just a detached aesthetic.
- **Missing coverage:** Indigenous Australian, Pacific, Arctic and Amazonian everyday-life imagery are underrepresented; do not fill gaps with unmarked AI reconstructions.

## Recommended integration

Use a compact asset manifest with: `asset_id`, `entity_id`, `technology_id`, `event_id`, `object_date_label`, `source_url`, `creator`, `media_license`, `evidence_type`, `file_sha256`, `local_variants`, `caption`, `alt_text`, `rights_checked_at` and `review_status`. Route authentic object imagery into Compare cards, technology detail journeys and the society reader; keep the chronological data and relationship evidence engines unchanged. Produce small, responsive WebP derivatives and use CSS fallback if assets are absent.

This is a researched selection, not complete global coverage.