/* World History Atlas — first playable slice, no framework or server required. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const yearLabel = y => y <= 0 ? `${Math.abs(y - 1).toLocaleString('en-AU')} BCE` : `${y.toLocaleString('en-AU')} CE`;
  const compactYear = y => y <= 0 ? `${Math.abs(y - 1)} BCE` : `${y} CE`;
  const life = c => window.AtlasDateScope?.label(c) ?? `${compactYear(c.start)} – ${compactYear(c.end)}`;
  const activeAt = (c,y) => c.kind !== 'overview' && c.start <= y && c.end >= y;
  const isCharted = c => c.kind !== 'overview';
  const groupLabel = c => c.kind === 'empire' ? 'Empire / imperial state' : c.kind === 'overview' ? 'Cultural overview' : 'Society / non-imperial polity';
  const regionMatch = (c,r) => r === 'All regions' || (r === 'Africa' ? c.region.includes('Africa') : c.region === r);
  const escapeHtml = val => String(val).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const civById = Object.fromEntries(CIVILISATIONS.map(c => [c.id,c]));
  const geo = window.WorldAtlasGeo;
  let markerGroups = [];
  const params = new URLSearchParams(window.location.search);
  const initialId = civById[params.get('civ')] ? params.get('civ') : 'rome';
  const rawYear = Number(params.get('year'));
  const initialYear = params.has('year') && Number.isFinite(rawYear) ? Math.min(2026,Math.max(-9999,Math.round(rawYear))) : 200;
  const state = {year:initialYear,civ:initialId,view:['actual','historical','known'].includes(params.get('view'))?params.get('view'):'actual',region:'All regions',search:'',zoom:1,tx:0,ty:0,catalogue:'all',geoMode:params.get('geo')==='points'?'points':'groups',geoGrid:params.get('grid')==='1'};
  // Reading and disclosure choices are separate from historical navigation.
  const reading = {civ:null, search:'', topics:new Set(), records:{}, limits:{}};
  const catalogueUI = {key:'', current:8, other:8, otherOpen:false};
  const parallelUI = {key:'', limits:{society:8,empire:8}, open:{society:false,empire:false}};
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
  function syncSelection(next) {
    // A changed year or region must not leave an unrelated historical map selected.
    if (Object.hasOwn(next, 'civ') ||
        !(['year','region','catalogue'].some(key => Object.hasOwn(next,key)))) return;
    const changedYear = Object.hasOwn(next,'year') && next.year !== state.year;
    const changedFilter = Object.hasOwn(next,'region') || Object.hasOwn(next,'catalogue');
    if (!changedYear && !changedFilter) return;
    const year = next.year ?? state.year;
    const region = next.region ?? state.region;
    const catalogue = next.catalogue ?? state.catalogue;
    const selected = civById[state.civ];
    const fits = selected && isCharted(selected) && activeAt(selected,year) && regionMatch(selected,region) &&
      (catalogue === 'all' || selected.kind === catalogue);
    if (fits) return;
    const options = CIVILISATIONS.filter(c => isCharted(c) && activeAt(c,year) && regionMatch(c,region) && (catalogue === 'all' || c.kind === catalogue));
    const preferred = options.find(c=>selected && c.region===selected.region) || options[0];
    if(preferred)next.civ = preferred.id;
    if (state.view === 'historical' || state.view === 'known') next.view = 'actual';
  }
  function go(next,{save=true,zoomReset=false}={}){
    syncSelection(next);
    const changed = Object.entries(next).some(([k,v]) => state[k] !== v);
    if(!changed) return;
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
      if(all.length>1){go({civ:randomDifferent(all,state.civ,c=>c.id).id,region:'All regions',catalogue:'all',search:'',view:'actual'}, {zoomReset:true});return;}
      randomise('all');return;
    }
    if(mode==='civilisation'){
      const civ=civById[state.civ];
      if(civ.kind==='overview'){randomise('all');return;}
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
    go({year:next.year,civ:next.civ,region:'All regions',catalogue:'all',search:'',view:Math.random()<.22 && civById[next.civ].mapId?'historical':'actual'}, {zoomReset:true});
  }
  function selectCiv(id){
    const c=civById[id];if(!c)return;
    const hidden=(state.region!=='All regions'&&!regionMatch(c,state.region)) || (state.catalogue!=='all'&&c.kind!==state.catalogue) || (state.search&&!`${c.name} ${c.location} ${c.region} ${c.summary}`.toLowerCase().includes(state.search.toLowerCase()));
    go({civ:id,year:c.kind==='overview'||activeAt(c,state.year)?state.year:c.at,view:'actual',...(hidden?{region:'All regions',catalogue:'all',search:''}:{})},{zoomReset:true});
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
    const key=[state.year,state.region,state.catalogue,q].join('|');
    if(catalogueUI.key!==key)Object.assign(catalogueUI,{key,current:8,other:8,otherOpen:!!q});
    const visible=CIVILISATIONS.filter(c=>isCharted(c) && (state.catalogue==='all'||c.kind===state.catalogue) &&
      regionMatch(c,state.region) && (!q||[c.name,c.location,c.region,c.summary].join(' ').toLowerCase().includes(q)))
      .sort((a,b)=>a.start-b.start||a.name.localeCompare(b.name));
    const current=visible.filter(c=>activeAt(c,state.year));
    const other=visible.filter(c=>!activeAt(c,state.year));
    // A visible selection takes one place in the compact batch, never an entire extra page.
    for(const rows of [current,other])rows.sort((a,b)=>Number(b.id===state.civ)-Number(a.id===state.civ));
    if(other.some(c=>c.id===state.civ))catalogueUI.otherOpen=true;
    $('civilisationCount').textContent=current.length+' at this date';
    $('filterSummary').textContent=(state.catalogue==='all'?'Societies & empires':state.catalogue==='society'?'Societies':'Empires')+' · '+state.region;
    const entry=c=>'<button type="button" class="civ-entry '+(state.civ===c.id?'active':'')+'" data-civ="'+c.id+'" '+(state.civ===c.id?'aria-current="true"':'')+' title="'+escapeHtml(c.name+' · '+life(c))+'"><span class="civ-dot" style="--dot:'+c.color+'"></span><span class="civ-text"><strong>'+escapeHtml(c.name)+'</strong><small>'+escapeHtml(c.region)+' · '+(c.kind==='empire'?'Empire':'Society')+'</small><small>'+escapeHtml(life(c))+'</small></span><span class="civ-arrow" aria-hidden="true">›</span></button>';
    const more=(group,rows)=>rows.length>catalogueUI[group]?'<button type="button" class="catalogue-more" data-catalogue-more="'+group+'">Show '+Math.min(8,rows.length-catalogueUI[group])+' more <span>'+catalogueUI[group]+' of '+rows.length+'</span></button>':'';
    const hiddenSelected=!visible.some(c=>c.id===state.civ)&&civById[state.civ].kind!=='overview'?'<div class="catalogue-selected"><span>Selected · outside these filters</span>'+entry(civById[state.civ])+'</div>':'';
    $('civilisationList').innerHTML=hiddenSelected+'<section class="catalogue-current"><h3>At this date <span>'+current.length+'</span></h3>'+(current.length?current.slice(0,catalogueUI.current).map(entry).join(''):'<p class="civ-empty">No matching entries at '+compactYear(state.year)+'. Try another date or the other periods below.</p>')+more('current',current)+'</section><details class="catalogue-other"'+(catalogueUI.otherOpen?' open':'')+'><summary>Other periods <span>'+other.length+'</span></summary>'+other.slice(0,catalogueUI.other).map(entry).join('')+more('other',other)+'</details>';
    $('civilisationList').querySelectorAll('[data-civ]').forEach(b=>b.addEventListener('click',()=>selectCiv(b.dataset.civ)));
    $('civilisationList').querySelectorAll('[data-catalogue-more]').forEach(b=>b.addEventListener('click',()=>{const group=b.dataset.catalogueMore;const previous=catalogueUI[group];catalogueUI[group]+=8;renderList();const rows=$('civilisationList').querySelectorAll(group==='current'?'.catalogue-current [data-civ]':'.catalogue-other [data-civ]');rows[previous]?.focus();}));
    const otherDetails=$('civilisationList').querySelector('.catalogue-other');
    otherDetails?.addEventListener('toggle',()=>{catalogueUI.otherOpen=otherDetails.open;});
    document.querySelectorAll('[data-catalogue]').forEach(b=>{const selected=b.dataset.catalogue===state.catalogue;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    const overviews=CIVILISATIONS.filter(c=>c.kind==='overview'&&(!q||[c.name,c.summary,c.region].join(' ').toLowerCase().includes(q)));
    $('culturalOverviewList').innerHTML=overviews.length?overviews.map(c=>'<button type="button" data-overview="'+c.id+'" class="overview-entry '+(state.civ===c.id?'active':'')+'">'+escapeHtml(c.name)+' ↗</button>').join(''):'<p class="civ-empty">No cultural background matches this search.</p>';
    const disclosure=$('culturalOverviewList').closest?.('details');
    if(disclosure&&(q||civById[state.civ].kind==='overview'))disclosure.open=true;
    $('culturalOverviewList').querySelectorAll('[data-overview]').forEach(b=>b.addEventListener('click',()=>go({civ:b.dataset.overview,view:'actual'})));
  }
  function project(lon,lat){return geo.project(lon,lat);}
  function getMapMarkers(){
    markerGroups=[];
    let visible=CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region)&&(state.catalogue==='all'||c.kind===state.catalogue));
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
    if(!visible.some(c=>c.id===state.civ) && (activeAt(c,state.year) || c.kind==='overview'))visible.unshift(c);
    if(state.geoMode==='points')return visible.map(v=>marker(v,v.id===state.civ)).join('');
    const groups=geo.cluster(visible,{zoom:state.zoom,selectedId:state.civ,radius:42});
    markerGroups=groups.filter(g=>g.count>1);
    return groups.map(g=>g.count>1?clusterMarker(g):marker(g.items[0],g.selected)).join('');
  }
  function clusterMarker(group){
    const label=group.count+' nearby reference points; zoom to inspect. Not a territory.';
    return '<g class="map-marker cluster-marker" data-mapcluster="'+escapeHtml(group.id)+'" tabindex="0" role="button" aria-label="'+escapeHtml(label)+'"><title>'+escapeHtml(label)+'</title><circle class="cluster-halo" cx="'+group.x+'" cy="'+group.y+'" r="18"/><circle class="cluster-core" cx="'+group.x+'" cy="'+group.y+'" r="14"/><text class="cluster-count" x="'+group.x+'" y="'+(group.y+4)+'" text-anchor="middle">'+group.count+'</text></g>';
  }
  function marker(c,selected){
    if(!geo.finite(c.lon,c.lat))return '';
    const [x,y]=project(c.lon,c.lat);
    return `<g class="map-marker ${selected?'selected':'not-selected'}" data-mapciv="${escapeHtml(c.id)}" tabindex="0" role="button" aria-label="Explore ${escapeHtml(c.name)}" style="--fill:${c.color}"><title>${escapeHtml(c.name)} · ${escapeHtml(c.location)}</title>${selected?`<circle class="ring" cx="${x}" cy="${y}" r="17"/>`:''}<circle class="core" cx="${x}" cy="${y}" r="${selected?9:6.5}"/>${selected?`<text x="${x+13}" y="${y-11}">${escapeHtml(c.name)}</text>`:''}</g>`;
  }
  function updateTransform(){
    $('mapTransform').setAttribute('transform',`translate(${state.tx.toFixed(2)} ${state.ty.toFixed(2)}) scale(${state.zoom.toFixed(3)})`);
  }
  function zoomBy(factor){
    const old=state.zoom;const next=Math.min(4,Math.max(1,old*factor));
    const f=next/old;
    state.tx=600-(600-state.tx)*f;state.ty=295-(295-state.ty)*f;state.zoom=next;
    updateTransform();
    if(state.view==='actual'){$('mapMarkers').innerHTML=getMapMarkers();updateGeoCount();}
  }
  function zoomToCluster(id){
    const group=markerGroups.find(g=>g.id===id);
    if(!group)return;
    if(state.zoom>=3.95){state.geoMode='points';renderMap();renderTitle();return;}
    state.zoom=Math.min(4,state.zoom*1.8);
    state.tx=600-group.x*state.zoom;
    state.ty=295-group.y*state.zoom;
    renderMap();
  }
  function updateGeoCount(){
    const n=markerGroups.reduce((sum,g)=>sum+g.count,0);
    $('mapClusterCount').textContent=state.view==='actual'
      ?(state.geoMode==='groups'&&n ? n+' reference points grouped into '+markerGroups.length+' clusters' : 'Showing individual reference points')
      :state.view==='known'?'Illustrative contact locations':'Historical map image';
  }
  function renderMap(){
    const civ=civById[state.civ];const historical=state.view==='historical';
    $('worldMap').classList.toggle('hidden',historical);
    $('historicalMap').classList.toggle('hidden',!historical);
    $('mapMarkers').innerHTML=getMapMarkers();
    $('mapGrid').innerHTML=historical||!state.geoGrid?'':geo.grid();
    $('geoControls').hidden=historical;
    $('groupGeo').setAttribute('aria-pressed',String(state.geoMode==='groups'));
    $('groupGeo').textContent=state.geoMode==='groups'?'● Group nearby':'○ Show nearby groups';
    $('toggleGrid').setAttribute('aria-pressed',String(state.geoGrid));
    updateGeoCount();
    updateTransform();
    $('mapYear').textContent=compactYear(state.year);
    $('mapStatus').textContent=state.view==='known'?'◉ Illustrative contact points · not a complete known world':historical?'◉ Historical cartography · read dating carefully':`◉ ${CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region)&&(state.catalogue==='all'||c.kind===state.catalogue)).length} charted entries in this selection`;
    const selectedMap=MAPS[civ.mapId];
    const worldviewParams=new URLSearchParams({year:String(state.year),civ:state.civ});
    $('worldviewLink').href='worldview.html?'+worldviewParams.toString();
    const entityURL=safeURL(civ.source);
    const evidenceSummary='<strong>'+escapeHtml(civ.name)+'</strong> · '+escapeHtml(civ.location||'Location not specified')+
      ' · '+escapeHtml(life(civ))+(Number.isFinite(civ.lon)&&Number.isFinite(civ.lat)?'. This point is an illustrative location, not a measured historical boundary or a documented territorial centre.':'. No verified map point is available for this research entry; its region is descriptive, not a plotted historical border.')+
      (entityURL?' <a href="'+escapeHtml(entityURL)+'" target="_blank" rel="noopener noreferrer">Background ↗</a>':'')+
      '<span class="geographic-caveat"> Background reading does not independently establish the precise marker coordinates.</span>';
    $('mapEvidence').innerHTML=historical&&selectedMap?'<strong>'+escapeHtml(selectedMap.title)+'</strong> · '+escapeHtml(selectedMap.date)+' · '+escapeHtml(selectedMap.type)+' · <a href="'+escapeHtml(selectedMap.page)+'" target="_blank" rel="noopener noreferrer">Source ↗</a>':state.view==='known'?'Illustrative contact points, not a complete known world. '+evidenceSummary:evidenceSummary;
    $('mapAboutText').textContent=historical?(selectedMap?selectedMap.description:'No appropriate period map is curated for this selection yet. Missing evidence does not mean people lacked geographical knowledge.'):state.view==='known'?(civ.knownText||'The examples show documented places or networks where available. They do not represent the knowledge of every inhabitant.'):'Markers identify representative locations where documented. They do not depict territorial extent or historical borders. Select a marker to explore its records.';
    $('mapHelp').textContent=state.view==='actual'?'Select a marker to read its story ↗':state.view==='known'?'Example places and networks, not knowledge boundaries':'Maps are historical artefacts, not satellite views';
    $('mapLegend').style.display=historical?'none':'';
    $('zoomIn').disabled=historical;$('zoomOut').disabled=historical;$('resetMap').disabled=historical;
    document.querySelectorAll('[data-view]').forEach(b=>{const yes=b.dataset.view===state.view;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));});
    if(historical){
      const m=MAPS[civ.mapId];
      $('historicalMap').innerHTML=m?`<img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.title)}" referrerpolicy="no-referrer"><div class="historic-overlay">${escapeHtml(m.title)} · ${escapeHtml(m.date)} · ${escapeHtml(m.type)} · <a href="${escapeHtml(m.page)}" target="_blank" rel="noopener noreferrer">Source ↗</a></div>`:`<div class="map-note"><div class="section-kicker">NO RELIABLE PERIOD MAP CURATED YET</div><h3>Not every world has a surviving map.</h3><p>We haven't added a suitable historical map for <strong>${escapeHtml(civ.name)}</strong> yet. That does not mean its people lacked sophisticated geographical knowledge.</p><a href="${escapeHtml(civ.source)}" target="_blank" rel="noopener noreferrer">Explore background reading ↗</a></div>`;
      const img=$('historicalMap').querySelector('img');
      if(img){img.addEventListener('error',()=>{$('historicalMap').innerHTML=`<div class="map-note"><h3>The archived map could not load.</h3><p>It is hosted by Wikimedia Commons and needs an internet connection. The rest of the atlas works offline.</p><a href="${escapeHtml(m.page)}" target="_blank" rel="noopener noreferrer">Open the source map ↗</a></div>`;});}
    }
  }
  function parallelRows(){
    const active=CIVILISATIONS.filter(c=>activeAt(c,state.year)&&regionMatch(c,state.region));
    const half=state.year>1600?190:state.year>0?460:800;
    const start=state.year-half,end=state.year+half;
    const key=[state.year,state.region].join('|');
    if(parallelUI.key!==key){parallelUI.key=key;parallelUI.limits={society:8,empire:8};}
    $('timelineFrom').textContent=compactYear(start);
    $('timelineTo').textContent=compactYear(end);
    $('parallelCount').textContent=active.length;
    function section(kind,label){
      const all=active.filter(c=>c.kind===kind).sort((a,b)=>Number(b.id===state.civ)-Number(a.id===state.civ)||a.region.localeCompare(b.region)||a.start-b.start);
      const at=all.findIndex(c=>c.id===state.civ);
      const chosen=all.slice(0,parallelUI.limits[kind]);
      const bars=chosen.map(c=>{
        const l=Math.max(0,(Math.max(start,c.start)-start)/(end-start)*100);
        const r=Math.min(100,(Math.min(end,c.end)-start)/(end-start)*100);
        return '<button class="timeline-row '+(c.id===state.civ?'selected':'')+'" type="button" data-timeline="'+c.id+'" title="'+escapeHtml(c.name+' · '+life(c))+'"><span class="timeline-name">'+escapeHtml(c.name)+'</span><span class="timeline-track"><span class="timeline-band" style="left:'+l.toFixed(2)+'%;width:'+Math.max(0,r-l).toFixed(2)+'%;--band:'+c.color+'"></span><span class="timeline-now"></span></span></button>';
      }).join('');
      return '<details class="timeline-group timeline-'+kind+'" data-parallel-group="'+kind+'"'+(parallelUI.open[kind]?' open':'')+'><summary class="timeline-group-title"><strong>'+label+'</strong><span>'+all.length+' contemporary'+(at>=0?' · includes selection':'')+'</span></summary>'+(chosen.length?bars:'<p class="timeline-empty">No '+label.toLowerCase()+' recorded in this region for '+compactYear(state.year)+'.</p>')+(all.length>chosen.length?'<button type="button" class="timeline-more" data-parallel-more="'+kind+'">Show '+Math.min(8,all.length-chosen.length)+' more · '+chosen.length+' of '+all.length+'</button>':'')+'</details>';
    }
    $('timelineRows').innerHTML=section('society','Societies')+section('empire','Empires');
    $('timelineRows').querySelectorAll('[data-timeline]').forEach(b=>b.addEventListener('click',()=>selectCiv(b.dataset.timeline)));
    $('timelineRows').querySelectorAll('[data-parallel-group]').forEach(d=>d.addEventListener('toggle',()=>{parallelUI.open[d.dataset.parallelGroup]=d.open;}));
    $('timelineRows').querySelectorAll('[data-parallel-more]').forEach(b=>b.addEventListener('click',()=>{const kind=b.dataset.parallelMore;const previous=parallelUI.limits[kind];parallelUI.limits[kind]+=8;parallelRows();$('timelineRows').querySelectorAll('.timeline-'+kind+' [data-timeline]')[previous]?.focus();}));
  }
  const readable = value => String(value||'').replaceAll('_',' ');
  const safeURL = value => typeof value==='string'&&/^https?:\/\//.test(value)?value:'';
  function recordDate(x){
    if(x.humanDate||x.dateLabel||x.date_label)return x.humanDate||x.dateLabel||x.date_label;
    if(x.physical_object_date_label)return x.physical_object_date_label;
    if(x.surviving_object_date)return x.surviving_object_date;
    const start=x.year??x.start_year??x.earliest_birth_year??x.birth_year??x.composition_earliest_year??x.year_composed_earliest??x.original_composition_year;
    const end=x.endExclusive!==undefined?x.endExclusive-1:x.end_year_exclusive!==undefined?x.end_year_exclusive-1:x.latest_death_year??x.death_year??x.composition_latest_year??x.year_composed_latest;
    if(!Number.isFinite(start))return '';
    const precision=x.datePrecision||x.date_precision||x.dating||'';
    if(/alternative/.test(precision)&&Number.isFinite(end)&&end!==start)return compactYear(start)+' or '+compactYear(end)+' · alternative dates';
    return (/approximate|circa|century|decade/.test(precision)?'c. ':'')+compactYear(start)+(Number.isFinite(end)&&end!==start?' – '+compactYear(end):'');
  }
  function storyRecords(c){
    const groups={events:[],people:[],maps:[],connections:[],meanwhile:[],sources:[]};
    const seen=new Set();const sourceRows=new Map();
    const addSource=(url,title,kind='Record source')=>{
      url=safeURL(url);if(!url)return;
      const existing=sourceRows.get(url);
      if(existing){if(!existing.title.includes(kind)){existing.title+=' · '+kind;existing.search+=' '+kind;}return;}
      sourceRows.set(url,{id:'source-'+sourceRows.size,title:kind,meta:title,html:'<a class="story-link" href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(title||url)+' ↗</a>',search:title+' '+url+' '+kind});
    };
    addSource(c.source,c.name+' · historical background','Background reading');
    function add(group,row,sourceIndex={},prefix='',extra=''){
      const title=row.title||row.name||row.region_or_place||readable(row.practice_type||row.theme||row.category||row.relationship_type||row.knowledge_type)||'Research record';
      const id=prefix+(row.id||row.researchId||title+'|'+(row.year??row.start_year??''));
      if(seen.has(group+'|'+id))return;seen.add(group+'|'+id);
      const sourceURLs=[row.source,row.sourceUrl,...(row.sourceUrls||[]),...(row.source_urls||[]),...(row.source_ids||row.sourceIds||[]).map(id=>sourceIndex[id]?.url)].filter(safeURL);
      const urls=[...new Set(sourceURLs)];
      urls.forEach(url=>addSource(url,title));
      const note=row.detail||row.summary||row.description||row.evidence_basis||row.content_scope||'';
      const date=recordDate(row);
      const qualifier=[row.kind||row.role||row.practice_type||row.theme||row.relationship_type||row.map_kind||row.representation_type||row.knowledge_level||row.evidence_layer,
        row.datePrecision||row.date_precision||row.dating,row.confidence?row.confidence+' confidence':''].filter(Boolean).map(readable).join(' · ');
      const caveats=[row.evidenceNote,row.evidence_note,row.evidence_status,row.evidenceStatus,row.scope_warning,row.comparison_caveat,row.worldview_caution,row.notes,row.direction_evidence,row.evidence_class,row.object_date_note].filter(Boolean);
      const html=(note?'<p>'+escapeHtml(note)+'</p>':'')+caveats.map(x=>'<p class="evidence-note">'+escapeHtml(readable(x))+'</p>').join('')+extra+
        (urls.length?urls.map(url=>'<a class="story-link" href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">Read record source ↗</a>').join(''):'<p class="evidence-note">No claim-level source attached to this record. The Sources section includes entity background reading.</p>')+(row.catalogueId?'<a class="story-link" href="catalogue.html?record='+encodeURIComponent(row.catalogueId)+'">Full research record ↗</a>':'')+
        (Number.isFinite(row.year)?'<button type="button" class="moment-chip" data-story-year="'+row.year+'">Explore '+compactYear(row.year)+' →</button>':'');
      groups[group].push({id,title,meta:[date,qualifier].filter(Boolean).join(' · '),html,search:[title,date,qualifier,note,...caveats].join(' '),year:row.year??row.start_year??row.birth_year??row.earliest_birth_year});
    }
    const eventSets=[
      [typeof ATLAS_RESEARCH_EVENTS!=='undefined'?ATLAS_RESEARCH_EVENTS:[],typeof ATLAS_RESEARCH_SOURCES!=='undefined'?ATLAS_RESEARCH_SOURCES:{}],
      [typeof ATLAS_MEDIEVAL_EVENTS!=='undefined'?ATLAS_MEDIEVAL_EVENTS:[],typeof ATLAS_MEDIEVAL_SOURCES!=='undefined'?ATLAS_MEDIEVAL_SOURCES:{}],
      [typeof ATLAS_CLASSICAL_EVENTS!=='undefined'?ATLAS_CLASSICAL_EVENTS:[],typeof ATLAS_CLASSICAL_SOURCES!=='undefined'?ATLAS_CLASSICAL_SOURCES:{}],
      [typeof ATLAS_MODERN_EVENTS!=='undefined'?ATLAS_MODERN_EVENTS:[],typeof ATLAS_MODERN_SOURCES!=='undefined'?ATLAS_MODERN_SOURCES:{}],[typeof ATLAS_EXPANSION_EVENTS!=='undefined'?ATLAS_EXPANSION_EVENTS:[],{}],[globalThis.ATLAS_MASTER_EVENTS||[],{}],[EVENTS,{}]
    ];
    const eventKeys=new Set();
    for(const [events,sources] of eventSets)for(const e of events){
      if(e.civ!==c.id&&![...(e.societyIds||[]),...(e.allSocietyIds||[])].includes(c.id))continue;
      const key=e.title.toLowerCase()+'|'+e.year;if(eventKeys.has(key))continue;eventKeys.add(key);add('events',e,sources);
    }
    const packs=[
      [typeof ATLAS_MEDIEVAL_PACK!=='undefined'?ATLAS_MEDIEVAL_PACK:null,typeof ATLAS_MEDIEVAL_ALIAS!=='undefined'?ATLAS_MEDIEVAL_ALIAS:{},typeof ATLAS_MEDIEVAL_SOURCES!=='undefined'?ATLAS_MEDIEVAL_SOURCES:{},'med-'],
      [typeof ATLAS_CLASSICAL_PACK!=='undefined'?ATLAS_CLASSICAL_PACK:null,typeof ATLAS_CLASSICAL_ALIAS!=='undefined'?ATLAS_CLASSICAL_ALIAS:{},typeof ATLAS_CLASSICAL_SOURCES!=='undefined'?ATLAS_CLASSICAL_SOURCES:{},'classical-'],
      [typeof ATLAS_MODERN_PACK!=='undefined'?ATLAS_MODERN_PACK:null,typeof ATLAS_MODERN_ALIAS!=='undefined'?ATLAS_MODERN_ALIAS:{},typeof ATLAS_MODERN_SOURCES!=='undefined'?ATLAS_MODERN_SOURCES:{},'modern-']
    ];
    for(const [pack,aliases,sources,prefix] of packs){
      if(!pack)continue;
      const linked=x=>[...(x.society_ids||[]),...(x.associated_society_ids||[]),x.society_id,x.associated_society_id,x.society_a_id,x.society_b_id,x.source_society_id,x.target_society_id].filter(Boolean).some(id=>(aliases[id]||id)===c.id);
      for(const row of [...(pack.figures||[]),...(pack.cultural_practices||[])].filter(linked))add('people',row,sources,prefix);
      for(const row of (pack.historical_maps||[]).filter(linked))add('maps',row,sources,prefix,'<p class="evidence-note">Catalogue record; no reproduction image bundled. '+escapeHtml(row.reproduction_status||row.copyright_reuse||'Check the item record for reproduction rights.')+'</p>');
      for(const row of (pack.geographical_knowledge||[]).filter(linked))add('maps',row,sources,prefix);
      for(const row of (pack.relationships||[]).filter(linked))add('connections',row,sources,prefix);
      const linkedEvents=new Set((pack.events||[]).filter(linked).map(x=>x.id));
      for(const row of pack.connections||[]){
        const related=linked(row)||(row.event_ids||[row.event_a_id,row.event_b_id]).some(id=>linkedEvents.has(id));
        const start=row.display_year??row.start_year??row.date_a;
        const end=row.end_year_exclusive??(Number.isFinite(start)?start+1:null);
        if(related||(Number.isFinite(start)&&Number.isFinite(end)&&start<=state.year&&state.year<end))add('meanwhile',row,sources,prefix,'<p class="evidence-note">Contemporaneity is a comparison, not evidence of contact.</p>');
      }
    }
    // The master archive contributes people, cultural practices, geographical
    // evidence and actual relationship records to this society's reader.
    // Editorial "connections" are comparisons, never asserted contact.
    for(const raw of globalThis.ATLAS_MASTER_CONTEXT?.forSociety(c.id)||[]){
      const dated=Number.isSafeInteger(raw.a)&&raw.a>=-9999&&raw.a<=2026;
      const midpoint=dated&&Number.isSafeInteger(raw.b)&&raw.b-raw.a>40;
      const placed=midpoint?Math.floor((raw.a+raw.b-1)/2):raw.a;
      const row={id:'master-'+raw.i,title:raw.t,summary:raw.s||'',kind:raw.k||raw.c,
        year:dated?placed:undefined,dateLabel:raw.d||'',datePrecision:midpoint?'approximate midpoint':raw.p||'',
        sourceUrls:raw.u||[],confidence:raw.h||'',notes:raw.n||'',catalogueId:raw.i,
        evidenceNote:midpoint?'Placed near the midpoint for browsing; original research period retained.':'Research-linked record; source status '+(raw.v||'not independently checked')+'.'};
      if(raw.c==='figures'||raw.c==='cultural_practices'||raw.c==='social_impacts')add('people',row,{},'');
      else if(raw.c==='geographical_knowledge'||raw.c==='visual_assets')add('maps',row,{},'');
      else if(raw.c==='relationships'||raw.c==='technology_transmission')add('connections',row,{},'');
      else if(raw.c==='connections')add('meanwhile',row,{},'', '<p class="evidence-note">This is a thematic comparison, not evidence of contact.</p>');
    }
    const m=MAPS[c.mapId];
    if(m){add('maps',{id:'display-map',title:m.title,dateLabel:m.date,kind:m.type,detail:m.description,source:m.page}, {},'', '<p class="evidence-note">Displayed cartographic example: '+escapeHtml(m.type)+'.</p>');}
    if(c.knownText)add('maps',{id:'known-world-overview',title:'Geographical knowledge overview',detail:c.knownText,kind:'Entity overview; illustrative contact points',source:c.source}, {},'', '<p class="evidence-note">Representative places and networks do not define a complete known world or political boundaries.</p>');
    for(const group of ['events','people','maps','connections'])groups[group].sort((a,b)=>Math.abs((a.year??state.year)-state.year)-Math.abs((b.year??state.year)-state.year));
    groups.sources=[...sourceRows.values()];
    return groups;
  }
  function renderStory(){
    const c=civById[state.civ];
    if(reading.civ!==c.id){reading.civ=c.id;reading.search='';reading.topics=new Set();reading.records={};reading.limits={};}
    if(state.region!=='All regions'&&!regionMatch(c,state.region)&&!CIVILISATIONS.some(e=>activeAt(e,state.year)&&regionMatch(e,state.region))){
      $('storyPanel').innerHTML='<div class="story-overline">NO ENTRIES FOR THIS DATE</div><h2 class="story-title">'+escapeHtml(state.region)+'</h2><p class="story-description">This atlas currently has no dated societies or empires in '+escapeHtml(state.region)+' for '+compactYear(state.year)+'. That is a gap in the atlas data, not a claim that the region was uninhabited.</p><p>Try changing the date or selecting another region.</p>';return;
    }
    const overview=c.kind==='overview',active=activeAt(c,state.year),records=storyRecords(c),q=reading.search.trim().toLowerCase();
    const requested=params.get('record')||params.get('event');
    if(requested&&!reading.requestHandled){
      for(const [key,rows] of Object.entries(records)){const at=rows.findIndex(r=>r.id===requested);if(at>=0){reading.topics.add(key);reading.records[key]=rows[at].id;reading.limits[key]=Math.ceil((at+1)/8)*8;reading.requestHandled=true;break;}}
    }
    const labels={events:['✦','Events'],people:['◈','People & daily life'],maps:['▤','Maps & geographical knowledge'],connections:['⌁','Connections'],meanwhile:['✧','Meanwhile elsewhere'],sources:['↗','Sources']};
    const matched=Object.values(records).flat().filter(r=>!q||r.search.toLowerCase().includes(q)).length;
    function topic(key){
      const [icon,label]=labels[key],all=records[key],rows=all.filter(r=>!q||r.search.toLowerCase().includes(q));
      const selectedAt=rows.findIndex(r=>r.id===reading.records[key]);
      const limit=Math.max(reading.limits[key]||8,selectedAt<0?0:Math.ceil((selectedAt+1)/8)*8),open=q?rows.length>0:reading.topics.has(key);
      const chosen=rows.slice(0,limit);
      return '<details class="reader-topic" data-reader-topic="'+key+'"'+(open?' open':'')+'><summary><span aria-hidden="true" class="topic-icon">'+icon+'</span><span>'+label+'</span><span class="topic-count">'+(q?rows.length+' / ':'')+all.length+'</span></summary><div class="reader-topic-body">'+
        (key==='connections'?'<p class="reader-hint">Documented relationships, with the evidence and its limits. Dates may differ from the selected year.</p>':key==='sources'?'<p class="reader-hint">Background reading and sources attached to individual records. Source presence does not independently verify every claim.</p>':key==='meanwhile'?'<p class="reader-hint">Parallel histories; sharing a date does not itself establish contact.</p>':'')+
        (chosen.length?chosen.map(r=>'<details class="reader-record" name="map-reader-'+key+'" data-reader-record="'+escapeHtml(r.id)+'"'+(reading.records[key]===r.id?' open':'')+'><summary><strong>'+escapeHtml(r.title)+'</strong>'+(r.meta?'<small>'+escapeHtml(r.meta)+'</small>':'')+'</summary><div class="reader-record-body">'+r.html+'</div></details>').join(''):'<p class="reader-empty">'+(q?'No records match this search.':'No linked records in this atlas yet.')+'</p>')+
        (rows.length>chosen.length?'<button class="reader-more" type="button" data-reader-more="'+key+'">Show '+Math.min(8,rows.length-chosen.length)+' more <span>'+chosen.length+' of '+rows.length+'</span></button>':'')+'</div></details>';
    }
    $('storyPanel').innerHTML='<div class="story-overline">'+(overview?'CULTURAL BACKGROUND':active?'CURRENTLY EXPLORING':'SELECTED HISTORICAL ENTITY')+' · '+escapeHtml(groupLabel(c))+'</div><h2 class="story-title">'+escapeHtml(c.name)+'</h2><div class="story-years">'+(overview?'Broad cultural overview · not a single dated polity':life(c)+(!active?' · not active in '+compactYear(state.year):''))+'</div><p class="story-location">⌖ '+escapeHtml(c.location)+' · '+escapeHtml(c.region)+'</p><p class="story-description">'+escapeHtml(c.summary)+'</p><a class="reader-context-link" href="story.html?year='+state.year+'&entity='+encodeURIComponent(c.id)+'">Read in Story →</a><label class="reader-search-label" for="mapReaderSearch">Find in this story</label><input id="mapReaderSearch" class="reader-search" type="search" placeholder="Search events, people, sources…" value="'+escapeHtml(reading.search)+'"><p class="reader-search-status" aria-live="polite">'+(q?matched+' matching records':'Open a topic to explore its records.')+'</p>'+Object.keys(labels).map(topic).join('')+'<div class="story-callout"><strong>Discover a contemporary</strong><p>'+escapeHtml(contemporaryNote(c))+'</p><button type="button" id="sameYearButton" class="moment-chip">Random contemporary society ↗</button></div>';
    if (window.AtlasNavigation?.href) {
      const links=[['story','Read chronological story'],['compare','Compare contemporaries'],['technology','Explore technology evidence']];
      $('storyPanel').innerHTML += '<nav class="atlas-journey" aria-label="Continue exploring this society">'+links.map(([view,label])=>'<a href="'+escapeHtml(window.AtlasNavigation.href(view))+'">'+escapeHtml(label)+' ↗</a>').join('')+'</nav>';
    }
    $('storyPanel').querySelectorAll('[data-story-year]').forEach(b=>b.addEventListener('click',()=>setYear(+b.dataset.storyYear)));
    $('storyPanel').querySelectorAll('[data-reader-topic]').forEach(d=>d.addEventListener('toggle',()=>{if(!reading.search.trim()){if(d.open)reading.topics.add(d.dataset.readerTopic);else reading.topics.delete(d.dataset.readerTopic);}}));
    $('storyPanel').querySelectorAll('[data-reader-record]').forEach(d=>d.addEventListener('toggle',()=>{const group=d.closest('[data-reader-topic]').dataset.readerTopic;if(d.open){reading.records[group]=d.dataset.readerRecord;d.parentElement.querySelectorAll('[data-reader-record]').forEach(other=>{if(other!==d)other.open=false;});}else if(reading.records[group]===d.dataset.readerRecord)delete reading.records[group];}));
    $('storyPanel').querySelectorAll('[data-reader-more]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.readerMore,previous=reading.limits[key]||8;reading.limits[key]=previous+8;reading.topics.add(key);renderStory();$('storyPanel').querySelectorAll('[data-reader-topic="'+key+'"] [data-reader-record] > summary')[previous]?.focus();}));
    const search=$('storyPanel').querySelector('.reader-search');
    search?.addEventListener('input',e=>{const position=e.target.selectionStart;reading.search=e.target.value;reading.limits={};renderStory();const next=$('storyPanel').querySelector('.reader-search');next?.focus();try{next?.setSelectionRange(position,position);}catch(_e){}});
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
    $('discoverLink').href='discover.html?year='+encodeURIComponent(state.year);
    $('backButton').disabled=snapshots.length===0;
    const url=new URL(location.href);url.searchParams.set('year',state.year);url.searchParams.set('civ',state.civ);url.searchParams.set('view',state.view);
    if(state.geoMode==='points')url.searchParams.set('geo','points');else url.searchParams.delete('geo');
    if(state.geoGrid)url.searchParams.set('grid','1');else url.searchParams.delete('grid');
    try {window.history.replaceState(null,'',url);}catch(_e){}
  }
  function render(){
    renderTitle();renderEras();renderList();renderMap();parallelRows();renderStory();renderMoments();
    $('searchInput').value=state.search;
    $('regionSelect').value=state.region;
    window.AtlasNavigation?.refresh();
  }
  function wire(){
    $('regionSelect').innerHTML=REGIONS.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    $('searchInput').addEventListener('input',e=>{state.search=e.target.value;if(state.search.trim())$('mapBrowse').open=true;renderList();});
    $('regionSelect').addEventListener('change',e=>go({region:e.target.value,search:'',view:'actual'}));
    document.querySelectorAll('[data-catalogue]').forEach(b=>b.addEventListener('click',()=>go({catalogue:b.dataset.catalogue,search:'',view:'actual'})));
    $('randomButton').addEventListener('click',()=>randomise('all'));
    $('moreRandom').addEventListener('click',()=>$('randomMenu').classList.toggle('hidden'));
    $('randomMenu').querySelectorAll('[data-random]').forEach(b=>b.addEventListener('click',()=>{$('randomMenu').classList.add('hidden');randomise(b.dataset.random);}));
    $('backButton').addEventListener('click',()=>{const p=snapshots.pop();if(p){Object.assign(state,p);render();}});
    $('helpButton').addEventListener('click',()=>$('aboutDialog').showModal());
    $('closeDialog').addEventListener('click',()=>$('aboutDialog').close());
    $('closeDialogAction').addEventListener('click',()=>$('aboutDialog').close());
    let sliderBefore=null;
    const beginSlide=()=>{if(sliderBefore===null)sliderBefore={...state};};
    $('yearSlider').addEventListener('pointerdown',beginSlide);
    $('yearSlider').addEventListener('keydown',beginSlide);
    $('yearSlider').addEventListener('input',e=>{const y=Number(e.target.value);if(sliderBefore===null)beginSlide();
      const next={year:y};syncSelection(next);Object.assign(state,next);render();});
    const finishSlide=()=>{if(sliderBefore!==null&&sliderBefore.year!==state.year){snapshots.push(sliderBefore);if(snapshots.length>45)snapshots.shift();$('backButton').disabled=false;}sliderBefore=null;};
    $('yearSlider').addEventListener('change',finishSlide);
    $('yearSlider').addEventListener('pointerup',finishSlide);
    $('yearSlider').addEventListener('blur',finishSlide);
    $('yearInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const y=parseYear(e.target.value);if(y!==null){setYear(y);e.target.blur();}else{e.target.setCustomValidity('Enter a year, for example 500 BCE or 200 CE');e.target.reportValidity();}}});
    $('yearInput').addEventListener('input',e=>e.target.setCustomValidity(''));
    $('yearInput').addEventListener('blur',e=>{const y=parseYear(e.target.value);if(y!==null && y!==state.year)setYear(y);else e.target.value=compactYear(state.year);});
    $('minusCentury').addEventListener('click',()=>setYear(state.year-100));
    $('plusCentury').addEventListener('click',()=>setYear(state.year+100));
    $('prevMoment').addEventListener('click',()=>{const earlier=MOMENTS.filter(m=>m.year<state.year);setYear((earlier[earlier.length-1]||MOMENTS[0]).year);});
    $('nextMoment').addEventListener('click',()=>{const later=MOMENTS.find(m=>m.year>state.year);setYear((later||MOMENTS[MOMENTS.length-1]).year);});
    document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>go({view:b.dataset.view})));
    $('mapMarkers').addEventListener('click',e=>{
      const cluster=e.target.closest('[data-mapcluster]');if(cluster){zoomToCluster(cluster.dataset.mapcluster);return;}
      const g=e.target.closest('[data-mapciv]');if(g)selectCiv(g.dataset.mapciv);
    });
    $('mapMarkers').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){
      const group=e.target.closest('[data-mapcluster]');if(group){e.preventDefault();zoomToCluster(group.dataset.mapcluster);return;}
      const g=e.target.closest('[data-mapciv]');if(g){e.preventDefault();selectCiv(g.dataset.mapciv);}
    }});
    $('zoomIn').addEventListener('click',()=>zoomBy(1.3));
    $('zoomOut').addEventListener('click',()=>zoomBy(1/1.3));
    $('resetMap').addEventListener('click',()=>{Object.assign(state,{zoom:1,tx:0,ty:0});renderMap();});
    $('groupGeo').addEventListener('click',()=>{state.geoMode=state.geoMode==='groups'?'points':'groups';renderMap();renderTitle();});
    $('toggleGrid').addEventListener('click',()=>{state.geoGrid=!state.geoGrid;renderMap();renderTitle();});
    $('mapStage').addEventListener('wheel',e=>{if(state.view==='historical')return;e.preventDefault();zoomBy(e.deltaY<0?1.15:1/1.15);},{passive:false});
    const svg=$('worldMap');let drag=null;
    svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-mapciv],[data-mapcluster]'))return;drag={x:e.clientX,y:e.clientY,tx:state.tx,ty:state.ty};svg.setPointerCapture(e.pointerId);$('mapStage').classList.add('dragging');});
    svg.addEventListener('pointermove',e=>{if(!drag)return;const box=svg.getBoundingClientRect();state.tx=drag.tx+(e.clientX-drag.x)*1200/box.width;state.ty=drag.ty+(e.clientY-drag.y)*590/box.height;updateTransform();});
    const endDrag=()=>{drag=null;$('mapStage').classList.remove('dragging');};
    svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
    document.addEventListener('keydown',e=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)){e.preventDefault();$('searchInput').focus();}if(e.key==='Escape')$('randomMenu').classList.add('hidden');});
    document.addEventListener('click',e=>{if(!e.target.closest('#moreRandom')&&!e.target.closest('#randomMenu'))$('randomMenu').classList.add('hidden');});
  }
  if(window.matchMedia?.('(max-width:700px)').matches)$('mapBrowse').open=false;
  wire();render();
  window.WorldHistoryAtlas={state,civilisations:CIVILISATIONS,moments:MOMENTS,selectCiv,setYear,randomise,go};
})();