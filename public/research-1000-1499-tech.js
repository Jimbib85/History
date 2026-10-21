/* Evidence observations loaded after tech-data.js, tech-extensions.js and research-tech.js. */
const ATLAS_MEDIEVAL_TECH_CATALOGUE = new Map(ATLAS_MEDIEVAL_PACK.technologies.map(t=>[t.id,t]));
const ATLAS_MEDIEVAL_TECH_BY_ID = new Map(TECHNOLOGIES.map(t=>[t.id,t]));
const ATLAS_MEDIEVAL_TECH_CIVS = new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
const ATLAS_MEDIEVAL_TECH_BRANCH={information:'printing',engineering:'materials',war:'warfare',science:'records',energy:'materials',commerce:'navigation',navigation:'navigation',materials:'materials',food:'food'};
const ATLAS_MEDIEVAL_TECH_EXISTS = new Set(TECHNOLOGIES.flatMap(t=>t.appearances.map(a=>a.researchId||'')));
let ATLAS_MEDIEVAL_TECH_IMPORTED=0,ATLAS_MEDIEVAL_TECH_UNMAPPED=0;
for (const dev of ATLAS_MEDIEVAL_PACK.technology_developments){
  const def=ATLAS_MEDIEVAL_TECH_CATALOGUE.get(dev.technology_id);
  if(!def){ATLAS_MEDIEVAL_TECH_UNMAPPED++;continue;}
  const id=def.existing_tech_id||('m1000-'+def.id);
  let topic=ATLAS_MEDIEVAL_TECH_BY_ID.get(id);
  if(!topic){topic={id,name:def.name,branch:ATLAS_MEDIEVAL_TECH_BRANCH[def.branch]||'materials',era:'1000–1499 CE',description:def.description,related:[],appearances:[]};TECHNOLOGIES.push(topic);ATLAS_MEDIEVAL_TECH_BY_ID.set(id,topic);}
  const civId=ATLAS_MEDIEVAL_ALIAS[dev.society_id]||dev.society_id;
  const civ=ATLAS_MEDIEVAL_TECH_CIVS.get(civId);
  if(!civ||dev.end_year_exclusive<=civ.start||dev.start_year>civ.end||ATLAS_MEDIEVAL_TECH_EXISTS.has(dev.id)) {ATLAS_MEDIEVAL_TECH_UNMAPPED++;continue;}
  const begin=Math.max(civ.start,dev.start_year),last=Math.min(civ.end,dev.end_year_exclusive-1);
  if(last<begin){ATLAS_MEDIEVAL_TECH_UNMAPPED++;continue;}
  const mid=Math.round((begin+last)/2);
  const specific=dev.start_year===dev.end_year_exclusive-1 && dev.date_precision==='year';
  const dateLabel=specific?`${dev.start_year} CE`:`${dev.date_precision==='approximate'?'c. ':''}${dev.start_year}–${dev.end_year_exclusive-1} CE`;
  const status=/independent/.test(dev.status)?'independent':/adopti|transmiss/.test(dev.status)?'adopted':/develop|refin|engineering|production/.test(dev.status)?'developed':'attested';
  const uri=ATLAS_MEDIEVAL_FIRST_URL(dev);
  if(!uri){ATLAS_MEDIEVAL_TECH_UNMAPPED++;continue;}
  topic.appearances.push({civ:civId,year:mid,dateLabel,status,sourceStatus:dev.status,label:dev.status.replaceAll('_',' '),
    note:dev.description+' The plotted point represents the middle of a documented date interval, not an invention date.',
    source:uri,sourceIds:dev.source_ids||[],confidence:dev.confidence,precision:dev.date_precision,
    researchId:dev.id,researchBatch:'1000-1499',validStart:dev.start_year,validEndExclusive:dev.end_year_exclusive});
  ATLAS_MEDIEVAL_TECH_EXISTS.add(dev.id);ATLAS_MEDIEVAL_TECH_IMPORTED++;
}
// Topics without an attributable dated milestone stay in the research archive, not the interactive tree.
for(let i=TECHNOLOGIES.length-1;i>=0;i--){if(TECHNOLOGIES[i].id.startsWith('m1000-')&&TECHNOLOGIES[i].appearances.length===0)TECHNOLOGIES.splice(i,1);}
