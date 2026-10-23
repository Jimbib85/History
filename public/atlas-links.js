/* v0.19. Keep year/society selection across Atlas views.
 * A link only carries context already selected or present in the current URL.
 * Conflicts intentionally stays unfiltered: that screen has no year selector.
 */
(function(root){
 'use strict';
 const BASE_NAMES=Object.freeze({"sumer":"Sumerian city-states","old-egypt":"Old Kingdom of Egypt","indus":"Indus civilisation","minoans":"Minoan civilisation","shang":"Shang dynasty","olmec":"Olmec cultures","kush":"Kingdom of Kush","persia":"Achaemenid Persian Empire","athens":"Classical Athens","maurya":"Maurya Empire","han":"Han dynasty","rome":"Roman Empire","maya":"Classic Maya city-states","teotihuacan":"Teotihuacan","aksum":"Kingdom of Aksum","gupta":"Gupta Empire","byzantium":"Eastern Roman Empire","ghana":"Ghana Empire","tang":"Tang dynasty","abbasid":"Abbasid Caliphate","angkor":"Khmer Empire / Angkor","great-zim":"Great Zimbabwe","mali":"Mali Empire","mongols":"Mongol Empire","maori":"Māori societies in Aotearoa","aboriginal":"Aboriginal Australian societies","ottomans":"Ottoman Empire","ming":"Ming dynasty","joseon":"Joseon Korea","inca":"Inca Empire","aztec":"Aztec Triple Alliance","songhai":"Songhai Empire","europe-navigation":"Iberian maritime expansion","british":"British Empire","usa":"United States","australia":"Commonwealth of Australia","soviet":"Soviet Union","prc":"People’s Republic of China"});
 const VIEWS=Object.freeze({
   story:'story.html',map:'index.html',compare:'compare.html',
   technology:'index.html',interactions:'interactions.html',worldview:'worldview.html',
   discover:'discover.html',conflicts:'conflicts.html',catalogue:'catalogue.html'
 });
 function context(){
   const q=new URLSearchParams(root.location?.search||'');
   const current=root.WorldHistoryAtlas?.state||root.HistoryCompare?.state||
     root.HistoryStory?.state||root.AtlasWorldView?.state||root.AtlasDiscoveryUI?.state||{};
   const raw=current.year??(q.has('year')?Number(q.get('year')):null);
   const year=Number.isSafeInteger(raw)&&raw>=-9999&&raw<=2026?raw:null;
   const entity=current.civ||current.selected||current.entity||current.society||
     q.get('entity')||q.get('civ')||null;
   const civ=typeof entity==='string'&&entity!=='all'&&/^[a-z0-9_-]{1,120}$/i.test(entity)?entity:null;
   const rawEvent=q.get('interaction')||q.get('event');
   const event=rawEvent&&/^[a-z0-9:_-]{1,180}$/i.test(rawEvent)?rawEvent:null;
   return {year,civ,event};
 }
 function href(view,ctx=context()){
   if(!Object.prototype.hasOwnProperty.call(VIEWS,view))return null;
   const pathname=VIEWS[view];
   if(view==='conflicts')return pathname; // Don't imply this view accepts a year.
   const q=new URLSearchParams();
   if(ctx.year!==null&&Number.isSafeInteger(ctx.year))q.set('year',String(ctx.year));
   if(ctx.civ&&view!=='discover')q.set(view==='story'?'entity':'civ',ctx.civ);
   if(ctx.event&&['map','compare','interactions','story'].includes(view))q.set(view==='map'?'interaction':'event',ctx.event);
   const suffix=q.size?'?'+q.toString():'';
   return pathname+suffix+(view==='technology'?'#technology':'');
 }
 function journey(ctx){
   if(typeof document==='undefined'||typeof document.createElement!=='function')return;
   const nav=document.querySelector?.('.atlas-crossnav');
   const header=nav?.closest?.('header');
   if(!header)return;
   let rail=document.getElementById?.('atlas-journey-rail');
   if(!ctx.civ&&!ctx.event&&ctx.year===null){if(rail)rail.hidden=true;return;}
   if(!rail){
     rail=document.createElement('div');rail.id='atlas-journey-rail';
     rail.className='atlas-journey-rail';
     rail.setAttribute('aria-label','Connected historical exploration');
     header.insertAdjacentElement('afterend',rail);
   }
   rail.hidden=false;
   const contextKey=JSON.stringify([ctx.year,ctx.civ,ctx.event]);
   if(rail.dataset?.context===contextKey)return;
   if(rail.dataset)rail.dataset.context=contextKey;
   const known=root.WorldHistoryAtlas?.civilisations||(typeof CIVILISATIONS!=='undefined'?CIVILISATIONS:[]);
   const society=known.find?.(x=>x.id===ctx.civ)?.name||BASE_NAMES[ctx.civ]||String(ctx.civ||'The world').replace(/[-_]/g,' ');
   const labelYear=ctx.year===null?'':ctx.year<=0?(1-ctx.year)+' BCE':ctx.year+' CE';
   const isDetail=!!ctx.event;
   rail.innerHTML='<div class="atlas-journey-copy"><span class="atlas-journey-kicker">YOUR CONNECTED EXPLORATION</span><strong>'+society.replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))+'</strong>'+
    (labelYear?'<span>'+labelYear+'</span>':'')+(isDetail?'<span>· Research record selected</span>':'')+'</div>'+
    '<nav aria-label="Follow the same historical context across Atlas pages">'+
    [['map','World Map'],['interactions','Interactions'],['compare','Compare'],['story','Story']].map(([view,label])=>'<a href="'+href(view,ctx)+'"'+(root.location?.pathname?.endsWith(VIEWS[view])?' aria-current="page"':'')+'>'+label+' ↗</a>').join('')+'</nav>';
 }
 function refresh(){
   if(typeof document==='undefined')return;
   const ctx=context();
   const nav=document.querySelector?.('.atlas-crossnav');
   journey(ctx);
   if(nav && !nav.querySelector('[data-atlas-view="catalogue"]')){
     const link=document.createElement('a');link.href='catalogue.html';link.dataset.atlasView='catalogue';link.textContent='Research';
     nav.appendChild(link);
   }
   for(const a of document.querySelectorAll?.('[data-atlas-view]')||[]){
     const next=href(a.dataset.atlasView,ctx);
     if(next)a.setAttribute('href',next);
   }
 }
 function revealCurrentView(){
   const nav=typeof document!=='undefined'?document.querySelector?.('.atlas-crossnav'):null;
   const active=nav?.querySelector?.('[aria-current="page"]');
   if(!active||nav.scrollWidth<=nav.clientWidth||!active.getBoundingClientRect)return;
   const offset=active.getBoundingClientRect().left-nav.getBoundingClientRect().left+nav.scrollLeft;
   nav.scrollLeft=Math.max(0,offset-(nav.clientWidth-active.clientWidth)/2);
 }
 root.AtlasCrossLinks=Object.freeze({context,href,refresh,revealCurrentView,journey});
 // Update before click, keyboard activation, link copy and context menu; no polling.
 if(typeof document!=='undefined'){
   if(document.readyState==='loading')document.addEventListener?.('DOMContentLoaded',()=>{refresh();revealCurrentView();},{once:true});
   else {refresh();revealCurrentView();}
   for(const action of ['pointerdown','focusin','click','auxclick','contextmenu'])
     document.addEventListener?.(action,refresh,true);
 }
 root.addEventListener?.('pageshow',refresh);
})(typeof window!=='undefined'?window:globalThis);
