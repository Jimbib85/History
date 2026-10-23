/* Interactions: evidence-linked, non-geographic relationship exploration.
 * Only explicit multi-society records form edges. Time overlap is never an edge.
 */
(function(root){
 'use strict';
  // Browser-only visual layer; research test sandboxes may have no DOM.
  if(typeof document==='undefined'||typeof document.getElementById!=='function')return;
 const $=id=>document.getElementById(id);
 const societies=new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
 const evidence=root.AtlasInteractionEvidence;
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
 const initialFocus=societies.has(params.get('civ'))?params.get('civ'):'';
 const initialPartner=initialFocus&&societies.has(params.get('with'))&&params.get('with')!==initialFocus?params.get('with'):'';
 const state={era:eraList[params.get('era')]?params.get('era'):'medieval',year:Number.isFinite(Number(params.get('year')))&&params.has('year')?Math.max(-9999,Math.min(2026,Number(params.get('year')))):1200,type:'All',search:'',focus:initialFocus,partner:initialPartner,event:params.get('event')||null,mode:params.get('view')==='stories'?'stories':'network'};
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
 const filterFor=(partner='')=>{const r=timeWindow();return evidence.filter(records,{start:r.start,end:r.end,type:state.type,focus:state.focus,partner,search:state.search,societyNames:societies});};
 const linkedRecords=()=>filterFor(state.partner);
 const contextualRecords=()=>filterFor('');
 function visibleRecords(){return linkedRecords().slice(0,80)}
 function artwork(e){
  const asset=root.AtlasVisualAssets?.forSociety(e.participants.find(id=>root.AtlasVisualAssets.forSociety(id)));
  if(asset)return '<div class="interaction-object">'+root.AtlasVisualAssets.html(asset,'card')+'</div>';
  return '<div class="interaction-object interaction-object-empty" aria-label="Decorative motif"><img src="assets/atlas-compass.svg" alt="" loading="lazy"/></div>';
 }
 function focusedNetwork(rows){
  const focal=societies.get(state.focus);
  const partners=evidence.partners(rows,state.focus,societies).slice(0,12);
  if(!focal||!partners.length)return '<p class="interaction-no-record">No connections in this period. Try another date or category.</p>';
  const anchor={x:500,y:277},radiusX=343,radiusY=193;
  const positions=partners.map((item,i)=>{
   const angle=-Math.PI/2+i*Math.PI*2/partners.length;
   return {...item,x:anchor.x+Math.cos(angle)*radiusX,y:anchor.y+Math.sin(angle)*radiusY};
  });
  const edges=positions.map(item=>{
   const selected=state.partner===item.id;
   const colour=item.types.length===1?(palettes[item.types[0]]||palettes.Other):'#d4b886';
   const midX=(anchor.x+item.x)/2,midY=(anchor.y+item.y)/2-14;
   return '<path data-network-partner="'+esc(item.id)+'" role="button" tabindex="0" class="interaction-edge interaction-focus-edge'+(selected?' selected':'')+'" d="M'+anchor.x+' '+anchor.y+' Q'+midX.toFixed(1)+' '+midY.toFixed(1)+' '+item.x.toFixed(1)+' '+item.y.toFixed(1)+'" stroke="'+colour+'" stroke-width="'+Math.min(5,2+Math.sqrt(item.count)).toFixed(1)+'" aria-label="'+esc(item.count+' shared research records naming '+focal.name+' and '+item.name)+'"><title>'+esc(item.count+' shared records · '+focal.name+' / '+item.name+'')+'</title></path>';
  }).join('');
  const nodes=positions.map(item=>{
   const chosen=state.partner===item.id;
   const name=item.name.length>24?item.name.slice(0,21)+'…':item.name;
   return '<g data-network-partner="'+esc(item.id)+'" class="interaction-node interaction-partner-node'+(chosen?' selected':'')+'" role="button" tabindex="0" aria-label="Show '+esc(item.count+' shared records involving '+item.name)+'"><circle cx="'+item.x.toFixed(1)+'" cy="'+item.y.toFixed(1)+'" r="27" fill="#102e3a" stroke="'+(chosen?'#fff0ba':'#d7b67c')+'" stroke-width="'+(chosen?4:2)+'"/><text x="'+item.x.toFixed(1)+'" y="'+(item.y+5).toFixed(1)+'" class="interaction-node-glyph" text-anchor="middle">'+esc(item.count)+'</text><text x="'+item.x.toFixed(1)+'" y="'+(item.y+44).toFixed(1)+'" class="interaction-node-name" text-anchor="middle">'+esc(name)+'</text></g>';
  }).join('');
  return '<svg class="interaction-network-svg" viewBox="0 0 1000 560" role="group" aria-label="Connections for '+esc(focal.name)"><circle cx="500" cy="277" r="207" fill="#17404a" fill-opacity=".28" stroke="#c9a66a" stroke-opacity=".2" stroke-dasharray="2 10"/><g class="interaction-net-lines">'+edges+'</g><g class="interaction-net-nodes">'+nodes+'<g class="interaction-focus-anchor"><circle cx="500" cy="277" r="57" fill="#0d2a39" stroke="#f1c786" stroke-width="3"/><text x="500" y="272" text-anchor="middle">'+esc(focal.name.length>20?focal.name.slice(0,17)+'…':focal.name)+'</text><text x="500" y="293" text-anchor="middle">FOCUS SOCIETY</text></g></g></svg>';
 }
 function network(rows){
  if(state.focus)return focusedNetwork(rows);
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
   return '<path data-network-event="'+esc(e.key)+'" class="interaction-edge'+(e.key===state.event?' selected':'')+'" d="M'+p.x.toFixed(1)+' '+p.y.toFixed(1)+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+q.x.toFixed(1)+' '+q.y.toFixed(1)+'" stroke="'+palettes[e.type]+'" stroke-width="2.5" tabindex="0" role="button" aria-label="Read '+esc(e.title)+', '+esc(dates(e))+'"><title>'+esc(e.title+' — '+dates(e))+'</title></path>';
  }).join('');
  const nodes=leaders.map((id,i)=>{
   const c=societies.get(id),p=positions.get(id),selected=id===state.focus;
   return '<g class="interaction-node'+(selected?' selected':'')+'" data-network-civ="'+esc(id)+'" role="button" tabindex="0" aria-label="Focus on '+esc(c.name)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="24" fill="#0e2636" stroke="'+(selected?'#f9da9d':'#e2b975')+'" stroke-width="'+(selected?4:2)+'"/><circle cx="'+p.x+'" cy="'+p.y+'" r="15" fill="#d1a75d" fill-opacity=".18"/><text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" class="interaction-node-glyph">'+(c.kind==='empire'?'♜':'✦')+'</text><text x="'+p.x+'" y="'+(p.y+42)+'" text-anchor="middle" class="interaction-node-name">'+esc(c.name.length>26?c.name.slice(0,23)+'…':c.name)+'</text></g>';
  }).join('');
  return '<svg class="interaction-network-svg" viewBox="0 0 1000 560" role="group" aria-label="Explore society connections"><defs><radialGradient id="interactionSea"><stop stop-color="#23545a" stop-opacity=".26"/><stop offset="1" stop-color="#07202b" stop-opacity=".05"/></radialGradient></defs><circle cx="500" cy="270" r="240" fill="url(#interactionSea)"/><g class="interaction-net-lines">'+lines+'</g><g class="interaction-net-nodes">'+nodes+'</g><g class="interaction-net-centre"><circle cx="500" cy="270" r="53" fill="#112d3b" stroke="#d6ab6a" stroke-width="1.5" stroke-dasharray="3 7"/><text x="500" y="264" text-anchor="middle">RECORDED</text><text x="500" y="280" text-anchor="middle">ENCOUNTERS</text></g></svg>';
 }
 function storyCard(e){
  const actors=e.participants.map(id=>societies.get(id).name),url=sourceUrl(e),selected=e.key===state.event;
  const art=root.AtlasVisualAssets?.forSociety(e.participants[0]);
  const thumb=art?'<img class="atlas-object-image" src="'+esc(art.imageUrl)+'" alt="" loading="lazy" decoding="async"/>':'<span class="interaction-icon-art" aria-hidden="true">✧</span>';
  return '<article class="interaction-story'+(selected?' selected':'')+'"><div class="interaction-story-thumb">'+thumb+'</div><div class="interaction-story-copy"><div class="interaction-story-meta"><b>'+esc(dates(e))+'</b><em style="--kind-colour:'+palettes[e.type]+'">'+esc(e.type)+'</em></div><h3>'+esc(e.title)+'</h3><p>'+esc(actors.slice(0,4).join(' · '))+'</p><button type="button" data-interaction-event="'+esc(e.key)+'">Explore story →</button></div></article>';
 }
 function geographicPreview(e){
  const geo=root.WorldAtlasGeo;
  if(!geo)return '';
  const named=e.participants.map(id=>societies.get(id)).filter(Boolean);
  const mapped=named.filter(c=>geo.finite(c.lon,c.lat));
  const missing=named.filter(c=>!geo.finite(c.lon,c.lat));
  const dots=mapped.map(c=>{
   const [x,y]=geo.project(c.lon,c.lat);
   const colour=/^#[0-9a-f]{6}$/i.test(c.color||'')?c.color:'#d4b279';
   return '<g class="interaction-geo-dot" aria-hidden="true"><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="10" fill="'+colour+'" stroke="#f9e5c3" stroke-width="2"/><text x="'+(x+14).toFixed(1)+'" y="'+(y-13).toFixed(1)+'">'+esc(c.name.length>26?c.name.slice(0,23)+'…':c.name)+'</text></g>';
  }).join('');
  return '<section class="interaction-geographic-preview" aria-label="Reference locations of societies named in the record"><div class="interaction-geo-head"><strong>THE SOCIETIES ON THE WORLD MAP</strong><span>'+mapped.length+' of '+named.length+' mapped</span></div>'+
   '<svg viewBox="0 0 1200 590" role="img" aria-label="World map with '+mapped.length+' society locations"><image href="world-cinematic.svg" x="0" y="0" width="1200" height="590"/>'+dots+'</svg>'+

   '<a href="index.html?year='+encodeURIComponent(e.year)+'&civ='+encodeURIComponent(state.focus||e.participants[0])+'&interaction='+encodeURIComponent(e.key)+'">Open societies on the World Map ↗</a></section>';
 }
 function detail(e){
  const item=$('interactionDetail');
  if(!e){item.innerHTML='<div class="interaction-no-record"><strong>No matching documented multi-society records</strong><p>Try another date, type or search.</p></div>';return;}
  const names=e.participants.map(id=>societies.get(id)?.name).filter(Boolean),url=sourceUrl(e);
  item.innerHTML='<div class="interaction-detail-overline">SELECTED HISTORICAL RECORD</div>'+artwork(e)+'<div class="interaction-detail-date">'+esc(dates(e))+' · '+esc(e.type)+'</div><h2>'+esc(e.title)+'</h2><p>'+esc(e.detail||'No further summary is attached to this record.')+'</p>'+geographicPreview(e)+'<h3>Societies named in this record</h3><div class="interaction-actors">'+e.participants.map(id=>'<button type="button" data-interaction-civ="'+esc(id)+'">'+esc(societies.get(id).name)+' ↗</button>').join('')+'</div><div class="interaction-evidence"><strong>Evidence boundaries</strong><p>These societies are explicitly linked to the same research record. This does not on its own prove direct bilateral contact, a travelled route, or equal involvement.</p><span>Editorial confidence: '+esc(e.confidence||'not rated')+' · Not independently re-verified for this visual layer</span></div><div class="interaction-actions">'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Sources ↗</a>':'')+'<a href="compare.html?year='+encodeURIComponent(e.year)+'&mode=events&event='+encodeURIComponent(e.key)+'&civ='+encodeURIComponent(state.focus||e.participants[0])+'">See in Compare ↗</a><a href="index.html?year='+encodeURIComponent(e.year)+'&civ='+encodeURIComponent(state.focus||e.participants[0])+'&interaction='+encodeURIComponent(e.key)+'">Explore on World Map ↗</a><a href="story.html?year='+encodeURIComponent(e.year)+'&entity='+encodeURIComponent(state.focus||e.participants[0])+'">Follow society timeline ↗</a></div>';
  root.AtlasVisualAssets?.bindImages(item);
 }
 const availableSocieties=new Set(records.flatMap(e=>e.participants));
 if(state.focus&&!availableSocieties.has(state.focus))availableSocieties.add(state.focus);
 const select=$('interactionSociety');
 select.innerHTML='<option value="">All evidenced societies</option>'+[...availableSocieties].sort((a,b)=>societies.get(a).name.localeCompare(societies.get(b).name))
  .map(id=>'<option value="'+esc(id)+'">'+esc(societies.get(id).name)+(records.some(e=>e.participants.includes(id))?'':' (no shared record)')+'</option>').join('');
 function renderEvidenceNavigation(total,range){
  select.value=state.focus||'';
  const shelf=$('interactionFocusShelf');shelf.hidden=!state.focus;
  if(state.focus){
   const focusRows=contextualRecords(),partners=evidence.partners(focusRows,state.focus,societies);
   $('interactionFocusTitle').textContent=societies.get(state.focus).name+' in the historical record';
   $('interactionFocusSummary').textContent=focusRows.length+' connections in this period · '+partners.length+' other societies';
   $('interactionClearPartner').hidden=!state.partner;
   $('interactionPartners').innerHTML=partners.length?partners.slice(0,30).map(item=>{
    const chosen=state.partner===item.id;
    return '<button type="button" class="interaction-partner-chip'+(chosen?' selected':'')+'" data-interaction-partner="'+esc(item.id)+'" aria-pressed="'+chosen+'"><strong>'+esc(item.name)+'</strong><span>'+item.count+' shared '+(item.count===1?'record':'records')+'</span></button>';
   }).join(''):'<p class="interaction-partner-empty">No connections here. Try another period or category.</p>';
  }
  const bins=evidence.timeline(total,range.start,range.end,12),peak=Math.max(1,...bins.map(b=>b.count));
  $('interactionTimeSummary').textContent=total.length+' dated records in this selection';
  $('interactionTimeRibbon').innerHTML=bins.map((bin,i)=>{
   const centre=Math.round((bin.start+bin.end)/2),height=12+Math.round(48*bin.count/peak);
   const label=year(bin.start)+' to '+year(bin.end);
   const active=state.era==='window'&&state.year>=bin.start&&state.year<=bin.end;
   return '<button type="button" class="interaction-time-bin'+(active?' active':'')+'" data-interaction-year="'+centre+'"'+(bin.count?'':' disabled')+' aria-label="'+esc(label+': '+bin.count+' dated records')+'" aria-pressed="'+active+'" title="'+esc(label+': '+bin.count+' records')+'"><span class="interaction-time-count">'+(bin.count||'')+'</span><span class="interaction-time-bar" style="height:'+height+'px"></span><span class="interaction-time-year">'+esc(year(bin.start))+'</span></button>';
  }).join('');
 }
 let previouslyFocusedSociety=null;
 function render(){
  const r=timeWindow(),total=linkedRecords(),rows=total.slice(0,80);
  renderEvidenceNavigation(total,r);
  const chosen=total.find(e=>e.key===state.event)||total[0]||null;
  if(chosen)state.event=chosen.key;else state.event=null;
  $('interactionYear').value=state.year;
  $('interactionEra').value=state.era;
  $('interactionType').value=state.type;
  $('interactionSearch').value=state.search;
  $('interactionRangeLabel').textContent=r.label+' · '+rows.length+(total.length>rows.length?' of '+total.length:'')+' linked records';
  $('interactionCount').textContent=rows.length+' records'+(total.length>rows.length?' (first '+rows.length+' displayed)':'');
  const networkRows=state.focus?contextualRecords():rows;
  const networkScroller=$('interactionNetwork'),previousX=networkScroller.scrollLeft;
  networkScroller.innerHTML=networkRows.length?network(networkRows):'<p class="interaction-no-record">No connections match this selection.</p>';
  networkScroller.scrollLeft=state.focus&&previouslyFocusedSociety!==state.focus?
   Math.max(0,(networkScroller.scrollWidth-networkScroller.clientWidth)/2):previousX;
  previouslyFocusedSociety=state.focus;
  $('interactionStories').innerHTML=rows.length?rows.slice(0,24).map(storyCard).join(''):'<p class="interaction-no-record">No linked stories for this period and filter.</p>';
  $('interactionNetwork').hidden=state.mode!=='network';
  $('interactionStories').hidden=state.mode!=='stories';
  document.querySelectorAll('[data-interaction-mode]').forEach(b=>{const on=b.dataset.interactionMode===state.mode;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on)});
  const focus=$('interactionFocus');
  focus.textContent=state.focus?'Focusing: '+societies.get(state.focus).name+' ×':'Explore all societies';
  detail(chosen);
  const position=chosen?total.findIndex(e=>e.key===chosen.key):-1;
  $('interactionTrailPosition').textContent=chosen?'Record '+(position+1)+' of '+total.length+' · '+dates(chosen):'No records for this selection';
  $('interactionTrailTitle').textContent=chosen?chosen.title:'Expand the year or change the society to discover more';
  $('interactionPreviousRecord').disabled=position<=0;
  $('interactionNextRecord').disabled=position<0||position>=total.length-1;
  $('interactionPlayRecords').disabled=total.length<2;
  $('interactionPlayRecords').setAttribute('aria-pressed',String(playing));
  $('interactionPlayRecords').textContent=playing?'Ⅱ Pause':'▶ Play records';
  const query=new URLSearchParams();if(state.era==='window')query.set('year',String(state.year));else query.set('era',state.era);if(state.focus)query.set('civ',state.focus);if(state.partner)query.set('with',state.partner);if(state.event)query.set('event',state.event);if(state.mode==='stories')query.set('view','stories');
  history.replaceState(null,'',location.pathname+'?'+query.toString());
  root.AtlasCrossLinks?.refresh();
 }
 let playback=null,playing=false;
 const motionReduced=()=>!!root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 function stopPlayback(){
  if(playback!==null){root.clearInterval(playback);playback=null;}
  if(playing){playing=false;$('interactionPlayRecords').setAttribute('aria-pressed','false');$('interactionPlayRecords').textContent='▶ Play records';}
 }
 function moveRecord(direction){
  const rows=linkedRecords(),next=evidence.move(rows,state.event,direction);
  if(!next)return false;
  if(next.key===state.event)return false;
  state.event=next.key;
  render();
  return true;
 }
 function change(patch){
  if(playing&&(!Object.prototype.hasOwnProperty.call(patch,'event')||patch.event!==state.event))stopPlayback();
  Object.assign(state,patch);render();
 }
 $('interactionPreviousRecord').addEventListener('click',()=>{stopPlayback();moveRecord(-1);});
 $('interactionNextRecord').addEventListener('click',()=>{stopPlayback();moveRecord(1);});
 $('interactionPlayRecords').addEventListener('click',()=>{
  if(playing){stopPlayback();return;}
  if(motionReduced()){
   $('interactionTrailPosition').textContent='Automatic playback disabled by your reduced-motion preference. Use the arrow buttons to move between records.';
   return;
  }
  const rows=linkedRecords();
  if(rows.length<2)return;
  if(state.event===rows[rows.length-1].key){state.event=rows[0].key;render();}
  playing=true;render();
  playback=root.setInterval(()=>{
   if(document.hidden||!moveRecord(1)){stopPlayback();return;}
   if(state.event===linkedRecords().at(-1)?.key)stopPlayback();
  },2800);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
 root.addEventListener?.('pagehide',stopPlayback);
 $('interactionSociety').addEventListener('change',e=>change({focus:e.target.value,partner:'',event:null}));
 $('interactionType').addEventListener('change',e=>change({type:e.target.value,event:null}));
 $('interactionEra').addEventListener('change',e=>change({era:e.target.value,event:null}));
 $('interactionSearch').addEventListener('input',e=>change({search:e.target.value,event:null}));
 $('interactionYear').addEventListener('input',e=>change({year:Number(e.target.value),era:'window',event:null}));
 $('interactionFocus').addEventListener('click',()=>change({focus:'',partner:'',event:null}));
 $('interactionClearPartner').addEventListener('click',()=>change({partner:'',event:null}));
 $('interactionTimeRibbon').addEventListener('click',e=>{const b=e.target.closest('[data-interaction-year]');if(b&&!b.disabled)change({year:Number(b.dataset.interactionYear),era:'window',event:null});});
 document.querySelectorAll('[data-interaction-mode]').forEach(b=>b.addEventListener('click',()=>change({mode:b.dataset.interactionMode})));
 document.addEventListener('click',e=>{
  const p=e.target.closest('[data-interaction-partner],[data-network-partner]');
  if(p){const id=p.dataset.interactionPartner||p.dataset.networkPartner;if(state.focus&&societies.has(id))change({partner:state.partner===id?'':id,event:null});return;}
  const ev=e.target.closest('[data-interaction-event],[data-network-event]');
  if(ev){const key=ev.dataset.interactionEvent||ev.dataset.networkEvent;if(records.some(x=>x.key===key)){change({event:key});
   if(root.matchMedia?.('(max-width: 950px)')?.matches)$('interactionDetailPanel').scrollIntoView({behavior:motionReduced()?'auto':'smooth',block:'start'});
  }return;}
  const civ=e.target.closest('[data-interaction-civ],[data-network-civ]');
  if(civ){const id=civ.dataset.interactionCiv||civ.dataset.networkCiv;if(societies.has(id))change({focus:id,partner:'',event:null});}
 });
 $('interactionNetwork').addEventListener('keydown',e=>{
  if(!['Enter',' '].includes(e.key))return;
  const target=e.target.closest('[data-network-event],[data-network-civ],[data-network-partner]');
  if(target){e.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
 });
 render();
 root.AtlasInteractions=Object.freeze({state,render,linkedRecords,sourceUrl,records,partners:()=>state.focus?evidence.partners(contextualRecords(),state.focus,societies):[],moveRecord,stopPlayback});
})(window);