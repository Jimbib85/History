/* Classical evidence updates imported from the two user-supplied 500-year research packs.
   This is a reviewed-claim index, not a replacement for the existing classical seed.
   The zlib payload is loaded only on demand when the evidence drawer opens.
   Do not infer POINT from a period midpoint or NEEDS_REVIEW from a partial check. */
(function(root){
 'use strict';
 const validStatuses=new Set(['SOURCE_CHECKED','EXCERPT_CHECKED','ABSTRACT_CHECKED','PARTIALLY_SOURCE_CHECKED']);
 const pointKinds=new Set(['POINT','CONVENTIONAL_MARKER']);
 function fromJSON(payload) {
   if(!payload||!Array.isArray(payload.records))throw Error('Invalid classical evidence payload');
   const rows=payload.records;
   const seen=new Set();
   for(const item of rows){
     if(seen.has(item.id))throw Error('Duplicate reviewed evidence ID: '+item.id);
     seen.add(item.id);
     if(!validStatuses.has(item.status)||!item.summary||!item.claimIds?.length)
       throw Error('Unreviewed record surfaced as a reviewed card: '+item.id);
   }
   return Object.freeze({records:rows,boundary:payload.boundary,sourceBatches:payload.sourceBatches});
 }
 function isPoint(row) {
   return pointKinds.has(row.temporal)&&Number.isSafeInteger(row.year)&&
     Number.isSafeInteger(row.end)&&row.end===row.year+1;
 }
 function yearText(year){return year<=0?String(1-year)+' BCE':String(year)+' CE';}
 function temporal(row) {
   if(row.temporal==='UNDATED_CONTEXT'||!Number.isInteger(row.year)&&
       !Number.isInteger(row.yearMin))return row.date||'No precise year established';
   if(isPoint(row))return yearText(row.year)+(row.temporal==='CONVENTIONAL_MARKER'?' (conventional era marker)':'');
   return (row.date||(
     Number.isInteger(row.yearMin)&&Number.isInteger(row.yearMax)?
       yearText(row.yearMin)+'–'+yearText(row.yearMax):
       'Evidence across a period'))+' · '+row.temporal.replaceAll('_',' ').toLowerCase()+
       ' (not an exact event date)';
 }
 function browse(rows,{kind='all',batch='all',query='',limit=18}={}){
   const needle=String(query).trim().toLowerCase();
   return rows.filter(r=>(kind==='all'||r.kind===kind)&&
     (batch==='all'||r.scope===batch||r.batches?.includes(batch))&&
     (!needle||[r.name,r.summary,r.region,r.date,r.id].filter(Boolean).join(' ').toLowerCase().includes(needle)))
     .slice(0,Math.min(150,Math.max(1,limit)));
 }
 async function load(){
   const b64=root.ATLAS_CLASSICAL_REVIEW_DEFLATE_BASE64;
   if(typeof b64!=='string')throw Error('Review data script was not loaded');
   if(!root.DecompressionStream||!root.atob||!root.Blob||!root.Response)
     throw Error('This browser does not support compressed offline research packs');
   const bytes=Uint8Array.from(root.atob(b64),ch=>ch.charCodeAt(0));
   const stream=new root.Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('deflate'));
   return fromJSON(await new root.Response(stream).json());
 }
 root.AtlasClassicalReviewed=Object.freeze({fromJSON,isPoint,temporal,yearText,browse,load});
})(typeof window!=='undefined'?window:globalThis);
