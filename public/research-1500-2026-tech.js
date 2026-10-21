/* Import 1500–2026 technology evidence; chronology is not proof of invention or transmission. */
const ATLAS_MODERN_TECH_DEFS=new Map(ATLAS_MODERN_PACK.technologies.map(t=>[t.id,t]));
const ATLAS_MODERN_TECH_BY_ID=new Map(TECHNOLOGIES.map(t=>[t.id,t]));
const ATLAS_MODERN_TECH_CIVS=new Map(CIVILISATIONS.map(c=>[c.id,c]));
const ATLAS_MODERN_TECH_BRANCH={'Information':'printing','Warfare':'warfare','Navigation':'navigation','Engineering':'materials','Science':'records','Medicine':'food','Agriculture':'food','Energy':'materials','Transport':'navigation','Commerce':'navigation','Manufacturing':'materials','Computing':'records','Communication':'printing','Space':'navigation','Materials':'materials','Food':'food'};
const ATLAS_MODERN_TECH_SEEN=new Set(TECHNOLOGIES.flatMap(t=>t.appearances.map(a=>a.researchId||'')));
let ATLAS_MODERN_TECH_IMPORTED=0,ATLAS_MODERN_TECH_UNMAPPED=0;
for(const dev of ATLAS_MODERN_PACK.technology_developments){
  const def=ATLAS_MODERN_TECH_DEFS.get(dev.technology_id);
  if(!def){ATLAS_MODERN_TECH_UNMAPPED++;continue;}
  const cid=dev.society_id&&(ATLAS_MODERN_ALIAS[dev.society_id]||dev.society_id);
  const civ=ATLAS_MODERN_TECH_CIVS.get(cid);
  const url=ATLAS_MODERN_SOURCE_URL(dev);
  if(!civ||!url||ATLAS_MODERN_TECH_SEEN.has('m1500-'+dev.id)||dev.end_year_exclusive<=civ.start||dev.start_year>civ.end){ATLAS_MODERN_TECH_UNMAPPED++;continue;}
  const a=Math.max(civ.start,dev.start_year),b=Math.min(civ.end,dev.end_year_exclusive-1);
  if(b<a){ATLAS_MODERN_TECH_UNMAPPED++;continue;}
  const id=def.existing_tech_id&&ATLAS_MODERN_TECH_BY_ID.has(def.existing_tech_id)?def.existing_tech_id:'m1500-'+def.id;
  let tech=ATLAS_MODERN_TECH_BY_ID.get(id);
  if(!tech){tech={id,name:def.name,branch:ATLAS_MODERN_TECH_BRANCH[def.category]||'materials',era:'1500–2026 CE',description:def.description,related:[],appearances:[]};TECHNOLOGIES.push(tech);ATLAS_MODERN_TECH_BY_ID.set(id,tech);}
  const mid=Math.round((a+b)/2),dateLabel=dev.start_year===dev.end_year_exclusive-1?`${dev.start_year} CE`:`${dev.date_precision==='approximate'?'c. ':''}${dev.start_year}–${dev.end_year_exclusive-1} CE`;
  const status=/independent/.test(dev.status)?'independent':/adopt|diffus|transmiss/.test(dev.status)?'adopted':/develop|refin|engineer|production/.test(dev.status)?'developed':'attested';
  tech.appearances.push({civ:cid,year:mid,dateLabel,status,sourceStatus:dev.status,label:dev.status.replace(/_/g,' '),note:dev.description+' The plotted point is the middle of a dated research interval, not a first-invention date.',source:url,
    sourceIds:dev.source_ids||[],confidence:dev.confidence,precision:dev.date_precision,researchId:'m1500-'+dev.id,researchBatch:'1500-2026',validStart:dev.start_year,validEndExclusive:dev.end_year_exclusive});
  ATLAS_MODERN_TECH_SEEN.add('m1500-'+dev.id);ATLAS_MODERN_TECH_IMPORTED++;
}