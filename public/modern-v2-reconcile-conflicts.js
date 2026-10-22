/* v0.24: attach modern v2 conflict evidence to the existing conflict reader.
 * A campaign/complex is never recast as an individual war. Related battles and
 * settlements retain their own identities. No geography or casualty figures invented.
 */
const ATLAS_MODERN_V2_CONFLICT_REPORT={enriched:[],added:[],review:[]};
(function(){
 'use strict';
 const pack=globalThis.AtlasModernV2Reconciled;
 if(!pack||typeof ATLAS_CONFLICTS_DATA==='undefined')return;
 const entries=ATLAS_CONFLICTS_DATA.records,sourceRows=[...pack.conflicts,...pack.additionalConflictEvidence];
 const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const exists=new Map(entries.map(x=>[x.id,x]));
 const sourceOf=e=>e.sources.map(s=>({
   id:s.id,title:s.title||s.id,url:s.url,access_status:s.access,limitations:'Research source or extract; not independently corroborated'
 }));
 const mapId=r=>'modern-v2-'+r.id;
 const ids=new Map(sourceRows.map(r=>[r.id,mapId(r)]));
 const findExisting=e=>{
   const direct=exists.get(e.id)||exists.get('modern-v2-'+e.id);
   if(direct)return direct;
   const matches=entries.filter(x=>x.type===(e.kind||'conflict')&&
     normalize(x.title)===normalize(e.title)&&
     (x.start===null||e.start===null||Math.abs(x.start-e.start)<=1));
   return matches.length===1?matches[0]:null;
 };
 for(const r of sourceRows){
   const prior=findExisting(r),linkedSources=sourceOf(r);
   if(prior){
     prior.sources=prior.sources||[];
     const urls=new Set(prior.sources.map(s=>s.url));
     for(const s of linkedSources)if(!urls.has(s.url)){prior.sources.push(s);urls.add(s.url);}
     prior.additionalResearch=prior.additionalResearch||[];
     if(!prior.additionalResearch.some(a=>a.id===mapId(r)))prior.additionalResearch.push({
       id:mapId(r),claimIds:r.claimIds,sourceIds:r.sourceIds,
       summary:r.summary,review:r.review,independentlyCorroborated:false
     });
     ATLAS_MODERN_V2_CONFLICT_REPORT.enriched.push(r.id);
     continue;
   }
   if(!linkedSources.length||!r.title){
     ATLAS_MODERN_V2_CONFLICT_REPORT.review.push(r.id);
     continue;
   }
   const type=r.kind||'conflict',parents=(r.parentIds||[]).map(id=>ids.get(id)||id);
   const isPoint=Number.isSafeInteger(r.start)&&r.endExclusive===r.start+1;
   const dateText=r.dateText||((Number.isInteger(r.start)?r.start+' CE':'Date not established')+
     (!isPoint?' · interval uncertain or approximate':''));
   const row={id:mapId(r),type,title:r.title,summary:r.summary||'Modern v2 research record.',
     region:r.region||'Global',start:Number.isInteger(r.start)?r.start:null,
     endExclusive:Number.isInteger(r.endExclusive)?r.endExclusive:null,dateText,
     datePrecision:r.precision||r.temporal||'Date scope uncertain',temporalKind:r.temporal||null,
     endStatus:r.endStatus||'UNKNOWN',observedThrough:null,
     hierarchy:type==='conflict'?(r.hierarchy||'CONFLICT_COMPLEX'):null,
     review:r.review||'SOURCE_CHECKED',confidence:r.confidence||'NOT_ASSESSED',
     sensitive:!!r.sensitive,contentLevel:r.contentLevel||'GENERAL',
     notes:['Research v2 supplement. Claims source-linked, not independently corroborated.',
       ...(!isPoint?['Date range describes the sourced scope, not continuous fighting.']:[])],
     sources:linkedSources,parentIds:parents,
     participations:(r.participants||[]).map(a=>({name:a.name||a.id||'Actor not identified',
       role:a.role||'Participation reported',side:a.side||null,
       scope:'Recorded role only; involvement dates require separate evidence.'})),
     casualties:[],links:[],outcome:r.outcome||null,anecdoteStatus:null,
     claimIds:r.claimIds||[],sourceIds:r.sourceIds||[],
     independentlyCorroborated:false
   };
   entries.push(row);exists.set(row.id,row);
   ATLAS_MODERN_V2_CONFLICT_REPORT.added.push(r.id);
 }
})();
