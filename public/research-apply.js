/* Additive adapter. Load after entity-types.js and all research datasets. */
// Stable IDs take precedence; no imported row may replace an established Atlas entry.
const atlasImportExisting = new Set(CIVILISATIONS.map(c=>c.id));
for (const c of ATLAS_RESEARCH_CIVILISATIONS) {
  if (!atlasImportExisting.has(c.id)) { CIVILISATIONS.push(c); atlasImportExisting.add(c.id); }
}
// Only attach to the core EVENTS stream when an actual mapped society exists.
// The separate ATLAS_RESEARCH_EVENTS array retains unlinked, global and disputed records.
const atlasImportEventKeys = new Set(EVENTS.map(e=>e.title.toLowerCase()+'|'+e.year));
for (const e of ATLAS_RESEARCH_EVENTS) {
  if (!e.civ || !atlasImportExisting.has(e.civ)) continue;
  const target=CIVILISATIONS.find(c=>c.id===e.civ);
  if (!target || e.year<target.start || e.year>target.end) continue;
  const key=e.title.toLowerCase()+'|'+e.year;
  if (atlasImportEventKeys.has(key)) continue;
  EVENTS.push({year:e.year,title:e.title,region:e.region,kind:e.kind,detail:e.detail,civ:e.civ,researchId:e.id,confidence:e.confidence,datePrecision:e.datePrecision,source:e.sourceUrl,endExclusive:e.endExclusive});
  atlasImportEventKeys.add(key);
}
const ATLAS_IMPORT_STATS = {societies:ATLAS_RESEARCH_CIVILISATIONS.length,events500:ATLAS_RESEARCH_EVENTS.filter(e=>e.origin==='500-999').length,eventsModern:ATLAS_RESEARCH_EVENTS.filter(e=>e.origin==='1500-2026').length,technologyDevelopments:ATLAS_RESEARCH_TECH_DEVELOPMENTS.length,sourceRecords:Object.keys(ATLAS_RESEARCH_SOURCES).length};

// Historical attribution corrections made possible by the newly added polity records.
// A colonial settlement is not an event *by* an Indigenous cultural overview.
const atlasHaitiEvent=EVENTS.find(e=>e.title==='Haitian independence'&&e.year===1804);
if(atlasHaitiEvent) atlasHaitiEvent.civ='haiti';
const atlasNswEvent=EVENTS.find(e=>e.title==='British colony established at Sydney Cove'&&e.year===1788);
if(atlasNswEvent) atlasNswEvent.civ='new-south-wales-colony';