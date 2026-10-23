/* Cliopatria v0.2.1 compact dated polygons, sourced and explicitly uncertain.
 * Seshat Global History Databank — CC BY 4.0. The browser never downloads
 * the original 14k-record research file; only verified identity-scoped slices.
 */
(function(root){
 'use strict';
 const CITATION='https://doi.org/10.5281/zenodo.23128623';
 const LICENSE='https://creativecommons.org/licenses/by/4.0/';
 const cache=new Map();
 let indexRequest=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeId=id=>typeof id==='string'&&/^[a-z0-9_-]{1,80}$/i.test(id);
 const safeHex=colour=>/^#[0-9a-f]{6}$/i.test(colour||'')?colour:'#c8a36a';
 function loadIndex(){
  if(indexRequest)return indexRequest;
  if(typeof root.fetch!=='function')return Promise.resolve(null);
  indexRequest=root.fetch('seshat/index.json',{cache:'force-cache'})
   .then(r=>{if(!r.ok)throw Error('Cliopatria index unavailable');return r.json();})
   .then(data=>data?.schema===1&&data?.version==='v0.2.1'&&data.coverage?data:null)
   .catch(()=>null);
  return indexRequest;
 }
 function load(id){
  if(!safeId(id))return Promise.resolve(null);
  if(cache.has(id))return cache.get(id);
  const promise=loadIndex().then(idx=>{
   const record=idx?.coverage?.[id];
   if(!record||record.file!=='seshat/'+id+'.json')return null;
   return root.fetch(record.file,{cache:'force-cache'})
    .then(r=>{if(!r.ok)throw Error('Polity not available');return r.json();})
    .then(payload=>payload?.atlasId===id&&payload?.version==='v0.2.1'&&Array.isArray(payload.records)?payload:null)
    .catch(()=>null);
  });
  cache.set(id,promise);
  return promise;
 }
 function atYear(payload,year){
  if(!payload||!Number.isSafeInteger(year))return [];
  return payload.records.filter(r=>Number.isSafeInteger(r.from)&&Number.isSafeInteger(r.to)&&r.from<=year&&year<=r.to);
 }
 function paths(rows,geo,projector){
  if(!geo||!projector||!Array.isArray(rows))return [];
  const result=[];
  for(const row of rows){
   const rings=projector.geometryPaths(row.geometry,geo);
   for(const d of rings)result.push({d,row});
  }
  return result;
 }
 function svg(rows,geo,projector,colour,id){
  if(!safeId(id))return '';
  return paths(rows,geo,projector).map(({d,row})=>{
   const label=esc((row.name||id)+' · Seshat Cliopatria approximate area '+row.from+' to '+row.to+' (Atlas astronomical years), simplified');
   return '<path class="atlas-cliopatria-extent" data-polity="'+esc(id)+'" d="'+esc(d)+'" fill="'+safeHex(colour)+
    '" stroke="'+safeHex(colour)+'" stroke-width="2" fill-opacity=".3" stroke-opacity=".89" fill-rule="evenodd"><title>'+label+'</title></path>';
  }).join('');
 }
 root.AtlasCliopatria=Object.freeze({CITATION,LICENSE,loadIndex,load,atYear,paths,svg,esc,safeId});
})(typeof window!=='undefined'?window:globalThis);
