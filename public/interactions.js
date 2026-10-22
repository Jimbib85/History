/* Interactions: evidence-linked, non-geographic relationship exploration.
 * Only explicit multi-society records form edges. Time overlap is never an edge.
 */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id);
 const societies=new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
 const allSources=[
  ...(typeof ATLAS_RESEARCH_EVENTS!=='undefined'?ATLAS_RESEARCH_EVENTS:[]),
  ...(typeof ATLAS_MEDIEVAL_EVENTS!=='undefined'?ATLAS_MEDIEVAL_EVENTS:[]),
  ...(typeof ATLAS_MODERN_EVENTS!=='undefined'?ATLAS_MODERN_EVENTS:[]),
  ...(typeof ATLAS_CLASSICAL_EVENTS!=='undefined'?ATLAS_CLASSICAL_EVENTS:[]),
  ...(typeof ATLAS_EXPANSION_EVENTS!=='undefined'?ATLAS_EXPANSION_EVENTS:[]),
  ...(root.ATLAS_MASTER_EVENTS||[])
 ];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const year=y=>y<=0?(1-y).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
 const groups=[
  ['Trade','trade|merchant|exchange|maritime|shipping|commerce|food exchange|trade institution'],
  ['Conflict','conflict|battle|war|siege|conquest|revolt|rebellion|sack|military|imperial expansion'],
  ['Diplomacy','diplom|treaty|conference|alliance|agreement|negotiation'],
  ['Knowledge','knowledge|science|idea|intellect|religion|faith|translation|cultural|ethics|education'],
  ['Migration','migration|settler|transportation|displacement|diaspora|enslav|forced labour'],
  ['Political change','imperial|independen|colonial|state|rights|abolition|political|decolonis|transition|revolution']
 ];
 const label=e=>{
  const v=String(e.kind||e.category||'').toLowerCase();
  const found=groups.find(([,term])=>new RegExp(term,'i').test(v));
  return found?.[0]||'Other';
 };
 const palettes={'Trade':'#edc16c','Conflict':'#f17a75','Diplomacy':'#67c9e7','Knowledge':'#ba98f0','Migration':'#76d4ad','Political change':'#e6a279','Other':'#afc5c9'};
 const params=new URLSearchParams(location.search);
 const eraList={medieval:{start:850,end:1500,label:'850–1500 CE'},classical:{start:-499,end:500,label:'500 BCE–500 CE'},earlymodern:{start:1450,end:1800,label:'1450–1800 CE'},modern:{start:1800,end:2026,label:'1800–2026 CE'},all:{start:-9999,end:2026,label:'All recorded history'}};
 const state={era:eraList[params.get('era')]?params.get('era'):'medieval',year:Number.isFinite(Number(params.get('year')))&&params.has('year')?Math.max(-9999,Math.min(2026,Number(params.get('year')))):1200,type:'All',search:'',focus:societies.has(params.get('civ'))?params.get('civ'):'',event:null,mode:'network'};
 if(params.has('year'))state.era='window';
 const records=[...new Map(allSources.filter(e=>e&&Number.isFinite(e.year)&&e.title).map((e,i)=>{
  const participants=[...new Set((e.societyIds||e.allSocietyIds||[]).filter(id=>societies.has(id)))];
  if(participants.length<2)return [null,null];
  const key=e.id||'multi-'+i;
  return [key,{...e,key,participants,type:label(e)}];
 }).filter(([id])=>id).map(([key,item])=>[key,item])).values()];
 const timeWindow=()=>state.era==='window'?{start:Math.max(-9999,state.year-250),end:Math.min(2026,state.year+250),label:'Around '+year(state.year)}:eraList[state.era];
 const sourceUrl=e=>{
  for(const candidate of [...(e.sourceUrls||[]),e.sourceUrl,e.source].filter(Boolean)){
   try{const u=new URL(candidate);if(['https:','http:'].includes(u.protocol))return u.href}catch(_){}
  }
  return null;
 };
 const dates=e=>e.humanDate||e.dateLabel||e.original_date_text||(/approx|circa|century/i.test(e.datePrecision||'')?'c. ':'')+year(e.year);
 const linkedRecords=()=>{
  const r=timeWindow(),q=state.search.trim().toLocaleLowerCase();
  return records.filter(e=>e.year>=r.start&&e.year<=r.end&&(!e.endExclusive||e.endExclusive>r.start))
   .filter(e=>state.type==='All'||e.type===state.type)
   .filter(e=>!state.focus||e.participants.includes(state.focus))
   .filter(e=>!q||[e.title,e.detail,e.kind,...e.participants.map(id=>societies.get(id)?.name)].join(' ').toLocaleLowerCase().includes(q))
   .sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
 };
 function visibleRecords(){return linkedRecords().slice(0,80)}
 function artwork(e){
  const asset=root.AtlasVisualAssets?.forSociety(e.participants.find(id=>root.AtlasVisualAssets.forSociety(id)));
  if(asset)return '<div class="interaction-object">'+root.AtlasVisualAssets.html(asset,'card')+'<div class="interaction-art-caption">Related period object, not a depiction of this event</div></div>';
  return '<div class="interaction-object interaction-object-empty" aria-label="Original decorative motif, not a historical depiction"><img src="assets/atlas-compass.svg" alt="" loading="lazy"/><span>Decorative illustration · not historical evidence</span></div>';
 }
 function network(rows){
  const degrees=new Map();
  for(const e of rows)for(const id of e.participants)degrees.set(id,(degrees.get(id)||0)+1);
  const leaders=[...degrees.keys()].sort((a,b)=>(degrees.get(b)||0)-(degrees.get(a)||0)||societies.get(a).name.localeCompare(societies.get(b).name)).slice(0,13);
  const positions=new Map(leaders.map((id,i)=>{const theta=-Math.PI/2+i*Math.PI*2/leaders.length;return[id,{x:500+Math.cos(theta)*355,y:270+Math.sin(theta)*190}]}));
  const edges=[];
  const seen=new Set();
  for(const e of rows){
   const active=e.participants.filter(id=>positions.has(id));
   if(active.length<2)continue;
   // A shared record with three or more participants becomes a small chain,
   // not an unsupported claim that every pair interacted directly.
   for(let i=0;i<active.length-1;i++){
    const a=active[i],b=active[i+1],key=e.key+':'+i;
    if(seen.has(key))continue;seen.add(key);
    edges.push({e,a,b});if(edges.length>=35)break;
   }
   if(edges.length>=35)break;
  }
  const lines=edges.map(({e,a,b},i)=>{
   const p=positions.get(a),q=positions.get(b);
   const mx=(p.x+q.x)/2,my=(p.y+q.y)/2-(i%2?21:-21);
   return '<path data-network-event="'+esc(e.key)+'" class="interaction-edge" d="M'+p.x.toFixed(1)+' '+p.y.toFixed(1)+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+q.x.toFixed(1)+' '+q.y.toFixed(1)+'" stroke="'+palettes[e.type]+'" stroke-width="2.5" tabindex="0" role="button" aria-label="Read '+esc(e.title)+', '+esc(dates(e))+'"><title>'+esc(e.title+' — '+dates(e))+'</title></path>';
  }).join('');
  const nodes=leaders.map((id,i)=>{
   const c=societies.get(id),p=positions.get(id),selected=id===state.focus;
   return '<g class="interaction-node'+(selected?' selected':'')+'" data-network-civ="'+esc(id)+'" role="button" tabindex="0" aria-label="Focus on '+esc(c.name)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="24" fill="#0e2636" stroke="'+(selected?'#f9da9d':'#e2b975')+'" stroke-width="'+(selected?4:2)+'"/><circle cx="'+p.x+'" cy="'+p.y+'" r="15" fill="#d1a75d" fill-opacity=".18"/><text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" class="interaction-node-glyph">'+(c.kind==='empire'?'♜':'✦')+'</text><text x="'+p.x+'" y="'+(p.y+42)+'" text-anchor="middle" class="interaction-node-name">'+esc(c.name.length>26?c.name.slice(0,23)+'…':c.name)+'</text></g>';
  }).join('');
  return '<svg class="interaction-network-svg" viewBox="0 0 1000 560" role="group" aria-label="Schematic network of societies sharing specific evidence records; not plotted geographic routes"><defs><radialGradient id="interactionSea"><stop stop-color="#23545a" stop-opacity=".26"/><stop offset="1" stop-color="#07202b" stop-opacity=".05"/></radialGradient></defs><circle cx="500" cy="270" r="240" fill="url(#interactionSea)"/><g class="interaction-net-lines">'+lines+'</g><g class="interaction-net-nodes">'+nodes+'</g><g class="interaction-net-centre"><circle cx="500" cy="270" r="53" fill="#112d3b" stroke="#d6ab6a" stroke-width="1.5" stroke-dasharray="3 7"/><text x="500" y="264" text-anchor="middle">RECORDED</text><text x="500" y="280" text-anchor="middle">ENCOUNTERS</text></g></svg>';
 }
 function storyCard(e){
  const actors=e.participants.map(id=>societies.get(id).name),url=sourceUrl(e),selected=e.key===state.event;
  const art=root.AtlasVisualAssets?.forSociety(e.participants[0]);
  const thumb=art?'<img class="atlas-object-image" src="'+esc(art.imageUrl)+'" alt="" loading="lazy" decoding="async"/>':'<span class="interaction-icon-art" aria-hidden="true">✧</span>';
  return '<article class="interaction-story'+(selected?' selected':'')+'"><div class="interaction-story-thumb">'+thumb+'<span>Context, not event depiction</span></div><div class="interaction-story-copy"><div class="interaction-story-meta"><b>'+esc(dates(e))+'</b><em style="--kind-colour:'+palettes[e.type]+'">'+esc(e.type)+'</em></div><h3>'+esc(e.title)+'</h3><p>'+esc(actors.slice(0,4).join(' · '))+'</p><button type="button" data-interaction-event="'+esc(e.key)+'">Explore evidence →</button></div></article>';
 }
 function detail(e){
  const item=$('interactionDetail');
  if(!e){item.innerHTML='<div class="interaction-no-record"><strong>No matching documented multi-society records</strong><p>Change the date, type or search terms. An empty result reflects atlas coverage, not proof that societies were isolated.</p></div>';return;}
  const names=e.participants.map(id=>societies.get(id)?.name).filter(Boolean),url=sourceUrl(e);
  item.innerHTML='<div class="interaction-detail-overline">SELECTED HISTORICAL RECORD</div>'+artwork(e)+'<div class="interaction-detail-date">'+esc(dates(e))+' · '+esc(e.type)+'</div><h2>'+esc(e.title)+'</h2><p>'+esc(e.detail||'No further summary is attached to this record.')+'</p><h3>Societies named in this record</h3><div class="interaction-actors">'+e.participants.map(id=>'<button type="button" data-interaction-civ="'+esc(id)+'">'+esc(societies.get(id).name)+' ↗</button>').join('')+'</div><div class="interaction-evidence"><strong>Evidence boundaries</strong><p>These societies are explicitly linked to the same research record. This does not on its own prove direct bilateral contact, a travelled route, or equal involvement.</p><span>Editorial confidence: '+esc(e.confidence||'not rated')+' · Not independently re-verified for this visual layer</span></div><div class="interaction-actions">'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Open linked source ↗</a>':'<span>No claim-specific source URL attached</span>')+'<a href="compare.html?year='+encodeURIComponent(e.year)+'&mode=events&event='+encodeURIComponent(e.key)+'&civ='+encodeURIComponent(e.participants[0])+'">See in Compare ↗</a></div>';
  root.AtlasVisualAssets?.bindImages(item);
 }
 function render(){
  const r=timeWindow(),rows=visibleRecords();
  const chosen=rows.find(e=>e.key===state.event)||rows[0]||null;
  if(chosen)state.event=chosen.key;else state.event=null;
  $('interactionYear').value=state.year;
  $('interactionEra').value=state.era;
  $('interactionRangeLabel').textContent=r.label+' · '+rows.length+(linkedRecords().length>rows.length?' of '+linkedRecords().length:'')+' linked records';
  $('interactionCount').textContent=rows.length+' sourced cross-society records'+(linkedRecords().length>rows.length?' (first '+rows.length+' displayed)':'');
  $('interactionNetwork').innerHTML=rows.length?network(rows):'<p class="interaction-no-record">No explicit multi-society records match this selection.</p>';
  $('interactionStories').innerHTML=rows.length?rows.slice(0,24).map(storyCard).join(''):'<p class="interaction-no-record">No linked stories for this period and filter.</p>';
  $('interactionNetwork').hidden=state.mode!=='network';
  $('interactionStories').hidden=state.mode!=='stories';
  document.querySelectorAll('[data-interaction-mode]').forEach(b=>{const on=b.dataset.interactionMode===state.mode;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on)});
  const focus=$('interactionFocus');
  focus.textContent=state.focus?'Focusing: '+societies.get(state.focus).name+' ×':'Explore all societies';
  detail(chosen);
  const query=new URLSearchParams();if(state.era==='window')query.set('year',String(state.year));else query.set('era',state.era);if(state.focus)query.set('civ',state.focus);
  history.replaceState(null,'',location.pathname+'?'+query.toString());
  root.AtlasCrossLinks?.refresh();
 }
 function change(patch){Object.assign(state,patch);render()}
 $('interactionType').addEventListener('change',e=>change({type:e.target.value,event:null}));
 $('interactionEra').addEventListener('change',e=>change({era:e.target.value,event:null}));
 $('interactionSearch').addEventListener('input',e=>change({search:e.target.value,event:null}));
 $('interactionYear').addEventListener('input',e=>change({year:Number(e.target.value),era:'window',event:null}));
 $('interactionFocus').addEventListener('click',()=>change({focus:'',event:null}));
 document.querySelectorAll('[data-interaction-mode]').forEach(b=>b.addEventListener('click',()=>change({mode:b.dataset.interactionMode})));
 document.addEventListener('click',e=>{
  const ev=e.target.closest('[data-interaction-event],[data-network-event]');
  if(ev){const key=ev.dataset.interactionEvent||ev.dataset.networkEvent;if(records.some(x=>x.key===key))change({event:key});return;}
  const civ=e.target.closest('[data-interaction-civ],[data-network-civ]');
  if(civ){const id=civ.dataset.interactionCiv||civ.dataset.networkCiv;if(societies.has(id))change({focus:id,event:null});}
 });
 $('interactionNetwork').addEventListener('keydown',e=>{
  if(!['Enter',' '].includes(e.key))return;
  const target=e.target.closest('[data-network-event],[data-network-civ]');
  if(target){e.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
 });
 render();
 root.AtlasInteractions=Object.freeze({state,render,linkedRecords,sourceUrl,records});
})(window);