/* World History Atlas v0.9: additive classical import. Applied after the prior source packs and data.js BCE normalisation. */
const ATLAS_CLASSICAL_SOURCES=Object.fromEntries(ATLAS_CLASSICAL_PACK.source_register.map(s=>[s.id,s]));
const ATLAS_CLASSICAL_SOURCE_URL = record => (record.source_urls||[]).find(url=>typeof url==='string'&&/^https:\/\//.test(url)) || (record.source_ids||[]).map(id=>ATLAS_CLASSICAL_SOURCES[id]?.url).find(url=>typeof url==='string'&&/^https:\/\//.test(url)) || null;
const ATLAS_CLASSICAL_REGIONS={
  'Europe':'Europe','Eastern Mediterranean':'Europe','West Asia':'West Asia','Central Asia':'West Asia','Arabian Peninsula':'West Asia',
  'North Africa':'North Africa','East Africa':'Sub-Saharan Africa','West Africa':'Sub-Saharan Africa','Central Africa':'Sub-Saharan Africa',
  'South Asia':'South Asia','East Asia':'East Asia','Southeast Asia':'Southeast Asia',
  'Mesoamerica':'Americas','Andes':'Americas','Northern Andes':'Americas','North America':'Americas','Caribbean':'Americas','Arctic':'Americas',
  'Oceania':'Oceania','Australia':'Oceania'
};
const ATLAS_CLASSICAL_COLOURS={'Europe':'#497ead','West Asia':'#9c668f','North Africa':'#b98a3c','Sub-Saharan Africa':'#8a9148','East Asia':'#b86f63','South Asia':'#a86b56','Southeast Asia':'#3b9293','Americas':'#5a9872','Oceania':'#6977a7'};
const ATLAS_CLASSICAL_ALIAS={};
const ATLAS_CLASSICAL_BY_ID=new Map(CIVILISATIONS.map(c=>[c.id,c]));
const ATLAS_CLASSICAL_PLACES=new Map();
for(const p of ATLAS_CLASSICAL_PACK.places){
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)continue;
  for(const id of p.society_ids||[]){if(!ATLAS_CLASSICAL_PLACES.has(id))ATLAS_CLASSICAL_PLACES.set(id,p);}
}
const ATLAS_CLASSICAL_NONPOLITICAL=new Set(['overview','historical_period','cultural_region']);
let ATLAS_CLASSICAL_ADDED=0,ATLAS_CLASSICAL_REUSED=0,ATLAS_CLASSICAL_RESEARCH_ONLY=0;
for(const s of ATLAS_CLASSICAL_PACK.societies){
  const id=ATLAS_CLASSICAL_BY_ID.has(s.id)?s.id:(s.legacy_id&&ATLAS_CLASSICAL_BY_ID.has(s.legacy_id)?s.legacy_id:s.id);
  ATLAS_CLASSICAL_ALIAS[s.id]=id;
  if(ATLAS_CLASSICAL_BY_ID.has(id)){
    const existing=ATLAS_CLASSICAL_BY_ID.get(id);
    if(!existing.additionalResearch)existing.additionalResearch=[];
    existing.additionalResearch.push({batch:'500BCE-500CE',id:s.id,sourceIds:s.source_ids||[],confidence:s.confidence,dateLabel:s.date_label});
    ATLAS_CLASSICAL_REUSED++;
    continue;
  }
  // Period overviews are *not* single contiguous political societies with surveyable territories.
  if(ATLAS_CLASSICAL_NONPOLITICAL.has(s.kind)||s.display_group==='overviews'||s.region==='Australia'){
    ATLAS_CLASSICAL_RESEARCH_ONLY++;continue;
  }
  if(!Number.isInteger(s.start_year)||!Number.isInteger(s.end_year_exclusive)||s.end_year_exclusive<=s.start_year){ATLAS_CLASSICAL_RESEARCH_ONLY++;continue;}
  const region=ATLAS_CLASSICAL_REGIONS[s.region]||s.region;
  const site=ATLAS_CLASSICAL_PLACES.get(s.id);
  const point=site?{lon:site.lon,lat:site.lat}:{};
  const record={id,name:s.name,kind:s.kind==='empire'&&s.display_group==='empires'?'empire':'society',researchKind:s.kind,
    region,start:s.start_year,end:s.end_year_exclusive-1,at:Math.max(s.start_year,Math.min(s.end_year_exclusive-1,100)),
    color:ATLAS_CLASSICAL_COLOURS[region]||'#718f89',icon:'◆',summary:s.summary||'Source-linked archaeological or historical research record.',
    location:site?site.name+' (modern reference site)':(s.location||s.region),source:ATLAS_CLASSICAL_SOURCE_URL(s)||'https://www.metmuseum.org/toah/',
    sourceIds:s.source_ids||[],confidence:s.confidence,dating:s.date_label||'',datePrecision:s.date_precision,
    periodScope:(s.start_year===-499||s.end_year_exclusive===501)?'research-window':'source-range',
    researchBatch:'500BCE-500CE',researchId:s.id,originRegion:s.region,coordinatesPrecision:site?'modern-reference-site':'not-georeferenced',...point};
  CIVILISATIONS.push(record);ATLAS_CLASSICAL_BY_ID.set(id,record);ATLAS_CLASSICAL_ADDED++;
}
// Keep all original research events, including global/multi-actor and disputed events, for Compare > Events.
const ATLAS_CLASSICAL_EVENTS=ATLAS_CLASSICAL_PACK.events.map(e=>{
  const participants=(e.society_ids||[]).map(id=>ATLAS_CLASSICAL_ALIAS[id]||id);
  const valid=participants.find(id=>{
    const c=ATLAS_CLASSICAL_BY_ID.get(id);
    return c&&c.kind!=='overview'&&e.start_year>=c.start&&e.start_year<=c.end;
  })||null;
  return {id:'classical-'+e.id,year:e.start_year,endExclusive:e.end_year_exclusive,humanDate:e.date_label,
    title:e.title,detail:e.summary,originalRegion:e.region,region:ATLAS_CLASSICAL_REGIONS[e.region]||e.region,
    datePrecision:e.date_precision,confidence:e.confidence,kind:e.event_type,civ:valid,societyIds:participants,
    sourceIds:e.source_ids||[],sourceUrl:ATLAS_CLASSICAL_SOURCE_URL(e),origin:'500BCE-500CE',evidenceStatus:e.evidence_status};
});
const ATLAS_CLASSICAL_EVENT_KEYS=new Set(EVENTS.map(e=>e.title.trim().toLowerCase()+'|'+e.year));
let ATLAS_CLASSICAL_EVENTS_ATTACHED=0,ATLAS_CLASSICAL_EVENTS_SKIPPED_DUPLICATE=0;
for(const e of ATLAS_CLASSICAL_EVENTS){
  if(!e.civ)continue;
  const key=e.title.trim().toLowerCase()+'|'+e.year;
  if(ATLAS_CLASSICAL_EVENT_KEYS.has(key)){ATLAS_CLASSICAL_EVENTS_SKIPPED_DUPLICATE++;continue;}
  EVENTS.push({year:e.year,title:e.title,region:e.region,kind:e.kind,detail:e.detail,civ:e.civ,
    researchId:e.id,source:e.sourceUrl,confidence:e.confidence,datePrecision:e.datePrecision,
    dateLabel:e.humanDate,endExclusive:e.endExclusive,societyIds:e.societyIds});
  ATLAS_CLASSICAL_EVENT_KEYS.add(key);ATLAS_CLASSICAL_EVENTS_ATTACHED++;
}
// The source pack marks the 500 CE overlap; no duplicate event is attached under the same title/year.
const ATLAS_CLASSICAL_STATS={societies:ATLAS_CLASSICAL_PACK.societies.length,added:ATLAS_CLASSICAL_ADDED,reused:ATLAS_CLASSICAL_REUSED,
  researchOnly:ATLAS_CLASSICAL_RESEARCH_ONLY,events:ATLAS_CLASSICAL_EVENTS.length,eventsAttached:ATLAS_CLASSICAL_EVENTS_ATTACHED,
  duplicateEventsSkipped:ATLAS_CLASSICAL_EVENTS_SKIPPED_DUPLICATE,sources:ATLAS_CLASSICAL_PACK.source_register.length,
  technologyEvidence:ATLAS_CLASSICAL_PACK.technology_developments.length};