/* v0.27 Living Map: playful, inferred co-presence links on existing Atlas points.
   Lines are illustrative proximity, NEVER verified historical trade routes.
   Underlying historical datasets, selection logic and date labels are unchanged. */
(function(root){
 'use strict';
 const doc=root.document,atlas=root.WorldHistoryAtlas;
 if(!doc||!atlas)return;
 const $=id=>doc.getElementById(id);
 const layer=$('livingConnections'),controls=$('livingMapControls');
 if(!layer||!controls)return;
 const SVG='http://www.w3.org/2000/svg',state=atlas.state;
 const ui={enabled:false,playing:false,speed:1,step:25};
 const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const finite=c=>Number.isFinite(c.lon)&&Number.isFinite(c.lat);
 const point=c=>root.WorldAtlasGeo.project(c.lon,c.lat);
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const escape=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function choices(){
   const selected=atlas.civilisations.find(c=>c.id===state.civ);
   if(!selected||!finite(selected))return [];
   const active=atlas.civilisations.filter(c=>c.id!==selected.id&&c.kind!=='overview'&&finite(c)&&
     c.start<=state.year&&c.end>=state.year&&
     (state.region==='All regions'||c.region===state.region)&&
     (state.catalogue==='all'||c.kind===state.catalogue));
   const a=point(selected);
   return active.map(c=>({c,a,b:point(c)})).map(v=>({...v,dist:distance(v.a,v.b)}))
     .filter(v=>v.dist>12).sort((x,y)=>x.dist-y.dist).slice(0,8);
 }
 function draw(){
   layer.replaceChildren();
   layer.setAttribute('aria-hidden','true');
   const visible=ui.enabled&&state.view==='actual';
   layer.classList.toggle('hidden',!visible);
   controls.querySelector('#livingConnectToggle')?.setAttribute('aria-pressed',String(ui.enabled));
   controls.querySelector('#livingConnectToggle')?.classList.toggle('is-on',ui.enabled);
   const caption=$('livingMapExplanation');
   if(caption)caption.textContent=ui.enabled?
     'Exploration links: nearby societies active around the selected date. Illustrative, not documented travel or trade routes.':
     'Connection illustration off. Select a society to explore its actual records.';
   if(!visible)return;
   const rows=choices();
   for(const [i,row] of rows.entries()){
     const {a,b,c}=row;
     const delta=b[0]-a[0],bend=Math.min(75,Math.abs(delta)*.15+24);
     const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2-bend;
     const path=doc.createElementNS(SVG,'path');
     path.setAttribute('d',`M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
     path.setAttribute('class','living-arc living-arc-'+(i%4));
     path.style.setProperty('--arc-delay',(i*.17)+'s');
     const title=doc.createElementNS(SVG,'title');
     title.textContent='Illustrative geographical proximity: '+atlas.civilisations.find(x=>x.id===state.civ)?.name+' and '+c.name;
     path.appendChild(title);layer.appendChild(path);
   }
   const count=$('livingMapCount');if(count)count.textContent=rows.length+' nearby contemporaries';
 }
 let timer=null;
 function stop(){
   ui.playing=false;
   if(timer!==null){root.clearInterval(timer);timer=null;}
   const btn=$('livingPlay');if(btn){btn.textContent='▶ Play history';btn.setAttribute('aria-pressed','false');}
 }
 function tick(){
   if(state.year>=2026){stop();return;}
   atlas.setYear(Math.min(2026,state.year+ui.step));
 }
 function play(){
   if(ui.playing){stop();return;}
   if(reduced())return;
   if(state.year>=2026)atlas.setYear(-9999);
   ui.playing=true;
   const btn=$('livingPlay');btn.textContent='Ⅱ Pause';btn.setAttribute('aria-pressed','true');
   timer=root.setInterval(tick,900/ui.speed);
 }
 $('livingConnectToggle')?.addEventListener('click',()=>{ui.enabled=!ui.enabled;draw();});
 $('livingPlay')?.addEventListener('click',play);
 $('livingSpeed')?.addEventListener('change',e=>{
   const speed=Number(e.target.value);ui.speed=[1,2,4].includes(speed)?speed:1;
   if(ui.playing){stop();play();}
 });
 $('livingStep')?.addEventListener('change',e=>{
   const step=Number(e.target.value);ui.step=[10,25,50,100].includes(step)?step:25;
 });
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();});
 root.addEventListener?.('pagehide',stop);
 const year=$('mapYear');
 if(year&&root.MutationObserver){
   new root.MutationObserver(()=>{if(ui.playing&&state.year>=2026)stop();draw();})
     .observe(year,{childList:true,characterData:true,subtree:true});
 }
 // State selection and map modes may change without a year update.
 const oldReplace=root.history?.replaceState?.bind(root.history);
 if(oldReplace){
   // No navigation semantics changed: this is a visual refresh after Atlas updated its URL.
   root.history.replaceState=function(...args){const result=oldReplace(...args);draw();return result;};
 }
 const buttons=controls.querySelectorAll('button');
 for(const button of buttons)button.setAttribute('type','button');
 if(reduced()){const btn=$('livingPlay');if(btn){btn.disabled=true;btn.title='Automatic animation disabled by reduced-motion preference';}}
 draw();
 root.AtlasLivingMap=Object.freeze({draw,stop,choices,getState:()=>({...ui})});
})(typeof window!=='undefined'?window:globalThis);
