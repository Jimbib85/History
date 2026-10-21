/* World History Atlas v0.9: earliest evidence, adoption and technology refinements are distinct claims. */
const ATLAS_CLASSICAL_TECH_DEFS=new Map(ATLAS_CLASSICAL_PACK.technologies.map(t=>[t.id,t]));
const ATLAS_CLASSICAL_TECH_BY_ID=new Map(TECHNOLOGIES.map(t=>[t.id,t]));
const ATLAS_CLASSICAL_TECH_CIVS=new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
const ATLAS_CLASSICAL_TECH_BRANCH={materials:'materials',food:'food',records:'records',exchange:'navigation',medicine:'food',transport:'navigation',energy:'materials',printing:'printing',science:'records',culture:'records',navigation:'navigation',construction:'materials'};
const ATLAS_CLASSICAL_TECH_ALIASES={'tech_roman_roads':'road-networks','tech_aqueducts':'urban-water','tech_roman_concrete':'m-classical-tech_roman_concrete'};
const ATLAS_CLASSICAL_TECH_SEEN=new Set(TECHNOLOGIES.flatMap(t=>t.appearances.map(a=>a.researchId||'')));
let ATLAS_CLASSICAL_TECH_IMPORTED=0,ATLAS_CLASSICAL_TECH_UNMAPPED=0;
for(const dev of ATLAS_CLASSICAL_PACK.technology_developments){
  const def=ATLAS_CLASSICAL_TECH_DEFS.get(dev.technology_id);
  if(!def){ATLAS_CLASSICAL_TECH_UNMAPPED++;continue;}
  const id=ATLAS_CLASSICAL_TECH_ALIASES[def.id]||(def.existing_tech_id&&ATLAS_CLASSICAL_TECH_BY_ID.has(def.existing_tech_id)?def.existing_tech_id:'classical-'+def.id);
  const cid=ATLAS_CLASSICAL_ALIAS[dev.society_id]||dev.society_id;
  const civ=ATLAS_CLASSICAL_TECH_CIVS.get(cid);
  const url=ATLAS_CLASSICAL_SOURCE_URL(dev);
  if(!civ||!url||ATLAS_CLASSICAL_TECH_SEEN.has('classical-'+dev.id)||dev.end_year_exclusive<=civ.start||dev.start_year>civ.end){ATLAS_CLASSICAL_TECH_UNMAPPED++;continue;}
  const a=Math.max(civ.start,dev.start_year),b=Math.min(civ.end,dev.end_year_exclusive-1);
  if(b<a){ATLAS_CLASSICAL_TECH_UNMAPPED++;continue;}
  let topic=ATLAS_CLASSICAL_TECH_BY_ID.get(id);
  if(!topic){topic={id,name:def.name,branch:ATLAS_CLASSICAL_TECH_BRANCH[def.category]||'materials',era:'500 BCE–500 CE',description:def.summary||'Research evidence, not necessarily an invention date.',related:[],appearances:[]};TECHNOLOGIES.push(topic);ATLAS_CLASSICAL_TECH_BY_ID.set(id,topic);}
  const mid=Math.round((a+b)/2);
  const yearLabel=x=>x<=0?`${1-x} BCE`:`${x} CE`;
  const point=dev.date_label||(a===b?yearLabel(a):yearLabel(a)+'–'+yearLabel(b));
  const category=dev.development_type;
  const status=/independent/.test(category)?'independent':/adopt|diffus|transmiss/.test(category)?'adopted':/develop|improv|refin|production|construction/.test(category)?'developed':'attested';
  topic.appearances.push({civ:cid,year:mid,dateLabel:point,status,sourceStatus:category,label:category.replace(/_/g,' '),
    note:dev.summary+' This record covers '+point+'; the timeline point is a visual midpoint, not an invention date.',
    source:url,sourceIds:dev.source_ids||[],confidence:dev.confidence,precision:dev.date_precision,
    researchId:'classical-'+dev.id,researchBatch:'500BCE-500CE',validStart:dev.start_year,validEndExclusive:dev.end_year_exclusive});
  ATLAS_CLASSICAL_TECH_SEEN.add('classical-'+dev.id);ATLAS_CLASSICAL_TECH_IMPORTED++;
}
for(let i=TECHNOLOGIES.length-1;i>=0;i--)if(TECHNOLOGIES[i].id.startsWith('classical-')&&TECHNOLOGIES[i].appearances.length===0)TECHNOLOGIES.splice(i,1);