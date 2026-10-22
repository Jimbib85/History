/* Additive identity-aware merge. Unknown society spans never become polity bars. */
const ATLAS_EXPANSION_EVENTS=[];const ATLAS_EXPANSION_SOURCES={};
const ATLAS_EXPANSION_REPORT={added:[],enriched:[],context:[],societyAliases:{caral:'norte-chico',ethiopia:'ethiopia_empire',brazil:'brazil_modern',indonesia:'indonesia_modern'}};
(function(){'use strict';
 const lookup=new Map(CIVILISATIONS.map(c=>[c.id,c]));const alias=id=>lookup.has(id)?id:ATLAS_EXPANSION_REPORT.societyAliases[id]||id;
 const existing=[...(typeof ATLAS_RESEARCH_EVENTS==='undefined'?[]:ATLAS_RESEARCH_EVENTS),...(typeof ATLAS_MEDIEVAL_EVENTS==='undefined'?[]:ATLAS_MEDIEVAL_EVENTS),...(typeof ATLAS_MODERN_EVENTS==='undefined'?[]:ATLAS_MODERN_EVENTS),...(typeof ATLAS_CLASSICAL_EVENTS==='undefined'?[]:ATLAS_CLASSICAL_EVENTS)];
 const ids=new Map(existing.map(e=>[e.id,e])),normal=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const crosswalk={evt_athens_508:'classical-evt_athenian_reforms',us_abolition_1865:'m1500-us_13th'};
 // Capacity additions differ from generation share; the Declaration differs from the whole Revolution.
 const distinct=new Set(['renewables_2025','french_rev_1789']);
 for(const p of globalThis.AtlasExpansionData?.packs||[]){const reg=Object.fromEntries(p.sources.map(s=>[s.id,s]));ATLAS_EXPANSION_SOURCES['expansion-'+p.id]=reg;
  for(const raw of p.tables.events){const id='expansion-'+p.id+'-'+raw.id;
   const urls=[...new Set([...(raw.source_urls||[]),...(raw.source_ids||[]).map(s=>reg[s]?.url)].filter(s=>/^https?:\/\//.test(s||'')))];
   const evidence='Research addition ('+p.label+'): '+raw.summary+' Source date: '+raw.original_date_text+'. Source access: '+(raw.source_access_levels||[]).join(', ')+'. Not independently corroborated.'+(raw.notes?' '+raw.notes:'');
   let prior=distinct.has(raw.id)?null:(ids.get(crosswalk[raw.id])||ids.get('m1500-'+raw.id)||ids.get('classical-'+raw.id)||ids.get(raw.id));
   if(!prior&&!distinct.has(raw.id))prior=existing.find(e=>e.year===raw.start_year&&normal(e.title)===normal(raw.title));
   if(prior){prior.sourceUrls=[...new Set([...(prior.sourceUrls||[]),...urls])];prior.evidenceNote=[prior.evidenceNote,evidence].filter(Boolean).join(' ');prior.additionalResearch=prior.additionalResearch||[];prior.additionalResearch.push({id,batch:p.id,rawId:raw.id,date:raw.original_date_text,claimIds:raw.claim_ids,sources:urls});for(const e of EVENTS.filter(e=>e.researchId===prior.id)){e.sourceUrls=prior.sourceUrls;e.evidenceNote=prior.evidenceNote;}ATLAS_EXPANSION_REPORT.enriched.push(id);continue;}
   if(!['POINT','DURATION','OBSERVATION_WINDOW'].includes(raw.temporal_kind)||!Number.isSafeInteger(raw.start_year)||!Number.isSafeInteger(raw.end_year_exclusive)||raw.end_year_exclusive<=raw.start_year||raw.start_year< -9999||raw.start_year>2026){ATLAS_EXPANSION_REPORT.context.push(id);continue;}
   const participants=(raw.society_ids||[]).map(alias),valid=participants.find(id=>{const c=lookup.get(id);return c&&c.kind!=='overview'&&raw.start_year>=c.start&&raw.start_year<=c.end;})||null;
   const e={id,year:raw.start_year,endExclusive:raw.end_year_exclusive,humanDate:raw.original_date_text,dateLabel:raw.original_date_text,title:raw.title,detail:raw.summary,kind:raw.category,region:raw.region,originalRegion:raw.region,civ:valid,societyIds:participants,allSocietyIds:raw.society_ids,sourceIds:raw.source_ids,sourceUrl:urls[0]||null,sourceUrls:urls,confidence:raw.confidence,datePrecision:raw.date_precision,temporalKind:raw.temporal_kind,origin:'expansion-'+p.id,evidenceStatus:raw.review_status,evidenceNote:evidence,claimIds:raw.claim_ids};
   ATLAS_EXPANSION_EVENTS.push(e);ATLAS_EXPANSION_REPORT.added.push(id);if(valid)EVENTS.push({...e,researchId:e.id,source:e.sourceUrl});
  }
 }
})();
