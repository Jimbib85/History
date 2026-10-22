/* Illustrated surface controls; no invented geographic data or dependencies. */
(()=>{'use strict';
// Progressive enhancement requires a browser DOM; research tests use a minimal fixture.
if(typeof document==='undefined'||typeof document.createElement!=='function')return;
const map=document.getElementById('mapStage');
if(map){
 const bar=document.createElement('div');bar.className='illustrated-layer-bar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Illustrated map appearance');
 const settings=[['terrain','Illustrated'],['parchment','Parchment'],['night','Night']];
 function select(mode){map.dataset.illustration=mode;const base=map.querySelector('#mapTransform > image');if(base)base.setAttribute('href',mode==='parchment'?'world.svg':'world-cinematic.svg');bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===mode)));try{localStorage.setItem('atlas-map-illustration',mode)}catch(_){}}
 settings.forEach(([v,label])=>{const b=document.createElement('button');b.type='button';b.dataset.layer=v;b.textContent=label;b.addEventListener('click',()=>select(v));bar.append(b)});
 map.append(bar);
 let saved='terrain';try{saved=localStorage.getItem('atlas-map-illustration')||saved}catch(_){}select(settings.some(s=>s[0]===saved)?saved:'terrain');
 const reader=document.getElementById('storyPanel');if(reader){
 const guide=document.createElement('div');guide.className='atlas-mini-guide';guide.innerHTML='<strong>Explore this society</strong> · Select a map marker, then expand Events, People, Connections or Sources below. Illustrated proximity links are not documented historical routes.';
 reader.parentNode?.insertBefore(guide,reader);
 }
}
const compare=document.getElementById('compareWorkspace');
if(compare){
 const strip=document.createElement('div');strip.className='comparison-intro-strip';strip.innerHTML='<span><b>Shared centuries, different histories.</b> Select a society on the timeline, then pin up to five for closer comparison.</span><a href="index.html?year=1200">Explore their geography ↗</a>';
 const toolbar=compare.querySelector('.compare-toolbar');toolbar?.parentNode?.insertBefore(strip,toolbar);
 const pin=document.getElementById('pinnedComparison');const summary=document.querySelector('.pinned-workbench>summary');if(summary)summary.setAttribute('title','Open a focused comparison of up to five selected societies');
 if(pin){pin.setAttribute('aria-label','Selected civilisations compared side by side');}
}
})();
