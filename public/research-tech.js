/* Import adapter for evidence-linked technology-development records. Must be loaded after tech-data.js and research-data.js.
   Period-centre plot positions are visualisations of date ranges, not invention dates. */
const ATLAS_TECH_TOPIC_MAP = {"paper": "paper", "woodblock": "woodblock", "urban_water": "urban-water", "irrigation": "irrigation", "road_networks": "road-networks", "maritime": "oceanic-navigation", "agriculture": "agriculture", "mathematics": "research-mathematics", "canals": "irrigation"};
const ATLAS_TECH_BRANCH_MAP = {"monumental": "materials", "book_culture": "printing", "script": "records", "astronomy": "records", "trade": "navigation", "ceramics": "materials", "steppes": "navigation", "fortifications": "warfare", "textiles": "materials", "metalcraft": "materials", "terracing": "food", "clinker": "navigation", "medicine": "food", "architecture": "materials", "khipu": "records"};
const ATLAS_TECH_NAMES = {"monumental": "Monumental building", "book_culture": "Book production and libraries", "script": "Scripts and written records", "astronomy": "Astronomy and sky knowledge", "trade": "Trade and exchange technology", "ceramics": "Ceramics and kilns", "steppes": "Steppe transport and material culture", "fortifications": "Fortifications", "textiles": "Textiles and weaving", "metalcraft": "Metalcraft", "terracing": "Terraced farming", "clinker": "Clinker-built boats", "medicine": "Medical practice", "architecture": "Building and architecture", "khipu": "Khipu recordkeeping", "mathematics": "Mathematical traditions"};
const atlasTechById = new Map(TECHNOLOGIES.map(t=>[t.id,t]));
const atlasTechSocieties = new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
const atlasTechExisting = new Set(TECHNOLOGIES.flatMap(t=>t.appearances.map(a=>t.id+'|'+a.civ+'|'+a.year+'|'+a.label)));
let ATLAS_TECH_IMPORTED=0,ATLAS_TECH_UNMAPPED=0;
for (const raw of ATLAS_RESEARCH_TECH_DEVELOPMENTS) {
  const id=ATLAS_TECH_TOPIC_MAP[raw.technology_id] || ('research-'+raw.technology_id);
  let topic=atlasTechById.get(id);
  if (!topic) {
    topic={id,branch:ATLAS_TECH_BRANCH_MAP[raw.technology_id]||'materials',name:ATLAS_TECH_NAMES[raw.technology_id]||raw.technology_id.replace(/_/g,' '),era:'500–999 CE',description:'Comparative evidence from the 500–999 CE research pack. Dates are provisional source windows, not dates of first invention.',related:[],appearances:[]};
    TECHNOLOGIES.push(topic);atlasTechById.set(id,topic);
  }
  const c=atlasTechSocieties.get(raw.society_canonical);
  if (!c || raw.end_year_exclusive<=c.start || raw.start_year>c.end || !raw.source_urls) {ATLAS_TECH_UNMAPPED++;continue;}
  const a=Math.max(c.start,raw.start_year),b=Math.min(c.end,raw.end_year_exclusive-1);
  if(b<a){ATLAS_TECH_UNMAPPED++;continue;}
  const mid=Math.round((a+b)/2);
  // display true period on each record. The midpoint only positions the point on the slider.
  const dateLabel=(raw.end_year_exclusive-raw.start_year>1?`c. ${raw.start_year}–${raw.end_year_exclusive-1} CE`:`${raw.start_year} CE`);
  const label=raw.status.replace(/_/g,' ');
  const key=id+'|'+c.id+'|'+mid+'|'+label;
  if (atlasTechExisting.has(key))continue;
  topic.appearances.push({civ:c.id,year:mid,status:raw.status==='regional_development'?'developed':'attested',sourceStatus:raw.status,label,note:raw.description,source:raw.source_urls.split(';')[0],dateLabel,confidence:raw.confidence,sourceIds:raw.source_ids.split(';'),researchId:raw.id,precision:raw.date_precision});
  atlasTechExisting.add(key);ATLAS_TECH_IMPORTED++;
}