/* v0.24: precise modern events and source-only corrections.
 * No inferred polity spans or midpoint dates. Broad observations stay in Discover.
 */
const ATLAS_MODERN_V2_REPORT={sourceEnriched:[],pointsAdded:[],pointsContextOnly:[],ambiguous:[],context:[]};
const ATLAS_MODERN_V2_NEW_EVENTS=[];
(function(){
 'use strict';
 const pack=globalThis.AtlasModernV2Reconciled;
 if(!pack||!Array.isArray(pack.events))return;
 const old=[...(typeof ATLAS_MODERN_EVENTS==='undefined'?[]:ATLAS_MODERN_EVENTS),
   ...(typeof ATLAS_EXPANSION_EVENTS==='undefined'?[]:ATLAS_EXPANSION_EVENTS)];
 const byId=new Map(old.map(e=>[e.id,e]));
 const civs=new Map(CIVILISATIONS.map(c=>[c.id,c]));
 const normal=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const visible=new Set([...old,...EVENTS].map(e=>normal(e.title)+'|'+(e.year??e.start)));
 const attach=(target,row)=>{
   if(!target)return false;
   const sources=row.sources.map(s=>s.url).filter(u=>typeof u==='string'&&/^https?:\/\//.test(u));
   target.sourceUrls=[...new Set([...(target.sourceUrls||[]),...sources])];
   target.sourceIds=[...new Set([...(target.sourceIds||[]),...row.sourceIds])];
   target.additionalResearch=target.additionalResearch||[];
   if(!target.additionalResearch.some(e=>e.id==='modern-v2-'+row.id))target.additionalResearch.push({
     id:'modern-v2-'+row.id,summary:row.summary,date:row.dateText,temporalKind:row.temporal,
     claimIds:row.claimIds,sourceIds:row.sourceIds,sourceUrls:sources,confidence:row.confidence,
     reviewStatus:row.review,independentlyCorroborated:row.independentlyCorroborated
   });
   for(const display of EVENTS.filter(e=>e.researchId===target.id)){
     display.sourceUrls=target.sourceUrls;
     display.additionalResearch=target.additionalResearch;
   }
   return true;
 };
 for(const e of pack.events){
   if(e.type==='existing'){
     if(attach(byId.get(e.canonical)||old.find(prior=>prior.additionalResearch?.some(r=>r.id===e.canonical)),e)){ATLAS_MODERN_V2_REPORT.sourceEnriched.push(e.id);}
     else ATLAS_MODERN_V2_REPORT.ambiguous.push({id:e.id,reason:'canonical_target_missing'});
     continue;
   }
   if(e.type!=='point'){
     ATLAS_MODERN_V2_REPORT[e.type==='review'?'ambiguous':'context'].push(e.id);
     continue;
   }
   const key=normal(e.title)+'|'+e.start;
   if(visible.has(key)||e.temporal!=='POINT'||e.endExclusive!==e.start+1||e.sensitive||!e.sources.length){
     ATLAS_MODERN_V2_REPORT.ambiguous.push({id:e.id,reason:'duplicate_or_nonpoint_at_runtime'});
     continue;
   }
   const participants=[...new Set(e.societyIds.map(id=>ATLAS_MODERN_ALIAS[id]||ATLAS_EXPANSION_REPORT?.societyAliases?.[id]||id))];
   const civ=participants.find(id=>{
     const c=civs.get(id);
     return c&&c.kind!=='overview'&&Number.isInteger(c.start)&&Number.isInteger(c.end)&&
       e.start>=c.start&&e.start<=c.end&&c.periodScope!=='research-window';
   })||null;
   const record={id:'modern-v2-'+e.id,year:e.start,endExclusive:e.endExclusive,
     title:e.title,detail:e.summary,kind:e.category||'Modern history',region:e.region,
     originalRegion:e.region,civ,societyIds:participants,sourceIds:e.sourceIds,
     sourceUrl:e.sources[0].url,sourceUrls:e.sources.map(s=>s.url),
     confidence:e.confidence,datePrecision:e.precision,temporalKind:e.temporal,
     dateLabel:e.dateText,origin:'modern-v2-reconciled',claimIds:e.claimIds,
     evidenceStatus:e.review,evidenceNote:'Source-checked research, not independently corroborated.'
   };
   ATLAS_MODERN_V2_NEW_EVENTS.push(record);
   // Story includes all source-linked precise events, even where the actor identity
   // is contextual; Map only shows markers for independently date-bounded societies.
   ATLAS_EXPANSION_EVENTS.push(record);
   if(civ)EVENTS.push({...record,researchId:record.id,source:record.sourceUrl});
   visible.add(key);
   ATLAS_MODERN_V2_REPORT.pointsAdded.push(e.id);
   if(!civ)ATLAS_MODERN_V2_REPORT.pointsContextOnly.push(e.id);
 }
})();
