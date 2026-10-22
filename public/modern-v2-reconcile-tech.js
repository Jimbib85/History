/* v0.24: source-reconciled technology observations. No invention claims or
 * plotted research-window midpoints. Unmapped observations remain in Discover. */
const ATLAS_MODERN_V2_TECH_REPORT={enriched:[],added:[],context:[],unmapped:[]};
(function(){
 'use strict';
 const pack=globalThis.AtlasModernV2Reconciled;
 if(!pack||!Array.isArray(pack.tech))return;
 const civs=new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
 const topics=new Map(TECHNOLOGIES.map(t=>[t.id,t]));
 const originalDefs=new Map(ATLAS_MODERN_PACK.technologies.map(t=>[t.id,t]));
 const branches={Energy:'materials',Information:'records',Computing:'records',Medicine:'food',Transport:'navigation',
   Navigation:'navigation',Communication:'printing',Science:'records',Manufacturing:'materials',Engineering:'materials',
   Warfare:'warfare',Food:'food',Materials:'materials'};
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(const row of pack.tech){
   const exact=row.temporal==='POINT'&&Number.isSafeInteger(row.start)&&row.endExclusive===row.start+1&&row.sources.length&&row.review==='SOURCE_CHECKED';
   const civIds=[...new Set(row.societyIds.map(id=>ATLAS_MODERN_ALIAS[id]||id))]
     .filter(id=>{const c=civs.get(id);return c&&Number.isInteger(c.start)&&Number.isInteger(c.end)&&
       c.periodScope!=='research-window'&&row.start>=c.start&&row.start<=c.end;});
   const oldDef=originalDefs.get(row.topicId);
   const candidates=[row.topicId,row.existingTechId,oldDef?.existing_tech_id,'m1500-'+row.topicId,
     'expansion-modern-'+row.topicId].filter(Boolean);
   let topic=candidates.map(id=>topics.get(id)).find(Boolean);
   if(!topic)topic=TECHNOLOGIES.find(t=>norm(t.name)===norm(row.topicName));
   if(!exact){ATLAS_MODERN_V2_TECH_REPORT.context.push(row.id);continue;}
   if(!civIds.length){ATLAS_MODERN_V2_TECH_REPORT.unmapped.push(row.id);continue;}
   if(!topic){
     const id='modern-v2-topic-'+row.topicId;
     topic={id,name:row.topicName,branch:branches[row.branch]||'records',era:'1501–2026 CE',
       description:'Source-linked modern research topic; not a universal invention date.',related:[],appearances:[]};
     TECHNOLOGIES.push(topic);topics.set(id,topic);
   }
   for(const id of civIds){
     const matched=topic.appearances.find(a=>a.civ===id&&a.year===row.start);
     const details={id:'modern-v2-'+row.id,summary:row.summary,date:row.dateText,
       claimIds:row.claimIds,sourceIds:row.sourceIds,sourceUrls:row.sources.map(s=>s.url),
       reviewStatus:row.review,independentlyCorroborated:row.independentlyCorroborated};
     if(matched){
       matched.additionalResearch=matched.additionalResearch||[];
       if(!matched.additionalResearch.some(x=>x.id===details.id))matched.additionalResearch.push(details);
       matched.sourceUrls=[...new Set([...(matched.sourceUrls||[]),...details.sourceUrls])];
       ATLAS_MODERN_V2_TECH_REPORT.enriched.push(row.id+':'+id);
     }else{
       topic.appearances.push({civ:id,year:row.start,dateLabel:row.dateText||String(row.start)+' CE',
         status:'attested',sourceStatus:row.development,label:String(row.development||'documented observation').replaceAll('_',' ').toLowerCase(),
         note:row.summary+'. Documented observation, not universal first invention. Not independently corroborated.',
         source:row.sources[0].url,sourceUrls:row.sources.map(s=>s.url),
         sourceIds:row.sourceIds,confidence:row.confidence,precision:'year',
         researchId:'modern-v2-'+row.id,researchBatch:'modern-priority-v2',
         validStart:row.start,validEndExclusive:row.endExclusive,claimIds:row.claimIds});
       ATLAS_MODERN_V2_TECH_REPORT.added.push(row.id+':'+id);
     }
   }
 }
})();
