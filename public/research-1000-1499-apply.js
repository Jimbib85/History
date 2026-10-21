/* v0.7 additive 1000–1499 CE research adapter. Reuses IDs; never overwrites previously curated entries. */
const ATLAS_MEDIEVAL_ALIAS = {};
const ATLAS_MEDIEVAL_SOURCES = Object.fromEntries(ATLAS_MEDIEVAL_PACK.source_register.map(s=>[s.id,s]));
const ATLAS_MEDIEVAL_FIRST_URL = record => (record.source_ids||[]).map(id=>ATLAS_MEDIEVAL_SOURCES[id]?.url).find(u=>typeof u==='string'&&/^https:\/\//.test(u))||null;
const ATLAS_MEDIEVAL_REGIONS={
  'Eastern Mediterranean':'Europe','Eastern Europe':'Europe','Northern Europe':'Europe',
  'Anatolia':'West Asia','Central Asia':'West Asia','Eurasian Steppe':'East Asia',
  'Northeast Africa':'North Africa','Central Africa':'Sub-Saharan Africa','East Africa':'Sub-Saharan Africa',
  'West Africa':'Sub-Saharan Africa','Southern Africa':'Sub-Saharan Africa',
  'Mesoamerica':'Americas','Andes':'Americas','Northern Andes':'Americas','Amazonia':'Americas',
  'Caribbean':'Americas','North America':'Americas','Arctic':'Americas',
  'Micronesia':'Oceania','Australia':'Oceania','Indian Ocean':'Southeast Asia'
};
const ATLAS_MEDIEVAL_COLOURS={'Europe':'#ae725d','West Asia':'#a46c49','East Asia':'#777d9f','South Asia':'#4c877d','Southeast Asia':'#729073','North Africa':'#b68b45','Sub-Saharan Africa':'#618976','Americas':'#bb7d59','Oceania':'#598e97'};
const ATLAS_MEDIEVAL_SOCIETIES = new Map(CIVILISATIONS.map(c=>[c.id,c]));
const ATLAS_MEDIEVAL_PLACES = new Map();
for (const place of ATLAS_MEDIEVAL_PACK.places) {
  if (!place.society_id || !Number.isFinite(place.longitude) || !Number.isFinite(place.latitude)) continue;
  if (Math.abs(place.longitude)>180||Math.abs(place.latitude)>90)continue;
  if (!ATLAS_MEDIEVAL_PLACES.has(place.society_id))ATLAS_MEDIEVAL_PLACES.set(place.society_id,place);
}
let ATLAS_MEDIEVAL_ENTITIES_ADDED=0,ATLAS_MEDIEVAL_ENTITIES_REUSED=0,ATLAS_MEDIEVAL_ENTITIES_RESEARCH_ONLY=0;
for (const s of ATLAS_MEDIEVAL_PACK.societies) {
  const id = ATLAS_MEDIEVAL_SOCIETIES.has(s.id) ? s.id :
     (s.legacy_id && ATLAS_MEDIEVAL_SOCIETIES.has(s.legacy_id) ? s.legacy_id : s.id);
  ATLAS_MEDIEVAL_ALIAS[s.id] = id;
  if (ATLAS_MEDIEVAL_SOCIETIES.has(id)) {ATLAS_MEDIEVAL_ENTITIES_REUSED++;continue;}
  // Do not create a single continent-spanning dated Australian Indigenous polity;
  // place-specific research remains intact in the research archive and bundle.
  if(s.region==='Australia'||s.kind==='historical_period'){ATLAS_MEDIEVAL_ENTITIES_RESEARCH_ONLY++;continue;}
  if (!Number.isInteger(s.start_year)||!Number.isInteger(s.end_year_exclusive)||s.end_year_exclusive<=s.start_year)continue;
  const site=ATLAS_MEDIEVAL_PLACES.get(s.id);
  const region=ATLAS_MEDIEVAL_REGIONS[s.region]||s.region;
  const focus=Math.max(s.start_year,Math.min(s.end_year_exclusive-1,1250));
  const entry={id,name:s.name,kind:s.kind==='empire'?'empire':'society',researchKind:s.kind,
    region,start:s.start_year,end:s.end_year_exclusive-1,at:focus,
    color:ATLAS_MEDIEVAL_COLOURS[region]||'#64818b',icon:'◆',
    summary:s.summary||'Sourced historical overview.',location:s.location||'Historical regional reference',
    source:ATLAS_MEDIEVAL_FIRST_URL(s)||'https://www.wikidata.org/',
    sourceIds:s.source_ids||[],confidence:s.confidence,dating:s.dating,
    periodScope:(s.start_year===1000||s.end_year_exclusive===1500||s.end_year_exclusive===1501)?'research-window':'source-range',
    researchBatch:'1000-1499',researchId:s.id,originRegion:s.region,coordinatesPrecision:'reference-site-only'};
  if(site){entry.lon=site.longitude;entry.lat=site.latitude;entry.location=site.name+' (modern site reference)';}
  // No guessed latitude/longitude for new societies without an attributable site.
  CIVILISATIONS.push(entry);ATLAS_MEDIEVAL_SOCIETIES.set(id,entry);ATLAS_MEDIEVAL_ENTITIES_ADDED++;
}
// Original research events remain accessible even if attribution is uncertain or none of the participants has a dated Atlas entity.
const ATLAS_MEDIEVAL_EVENTS = ATLAS_MEDIEVAL_PACK.events.map(e=>{
  const participants=(e.society_ids||[]).map(id=>ATLAS_MEDIEVAL_ALIAS[id]||id);
  const valid=participants.find(id=>{const s=ATLAS_MEDIEVAL_SOCIETIES.get(id);return s&&s.kind!=='overview'&&e.start_year>=s.start&&e.start_year<=s.end;})||null;
  return {id:'m1000-'+e.id,year:e.start_year,endExclusive:e.end_year_exclusive,title:e.title,
    detail:e.summary,originalRegion:e.region,region:ATLAS_MEDIEVAL_REGIONS[e.region]||e.region,
    datePrecision:e.date_precision,confidence:e.confidence,kind:e.category,civ:valid,
    societyIds:participants,sourceIds:e.source_ids||[],sourceUrl:ATLAS_MEDIEVAL_FIRST_URL(e),origin:'1000-1499'};
});
const ATLAS_MEDIEVAL_EVENT_KEYS=new Set(EVENTS.map(e=>e.title.toLowerCase()+'|'+e.year));
let ATLAS_MEDIEVAL_EVENTS_ATTACHED=0;
for(const e of ATLAS_MEDIEVAL_EVENTS){
  if(!e.civ)continue;
  const key=e.title.toLowerCase()+'|'+e.year;
  if(ATLAS_MEDIEVAL_EVENT_KEYS.has(key))continue;
  EVENTS.push({year:e.year,title:e.title,region:e.region,kind:e.kind,detail:e.detail,civ:e.civ,
    endExclusive:e.endExclusive,researchId:e.id,datePrecision:e.datePrecision,
    confidence:e.confidence,source:e.sourceUrl,societyIds:e.societyIds});
  ATLAS_MEDIEVAL_EVENT_KEYS.add(key);ATLAS_MEDIEVAL_EVENTS_ATTACHED++;
}
const ATLAS_MEDIEVAL_STATS={totalSocieties:ATLAS_MEDIEVAL_PACK.societies.length,newSocieties:ATLAS_MEDIEVAL_ENTITIES_ADDED,reusedSocieties:ATLAS_MEDIEVAL_ENTITIES_REUSED,recordsResearchOnly:ATLAS_MEDIEVAL_ENTITIES_RESEARCH_ONLY,
  totalEvents:ATLAS_MEDIEVAL_EVENTS.length,linkedEvents:ATLAS_MEDIEVAL_EVENTS_ATTACHED,totalSources:ATLAS_MEDIEVAL_PACK.source_register.length};