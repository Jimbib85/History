/* Deterministic, conservative ID reconciliation of uploaded modern v2 research.
 * Existing records are updated by ID or uniquely matching title+year only.
 * Research windows, actor-only entries, and unreviewed collisions remain contextual.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const b64=read('public/modern-v2-data.js').match(/ATLAS_MODERN_V2_GZIP = '([^']+)'/)?.[1];
assert.ok(b64,'v2 pack data missing');
const pack=JSON.parse(gunzipSync(Buffer.from(b64,'base64')));
const old=JSON.parse(read('public/research-1500-2026-data.js').split('ATLAS_MODERN_PACK=')[1].replace(/;\s*$/,''));
const ctx=vm.createContext({});
vm.runInContext(read('public/research-expansion-data.js'),ctx);
const expansions=vm.runInContext('AtlasExpansionData.packs',ctx);
const exp=(expansions.find(p=>p.id==='modern')?.tables.events||[]);
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const y=r=>r.start_year;
const eventIndexes=[
 ...old.events.map(r=>({canonical:'m1500-'+r.id,source:'modern',id:r.id,title:r.title,year:y(r)})),
 ...exp.map(r=>({canonical:'expansion-modern-'+r.id,source:'expansion',id:r.id,title:r.title,year:y(r)}))
];
const sourceById=new Map(pack.tables.source_register.map(s=>[s.id,s]));
const sourceInfo=r=>[...new Map([...(r.source_ids||[]).map(id=>{const s=sourceById.get(id);return s&&typeof s.url==='string'&&/^https?:\/\//.test(s.url)?[s.url,{id,title:s.title,url:s.url,access:s.access_status}]:null}).filter(Boolean),
 ...(r.source_urls||[]).filter(url=>/^https?:\/\//.test(url)).map(url=>[url,{id:'direct',title:'Linked research source',url,access:'Research link'}])]).values()];
const claimIds=r=>(r.claim_ids||[]).filter(id=>pack.tables.claims.some(c=>c.id===id));
const matchEvent=r=>{
 const ids=eventIndexes.filter(e=>e.id===r.id);
 if(ids.length===1)return {type:'existing',canonical:ids[0].canonical,match:'exact_id'};
 if(ids.length>1)return {type:'review',match:'ambiguous_id'};
 const cand=eventIndexes.filter(e=>e.year===r.start_year&&normalize(e.title)===normalize(r.title));
 if(cand.length===1)return {type:'existing',canonical:cand[0].canonical,match:'exact_title_year'};
 if(cand.length>1)return {type:'review',match:'ambiguous_title_year'};
 const isPoint=r.temporal_kind==='POINT'&&Number.isSafeInteger(r.start_year)&&r.end_year_exclusive===r.start_year+1&&r.context_only!==true;
 if(isPoint&&r.default_discovery!==false&&r.review_status==='SOURCE_CHECKED')return {type:'point',match:'new_exact_point'};
 return {type:'context',match:'broad_or_unreviewed'};
};
const seenTitles=new Set(eventIndexes.map(e=>normalize(e.title)+'|'+e.year));
const events=pack.tables.events.map(r=>{
 const decision=matchEvent(r),titleKey=normalize(r.title)+'|'+r.start_year;
 if(decision.type==='point'&&seenTitles.has(titleKey)){decision.type='review';decision.match='duplicate_exact_title_year';}
 seenTitles.add(titleKey);
 const sources=sourceInfo(r);
 if(!sources.length&&decision.type==='point'){decision.type='context';decision.match='missing_linked_source';}
 return {id:r.id,title:r.title,summary:r.summary||'',region:r.region,category:r.category,
  start:r.start_year,endExclusive:r.end_year_exclusive,dateText:r.original_date_text,
  precision:r.date_precision,temporal:r.temporal_kind,societyIds:r.society_ids||[],
  sourceIds:r.source_ids||[],sources,claimIds:claimIds(r),confidence:r.confidence,
  review:r.review_status,independentlyCorroborated:r.independently_corroborated===true,
  sensitive:r.default_discovery===false||r.content_level==='DISTURBING_NON_GRAPHIC',
  ...decision};
});
const topics=new Map(pack.tables.technologies.map(r=>[r.id,r]));
const tech=pack.tables.technology_developments.map(r=>{
 const topic=topics.get(r.technology_id)||{};
 return {id:r.id,title:r.title||topic.title||topic.preferred_name||r.technology_id,topicId:r.technology_id,
  topicName:topic.preferred_name||topic.title||topic.name||r.technology_id,existingTechId:topic.existing_tech_id||null,
  branch:topic.category||'Information',summary:r.description||'',development:r.development_type,
  start:r.start_year,endExclusive:r.end_year_exclusive,temporal:r.temporal_kind,dateText:r.original_date_text,
  societyIds:r.society_ids||[],sources:sourceInfo(r),sourceIds:r.source_ids||[],claimIds:claimIds(r),
  confidence:r.confidence,review:r.review_status,
  independentlyCorroborated:r.independently_corroborated===true
 };
});
const aliasNames=new Map(pack.tables.societies.map(a=>[a.id,a.preferred_name||a.id]));
const participantByConflict=new Map();
for(const p of pack.tables.conflict_participations){const key=p.conflict_id;if(!participantByConflict.has(key))participantByConflict.set(key,[]);participantByConflict.get(key).push({
 id:p.actor_id,name:aliasNames.get(p.actor_id)||p.title||p.actor_id,role:p.role,side:p.side,
 start:p.start_year,endExclusive:p.end_year_exclusive,precision:p.participation_precision,
 notes:p.notes||null
});}
const conflictRows=pack.tables.conflicts.map(r=>({
 id:r.id,title:r.title,summary:r.summary,region:r.region||'Global',
 start:r.start_year,endExclusive:r.end_year_exclusive,dateText:r.original_date_text||null,
 temporal:r.temporal_kind,precision:r.date_precision||null,hierarchy:r.hierarchy||'CONFLICT_COMPLEX',
 parentIds:r.parent_ids||[],societyIds:r.society_ids||[],participants:participantByConflict.get(r.id)||[],
 sources:sourceInfo(r),sourceIds:r.source_ids||[],claimIds:claimIds(r),review:r.review_status,confidence:r.confidence,
 sensitive:r.default_discovery===false||r.content_level==='DISTURBING_NON_GRAPHIC',
 contentLevel:r.content_level,endStatus:r.end_status||'UNKNOWN',outcome:r.outcome_notes||null,
 independentlyCorroborated:r.independently_corroborated===true
}));
const otherConflicts=[...pack.tables.battles_and_sieges.map(r=>({...r,kind:'battle'})),
 ...pack.tables.treaties_and_settlements.map(r=>({...r,kind:'treaty'}))].map(r=>({
 id:r.id,title:r.title,summary:r.summary,start:r.start_year,endExclusive:r.end_year_exclusive,
 dateText:r.original_date_text||r.date||null,kind:r.kind,region:r.region||'Global',
 societyIds:r.society_ids||[],parentIds:r.parent_conflict_ids||[],sources:sourceInfo(r),
 sourceIds:r.source_ids||[],claimIds:claimIds(r),review:r.review_status,confidence:r.confidence,
 sensitive:r.default_discovery===false||r.content_level==='DISTURBING_NON_GRAPHIC'
}));
const result={version:1,pack:'wha_1501_2026_priority_v2',cutoff:'2026-10-22',events,tech,conflicts:conflictRows,additionalConflictEvidence:otherConflicts,
 report:{events:Object.fromEntries([...new Set(events.map(e=>e.type))].map(k=>[k,events.filter(e=>e.type===k).length])),
  matched:events.filter(e=>e.type==='existing').length,
  preciseCandidates:events.filter(e=>e.type==='point').length,
  context:events.filter(e=>e.type==='context').length,
  review:events.filter(e=>e.type==='review').length,
  tech:tech.length,conflicts:conflictRows.length,otherConflicts:otherConflicts.length,
  identityOnlySocieties:pack.tables.societies.length,
  independentClaims:pack.quality.independently_corroborated_claims}};
assert.equal(events.length,97);assert.equal(tech.length,28);assert.equal(conflictRows.length,18);assert.equal(otherConflicts.length,8);
assert.equal(events.reduce((n,e)=>n+(e.type==='existing'||e.type==='point'||e.type==='context'||e.type==='review'),0),97);
const out='/* v0.24 generated exact-ID reconciled evidence; original pack preserved in modern-v2-data.js. */\nglobalThis.AtlasModernV2Reconciled = '+JSON.stringify(result).replace(/<\//g,'<\\/')+';\n';
const path=new URL('public/modern-v2-reconciled-data.js',root);
if(process.argv.includes('--check')){
 assert.equal(fs.readFileSync(path,'utf8'),out,'Reconciled index must match original canonical modern v2 and existing research IDs');
 console.log('PASS modern v2 reconciled index matches immutable evidence');
}else if(process.argv.includes('--print')){
 console.log('RECONCILIATION '+JSON.stringify(result.report));
 console.log('POINT_CANDIDATES '+JSON.stringify(events.filter(e=>e.type==='point').map(e=>({id:e.id,year:e.start,title:e.title,societies:e.societyIds}))));
 console.log('MATCHED_SAMPLE '+JSON.stringify(events.filter(e=>e.type==='existing').slice(0,15).map(e=>({id:e.id,canonical:e.canonical,match:e.match}))));
 console.log('TECH_TOPICS '+JSON.stringify(tech.map(t=>({id:t.id,topicId:t.topicId,existingTechId:t.existingTechId,temporal:t.temporal,societies:t.societyIds,start:t.start}))).slice(0,10000));
}else{
 fs.writeFileSync(path,out);
 console.log('Generated '+path.pathname+' ('+out.length+' characters) '+JSON.stringify(result.report));
}
