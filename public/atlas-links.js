/* v0.19. Keep year/society selection across Atlas views.
 * A link only carries context already selected or present in the current URL.
 * Conflicts intentionally stays unfiltered: that screen has no year selector.
 */
(function(root){
 'use strict';
 const VIEWS=Object.freeze({
   story:'story.html',map:'index.html',compare:'compare.html',
   technology:'index.html',interactions:'interactions.html',worldview:'worldview.html',
   discover:'discover.html',conflicts:'conflicts.html'
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
   return {year,civ};
 }
 function href(view,ctx=context()){
   if(!Object.prototype.hasOwnProperty.call(VIEWS,view))return null;
   const pathname=VIEWS[view];
   if(view==='conflicts')return pathname; // Don't imply this view accepts a year.
   const q=new URLSearchParams();
   if(ctx.year!==null&&Number.isSafeInteger(ctx.year))q.set('year',String(ctx.year));
   if(ctx.civ&&view!=='discover')q.set(view==='story'?'entity':'civ',ctx.civ);
   const suffix=q.size?'?'+q.toString():'';
   return pathname+suffix+(view==='technology'?'#technology':'');
 }
 function refresh(){
   if(typeof document==='undefined')return;
   const ctx=context();
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
 root.AtlasCrossLinks=Object.freeze({context,href,refresh,revealCurrentView});
 // Update before click, keyboard activation, link copy and context menu; no polling.
 if(typeof document!=='undefined'){
   if(document.readyState==='loading')document.addEventListener?.('DOMContentLoaded',()=>{refresh();revealCurrentView();},{once:true});
   else {refresh();revealCurrentView();}
   for(const action of ['pointerdown','focusin','click','auxclick','contextmenu'])
     document.addEventListener?.(action,refresh,true);
 }
 root.addEventListener?.('pageshow',refresh);
})(typeof window!=='undefined'?window:globalThis);
