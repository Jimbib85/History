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
 const queryEvent=params.get('interaction');
 const allSources=[
  ...(typeof ATLAS_RESEARCH_EVENTS!=='undefined'?ATLAS_RESEARCH_EVENTS:[]),
  ...(typeof ATLAS_MEDIEVAL_EVENTS!=='undefined'?ATLAS_MEDIEVAL_EVENTS:[]),
  ...(typeof ATLAS_MODERN_EVENTS!=='undefined'?ATLAS_MODERN_EVENTS:[]),
  ...(typeof ATLAS_CLASSICAL_EVENTS!=='undefined'?ATLAS_CLASSICAL_EVENTS:[]),
  ...(typeof ATLAS_EXPANSION_EVENTS!=='undefined'?ATLAS_EXPANSION_EVENTS:[]),
  ...(root.ATLAS_MASTER_EVENTS||[])
 ];
 const record=presence.interaction(allSources,queryEvent,atlas.civilisations);
 let enabled=true;
 function renderContext(){
  if(!queryEvent){panel.hidden=true;return;}
  panel.hidden=false;
  if(!record){panel.innerHTML='<div class="atlas-interaction-overline">SHARED HISTORICAL RECORD</div><h3>Interaction record unavailable</h3><p>The requested event could not be matched to a current dated research record. The map still works independently. Return to Interactions to choose another record.</p><div class="atlas-interaction-foot"><a href="interactions.html">Explore interactions ↗</a></div>';return;}
  const mapped=record.participants.filter(id=>presence.mapped(societyById.get(id),geo));
  const selected=atlas.state.civ;
  const actors=record.participants.map(id=>{
   const c=societyById.get(id);
   if(!c)return '';
   const canMap=presence.mapped(c,geo);
   return '<button type="button" data-map-presence-civ="'+esc(id)+'" aria-pressed="'+(selected===id)+'"'+(canMap?'':' disabled')+' style="--actor-colour:'+presence.safeColour(c.color)+'"><span class="atlas-presence-dot" aria-hidden="true"></span><span>'+esc(c.name)+(canMap?'':' <small>· no mapped point</small>')+'</span></button>';
  }).join('');
  const fallback=record.detail?'<p>'+esc(record.detail)+'</p>':'';
  const yearDifferent=atlas.state.year!==record.year;
  const origin=record.participants[0],back=new URLSearchParams({year:String(record.year),civ:origin,event:record.key});
  panel.innerHTML='<span class="atlas-interaction-overline">CONNECTIONS ACROSS THE MAP · RESEARCH RECORD</span>'+
   '<h3>'+esc(record.title)+'</h3>'+
   '<p class="atlas-interaction-date">Record dated '+esc(readableYear(record.year))+
   (yearDifferent?' · Current map: '+esc(readableYear(atlas.state.year)):'')+'</p>'+fallback+
   '<p>'+mapped.length+' of '+record.participants.length+' named societies have representative map points. Coloured cloud outlines show <strong>illustrative neighbourhoods around those points</strong>; they are not reconstructions of historic boundaries, political control or where the encounter happened.</p>'+
   '<div class="atlas-interaction-actors" role="group" aria-label="Focus the geographical reference for a named society">'+actors+'</div>'+
   '<div class="atlas-interaction-foot">'+
   (yearDifferent?'<button type="button" id="returnInteractionYear">Return to record year ↗</button>':'')+
   '<a href="interactions.html?'+back.toString()+'">Open supporting interaction evidence ↗</a></div>';
 }
 function render(){
  const state=atlas.state,canShow=state.view==='actual';
  const related=record?record.participants:[];
  const clouds=enabled&&canShow?presence.choose(atlas.civilisations,geo,state.year,{selectedId:state.civ,participants:related,limit:26}):[];
  layer.innerHTML=enabled&&canShow?presence.cloudSvg(clouds,geo):'';
  toggle.setAttribute('aria-pressed',String(enabled));
  toggle.textContent=enabled?'☁ Presence clouds on':'☁ Presence clouds off';
  toggle.disabled=!canShow;
  note.textContent=!canShow?'Cloud areas are only shown on the modern geographical reference map, not on surviving historical maps or reconstructed worldviews.':
   !enabled?'Presence clouds hidden. Turn them on to view illustrative areas around society reference points.':
   clouds.length+' coloured cloud areas near geographical reference points'+(record?' · '+related.filter(id=>presence.mapped(societyById.get(id),geo)).length+' mapped societies from the selected interaction':'')+'. Their shapes and sizes are decorative and are NOT historical territories, borders or routes.';
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
  if(event.target.closest?.('#returnInteractionYear')&&record){atlas.setYear(record.year);}
 });
 // app.js redraws markers for every change to time, society, filters and map mode.
 // Observe only that group to avoid mutation feedback with the clouds themselves.
 if(typeof root.MutationObserver==='function')new root.MutationObserver(render).observe(markers,{childList:true});
 render();
 root.AtlasMapPresence=Object.freeze({render,record,geo,enabled:()=>enabled});
})(typeof window!=='undefined'?window:globalThis);
