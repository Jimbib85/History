/* World History Atlas v0.37: illustrated presence + interaction record context.
 * Highlights representative geography without pretending to reconstruct borders.
 */
(function(root){
 'use strict';
 if(typeof document==='undefined'||typeof document.getElementById!=='function')return;
 const $=id=>document.getElementById(id);
 const atlas=root.WorldHistoryAtlas,geo=root.WorldAtlasGeo,presence=root.AtlasPresence;
 const layer=$('mapPresenceClouds'),markers=$('mapMarkers'),toggle=$('togglePresenceClouds'),note=$('mapPresenceNote'),panel=$('mapInteractionContext');
 if(!atlas||!geo||!presence||!layer||!markers||!toggle||!note||!panel)return;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const readableYear=y=>y<=0?(1-y).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
 const societyById=new Map(atlas.civilisations.map(c=>[c.id,c]));
 const params=new URLSearchParams(root.location?.search||'');
 let queryEvent=params.get('interaction');
 const extents=root.AtlasResearchedExtents;
 const allSources=[
  ...(typeof ATLAS_RESEARCH_EVENTS!=='undefined'?ATLAS_RESEARCH_EVENTS:[]),
  ...(typeof ATLAS_MEDIEVAL_EVENTS!=='undefined'?ATLAS_MEDIEVAL_EVENTS:[]),
  ...(typeof ATLAS_MODERN_EVENTS!=='undefined'?ATLAS_MODERN_EVENTS:[]),
  ...(typeof ATLAS_CLASSICAL_EVENTS!=='undefined'?ATLAS_CLASSICAL_EVENTS:[]),
  ...(typeof ATLAS_EXPANSION_EVENTS!=='undefined'?ATLAS_EXPANSION_EVENTS:[]),
  ...(root.ATLAS_MASTER_EVENTS||[])
 ];
 const allRecords=extents?.linkedRecords(allSources,atlas.civilisations)||[];
 let record=presence.interaction(allSources,queryEvent,atlas.civilisations);
 const researched=new Map(),pending=new Set(),failed=new Set();
 let enabled=true;
 function availableTrail(){
  if(!record)return [];
  const anchor=record.participants.includes(atlas.state.civ)?atlas.state.civ:record.participants[0];
  return allRecords.filter(e=>e.participants.includes(anchor));
 }
 function visitRecord(next){
  if(!next)return;
  record=next;queryEvent=next.key;
  const url=new URL(root.location.href);url.searchParams.set('interaction',next.key);
  root.history.replaceState(null,'',url);
  const civ=next.participants.includes(atlas.state.civ)?atlas.state.civ:next.participants[0];
  const changed=atlas.state.year!==next.year||atlas.state.civ!==civ||atlas.state.view!=='actual';
  if(changed)atlas.go({year:next.year,civ,view:'actual',region:'All regions',catalogue:'all',search:''});
  render();
 }
 function fetchSnapshot(snapshot){
  if(researched.has(snapshot.id)||pending.has(snapshot.id)||failed.has(snapshot.id))return;
  if(typeof root.fetch!=='function'){failed.add(snapshot.id);return;}
  pending.add(snapshot.id);
  root.fetch(extents.queryUrl(snapshot),{mode:'cors'})
   .then(response=>{if(!response.ok)throw Error('Geodata unavailable');return response.json();})
   .then(data=>{const shapes=extents.normalize(data,snapshot,geo);
    if(!shapes.length)throw Error('No supported geometry');
    researched.set(snapshot.id,shapes);})
   .catch(()=>failed.add(snapshot.id))
   .finally(()=>{pending.delete(snapshot.id);render();});
 }
 function fitParticipants(){
  if(!record)return;
  const pts=record.participants.map(id=>societyById.get(id)).filter(c=>presence.mapped(c,geo)).map(c=>geo.project(c.lon,c.lat));
  if(!pts.length)return;
  const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0]));
  const minY=Math.min(...pts.map(p=>p[1])),maxY=Math.max(...pts.map(p=>p[1]));
  const zoom=Math.max(1,Math.min(3.5,950/(maxX-minX+140),420/(maxY-minY+110)));
  const tx=600-zoom*(minX+maxX)/2,ty=295-zoom*(minY+maxY)/2;
  atlas.go({view:'actual',zoom,tx,ty,geoMode:'points',region:'All regions',catalogue:'all',search:''});
  render();
 }
 const chooser=$('researchedExtentButtons');
 if(chooser&&extents){
  chooser.innerHTML=extents.SNAPSHOTS.map(s=>
   '<button type="button" data-atlas-snapshot="'+s.id+'" aria-pressed="false">'+esc(s.label)+'</button>').join('');
  chooser.addEventListener('click',event=>{
   const button=event.target.closest('[data-atlas-snapshot]'),snapshot=extents.SNAPSHOTS.find(s=>s.id===button?.dataset.atlasSnapshot);
   if(snapshot){atlas.go({year:snapshot.year,civ:snapshot.id,view:'actual',region:'All regions',catalogue:'all',search:''});render();}
  });
 }
 function renderContext(){
  if(!queryEvent){panel.hidden=true;return;}
  panel.hidden=false;
  if(!record){panel.innerHTML='<div class="atlas-interaction-overline">SHARED HISTORICAL RECORD</div><h3>Interaction record unavailable</h3><p>The requested event could not be matched to a current dated research record. The map still works independently.</p><div class="atlas-interaction-foot"><a href="interactions.html">Explore interactions ↗</a></div>';return;}
  const mapped=record.participants.filter(id=>presence.mapped(societyById.get(id),geo));
  const selected=atlas.state.civ;
  const actors=record.participants.map(id=>{
   const c=societyById.get(id);
   if(!c)return '';
   const canMap=presence.mapped(c,geo);
   return '<button type="button" data-map-presence-civ="'+esc(id)+'" aria-pressed="'+(selected===id)+'"'+(canMap?'':' disabled')+' style="--actor-colour:'+presence.safeColour(c.color)+'"><span class="atlas-presence-dot" aria-hidden="true"></span><span>'+esc(c.name)+(canMap?'':' <small>· no mapped point</small>')+'</span></button>';
  }).join('');
  const yearDifferent=atlas.state.year!==record.year;
  const origin=record.participants[0],back=new URLSearchParams({year:String(record.year),civ:origin,event:record.key,view:'stories'});
  const sources=[...(record.sourceUrls||[]),record.sourceUrl].filter(Boolean);
  const source=sources.find(v=>{try{return /^https?:$/.test(new URL(v).protocol)}catch(_){return false}});
  const trail=availableTrail(),index=trail.findIndex(e=>e.key===record.key);
  const snapshot=extents?.atYear(atlas.state.year)||[];
  panel.innerHTML='<span class="atlas-interaction-overline">CONNECTED HISTORY · DATED RESEARCH RECORD</span>'+
   '<h3>'+esc(record.title)+'</h3>'+
   '<p class="atlas-interaction-date">Record dated '+esc(readableYear(record.year))+
   (yearDifferent?' · Current map: '+esc(readableYear(atlas.state.year)):'')+'</p>'+
   (record.detail?'<p>'+esc(record.detail)+'</p>':'')+
   '<p class="atlas-interaction-geo-summary">'+mapped.length+' of '+record.participants.length+' named societies have representative map points. The coloured outlines are location guides; only individually sourced territory snapshots qualify as historical extents. Neither plotting nor shared evidence proves the event occurred at these points.</p>'+
   '<div class="atlas-interaction-actors" role="group" aria-label="Focus a society named in this research record">'+actors+'</div>'+
   '<div class="atlas-map-evidence-trail"><span>Record '+(index+1)+' of '+trail.length+' for '+esc(societyById.get(trail.length?(record.participants.includes(selected)?selected:origin):origin)?.name||'this society')+'</span>'+
   '<button type="button" data-map-evidence-step="-1"'+(index<=0?' disabled':'')+' aria-label="Previous dated record">‹ Previous</button>'+
   '<button type="button" data-map-evidence-step="1"'+(index<0||index>=trail.length-1?' disabled':'')+' aria-label="Next dated record">Next ›</button></div>'+
   '<div class="atlas-interaction-foot">'+
   (yearDifferent?'<button type="button" id="returnInteractionYear">Return to record year</button>':'')+
   (mapped.length>1?'<button type="button" id="fitInteractionSocieties">Fit society locations on map</button>':'')+
   '<a href="interactions.html?'+back.toString()+'">Open evidence trail ↗</a>'+
   (source?'<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Record source ↗</a>':'')+
   (snapshot.length?'<a href="'+esc(extents.SOURCE)+'" target="_blank" rel="noopener noreferrer">Extent GIS source ↗</a>':'')+
   '</div>';
 }
 function render(){
  const state=atlas.state,canShow=state.view==='actual';
  const related=record?record.participants:[];
  const shapes=enabled&&canShow&&extents?extents.atYear(state.year):[];
  for(const snap of shapes)fetchSnapshot(snap);
  const researchedIds=new Set(shapes.filter(s=>researched.has(s.id)).map(s=>s.id));
  const clouds=enabled&&canShow?presence.choose(atlas.civilisations,geo,state.year,{selectedId:state.civ,participants:related,limit:26}).filter(x=>!researchedIds.has(x.c.id)):[];
  const outlines=shapes.map(s=>researched.has(s.id)?extents.render(researched.get(s.id),s,societyById.get(s.id)?.color):'').join('');
  layer.innerHTML=enabled&&canShow?outlines+presence.cloudSvg(clouds,geo):'';
  toggle.setAttribute('aria-pressed',String(enabled));
  toggle.textContent=enabled?'☁ Presence clouds on':'☁ Presence clouds off';
  toggle.disabled=!canShow;
  if(chooser)chooser.querySelectorAll('[data-atlas-snapshot]').forEach(b=>b.setAttribute('aria-pressed',String(extents?.SNAPSHOTS.some(s=>s.id===b.dataset.atlasSnapshot&&s.year===state.year))));
  const extentMessage=shapes.map(s=>{
   if(researched.has(s.id))return s.name+' · published approximate peak extent at '+readableYear(s.year)+' (University of Minnesota GIS; geometry simplified for viewing)';
   if(pending.has(s.id))return s.name+' · loading sourced GIS boundary';
   if(failed.has(s.id))return s.name+' · GIS currently unavailable; illustrative location cloud retained';
   return '';
  }).filter(Boolean).join(' · ');
  note.textContent=!canShow?'Historical boundaries and location clouds are hidden on surviving historic-map and worldview modes.':
   !enabled?'Geographical overlays hidden. Turn them on to see locations and researched peak snapshots.':
   (extentMessage?extentMessage+'. ':'')+
   clouds.length+' illustrative coloured cloud areas near representative map points'+(record?' · '+related.filter(id=>presence.mapped(societyById.get(id),geo)).length+' mapped societies from the selected interaction':'')+
   '. Cloud sizes are decorative; only named, dated GIS outlines are approximate researched extents. Neither shows exact borders or routes.';
  renderContext();
 }
 toggle.addEventListener('click',()=>{enabled=!enabled;render();});
 panel.addEventListener('click',event=>{
  const btn=event.target.closest?.('[data-map-presence-civ]');
  if(btn&&!btn.disabled){
   const id=btn.dataset.mapPresenceCiv;
   if(societyById.has(id))atlas.go({civ:id,view:'actual',region:'All regions',catalogue:'all',search:''});
   return;
  }
  const stepButton=event.target.closest?.('[data-map-evidence-step]');
  if(stepButton&&!stepButton.disabled&&record){visitRecord(extents.step(availableTrail(),record.key,Number(stepButton.dataset.mapEvidenceStep)));return;}
  if(event.target.closest?.('#fitInteractionSocieties')){fitParticipants();return;}
  if(event.target.closest?.('#returnInteractionYear')&&record){atlas.setYear(record.year);}
 });
 // app.js redraws markers for every change to time, society, filters and map mode.
 // Observe only that group to avoid mutation feedback with the clouds themselves.
 if(typeof root.MutationObserver==='function')new root.MutationObserver(render).observe(markers,{childList:true});
 render();
 root.AtlasMapPresence=Object.freeze({render,get record(){return record;},geo,enabled:()=>enabled,visitRecord,researched});
})(typeof window!=='undefined'?window:globalThis);
