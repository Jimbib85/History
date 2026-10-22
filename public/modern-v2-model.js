/* v0.23: safely inspect the complete supplied modern priority v2 research evidence.
   Source checks are NOT independent corroboration. No automatic map polygons or lifespan bars. */
(function(root){
 'use strict';
 const TYPES=['events','conflicts','conflict_participations','battles_and_sieges','treaties_and_settlements','technology_developments','technologies','technology_dependencies','technology_transmission','cultural_practices','historical_figures','social_impacts','relationships','connections','statistical_observations','discovery_cards','societies','research_gaps'];
 const validUrl=u=>{try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:null;}catch{return null}};
 function decode(raw){
   if(!raw||!raw.tables||!raw.quality)throw Error('Invalid modern priority v2 data');
   if(raw.quality.pack_id!=='wha_1501_2026_priority_v2')throw Error('Unexpected modern data identity');
   if(raw.metadata.start_year!==1501||raw.metadata.end_year_exclusive!==2027)throw Error('Modern date envelope changed');
   const tables=raw.tables;
   for(const [name,count] of Object.entries(raw.quality.record_counts)){
     if(!Array.isArray(tables[name])||tables[name].length!==count)throw Error('Missing or altered '+name);
     const ids=tables[name].map(row=>row.id).filter(Boolean);
     if(new Set(ids).size!==ids.length)throw Error('Duplicate ID in '+name);
   }
   const sources=new Map(tables.source_register.map(s=>[s.id,s]));
   const claims=new Map(tables.claims.map(c=>[c.id,c]));
   return Object.freeze({raw,tables,sources,claims,types:TYPES});
 }
 async function load(){
   const b64=root.ATLAS_MODERN_V2_GZIP;
   if(typeof b64!=='string')throw Error('Modern priority v2 payload not loaded');
   if(!root.DecompressionStream||!root.atob||!root.Blob||!root.Response)throw Error('This browser cannot decompress the research archive');
   const bytes=Uint8Array.from(root.atob(b64),ch=>ch.charCodeAt(0));
   const stream=new root.Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('gzip'));
   return decode(await new root.Response(stream).json());
 }
 function list(pack,{type='events',search='',limit=20,includeSensitive=false}={}){
   const rows=pack.tables[type]||[];
   const terms=String(search).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
   const safe=rows.filter(row=>{
     const sensitive=/DISTURBING_NON_GRAPHIC/.test(String(row.content_sensitivity||row.sensitivity||row.content_warning||''));
     if(sensitive&&!includeSensitive)return false;
     return terms.every(t=>[row.title,row.preferred_name,row.name,row.summary,row.description,row.region,row.original_date_text,row.id].filter(Boolean).join(' ').toLocaleLowerCase().includes(t));
   });
   return {count:safe.length,rows:safe.slice(0,Math.min(300,Math.max(1,limit)))};
 }
 function sourceLinks(pack,row){
   const sources=(row.source_ids||[]).map(id=>pack.sources.get(id)).filter(Boolean);
   const urls=[...(row.source_urls||[]),...sources.map(x=>x.url)].map(validUrl).filter(Boolean);
   return [...new Set(urls)];
 }
 function reviewedClaims(pack,row){
   return (row.claim_ids||[]).map(id=>pack.claims.get(id)).filter(Boolean);
 }
 function isPreciseEvent(row){
   return row.temporal_kind==='POINT'&&Number.isSafeInteger(row.start_year)&&
     Number.isSafeInteger(row.end_year_exclusive)&&row.end_year_exclusive===row.start_year+1;
 }
 root.AtlasModernV2=Object.freeze({decode,load,list,sourceLinks,reviewedClaims,isPreciseEvent,TYPES});
})(typeof window!=='undefined'?window:globalThis);
