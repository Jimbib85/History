/* World History Atlas — first playable slice, no framework or server required. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const yearLabel = y => y <= 0 ? `${Math.abs(y - 1).toLocaleString('en-AU')} BCE` : `${y.toLocaleString('en-AU')} CE`;
  const compactYear = y => y <= 0 ? `${Math.abs(y - 1)} BCE` : `${y} CE`;
  const life = c => `${compactYear(c.start)} – ${compactYear(c.end)}`;
  const activeAt = (c,y) => c.start <= y && c.end >= y;
  const regionMatch = (c,r) => r === 'All regions' || (r === 'Africa' ? c.region.includes('Africa') : c.region === r);
  const escapeHtml = val => String(val).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const civById = Object.fromEntries(CIVILISATIONS.map(c => [c.id,c]));
  const params = new URLSearchParams(window.location.search);
  const initialId = civById[params.get('civ')] ? params.get('civ') : 'rome';
  const rawYear = Number(params.get('year'));
  const initialYear = params.has('year') && Number.isFinite(rawYear) ? Math.min(2026,Math.max(-9999,Math.round(rawYear))) : 200;
  const state = {year:initialYear,civ:initialId,view:['actual','historical','known'].includes(params.get('view'))?params.get('view'):'actual',region:'All regions',search:'',zoom:1,tx:0,ty:0};
  const snapshots = [];
  const eras = [
    {name:'Early human history',subtitle:'8000 BCE',year:-7999},
    {name:'First great cities',subtitle:'2600 BCE',year:-2599},
    {name:'Classical worlds',subtitle:'200 CE',year:200},
    {name:'Medieval worlds',subtitle:'1200 CE',year:1200},
    {name:'Age of global contact',subtitle:'1500 CE',year:1500},
    {name:'A changing world',subtitle:'1800 CE',year:1800},
    {name:'Modern history',subtitle:'1945 CE',year:1945}
  ];
  function saveSnapshot(){snapshots.push({...state});if(snapshots.length>45)snapshots.shift();}
  function go(next,{save=true,zoomReset=false}={}){
    if(save)saveSnapshot();
    Object.assign(state,next);
    if(zoomReset)Object.assign(state,{zoom:1,tx:0,ty:0});
    render();
  }
  const momentNearest = y => MOMENTS.reduce((a,m)=>Math.abs(m.year-y)<Math.abs(a.year-y)?m:a,MOMENTS[0]);
  const randomDifferent = (items,current,extract) => {
    const choices = items.filter(x => extract(x)!==current);
    return (choices.length?choices:items)[Math.floor(Math.random()*(choices.length?choices.length:items.length))];
  };
  function randomise(mode='all') {
    if(mode==='year'){
      const all=CIVILISATIONS.filter(c=>activeAt(c,state.year));
      if(all.length>1){go({civ:randomDifferent(all,state.civ,c=>c.id).id,view:'actual'}, {zoomReset:true});return;}
      randomise('all');return;
    }
    if(mode==='civilisation'){
      const civ=civById[state.civ];
      const moments=MOMENTS.filter(m=>activeAt(civ,m.year)&&Math.abs(m.year-state.year)>10);
      const opts=moments.length?moments.map(m=>m.year):[civ.start,civ.at,civ.end].filter(y=>Math.abs(y-state.year)>10);
      if(opts.length){const y=opts[Math.floor(Math.random()*opts.length)];go({year:y,view:'actual'}, {zoomReset:true});return;}
      randomise('all');return;
    }
    // Prefer dates with several contemporaries so the result is fun, not empty.
    const pairs=[];
    for(const m of MOMENTS){
      const matches=CIVILISATIONS.filter(c=>activeAt(c,m.year));
      for(const c of matches)if(matches.length>=2)pairs.push({civ:c.id,year:m.year});
    }
    const next=randomDifferent(pairs,`${state.civ}:${state.year}`,x=>`${x.civ}:${x.year}`);
    go({year:next.year,civ:next.civ,region:'All regions',search:'',view:Math.random()<.22 && civById[next.civ].mapId?'historical':'actual'}, {zoomReset:true});
  }
  function selectCiv(id){
    const c=civById[id];if(!c)return;
    go({civ:id,year:activeAt(c,state.year)?state.year:c.at,view:'actual'},{zoomReset:true});
  }
  function setYear(y){if(!Number.isFinite(y))return;go({year:Math.min(2026,Math.max(-9999,Math.round(y)))},{save:true});}
  function parseYear(value){
    const s=value.trim().replace(/,/g,'');
    const m=s.match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
    if(!m)return null;
    const n=Number(m[1]);const suffix=(m[2]||'').toUpperCase();
    if(suffix==='BC'||suffix==='BCE')return n>0?1-n:null;
    if(suffix==='CE'||suffix==='AD')return n>0?n:null;
    return n;
  }
  function renderEras(){
    $('eraButtons').innerHTML=eras.map(e=>`<button type="button" class="era-btn ${Math.abs(state.year-e.year)<90?'active':''}" data-era="${e.year}"><span>${escapeHtml(e.name)}</span><small>${escapeHtml(e.subtitle)}</small></button>`).join('');
    $('eraButtons').querySelectorAll('[data-era]').forEach(b=>b.addEventListener('click',()=>go({year:+b.dataset.era,search:''},{zoomReset:true})));
  }
  function renderList(){
    const q=state.search.toLowerCase().trim();
    const visible=CIVILISATIONS.filter(c=>regionMatch(c,state.region) && (!q||`${c.name} ${c.location} ${c.region} ${c.summary}`.toLowerCase().includes(q)))
      .sort((a,b)=>{
        const aOn=activeAt(a,state.year),bOn=activeAt(b,state.year);
        return Number(bOn)-Number(aOn)||a.start-b.start;
      });
    $('civilisationCount').textContent=`${visible.filter(c=>activeAt(c,state.year)).length} active`;
    $('civilisationList').innerHTML=visible.length?visible.map(c=>`<button type="button" class="civ-entry ${state.civ===c.id?'active':''}" data-civ="${c.id}" title="${escapeHtml(c.name)} (${life(c)})"><span class="civ-dot" style="--dot:${c.color}"></span><span class="civ-text"><strong>${escapeHtml(c.name)}</strong><small>${activeAt(c,state.year)?'Contemporary':'Jump to '+compactYear(c.at)} · ${escapeHtml(c.region)}</small></span><span class="civ-arrow">›</span></button>`).join(''):'<p class="civ-empty">Nothing found here. Try a different region or search.</p>';
    $('civilisationList').querySelectorAll('[data-civ]').forEach(b=>b.addEventListener('click',()=>selectCiv(b.dataset.civ)));
  }
  function project(lon,lat){return [((lon+180)/360*1200),((88-lat)/176*590)];}
  function getMapMarkers(){
    let visible=CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region));
    const c=civById[state.civ];
    if(state.view==='known'){
      const contact=(c.known||[]).map(id=>PLACES[id]).filter(Boolean);
      const points=contact.map(p=>{
        const [x,y]=project(p.lon,p.lat);
        return `<g class="map-marker knowledge-marker" aria-label="${escapeHtml(p.name)}: example location in a broader network"><circle cx="${x}" cy="${y}" r="7" fill="#e5a25c" stroke="#fdf6db" stroke-width="2"/><text x="${x+11}" y="${y-10}">${escapeHtml(p.name)}</text></g>`;
      });
      visible=[c];
      return visible.map(v=>marker(v,true)).join('')+points.join('');
    }
    if(!visible.some(c=>c.id===state.civ) && activeAt(c,state.year))visible.unshift(c);
    return visible.map(v=>marker(v,v.id===state.civ)).join('');
  }
  function marker(c,selected){
    const [x,y]=project(c.lon,c.lat);
    return `<g class="map-marker ${selected?'selected':'not-selected'}" data-mapciv="${c.id}" tabindex="0" role="button" aria-label="Explore ${escapeHtml(c.name)}" style="--fill:${c.color}"><title>${escapeHtml(c.name)} · ${escapeHtml(c.location)}</title>${selected?`<circle class="ring" cx="${x}" cy="${y}" r="17"/>`:''}<circle class="core" cx="${x}" cy="${y}" r="${selected?9:6.5}"/>${selected?`<text x="${x+13}" y="${y-11}">${escapeHtml(c.name)}</text>`:''}</g>`;
  }
  function updateTransform(){
    $('mapTransform').setAttribute('transform',`translate(${state.tx.toFixed(2)} ${state.ty.toFixed(2)}) scale(${state.zoom.toFixed(3)})`);
  }
  function zoomBy(factor){
    const old=state.zoom;const next=Math.min(4,Math.max(1,old*factor));
    const f=next/old;
    state.tx=600-(600-state.tx)*f;state.ty=295-(295-state.ty)*f;state.zoom=next;
    updateTransform();
  }
  function renderMap(){
    const civ=civById[state.civ];const historical=state.view==='historical';
    $('worldMap').classList.toggle('hidden',historical);
    $('historicalMap').classList.toggle('hidden',!historical);
    $('mapMarkers').innerHTML=getMapMarkers();
    updateTransform();
    $('mapYear').textContent=compactYear(state.year);
    $('mapStatus').textContent=state.view==='known'?'◉ Illustrative contact points · not a complete known world':historical?'◉ Historical cartography · read dating carefully':`◉ ${CIVILISATIONS.filter(c=>activeAt(c,state.year)).length} societies in this starter collection`;
    $('mapHelp').textContent=state.view==='actual'?'Select a marker to read its story ↗':state.view==='known'?'Example places and networks, not knowledge boundaries':'Maps are historical artefacts, not satellite views';
    $('mapLegend').style.display=historical?'none':'';
    $('zoomIn').disabled=historical;$('zoomOut').disabled=historical;$('resetMap').disabled=historical;
    document.querySelectorAll('[data-view]').forEach(b=>{const yes=b.dataset.view===state.view;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));});
    if(historical){
      const m=MAPS[civ.mapId];
      $('historicalMap').innerHTML=m?`<img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.title)}" referrerpolicy="no-referrer"><div class="historic-overlay">${escapeHtml(m.title)} · ${escapeHtml(m.type)} · <a href="${escapeHtml(m.page)}" target="_blank" rel="noopener noreferrer">Source ↗</a></div>`:`<div class="map-note"><div class="section-kicker">NO RELIABLE PERIOD MAP CURATED YET</div><h3>Not every world has a surviving map.</h3><p>We haven't added a suitable historical map for <strong>${escapeHtml(civ.name)}</strong> yet. That does not mean its people lacked sophisticated geographical knowledge.</p><a href="${escapeHtml(civ.source)}" target="_blank" rel="noopener noreferrer">Explore background reading ↗</a></div>`;
      const img=$('historicalMap').querySelector('img');
      if(img){img.addEventListener('error',()=>{$('historicalMap').innerHTML=`<div class="map-note"><h3>The archived map could not load.</h3><p>It is hosted by Wikimedia Commons and needs an internet connection. The rest of the atlas works offline.</p><a href="${escapeHtml(m.page)}" target="_blank" rel="noopener noreferrer">Open the source map ↗</a></div>`;});}
    }
  }
  function parallelRows(){
    let active=CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region));
    if(active.length>11){
      // Keep the selected society and show a geographically varied cross section.
      const picked=[];
      const selected=active.find(c=>c.id===state.civ);if(selected)picked.push(selected);
      const uniqueRegions=[...new Set(active.map(c=>c.region))];
      for(const region of uniqueRegions){const c=active.find(c=>c.region===region&&!picked.some(x=>x.id===c.id));if(c)picked.push(c);}
      for(const c of active)if(picked.length<11&&!picked.some(x=>x.id===c.id))picked.push(c);
      active=picked.slice(0,11);
    }
    const half=state.year>1600?190:state.year>0?460:800;
    const start=state.year-half;const end=state.year+half;
    $('timelineFrom').textContent=compactYear(start);
    $('timelineTo').textContent=compactYear(end);
    $('parallelCount').textContent=CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region)).length;
    if(!active.length){$('timelineRows').innerHTML='<div class="no-parallels"><strong>A quieter page of this atlas.</strong>No societies in this small collection match the date and region. Try Surprise me, or jump to another era.</div>';return;}
    active.sort((a,b)=>a.id===state.civ?-1:b.id===state.civ?1:a.region.localeCompare(b.region)||a.start-b.start);
    $('timelineRows').innerHTML=active.map(c=>{
      const l=Math.max(0,(Math.max(start,c.start)-start)/(end-start)*100);const r=Math.min(100,(Math.min(end,c.end)-start)/(end-start)*100);
      const width=Math.max(0,r-l);
      return `<button class="timeline-row ${c.id===state.civ?'selected':''}" type="button" data-timeline="${c.id}" title="${escapeHtml(c.name)} · ${life(c)}"><span class="timeline-name">${escapeHtml(c.name)}</span><span class="timeline-track"><span class="timeline-band" style="left:${l.toFixed(2)}%;width:${width.toFixed(2)}%;--band:${c.color}"></span><span class="timeline-now"></span></span></button>`;
    }).join('');
    $('timelineRows').querySelectorAll('[data-timeline]').forEach(b=>b.addEventListener('click',()=>selectCiv(b.dataset.timeline)));
  }
  function renderStory(){
    const c=civById[state.civ];const nearby=EVENTS.filter(e=>e.civ===c.id).sort((a,b)=>Math.abs(a.year-state.year)-Math.abs(b.year-state.year))[0];
    const active=activeAt(c,state.year);
    const isHistorical=state.view==='historical';const m=MAPS[c.mapId];
    const mapNote=isHistorical?(m?`<p class="story-value"><strong>${escapeHtml(m.title)}</strong> (${escapeHtml(m.date)}). ${escapeHtml(m.description)}</p><a class="story-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(m.page)}">View original Wikimedia record ↗</a>`:'<p class="story-value">No appropriate period map in our collection yet. This is an evidence gap, not proof that its people did not make maps.</p>'):state.view==='known'?`<p class="story-value">${escapeHtml(c.knownText||'Historical geographical understanding is not the same as a modern political boundary. Specific surviving maps or geographical accounts have not been curated for this society yet.')}</p>`:'<p class="story-value">The highlighted marker shows an illustrative historical centre, not the borders of the civilisation. Select the map tabs to explore geographical perspectives.</p>';
    $('storyPanel').innerHTML=`
      <div class="story-overline">${active?'CURRENTLY EXPLORING':'SELECTED CIVILISATION'}</div>
      <h2 class="story-title">${escapeHtml(c.name)}</h2>
      <div class="story-years">${life(c)} ${!active?` · not active in ${compactYear(state.year)}`:''}</div>
      <p class="story-description">${escapeHtml(c.summary)}</p>
      <div class="story-section"><div class="story-label">⌖ GEOGRAPHICAL FOCUS</div><div class="story-value">${escapeHtml(c.location)}<br><span style="color:#a2a09a">${escapeHtml(c.region)}</span></div></div>
      <div class="story-section"><div class="story-label">▤ ${isHistorical?'HISTORICAL MAP':state.view==='known'?'THEIR GEOGRAPHICAL WORLD':'MAP INTERPRETATION'}</div>${mapNote}</div>
      ${nearby?`<div class="story-section"><div class="story-label">✦ HISTORICAL MOMENT</div><div class="story-event"><div class="event-year">${compactYear(nearby.year)} · ${escapeHtml(nearby.kind)}</div><strong>${escapeHtml(nearby.title)}</strong><p>${escapeHtml(nearby.detail)}</p><button type="button" class="moment-chip" data-story-year="${nearby.year}">Explore this year →</button></div></div>`:''}
      <div class="story-section"><div class="story-label">↗ FURTHER READING</div><a class="story-link" href="${escapeHtml(c.source)}" target="_blank" rel="noopener noreferrer">Read historical background and sources ↗</a></div>
      <div class="story-callout"><strong>✧ Meanwhile, elsewhere...</strong><p>${escapeHtml(contemporaryNote(c))}</p><button type="button" id="sameYearButton" class="moment-chip" style="margin-top:12px">Random contemporary society ↗</button></div>`;
    const storyYear=$('storyPanel').querySelector('[data-story-year]');if(storyYear)storyYear.addEventListener('click',()=>setYear(+storyYear.dataset.storyYear));
    $('sameYearButton').addEventListener('click',()=>randomise('year'));
  }
  function contemporaryNote(c){
    const others=CIVILISATIONS.filter(x=>x.id!==c.id&&activeAt(x,state.year));
    const regions=[...new Set(others.map(x=>x.region))];
    const picks=[];for(const r of regions){const x=others.find(e=>e.region===r);if(x)picks.push(x.name);if(picks.length>=3)break;}
    return picks.length?`In ${compactYear(state.year)}, ${picks.join(', ')} ${picks.length===1?'was':'were'} also part of the human story. Being contemporary does not by itself indicate contact.`:'There are no additional contemporary societies in this starter dataset for this year. That is a gap in the atlas, not in human history.';
  }
  function renderMoments(){
    $('moments').innerHTML=MOMENTS.map(m=>`<button type="button" data-moment="${m.year}" class="moment-chip ${Math.abs(state.year-m.year)<10?'active':''}" title="${escapeHtml(m.title)}">${compactYear(m.year)}</button>`).join('');
    $('moments').querySelectorAll('[data-moment]').forEach(b=>b.addEventListener('click',()=>setYear(+b.dataset.moment)));
  }
  function renderTitle(){
    const year=compactYear(state.year);const moment=momentNearest(state.year);
    $('sceneTitle').innerHTML=`The world, <em>${escapeHtml(year)}</em>`;
    $('sceneSubtitle').textContent=Math.abs(state.year-moment.year)<110?moment.description:'Explore what different societies were doing at the same point in time.';
    $('yearInput').value=year;
    $('yearSlider').value=state.year;
    $('backButton').disabled=snapshots.length===0;
    const url=new URL(location.href);url.searchParams.set('year',state.year);url.searchParams.set('civ',state.civ);url.searchParams.set('view',state.view);
    try {window.history.replaceState(null,'',url);}catch(_e){}
  }
  function render(){
    renderTitle();renderEras();renderList();renderMap();parallelRows();renderStory();renderMoments();
    $('searchInput').value=state.search;
    $('regionSelect').value=state.region;
  }
  function wire(){
    $('regionSelect').innerHTML=REGIONS.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    $('searchInput').addEventListener('input',e=>{state.search=e.target.value;renderList();});
    $('regionSelect').addEventListener('change',e=>go({region:e.target.value}));
    $('randomButton').addEventListener('click',()=>randomise('all'));
    $('moreRandom').addEventListener('click',()=>$('randomMenu').classList.toggle('hidden'));
    $('randomMenu').querySelectorAll('[data-random]').forEach(b=>b.addEventListener('click',()=>{$('randomMenu').classList.add('hidden');randomise(b.dataset.random);}));
    $('backButton').addEventListener('click',()=>{const p=snapshots.pop();if(p){Object.assign(state,p);render();}});
    $('helpButton').addEventListener('click',()=>$('aboutDialog').showModal());
    $('closeDialog').addEventListener('click',()=>$('aboutDialog').close());
    $('closeDialogAction').addEventListener('click',()=>$('aboutDialog').close());
    $('yearSlider').addEventListener('input',e=>{const y=Number(e.target.value);state.year=y;render();});
    $('yearInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const y=parseYear(e.target.value);if(y!==null){setYear(y);e.target.blur();}else{e.target.setCustomValidity('Enter a year, for example 500 BCE or 200 CE');e.target.reportValidity();}}});
    $('yearInput').addEventListener('input',e=>e.target.setCustomValidity(''));
    $('yearInput').addEventListener('blur',()=>{$('yearInput').value=compactYear(state.year);});
    $('minusCentury').addEventListener('click',()=>setYear(state.year-100));
    $('plusCentury').addEventListener('click',()=>setYear(state.year+100));
    $('prevMoment').addEventListener('click',()=>{const earlier=MOMENTS.filter(m=>m.year<state.year);setYear((earlier[earlier.length-1]||MOMENTS[0]).year);});
    $('nextMoment').addEventListener('click',()=>{const later=MOMENTS.find(m=>m.year>state.year);setYear((later||MOMENTS[MOMENTS.length-1]).year);});
    document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>go({view:b.dataset.view})));
    $('mapMarkers').addEventListener('click',e=>{const g=e.target.closest('[data-mapciv]');if(g)selectCiv(g.dataset.mapciv);});
    $('mapMarkers').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const g=e.target.closest('[data-mapciv]');if(g){e.preventDefault();selectCiv(g.dataset.mapciv);}}});
    $('zoomIn').addEventListener('click',()=>zoomBy(1.3));
    $('zoomOut').addEventListener('click',()=>zoomBy(1/1.3));
    $('resetMap').addEventListener('click',()=>{Object.assign(state,{zoom:1,tx:0,ty:0});updateTransform();});
    $('mapStage').addEventListener('wheel',e=>{if(state.view==='historical')return;e.preventDefault();zoomBy(e.deltaY<0?1.15:1/1.15);},{passive:false});
    const svg=$('worldMap');let drag=null;
    svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-mapciv]'))return;drag={x:e.clientX,y:e.clientY,tx:state.tx,ty:state.ty};svg.setPointerCapture(e.pointerId);$('mapStage').classList.add('dragging');});
    svg.addEventListener('pointermove',e=>{if(!drag)return;const box=svg.getBoundingClientRect();state.tx=drag.tx+(e.clientX-drag.x)*1200/box.width;state.ty=drag.ty+(e.clientY-drag.y)*590/box.height;updateTransform();});
    const endDrag=()=>{drag=null;$('mapStage').classList.remove('dragging');};
    svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
    document.addEventListener('keydown',e=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)){e.preventDefault();$('searchInput').focus();}if(e.key==='Escape')$('randomMenu').classList.add('hidden');});
    document.addEventListener('click',e=>{if(!e.target.closest('#moreRandom')&&!e.target.closest('#randomMenu'))$('randomMenu').classList.add('hidden');});
  }
  wire();render();
  window.WorldHistoryAtlas={state,civilisations:CIVILISATIONS,moments:MOMENTS,selectCiv,setYear,randomise};
})();