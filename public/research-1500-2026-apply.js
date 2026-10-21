/* v0.8 modern-period additive adapter. Preserve all original research records. */
const ATLAS_MODERN_SOURCES = Object.fromEntries(ATLAS_MODERN_PACK.source_register.map(s=>[s.id,s]));
const ATLAS_MODERN_SOURCE_URL = record => (record.source_ids||[]).map(id=>ATLAS_MODERN_SOURCES[id]?.url).find(u=>typeof u==='string'&&/^https:\/\//.test(u))||null;
const ATLAS_MODERN_REGIONS={ 'Europe':'Europe','Western Europe':'Europe','Eastern Europe':'Europe','Northern Europe':'Europe','Southern Europe':'Europe','North Africa':'North Africa','Northeast Africa':'North Africa','West Africa':'Sub-Saharan Africa','East Africa':'Sub-Saharan Africa','Central Africa':'Sub-Saharan Africa','Southern Africa':'Sub-Saharan Africa','Sub-Saharan Africa':'Sub-Saharan Africa','Central Asia':'West Asia','West Asia':'West Asia','Middle East':'West Asia','South Asia':'South Asia','East Asia':'East Asia','Southeast Asia':'Southeast Asia','North America':'Americas','South America':'Americas','Central America':'Americas','Mesoamerica':'Americas','Andes':'Americas','Caribbean':'Americas','Americas':'Americas','Pacific':'Oceania','Oceania':'Oceania','Australia':'Oceania','Global':'Global','Arctic':'Americas'};
const ATLAS_MODERN_COLOURS={'Europe':'#497ead','West Asia':'#9c668f','North Africa':'#b98a3c','Sub-Saharan Africa':'#8a9148','East Asia':'#b86f63','South Asia':'#a86b56','Southeast Asia':'#3b9293','Americas':'#5a9872','Oceania':'#6977a7','Global':'#6c8390'};
const ATLAS_MODERN_EXPLICIT_ALIAS={'safavid':'safavid','mughal':'mughal','qing':'qing','tokugawa':'tokugawa','vijayanagara':'vijayanagara','asante':'asante','dahomey':'dahomey','kongo':'kongo','haiti':'haiti','british-raj':'british-raj','french-indochina':'french-indochina','new-south-wales-colony':'new-south-wales-colony'};
const ATLAS_MODERN_ALIAS={};
const ATLAS_MODERN_BY_ID=new Map(CIVILISATIONS.map(c=>[c.id,c]));
let ATLAS_MODERN_ENTITIES_ADDED=0,ATLAS_MODERN_ENTITIES_REUSED=0,ATLAS_MODERN_RESEARCH_ONLY=0;
for(const s of ATLAS_MODERN_PACK.societies){
  const id=ATLAS_MODERN_BY_ID.has(s.id)?s.id:(s.legacy_id&&ATLAS_MODERN_BY_ID.has(s.legacy_id)?s.legacy_id:(ATLAS_MODERN_EXPLICIT_ALIAS[s.id]||s.id));
  ATLAS_MODERN_ALIAS[s.id]=id;
  if(ATLAS_MODERN_BY_ID.has(id)){ATLAS_MODERN_ENTITIES_REUSED++;continue;}
  if(!Number.isInteger(s.start_year)||!Number.isInteger(s.end_year_exclusive)||s.end_year_exclusive<=s.start_year||s.kind==='historical_period'||s.region==='Australia'&&s.kind==='cultural_overview'){ATLAS_MODERN_RESEARCH_ONLY++;continue;}
  const region=ATLAS_MODERN_REGIONS[s.region]||s.region;
  const entry={id,name:s.name,kind:s.display_group==='empires'||s.kind==='empire'?'empire':'society',researchKind:s.kind,region,
    start:s.start_year,end:s.end_year_exclusive-1,at:Math.max(s.start_year,Math.min(s.end_year_exclusive-1,1850)),
    color:ATLAS_MODERN_COLOURS[region]||'#728e8f',icon:'◆',summary:s.summary||'Historical research seed.',location:s.location||s.region,
    source:ATLAS_MODERN_SOURCE_URL(s)||'https://www.wikidata.org/',sourceIds:s.source_ids||[],confidence:s.confidence||'UNRATED',dating:s.dating||s.date_precision||'range',
    periodScope:s.provenance_stage==='continuation_from_1000_1499'||(s.start_year<=1500&&s.end_year_exclusive>=2027)?'research-window':'source-range',researchBatch:'1500-2026',researchId:s.id,
    originRegion:s.region,coordinatesPrecision:'not-yet-georeferenced'};
  // Do not infer historic borders or centroids from modern reference-site points.
  CIVILISATIONS.push(entry);ATLAS_MODERN_BY_ID.set(id,entry);ATLAS_MODERN_ENTITIES_ADDED++;
}
// All 173 source events remain available even when they involve many actors or no suitable political owner.
const ATLAS_MODERN_EVENTS=ATLAS_MODERN_PACK.events.map(e=>{
  const participants=(e.society_ids||[]).map(id=>ATLAS_MODERN_ALIAS[id]||id);
  const valid=participants.find(id=>{const c=ATLAS_MODERN_BY_ID.get(id);return c&&c.kind!=='overview'&&e.start_year>=c.start&&e.start_year<=c.end;})||null;
  return {id:'m1500-'+e.id,year:e.start_year,endExclusive:e.end_year_exclusive,title:e.title,detail:e.summary,
    originalRegion:e.region,region:ATLAS_MODERN_REGIONS[e.region]||e.region,datePrecision:e.date_precision,confidence:e.confidence,
    kind:e.category,civ:valid,societyIds:participants,sourceIds:e.source_ids||[],sourceUrl:ATLAS_MODERN_SOURCE_URL(e),origin:'1500-2026-structured',evidenceNote:e.evidence_note};
});
const ATLAS_MODERN_EVENT_KEYS=new Set(EVENTS.map(e=>e.title.trim().toLowerCase()+'|'+e.year));
let ATLAS_MODERN_EVENTS_ATTACHED=0;
for(const e of ATLAS_MODERN_EVENTS){if(!e.civ)continue;const key=e.title.trim().toLowerCase()+'|'+e.year;if(ATLAS_MODERN_EVENT_KEYS.has(key))continue;
  EVENTS.push({year:e.year,title:e.title,region:e.region,kind:e.kind,detail:e.detail,civ:e.civ,endExclusive:e.endExclusive,
    researchId:e.id,datePrecision:e.datePrecision,confidence:e.confidence,source:e.sourceUrl,societyIds:e.societyIds});
  ATLAS_MODERN_EVENT_KEYS.add(key);ATLAS_MODERN_EVENTS_ATTACHED++;
}
const ATLAS_MODERN_STATS={societies:ATLAS_MODERN_PACK.societies.length,added:ATLAS_MODERN_ENTITIES_ADDED,reused:ATLAS_MODERN_ENTITIES_REUSED,researchOnly:ATLAS_MODERN_RESEARCH_ONLY,
  events:ATLAS_MODERN_EVENTS.length,eventsAttached:ATLAS_MODERN_EVENTS_ATTACHED,sources:ATLAS_MODERN_PACK.source_register.length,technologyEvidence:ATLAS_MODERN_PACK.technology_developments.length};