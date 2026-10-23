/* Living Atlas Map composition. All society choices and dates remain driven by app.js.
 * Map basemap is a modern geographical reference; this file never adds borders.
 */
(function(root){
 'use strict';
// Skip browser-only map composition in minimal DOM research fixtures.
 if(typeof document==='undefined'||typeof document.createElement!=='function'||typeof document.querySelector!=='function')return;
 const api=root.WorldHistoryAtlas,stage=document.getElementById('mapStage'),yearNode=document.getElementById('mapYear');
 const browse=document.querySelector('.left-panel'),mapCard=document.querySelector('.map-card');
 if(!api||!stage||!browse||!mapCard)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=y=>y<=0?(1-y).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
 const active=(c,y)=>c.kind!=='overview'&&Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start<=y&&c.end>=y;
 const media=root.AtlasVisualAssets;
 const header=document.querySelector('.scene-heading');
 const controls=document.createElement('div');controls.className='atlas-stage-actions';
 controls.innerHTML='<button type="button" id="atlasBrowseToggle" aria-controls="atlasBrowsePanel" aria-expanded="false">☰ Browse societies</button><button type="button" id="atlasFeaturedYear">✦ Visit 1200 CE</button><a href="interactions.html" id="atlasExploreConnections">⌁ Interactions ↗</a>';
 header?.append(controls);
 browse.id='atlasBrowsePanel';browse.setAttribute('aria-label','Browse historical societies and refine filters');
 browse.setAttribute('aria-hidden','true');browse.inert=true;
 const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='atlas-browse-backdrop';backdrop.hidden=true;backdrop.tabIndex=-1;backdrop.setAttribute('aria-label','Close society browser');document.body.append(backdrop);
 const toggle=document.getElementById('atlasBrowseToggle');
 function setBrowse(open,restore=false){
   document.body.classList.toggle('atlas-browse-open',open);
   browse.inert=!open;browse.setAttribute('aria-hidden',String(!open));
   toggle.setAttribute('aria-expanded',String(open));
   backdrop.hidden=!open;
   if(open)browse.querySelector('#searchInput')?.focus({preventScroll:true});
   else if(restore)toggle.focus({preventScroll:true});
 }
 toggle.addEventListener('click',()=>setBrowse(!document.body.classList.contains('atlas-browse-open'),true));
 backdrop.addEventListener('click',()=>setBrowse(false,true));
 browse.addEventListener('click',e=>{
   if(e.target.closest('[data-civ],[data-overview],[data-era]'))setBrowse(false);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('atlas-browse-open')){e.preventDefault();setBrowse(false,true);}});
 document.getElementById('atlasFeaturedYear')?.addEventListener('click',()=>{
   api.go({year:1200,civ:'abbasid',region:'All regions',catalogue:'all',search:'',view:'actual'},{zoomReset:true});
 });
 const hero=document.createElement('section');hero.className='atlas-map-spotlight';hero.id='atlasMapSpotlight';hero.setAttribute('aria-label','Society currently selected on the map');
 stage.append(hero);
 const strip=document.createElement('div');strip.className='atlas-map-contemporaries';strip.id='atlasMapContemporaries';strip.setAttribute('aria-label','Other atlas societies active at this date');
 stage.insertAdjacentElement('afterend',strip);
 const toolbar=document.getElementById('livingMapControls'),geo=document.getElementById('geoControls');
 const layerTools=document.createElement('details');layerTools.className='atlas-map-layer-tools';
 if(toolbar&&geo){
   const summary=document.createElement('summary');summary.textContent='⚙ Map layers';layerTools.append(summary);
   toolbar.append(layerTools);layerTools.append(geo);
   document.addEventListener('click',event=>{if(layerTools.open&&!layerTools.contains(event.target))layerTools.open=false;});
 }
 const caution=document.getElementById('livingMapExplanation');
 if(caution)caution.hidden=true;
 const evidence=document.getElementById('mapEvidence');
 if(evidence){
   const drawer=document.createElement('details');drawer.className='atlas-map-source-drawer';
   const summary=document.createElement('summary');summary.textContent='More maps, stories & sources ↘';
   drawer.append(summary);
   evidence.parentElement.insertBefore(drawer,evidence);
   const things=[evidence,...mapCard.querySelectorAll('.worldview-entry,.map-about')];
   for(const node of things)drawer.append(node);
 }
 function image(c){
   const asset=media?.forSociety(c.id);
   if(asset)return '<img class="atlas-object-image" src="'+esc(asset.imageUrl)+'" alt="" loading="lazy" decoding="async">';
   return '<img src="assets/atlas-compass.svg" alt="" loading="lazy" class="atlas-map-decorative">';
 }
 function link(c,yy){
   const q=new URLSearchParams({year:String(yy),civ:c.id});
   return 'compare.html?'+q.toString();
 }
 function update(){
   const y=api.state.year,selected=api.civilisations.find(c=>c.id===api.state.civ);
   if(!selected)return;
   stage.dataset.atlasEra=String(y<500?'ancient':y<1500?'medieval':y<1800?'earlymodern':'modern');
   const item=media?.forSociety(selected.id);
   const description=selected.kind==='overview'?'Cultural context rather than a single dated polity':
     active(selected,y)?'Part of the world at this date':'Selected from another historical period';
   if(layerTools.parentNode)layerTools.hidden=api.state.view==='historical';
   hero.hidden=api.state.view!=='actual';
   hero.innerHTML='<div class="atlas-map-spotlight-visual">'+image(selected)+'</div><div class="atlas-map-spotlight-copy"><span>EXPLORE · '+esc(description)+'</span><h3>'+esc(selected.name)+'</h3><p>'+esc(selected.region)+' · '+esc(selected.location||'')+'</p><div><a href="'+link(selected,y)+'">Compare ↗</a><a href="story.html?year='+encodeURIComponent(y)+'&entity='+encodeURIComponent(selected.id)+'">Read story ↗</a></div>'+(item?'<small>'+esc(item.title)+' · '+esc(item.date)+'</small>':'')+'</div>';
   const activeSocieties=api.civilisations.filter(c=>active(c,y));
   const prioritised=activeSocieties.sort((a,b)=>
      Number(b.id===selected.id)-Number(a.id===selected.id)||
      Number(Boolean(media?.forSociety(b.id)))-Number(Boolean(media?.forSociety(a.id)))||
      Number(b.region!==selected.region)-Number(a.region!==selected.region)||a.name.localeCompare(b.name));
   const chosen=[selected,...prioritised.filter(c=>c.id!==selected.id)].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,5);
   strip.innerHTML='<div class="atlas-contemporary-intro"><span>AT THIS MOMENT</span><h3>Meanwhile in other worlds</h3></div><div class="atlas-contemporary-list">'+chosen.map(c=>{
    const object=media?.forSociety(c.id);
    return '<button type="button" data-map-contemporary="'+esc(c.id)+'" aria-pressed="'+(c.id===selected.id)+'"><span class="atlas-contemporary-art">'+image(c)+'</span><span class="atlas-contemporary-text"><strong>'+esc(c.name)+'</strong><small>'+esc(c.region)+'</small>'+(object?'<em>Explore</em>':'<em>Explore</em>')+'</span></button>';
   }).join('')+'</div>';
   media?.bindImages(hero);media?.bindImages(strip);
   const interaction=document.getElementById('atlasExploreConnections');
   if(interaction)interaction.href='interactions.html?year='+encodeURIComponent(y)+'&civ='+encodeURIComponent(selected.id);
 }
 strip.addEventListener('click',e=>{
   const btn=e.target.closest('[data-map-contemporary]');
   if(btn)api.selectCiv(btn.dataset.mapContemporary);
 });
 // Map labels update after every app.js render, including slider input.
 if(yearNode){
   new MutationObserver(update).observe(yearNode,{childList:true,characterData:true,subtree:true});
 }
 // A society change can leave the year untouched; update on the next paint.
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-civ],[data-overview],#randomButton,#sameYearButton,#backButton,[data-random],[data-view]')){
     root.requestAnimationFrame?.(update);
   }
 });
 update();
 root.AtlasLivingStage=Object.freeze({update,setBrowse});
})(window);