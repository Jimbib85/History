/* Dated, reviewed Seshat polity areas for the existing World Map.
 * Loaded lazily from compact local files; missing data falls back to clouds.
 * The shape source is a historical reconstruction with uncertainty, not GPS.
 */
(function(root){
 'use strict';
 if(typeof document==='undefined'||typeof document.getElementById!=='function')return;
 const map=root.WorldHistoryAtlas,geo=root.WorldAtlasGeo,source=root.AtlasCliopatria,projector=root.AtlasResearchedExtents;
 const $=id=>document.getElementById(id);
 const layer=$('mapCliopatriaShapes'),markers=$('mapMarkers'),status=$('atlasSeshatStatus'),toggle=$('togglePresenceClouds');
 if(!map||!geo||!source||!projector||!layer||!markers||!status||!toggle)return;
 const byId=new Map(map.civilisations.map(c=>[c.id,c]));
 const requested=new Set(),loaded=new Map();
 let index=null,version=0;
 const date=y=>y<=0?(1-y)+' BCE':y+' CE';
 function candidateIds(year){
  if(!index?.coverage)return [];
  const active=c=>c&&c.kind!=='overview'&&c.start<=year&&c.end>=year;
  const focus=map.state.civ,rec=root.AtlasMapPresence?.record,prio=[...(rec?.participants||[]),focus];
  const byGeography=map.civilisations.filter(c=>active(c)&&index.coverage[c.id])
   .sort((a,b)=>Number(a.lon||0)-Number(b.lon||0)||a.id.localeCompare(b.id));
  const pool=byGeography.length>9?Array.from({length:9},(_,i)=>byGeography[Math.floor((i+.5)*byGeography.length/9)].id):byGeography.map(c=>c.id);
  return [...new Set([...prio,...pool])].filter(id=>source.safeId(id)&&index.coverage[id]).slice(0,16);
 }
 function fetchSlice(id){
  if(requested.has(id))return;
  requested.add(id);
  source.load(id).then(data=>{loaded.set(id,data);render();});
 }
 function render(){
  const year=map.state.year,available=map.state.view==='actual'&&toggle.getAttribute('aria-pressed')==='true';
  const candidates=index?candidateIds(year):[];
  if(available)for(const id of candidates)fetchSlice(id);
  const current=[],drawnIds=new Set();
  if(available)for(const id of candidates){
   const data=loaded.get(id),rows=source.atYear(data,year),c=byId.get(id);
   if(!rows.length||!c)continue;
   const markup=source.svg(rows,geo,projector,c.color,id);
   if(markup){drawnIds.add(id);current.push(markup);}
  }
  layer.innerHTML=current.join('');
  // Source-backed geometry replaces a decorative cloud for the same polity.
  document.querySelectorAll('#mapPresenceClouds [data-atlas-id]').forEach(cloud=>{
   const isSourced=drawnIds.has(cloud.getAttribute('data-atlas-id'));
   cloud.style.display=isSourced?'none':'';
  });
  // Previous three standalone peak-extent snapshots remain the fallback.
  const snapshot=projector.atYear?.(year)||[];
  document.querySelectorAll('#mapPresenceClouds .atlas-researched-extent').forEach(path=>{
   path.style.display=snapshot.some(s=>drawnIds.has(s.id))?'none':'';
  });
  if(!index){
   status.textContent='Seshat Cliopatria geography is unavailable on this build. Existing location clouds and independently sourced snapshot outlines remain usable.';
   return;
  }
  const matched=Object.keys(index.coverage).length;
  if(!available){
   status.textContent='Dated Seshat boundaries are hidden in this map mode. Source coverage: '+matched+' verified atlas identity matches.';
   return;
  }
  const selected=map.state.civ,chosen=loaded.get(selected);
  const rows=source.atYear(chosen,year);
  const info=rows.length?' '+(byId.get(selected)?.name||selected)+' has '+rows.length+' documented map '+(rows.length===1?'shape':'shapes')+' for '+date(year)+'.':
    (index.coverage[selected]?' No Seshat polygon for the selected society at '+date(year)+'; the illustrative cloud is retained.':' This society has no reviewed Cliopatria identity match.');
  status.innerHTML='<strong>Seshat Cliopatria · v0.2.1</strong> · '+drawnIds.size+
   ' mapped societies at '+date(year)+' · '+matched+' curated atlas identities.'+
   source.esc(info)+
   ' <span>Territories are scholarly reconstructions, not exact or uncontested borders; original dates and simplified polygons are preserved.</span>'+
   ' <a href="'+source.CITATION+'" target="_blank" rel="noopener noreferrer">Dataset and methodology ↗</a>'+
   ' <a href="'+source.LICENSE+'" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>';
 }
 source.loadIndex().then(data=>{index=data;render();});
 // The existing map changes its marker group whenever year, society or mode changes.
 if(typeof root.MutationObserver==='function'){
  new root.MutationObserver(render).observe(markers,{childList:true});
  new root.MutationObserver(render).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
 }
 render();
 root.AtlasCliopatriaMap=Object.freeze({render,candidateIds,loaded});
})(typeof window!=='undefined'?window:globalThis);
