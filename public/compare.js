/* Compare: a shared chronological scale with compact, progressively disclosed readers. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = CIVILISATIONS.filter(c => c.kind !== 'overview' && Number.isFinite(c.start) && Number.isFinite(c.end));
  const entities = new Map(all.map(c => [c.id, c]));
  const nativeEvents = EVENTS.filter(e => entities.has(e.civ) && Number.isFinite(e.year));
  const researchEvents = [...(typeof ATLAS_RESEARCH_EVENTS !== 'undefined' ? ATLAS_RESEARCH_EVENTS : []), ...(typeof ATLAS_MEDIEVAL_EVENTS !== 'undefined' ? ATLAS_MEDIEVAL_EVENTS : []), ...(typeof ATLAS_MODERN_EVENTS !== 'undefined' ? ATLAS_MODERN_EVENTS : []), ...(typeof ATLAS_CLASSICAL_EVENTS !== 'undefined' ? ATLAS_CLASSICAL_EVENTS : []),...(typeof ATLAS_EXPANSION_EVENTS !== 'undefined'?ATLAS_EXPANSION_EVENTS:[]),...(globalThis.ATLAS_MASTER_EVENTS||[])];
  const researchIds = new Set(researchEvents.map(e => e.id));
  const events = [
    ...nativeEvents.filter(e => !e.researchId || !researchIds.has(e.researchId)).map((e, i) => ({...e, key:'native-' + i})),
    ...researchEvents.map(e => ({...e, key:e.id}))
  ];
  const eventByKey = new Map(events.map(e => [e.key, e]));
  const sourceRegistries = {
    '500-999': typeof ATLAS_RESEARCH_SOURCES !== 'undefined' ? ATLAS_RESEARCH_SOURCES : {},
    '1000-1499': typeof ATLAS_MEDIEVAL_SOURCES !== 'undefined' ? ATLAS_MEDIEVAL_SOURCES : {},
    '1500-2026-structured': typeof ATLAS_MODERN_SOURCES !== 'undefined' ? ATLAS_MODERN_SOURCES : {},
    '1500-2026': typeof ATLAS_MODERN_SOURCES !== 'undefined' ? ATLAS_MODERN_SOURCES : {},
    ...(typeof ATLAS_EXPANSION_SOURCES !== 'undefined'?ATLAS_EXPANSION_SOURCES:{}),
    '500BCE-500CE': typeof ATLAS_CLASSICAL_SOURCES !== 'undefined' ? ATLAS_CLASSICAL_SOURCES : {}
  };
  const params = new URLSearchParams(location.search);
  const within = (x, min, max) => Math.min(max, Math.max(min, x));
  const safe = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[x]));
  const validURL = value => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : null; } catch (_) { return null; } };
  const parseDate = input => {
    const m = String(input).trim().replace(/,/g, '').match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
    if (!m) return null;
    const n = Number(m[1]), era = (m[2] || '').toUpperCase();
    if (!Number.isSafeInteger(n)) return null;
    if (era === 'BCE' || era === 'BC') return n > 0 ? 1 - n : null;
    if (era === 'CE' || era === 'AD') return n > 0 ? n : null;
    return n;
  };
  const yearText = y => y <= 0 ? (1 - y).toLocaleString('en-AU') + ' BCE' : y.toLocaleString('en-AU') + ' CE';
  const regionOrder=['North Africa','Sub-Saharan Africa','Europe','West Asia','South Asia','East Asia','Southeast Asia','Americas','Oceania'];
  const regions=[...new Set(all.map(c=>c.region))].sort((a,b)=>(regionOrder.includes(a)?regionOrder.indexOf(a):99)-(regionOrder.includes(b)?regionOrder.indexOf(b):99)||a.localeCompare(b));
  const regionColours = {'Europe':'#497ead','West Asia':'#9c668f','North Africa':'#b98a3c','Sub-Saharan Africa':'#8a9148','East Asia':'#b86f63','South Asia':'#a86b56','Southeast Asia':'#3b9293','Americas':'#5a9872','Oceania':'#6977a7'};
  const colour = c => regionColours[c?.region] || '#678595';
  const spans = [500, 1000, 2000, 4000, 12026];
  const MAX_PINS=5, PIN_STORE='world-history-atlas-compare-pins-v1';
  function savedPins() {
    try {return typeof localStorage === 'undefined' ? [] : JSON.parse(localStorage.getItem(PIN_STORE) || '[]');}
    catch (_) {return [];}
  }
  function validPins(value) {
    const items=Array.isArray(value)?value:typeof value==='string'?value.split(','):[];
    return [...new Set(items.filter(id=>typeof id==='string'&&entities.has(id)))].slice(0,MAX_PINS);
  }
  function savePins() {
    try {if(typeof localStorage!=='undefined')localStorage.setItem(PIN_STORE,JSON.stringify(state.pinned));}catch(_){}
  }
  const initialPins=validPins(params.has('pins')?params.get('pins'):savedPins());
  const state = {
    year:within(parseDate(params.get('year')) ?? 1200, -9999, 2026),
    mode:['overlap','eras','regions','events'].includes(params.get('mode')) ? params.get('mode') : 'overlap',
    selected:entities.has(params.get('civ')) ? params.get('civ') : 'abbasid',
    region:regions.includes(params.get('region')) ? params.get('region') : 'all',
    type:['all','empire','society'].includes(params.get('type')) ? params.get('type') : 'all',
    span:spans.includes(Number(params.get('span'))) ? Number(params.get('span')) : 1000,
    limit:[12,24,60,150,9999].includes(Number(params.get('limit'))) ? Number(params.get('limit')) : 12,
    search:(params.get('search') || '').trim().toLowerCase(), pinned:initialPins, focusPinned:params.get('focus')==='1'&&initialPins.length>=2,
    event:eventByKey.has(params.get('event')) ? params.get('event') : null
  };
  // Reading state is intentionally separate from dates, filters, selection and saved row ordering.
  const ui = {collapsed:new Set(), eventLimit:8, concurrentLimit:8, nearLimit:8, sourceLimit:8, cellLimit:8, extraRows:0, cell:null, lastCell:null};
  const active = (c, y) => c.start <= y && y <= c.end;
  const range = () => {
    if (state.span === 12026) return {start:-9999, end:2026};
    const half = state.span / 2;
    let start = Math.round(state.year - half), end = Math.round(state.year + half);
    if (start < -9999) { end += -9999 - start; start = -9999; }
    if (end > 2026) { start -= end - 2026; end = 2026; }
    return {start:Math.max(-9999, start), end:Math.min(2026, end)};
  };
  const pct = (v, r) => within((v - r.start) / (r.end - r.start) * 100, 0, 100);
  const overlaps = (c, r) => c.end >= r.start && c.start <= r.end;
  const pass = c => (state.region === 'all' || c.region === state.region) && (state.type === 'all' || c.kind === state.type) && (!state.search || (c.name + ' ' + c.region + ' ' + c.summary).toLowerCase().includes(state.search));
  const candidates = r => all.filter(c => (state.focusPinned&&state.pinned.length>=2?state.pinned.includes(c.id):pass(c)) && overlaps(c, r));
  const eventPass = e => {
    const linked = [e.civ, ...(e.societyIds || e.allSocietyIds || [])].map(id => entities.get(id)).filter(Boolean);
    if(state.focusPinned && state.pinned.length>=2) {
      if(!linked.some(c=>state.pinned.includes(c.id))) return false;
    } else if (state.region !== 'all' && e.region !== state.region && !linked.some(c => c.region === state.region)) return false;
    if (!state.focusPinned && state.type !== 'all' && !linked.some(c => c.kind === state.type)) return false;
    return !state.search || [e.title,e.detail,e.kind,e.region,e.originalRegion,e.humanDate,e.dateLabel,...linked.map(c => c.name)].join(' ').toLowerCase().includes(state.search);
  };
  const filteredEvents = r => events.filter(e => Number.isFinite(e.year) && e.year <= r.end && (e.endExclusive || e.year + 1) > r.start && eventPass(e)).sort((a,b) => a.year - b.year || a.title.localeCompare(b.title));
  function chooseRows(r) {
    const group = candidates(r).sort((a,b) => {
      const contemporary = Number(active(b,state.year)) - Number(active(a,state.year));
      if (contemporary) return contemporary;
      const overlapA = Math.max(0,Math.min(a.end,r.end) - Math.max(a.start,r.start));
      const overlapB = Math.max(0,Math.min(b.end,r.end) - Math.max(b.start,r.start));
      return overlapB - overlapA || a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
    });
    // Selecting a row never changes its ordering; user order remains authoritative within each type.
    if (window.HistoryRowOrder) {
      // The saved comparator intentionally returns equality across different types.
      // Sort each type independently, then restore its slots in the shared selection.
      for (const kind of ['society','empire']) {
        const ordered = group.filter(c => c.kind === kind);
        window.HistoryRowOrder.sort(ordered);
        let next = 0;
        group.forEach((c,i) => {if (c.kind === kind) group[i] = ordered[next++];});
      }
    }
    const take = state.focusPinned&&state.pinned.length>=2 ? group.length : Math.min(group.length, state.limit + ui.extraRows);
    const required = new Set([state.selected, ...state.pinned]);
    const rowKey=JSON.stringify([state.year,state.span,state.region,state.type,state.search,take,state.focusPinned,state.pinned]);
    const overview=[];
    for(const region of regionOrder){const local=group.filter(c=>c.region===region).sort((a,b)=>Number(!b.researchBatch)-Number(!a.researchBatch)||Number(active(b,state.year))-Number(active(a,state.year))||b.end-b.start-(a.end-a.start));if(local.length)overview.push(local[0]);}
    const priority=[...overview,...group.filter(c=>!overview.includes(c)).sort((a,b)=>Number(!b.researchBatch)-Number(!a.researchBatch))];
    const ids=new Set(ui.rowKey===rowKey?(ui.rowIDs||[]).filter(id=>group.some(c=>c.id===id)):priority.slice(0,take).map(c=>c.id));
    for(const c of group){if(ids.size>=take)break;ids.add(c.id);}
    for (const c of group) if (required.has(c.id) && !ids.has(c.id)) {
      const replace = [...ids].reverse().find(id => !required.has(id));
      if (replace) ids.delete(replace);
      ids.add(c.id);
    }
    ui.rowKey=rowKey;ui.rowIDs=[...ids];
    return {rows:group.filter(c => ids.has(c.id)), total:group.length};
  }
  function qs(extra = {}) {
    const u = new URL('index.html', document.baseURI);
    u.searchParams.set('year', String(extra.year ?? state.year));
    if (extra.civ || state.selected) u.searchParams.set('civ', extra.civ || state.selected);
    return u.toString();
  }
  function updateLink() {
    const u = new URL(location.href);
    for (const [k,v] of Object.entries({year:state.year,mode:state.mode,civ:state.selected,region:state.region,type:state.type,span:state.span,limit:state.limit,search:state.search,event:state.event,pins:state.pinned.join(','),focus:state.focusPinned?'1':null})) {
      if (v === null || v === '') u.searchParams.delete(k); else u.searchParams.set(k, v);
    }
    if (['http:','https:','file:'].includes(location.protocol)) history.replaceState(null, '', u.pathname + u.search + u.hash);
    savePins();
    $('mapLink').href = qs(); $('topMapLink').href = qs();
    document.querySelectorAll('[data-atlas-nav="map"],[data-atlas-nav="technology"]').forEach(a => {a.href = qs() + (a.dataset.atlasNav === 'technology' ? '#technology' : '');});
  }
  function marker(r) {
    return state.year >= r.start && state.year <= r.end ? '<span class="current-line" style="left:' + pct(state.year,r).toFixed(3) + '%" aria-hidden="true"></span>' : '';
  }
  function regionIcon(region){
    const paths={Europe:'M3 9 14 3 25 9ZM5 11v11M11 11v11M17 11v11M23 11v11M2 24h24','North Africa':'M4 22 13 6 22 22ZM13 6v16M5 22h18','Sub-Saharan Africa':'M6 8 13 3 20 8 18 17 13 25 8 17ZM6 8h14M8 14h10','West Asia':'M21 4a11 11 0 1 0 3 17A10 10 0 0 1 21 4Z','South Asia':'M4 22h20M7 21V14l7-9 7 9v7M5 14h18M10 13h8M12 21v-6h4v6','East Asia':'M3 22h22M6 20v-4h16v4M3 15h22L21 11H7ZM7 10h14l-4-4h-6ZM14 3v3','Southeast Asia':'M3 24h22M5 24V14h6v10M17 24V14h6v10M10 24V9h8v15M4 14l4-6 4 6M16 14l4-6 4 6M10 9l4-6 4 6',Americas:'M3 24h22M5 20h18M8 16h12M10 12h8M12 8h4M5 20v4M8 16v4M10 12v4M12 8v4M16 8v4M18 12v4M20 16v4M23 20v4',Oceania:'M3 21c3-3 5 3 8 0s5 3 8 0 5 2 7 0M4 17h20L14 3v14M13 5 6 15h7'};
    return '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="'+(paths[region]||paths.Europe)+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }
  function axis(r){const ticks=Array.from({length:7},(_,i)=>Math.round(r.start+(r.end-r.start)*i/6));return '<div class="axis"><div class="axis-label">REGION <small>One shared time scale</small></div><div class="axis-track">'+ticks.map((y,i)=>'<span class="axis-tick" style="left:'+i/6*100+'%">'+safe(yearText(y))+'</span>').join('')+marker(r)+'<strong class="axis-year-badge" style="left:'+pct(state.year,r)+'%">'+safe(yearText(state.year))+'</strong></div></div>';}
  function bar(c,r){
    const left=pct(Math.max(c.start,r.start),r),right=pct(Math.min(c.end,r.end),r);
    const linked=events.filter(e=>Number.isFinite(e.year)&&e.year>=r.start&&e.year<=r.end&&e.year>=c.start&&e.year<=c.end&&(e.civ===c.id||(e.societyIds||e.allSocietyIds||[]).includes(c.id))).sort((a,b)=>a.year-b.year||a.key.localeCompare(b.key));
    const selectedKeys=new Set();const slots=Math.min(5,linked.length);
    for(let i=0;i<slots;i++)selectedKeys.add(linked[Math.floor(i*(linked.length-1)/Math.max(1,slots-1))].key);
    if(state.event&&linked.some(e=>e.key===state.event))selectedKeys.add(state.event);
    const points=linked.filter(e=>selectedKeys.has(e.key));const labels=[];
    const ms=points.map((e,i)=>{const x=pct(e.year,r),labelled=i<2&&(!labels.length||Math.abs(x-labels.at(-1))>17);if(labelled)labels.push(x);return '<button type="button" class="milestone'+(state.event===e.key?' selected':'')+'" data-event-key="'+safe(e.key)+'" aria-pressed="'+(state.event===e.key)+'" style="left:'+x.toFixed(3)+'%;--bar:'+colour(c)+'" title="'+safe(researchEventDate(e)+' / '+e.title)+'" aria-label="Read '+safe(e.title+', '+researchEventDate(e))+'"></button>'+(labelled?'<span class="milestone-label'+(x>78?' align-right':'')+'" style="left:'+x.toFixed(3)+'%" aria-hidden="true"><strong>'+safe(e.title)+'</strong><small>'+safe(researchEventDate(e))+'</small></span>':'');}).join('');
    const date=(c.periodScope?'Recorded: ':'')+yearText(c.start)+' - '+yearText(c.end),narrow=right-left<18;
    return '<div class="lane atlas-lane '+(c.id===state.selected?'selected ':'')+(active(c,state.year)?'contemporary':'')+'"><div class="lane-track"><div class="lane-grid"></div><button type="button" class="lane-name duration '+c.kind+(narrow?' narrow':'')+'" data-civ="'+safe(c.id)+'" aria-pressed="'+(c.id===state.selected)+'" style="left:'+left.toFixed(3)+'%;width:'+Math.max(right-left,0).toFixed(3)+'%;--bar:'+colour(c)+'" title="'+safe(c.name+' / '+entityDates(c))+'"><span class="bar-type" aria-hidden="true">'+(c.kind==='empire'?'&#9819;':'&#9671;')+'</span><span class="bar-copy"><strong>'+safe(c.name)+(state.pinned.includes(c.id)?' &#9733;':'')+'</strong><small>'+safe(date)+'</small></span></button>'+(narrow?'<span class="floating-bar-label'+(left>76?' align-right':'')+'" style="left:'+left+'%;--bar:'+colour(c)+'"><strong>'+safe(c.name)+'</strong><small>'+safe(date)+'</small></span>':'')+ms+marker(r)+'</div></div>';
  }
  function groupHeading(label,count,key,id) {
    const open = !ui.collapsed.has(key);
    return '<button type="button" class="group-heading" data-group="' + safe(key) + '" aria-expanded="' + open + '" aria-controls="' + id + '"><span><i class="disclosure-chevron" aria-hidden="true">' + (open ? '⌄' : '›') + '</i>' + safe(label) + '</span><b>' + count + ' ' + (count === 1 ? 'entry' : 'entries') + '</b></button>';
  }
  function moreButton(key,shown,total,label='records') {
    return '<div class="list-progress"><span role="status">Showing ' + Math.min(shown,total) + ' of ' + total + ' ' + label + '</span>' + (shown < total ? '<button type="button" class="show-more" data-more="' + key + '">Show ' + Math.min(key === 'rows' ? 24 : 8,total-shown) + ' more <span aria-hidden="true">↓</span></button>' : '') + '</div>';
  }
  function empty(message) {
    return '<div class="empty-state"><strong>No matching records</strong><p>' + safe(message) + '</p><button type="button" data-action="reset">Reset comparison ↗</button></div>';
  }
  function regionalTracks(r,compact=false){const {rows,total}=chooseRows(r);if(!rows.length)return empty('Try another region or a wider time span.');const parts=regions.filter(g=>rows.some(c=>c.region===g)).map((g,i)=>{const members=rows.filter(c=>c.region===g),key='region:'+g,id='lanes-region-'+i;return '<section class="atlas-region-block" style="--region:'+colour({region:g})+'"><button type="button" class="region-rail" data-group="'+safe(key)+'" aria-expanded="'+!ui.collapsed.has(key)+'" aria-controls="'+id+'">'+regionIcon(g)+'<strong>'+safe(g)+'</strong><small>'+members.length+' entries</small></button><div class="region-tracks" id="'+id+'"'+(ui.collapsed.has(key)?' hidden':'')+'>'+members.map(c=>bar(c,r)).join('')+'</div></section>';}).join('');return '<div class="timeline-scroll" tabindex="0" aria-label="Scrollable regional historical timeline"><div class="timeline-canvas atlas-overlap'+(compact?' condensed-lanes':'')+'">'+axis(r)+'<div class="comparison-lanes">'+parts+'</div></div></div>'+moreButton('rows',rows.length,total,'entries');}
  function overlapView(r){return regionalTracks(r);}
  function regionsView(r){return regionalTracks(r,true);}
  function cellMatches(cell) {
    return candidates(range()).filter(c => c.region === cell.region && c.start < cell.hi && c.end >= cell.lo).sort((a,b) => a.name.localeCompare(b.name));
  }
  function eraView(r){
    const rows=candidates(r);if(!rows.length)return empty('No recorded societies overlap this period.');const slots=8,w=(r.end-r.start+1)/slots,groups=regions.filter(g=>rows.some(c=>c.region===g)),colours=['#ddb65e','#dd9554','#ce6f69','#a181bd','#6a9fca','#56aa9e','#86ad62','#c1af60'];
    const headings=Array.from({length:slots},(_,i)=>'<div class="atlas-era-head" style="--era-colour:'+colours[i]+'"><b>'+safe(yearText(Math.ceil(r.start+i*w)))+'</b><small>to '+safe(yearText(Math.ceil(r.start+(i+1)*w)-1))+'</small><span aria-hidden="true">'+['&#9650;','&#9819;','&#9670;','&#8962;','&#9817;','&#9673;','&#9873;','&#9788;'][i]+'</span></div>').join('');
    const sections=groups.map(g=>{const members=rows.filter(c=>c.region===g).sort((a,b)=>a.start-b.start||b.end-a.end||a.name.localeCompare(b.name)),laneEnds=[],placed=[];
      for(const c of members){const x=pct(c.start,r),end=pct(c.end,r);let lane=laneEnds.findIndex(e=>e+1<x);if(lane<0){if(laneEnds.length>=2)continue;lane=laneEnds.length;laneEnds.push(-10);}laneEnds[lane]=end;placed.push({c,x,end,lane});}
      const bars=placed.map(({c,x,end,lane})=>'<button type="button" class="atlas-era-span'+(c.id===state.selected?' selected':'')+'" data-civ="'+safe(c.id)+'" style="left:'+x+'%;width:'+Math.max(end-x,0)+'%;top:'+(8+lane*36)+'px;--bar:'+colour(c)+'" title="'+safe(c.name+' / '+entityDates(c))+'">'+safe(c.name)+'</button>').join('');
      const counts=Array.from({length:slots},(_,i)=>{const lo=r.start+i*w,hi=lo+w,n=members.filter(c=>c.start<hi&&c.end>=lo).length;return n?'<button type="button" class="era-more" data-era-region="'+safe(g)+'" data-era-slot="'+i+'" style="left:'+(i*12.5)+'%;width:12.5%">'+n+' records<span class="sr-only"> in '+safe(g)+' '+safe(yearText(Math.ceil(lo))+' to '+yearText(Math.ceil(hi)-1))+'</span></button>':'';}).join('');
      return {region:g,markup:'<section class="atlas-era-region" style="--region:'+colour({region:g})+'"><div class="region-rail">'+regionIcon(g)+'<strong>'+safe(g)+'</strong><small>'+members.length+' entries</small></div><div class="atlas-era-track" style="height:'+(Math.max(1,laneEnds.length)*36+37)+'px">'+bars+counts+marker(r)+'</div></section>'};});
    const major=sections.filter(x=>regionOrder.includes(x.region)).map(x=>x.markup).join(''),other=sections.filter(x=>!regionOrder.includes(x.region));
    const tracks=major+(other.length?'<details class="other-era-regions"'+(state.region!=='all'?' open':'')+'><summary>Other source-specific regions ('+other.length+') &#8595;</summary>'+other.map(x=>x.markup).join('')+'</details>':'');
    return '<p class="era-explain">Eight equal-duration bands on one linear scale. Bars form a representative overview; cell counts open <b>all</b> matching records. Overlap is not contact. <button type="button" data-action="reader">Read selected society &#8599;</button></p><div class="era-grid-scroll" tabindex="0" aria-label="Scrollable era bands"><div class="atlas-era-grid"><div class="atlas-era-columns"><span class="era-corner">'+regionIcon('Europe')+' REGION</span><div class="atlas-era-heads">'+headings+'</div></div>'+tracks+'</div></div>';
  }
  function renderAtlasSummary(r){const host=$('atlasRegionSummary');if(!host)return;const rows=candidates(r);host.innerHTML=regions.filter(g=>rows.some(c=>c.region===g)).map(g=>'<span><i style="background:'+colour({region:g})+'"></i><b>'+safe(g)+'</b><small>'+rows.filter(c=>c.region===g).length+' entries</small></span>').join('');$('atlasScaleNote').textContent=yearText(r.start)+' to '+yearText(r.end)+'. One genuine linear scale. Research coverage is not necessarily a complete historical lifespan.';}
  function researchEventDate(e) {
    if (e.humanDate || e.dateLabel) return e.humanDate || e.dateLabel;
    const end = Number.isFinite(e.endExclusive) ? e.endExclusive : e.year+1;
    if (/alternative/.test(e.datePrecision || '') && end > e.year+1) return yearText(e.year) + ' or ' + yearText(end-1);
    const approximate = /approx|circa|century|decade/.test(e.datePrecision || '') ? 'c. ' : '';
    return approximate + yearText(e.year) + (end > e.year+1 ? '–' + yearText(end-1) : '');
  }
  const precisionLabel = e => {
    const p = e.datePrecision || '';
    if (!p || p === 'year' || p === 'exact' || p === 'unspecified') return '';
    if (p === 'alternative_years_not_continuous') return 'Alternative dates, not a continuous span';
    if (/tradition/.test(p)) return 'Traditional chronology';
    return p.replace(/_/g,' ').replace(/^./, c => c.toUpperCase());
  };
  const entityDates = c => {
    if (c.periodScope === 'research-window' || c.periodScope === 'source-range') return window.AtlasDateScope?.label(c) ?? `${yearText(c.start)} – ${yearText(c.end)}`;
    if (c.dateLabel) return c.dateLabel;
    if (typeof c.dating === 'string' && /\d/.test(c.dating)) return c.dating;
    return (/approx|circa/.test(c.datePrecision || c.dating || '') ? 'c. ' : '') + yearText(c.start) + ' – ' + yearText(c.end);
  };
  function eventMeta(e) {
    const c = entities.get(e.civ);
    return [c?.name || e.originalRegion || e.region || 'Global history', e.kind, precisionLabel(e), e.confidence ? 'Editorial confidence: ' + String(e.confidence).toLowerCase() : ''].filter(Boolean).join(' · ');
  }
  function eventsView(r) {
    const listed = filteredEvents(r);
    if (!listed.length) return empty('No dated events match this period. Try another search or a wider time span.');
    const selectedIndex = listed.findIndex(e => e.key === state.event);
    if (selectedIndex >= ui.eventLimit) ui.eventLimit = Math.ceil((selectedIndex+1)/8)*8;
    return '<p class="events-intro">Select a dated heading to read its evidence. The dots use the same time scale; opening a record keeps this window in place.</p><div class="timeline-scroll" tabindex="0" aria-label="Scrollable event timeline"><div class="timeline-canvas events-canvas">' + axis(r) + '<div class="event-lanes">' + listed.slice(0,ui.eventLimit).map(e => '<button type="button" class="event-lane' + (e.key === state.event ? ' selected' : '') + '" data-event-key="' + safe(e.key) + '" aria-pressed="' + (e.key === state.event) + '"><span class="event-year">' + safe(researchEventDate(e)) + '</span><span class="event-copy"><strong>' + safe(e.title) + '</strong><small>' + safe(eventMeta(e)) + '</small></span><span class="event-track" aria-hidden="true"><i style="left:' + pct(e.year,r).toFixed(3) + '%;background:' + colour(entities.get(e.civ) || {region:e.region}) + '"></i>' + marker(r) + '</span><span class="event-open" aria-hidden="true">›</span></button>').join('') + '</div></div></div>' + moreButton('events',ui.eventLimit,listed.length,'milestones');
  }
  function entityButton(c) {
    return '<button type="button" data-civ="' + safe(c.id) + '" class="concurrent"><i style="background:' + colour(c) + '"></i><span><b>' + safe(c.name) + '</b><small>' + safe(c.region + ' · ' + entityDates(c)) + '</small></span><em aria-hidden="true">›</em></button>';
  }
  function cardEvent(e) {
    return '<button type="button" class="insight-event" data-event-key="' + safe(e.key) + '"><b>' + safe(researchEventDate(e)) + '</b><span><strong>' + safe(e.title) + '</strong><small>' + safe(precisionLabel(e) || e.kind || 'Milestone') + '</small></span><em aria-hidden="true">›</em></button>';
  }
  function sourcesFor(record,isEvent) {
    if (!record) return [];
    const result = [], seen = new Set();
    function add(url,title,kind) {
      const href = validURL(url); if (!href || seen.has(href)) return;
      seen.add(href); result.push({url:href,title:title || 'Read source',kind});
    }
    function ids(ids,batch) {
      // Legacy modern events share the older bibliography; modern entity records use the newer pack.
      const registry = isEvent && batch === '1500-2026' ? sourceRegistries['500-999'] : sourceRegistries[batch] || {};
      for (const id of ids || []) {const s = registry[id]; if (s) add(s.url,s.title || s.name,isEvent ? 'Record source' : 'Entity background');}
    }
    ids(record.sourceIds,record.origin || record.researchBatch);
    for (const research of record.additionalResearch || []) ids(research.sourceIds,research.batch);
    const explicit = [...(record.sourceUrls || []), ...(record.source_urls || []), record.sourceUrl, isEvent ? record.source : null].filter(Boolean);
    for (const url of explicit) add(url,'Read record source',isEvent ? 'Record source' : 'Entity background');
    if (!isEvent) add(record.source,record.name + ' — background reference','Entity background');
    if (isEvent && !result.length) {
      const c = entities.get(record.civ); if (c) add(c.source,c.name + ' — background reference','Background only; not a source for this claim');
    }
    return result;
  }
  function renderSources(record,isEvent) {
    const sources = sourcesFor(record,isEvent), explicit = sources.some(s => s.kind === 'Record source');
    $('sourceNumber').textContent = sources.length;
    $('selectedSources').innerHTML = '' + sources.slice(0,ui.sourceLimit).map(s => '<a class="reader-source" href="' + safe(s.url) + '" target="_blank" rel="noopener noreferrer"><strong>' + safe(s.title) + ' ↗</strong><small>' + safe(s.kind) + '</small></a>').join('') + (sources.length ? moreButton('sources',ui.sourceLimit,sources.length,'references') : '<p class="small-caption">No source link is attached.</p>');
    return sources.length;
  }
  function insight() {
    const selected = entities.get(state.selected), evidence = eventByKey.get(state.event);
    const now = all.filter(c => active(c,state.year) && pass(c));
    const concurrent = now.filter(c => c.id !== state.selected).sort((a,b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));
    const near = events.filter(e => Math.abs(e.year-state.year) <= 200 && eventPass(e)).sort((a,b) => Math.abs(a.year-state.year)-Math.abs(b.year-state.year) || a.year-b.year || a.title.localeCompare(b.title));
    $('insightYear').textContent = yearText(state.year);
    $('yearCaption').textContent = now.length + ' matching atlas ' + (now.length === 1 ? 'entry' : 'entries') + ' dated as active at this time.';
    $('activeNumber').textContent = concurrent.length;
    $('nearNumber').textContent = near.length;
    $('concurrentList').innerHTML = concurrent.length ? concurrent.slice(0,ui.concurrentLimit).map(entityButton).join('') + moreButton('concurrent',ui.concurrentLimit,concurrent.length,'entries') : '<p class="small-caption">No other matching societies in this selection.</p>';
    $('nearEvents').innerHTML = near.length ? near.slice(0,ui.nearLimit).map(cardEvent).join('') + moreButton('near',ui.nearLimit,near.length,'records') : '<p class="small-caption">No matching records within 200 years.</p>';
    const pinned = state.pinned.includes(state.selected);
    $('pinCompare').textContent = pinned ? '★ Unpin selected' : '☆ Pin selected';
    $('pinCompare').setAttribute('aria-pressed',String(pinned));
    $('pinCompare').disabled = !selected || Boolean(ui.cell);
    $('selectedNotes').innerHTML = '';
    $('readerRecords').innerHTML = '';
    $('sourcesDetails').hidden = Boolean(ui.cell);
    if (ui.cell) {
      const rows = cellMatches(ui.cell);
      $('readerLabel').textContent = 'ENTRIES IN THIS TIME WINDOW';
      $('selectedName').textContent = ui.cell.region;
      $('selectedLife').textContent = yearText(Math.ceil(ui.cell.lo)) + ' – ' + yearText(Math.ceil(ui.cell.hi)-1);
      $('selectedSummary').textContent = rows.length + ' matching ' + (rows.length === 1 ? 'entry overlaps' : 'entries overlap') + ' this window. Select a heading to read its history.';
      $('selectedActions').innerHTML = '<button type="button" data-action="close-cell">Return to selected entry</button>';
      $('readerRecords').innerHTML = rows.slice(0,ui.cellLimit).map(entityButton).join('') + moreButton('cell',ui.cellLimit,rows.length,'entries');
      return;
    }
    const n = renderSources(evidence || selected, Boolean(evidence));
    $('readerLabel').textContent = evidence ? 'SELECTED MILESTONE' : 'CURRENT SELECTION';
    $('selectedName').textContent = evidence?.title || selected?.name || 'Select an entry';
    $('selectedLife').textContent = evidence ? researchEventDate(evidence) + ' · ' + eventMeta(evidence) : selected ? entityDates(selected) + ' · ' + (selected.kind === 'empire' ? 'Empire' : 'Society') + ' · ' + selected.region : '';
    $('selectedSummary').textContent = evidence ? evidence.detail || '' : selected?.summary || '';
    const notes = [];
    if (evidence?.evidenceNote) notes.push(evidence.evidenceNote);
    if (evidence?.evidenceStatus) notes.push('Evidence status: ' + evidence.evidenceStatus.replace(/_/g,' '));
    if (!evidence && selected && !active(selected,state.year)) notes.push('This entry is not dated as active in the selected year.');
    if (!evidence && selected?.datePrecision && !selected?.dating) notes.push('Dating: ' + selected.datePrecision.replace(/_/g,' '));
    $('selectedNotes').innerHTML = notes.map(note => '<p>' + safe(note) + '</p>').join('') + (evidence ? (globalThis.AtlasHistoryStories?.forEvent(evidence)||'') : selected ? (globalThis.AtlasHistoryStories?.forSociety(selected)||'') : '');
    const sourceAction = '<button type="button" data-open-reader="sourcesDetails">Sources (' + n + ')</button>';
    $('selectedActions').innerHTML = evidence ? '<button type="button" data-action="event-date">Go to this date</button>' + (entities.has(evidence.civ) ? '<button type="button" data-civ="' + safe(evidence.civ) + '">Read ' + safe(entities.get(evidence.civ).name) + '</button>' : '') + sourceAction : selected ? '<button data-action="focus" type="button">Focus its period</button><button data-action="pin" type="button">' + (pinned ? '★ Unpin' : '☆ Pin') + '</button>' + sourceAction + (ui.lastCell ? '<button type="button" data-action="back-cell">Back to era entries</button>' : '') : '';
  }
  function renderPins() {
    const shelf=$('pinnedComparison');
    const pinned=state.pinned.map(id=>entities.get(id)).filter(Boolean);
    const sharedStart=pinned.length?Math.max(...pinned.map(c=>c.start)):null;
    const sharedEnd=pinned.length?Math.min(...pinned.map(c=>c.end)):null;
    const dateNote=pinned.length<2
      ? 'Pin at least two societies to compare them on their own shared ruler.'
      : sharedStart<=sharedEnd
        ? 'Recorded overlap: '+yearText(sharedStart)+' – '+yearText(sharedEnd)+'. Contemporaneity is not evidence of contact.'
        : 'No shared dated overlap among all pinned entries. Their time bands may still be compared.';
    $('pinnedCount').textContent=pinned.length+' / '+MAX_PINS+' pinned';
    $('pinSummary').textContent=dateNote;
    shelf.innerHTML=pinned.length
      ?pinned.map(c=>'<span class="pinned-chip"><button type="button" data-civ="'+safe(c.id)+'" class="'+(c.id===state.selected?'active':'')+'" aria-label="Select '+safe(c.name)+'">'+safe(c.name)+'</button><button type="button" class="remove-pin" data-unpin="'+safe(c.id)+'" aria-label="Unpin '+safe(c.name)+'">×</button></span>').join('')
      :'<span class="pinned-empty">Select a society and choose ☆ Pin selected to start comparing.</span>';
    const canFocus=pinned.length>=2;
    $('onlyPinned').disabled=!canFocus;
    $('onlyPinned').setAttribute('aria-pressed',String(state.focusPinned));
    $('onlyPinned').textContent=state.focusPinned?'★ Show all entries':'◎ Compare pinned only';
    $('fitPinned').disabled=!canFocus;
    $('clearPinned').disabled=pinned.length===0;
    const available=all.filter(c=>!state.pinned.includes(c.id)&&active(c,state.year)).sort((a,b)=>a.name.localeCompare(b.name));
    const pick=$('addCompareSociety');
    pick.innerHTML='<option value="">+ Add a contemporary society…</option>'+
      available.slice(0,120).map(c=>'<option value="'+safe(c.id)+'">'+safe(c.name)+' · '+safe(c.region)+'</option>').join('');
    pick.disabled=pinned.length>=MAX_PINS||!available.length;
    $('pinLimitNote').textContent=pinned.length>=MAX_PINS?'Five pinned entries maximum. Remove one to add another.':
      state.focusPinned?'Focused views show pinned entities and their explicitly linked events. Region, type and text filters are suspended until focus is turned off.':
      'Pin choices remain in this browser and the shareable URL. Pinned ranges are research-backed display intervals, not always complete lifespans.';
  }
  function fitPinned() {
    const entries=state.pinned.map(id=>entities.get(id)).filter(Boolean);
    if(entries.length<2)return;
    const earliest=within(Math.min(...entries.map(c=>c.start)),-9999,2026);
    const latest=within(Math.max(...entries.map(c=>c.end)),-9999,2026);
    const middle=Math.round((earliest+latest)/2);
    const span=spans.find(n=>n>=latest-earliest+2)||12026;
    change({year:middle,span,mode:'overlap',event:null});
  }
  function removePin(id) {
    if(!state.pinned.includes(id))return;
    state.pinned=state.pinned.filter(x=>x!==id);
    if(state.pinned.length<2)state.focusPinned=false;
    render();
  }

  // Cinematic comparison deck is a second reading surface for the same state
  // and historic intervals. Never creates inferred cross-civilisation links.
  function renderCinematicDeck(){
    const host=$('cinematicCompareDeck');if(!host)return;
    const r=range();
    const spotlight=state.selected==='abbasid' && state.pinned.length===0 ? ['song','byzantium'] : [];
    const suggestions=all.filter(c=>c.id!==state.selected&&active(c,state.year)).sort((a,b)=>{
      const ai=spotlight.indexOf(a.id),bi=spotlight.indexOf(b.id);
      if(ai!==bi)return (ai<0?999:ai)-(bi<0?999:bi);
      const selected=entities.get(state.selected);
      const ar=selected&&a.region!==selected.region?0:1,br=selected&&b.region!==selected.region?0:1;
      return ar-br||a.name.localeCompare(b.name);
    });
    const ordered=[...new Set([state.selected,...state.pinned,...suggestions.map(c=>c.id)])]
      .map(id=>entities.get(id)).filter(c=>c&&(c.id===state.selected||overlaps(c,r))).slice(0,3);
    const media=window.AtlasVisualAssets;
    host.innerHTML='<div class="cinematic-deck-heading"><span>PEOPLES · PLACES · CONNECTIONS</span><strong>'+safe(yearText(state.year))+'</strong></div>'+
      '<div class="cinematic-societies">'+ordered.map((c,i)=>{
        const hue=['gold','green','violet'][i],isSelected=c.id===state.selected;
        const artwork=media?.forSociety(c.id);
        const visual=artwork?media.html(artwork,'card'):'<div class="atlas-artwork atlas-artwork-empty" aria-label="Illustrated placeholder; no reviewed period image available"><div class="atlas-artwork-placeholder"><span aria-hidden="true">✧</span><small>Artwork being researched</small></div></div>';
        return '<article class="cinematic-society '+hue+(isSelected?' current':'')+'" data-entity="'+safe(c.id)+'"><div class="cinematic-society-top"><span class="cinematic-glyph" aria-hidden="true">'+(c.kind==='empire'?'♜':'✥')+'</span><span class="cinematic-region">'+safe(c.region)+'</span></div><div class="cinematic-society-main"><div class="cinematic-society-copy"><h2>'+safe(c.name)+'</h2><div class="cinematic-society-life">'+safe(entityDates(c))+'</div><p>'+safe((c.summary||c.description||'Explore its surviving historical evidence.').slice(0,230))+'</p></div>'+visual+'</div><div class="cinematic-card-actions"><button type="button" data-deck-civ="'+safe(c.id)+'" '+(isSelected?'aria-current="true"':'')+'>Explore history →</button><button type="button" data-deck-pin="'+safe(c.id)+'" aria-pressed="'+state.pinned.includes(c.id)+'">'+(state.pinned.includes(c.id)?'★ Pinned':'☆ Pin')+'</button></div></article>';
      }).join('')+'</div>'+
      '<div class="cinematic-flow-heading"><div><strong>Histories in parallel</strong><span>Recorded periods, positioned on one chronological scale</span></div><span>'+safe(yearText(r.start))+' — '+safe(yearText(r.end))+'</span></div>'+
      '<div class="cinematic-flow-tracks">'+ordered.map((c,i)=>{
        const visible=overlaps(c,r),x=pct(Math.max(c.start,r.start),r),end=pct(Math.min(c.end,r.end),r);
        return '<div class="cinematic-flow-track"><span title="'+safe(c.name)+'">'+safe(c.name)+'</span><div class="cinematic-flow-line">'+(visible?'<button type="button" data-deck-civ="'+safe(c.id)+'" aria-label="Explore '+safe(c.name)+'" style="--flow-x:'+x.toFixed(3)+'%;--flow-width:'+Math.max(.6,end-x).toFixed(3)+'%;--flow-colour:var(--flow-'+i+')" title="'+safe(entityDates(c))+'"></button>':'<small>Outside visible period</small>')+'<i style="left:'+pct(state.year,r)+'%" aria-hidden="true"></i></div></div>';
      }).join('')+'</div>'+
      '';
    media?.bindImages(host);
  }
  function render() {
    const focused = document.activeElement;
    const focusAttr = ['data-group','data-more','data-event-key','data-civ','data-action','data-order-up','data-order-down'].find(a => focused?.hasAttribute?.(a));
    const focusValue = focusAttr && focused.getAttribute(focusAttr);
    const r = range(), {rows,total} = chooseRows(r);
    const modes = {
      overlap:['OVERLAPPING HISTORIES','A world of overlapping stories','Bars share one time scale. Select an entry to read its history.'],
      eras:['BIG-PICTURE COMPARISON','Eight windows across time','Explore every entry in a broad time window.'],
      regions:['REGIONAL COMPARISON','Different regions, same time','Open a region and compare its entries on the shared ruler.'],
      events:['HISTORICAL MILESTONES','Important moments in context','Dated headings first, supporting evidence when you select one.']
    };
    $('compareWorkspace').classList.toggle('mode-eras',state.mode==='eras');
    $('compareWorkspace').classList.toggle('show-era-reader',Boolean(ui.cell||ui.userRead));
    $('modeKicker').textContent = modes[state.mode][0]; $('chartTitle').textContent = modes[state.mode][1]; $('chartSubtitle').textContent = modes[state.mode][2];
    $('resultsCount').textContent = state.mode === 'events' ? filteredEvents(r).length + ' milestones' : state.mode === 'eras' ? total + ' entries' : rows.length + ' of ' + total + ' entries';
    $('compareYear').value = yearText(state.year); $('compareSlider').value = state.year;
    for (const [id,value] of [['compareRegion',state.region],['compareType',state.type],['compareSpan',state.span],['compareLimit',state.limit]]) $(id).value = String(value);
    if (document.activeElement !== $('compareSearch')) $('compareSearch').value = state.search;
    $('compareLimit').disabled = state.mode === 'events' || state.mode === 'eras';
    $('activeFilters').textContent = (state.region === 'all' ? 'All regions' : state.region) + ' · ' + (state.type === 'all' ? 'Societies & empires' : state.type === 'empire' ? 'Empires' : 'Societies') + (state.search ? ' · “' + state.search + '”' : '');
    $('compareSearch').placeholder = state.mode === 'events' ? 'Search every event in this window…' : 'Search names, regions or summaries…';
    document.querySelectorAll('[data-mode]').forEach(b => { const is = b.dataset.mode === state.mode; b.classList.toggle('active',is); b.setAttribute('aria-selected',String(is)); b.tabIndex = is ? 0 : -1; });
    $('comparisonChart').innerHTML = state.mode === 'eras' ? eraView(r) : state.mode === 'regions' ? regionsView(r) : state.mode === 'events' ? eventsView(r) : overlapView(r);
    insight(); renderPins(); renderAtlasSummary(r); renderCinematicDeck(); updateLink();
    if (focusAttr && !focused.isConnected) {
      const replacement = [...document.querySelectorAll('[' + focusAttr + ']')].find(el => el.getAttribute(focusAttr) === focusValue);
      replacement?.focus({preventScroll:true});
    }
    window.AtlasNavigation?.refresh();
  }
  function revealEntity(id) { const c = entities.get(id); if (c) {ui.collapsed.delete('type:' + c.kind); ui.collapsed.delete('region:' + c.region);} }
  function readOnMobile() { if(state.mode==='eras'){$('selectedName').scrollIntoView({block:'center',behavior:'smooth'});return;}  if (window.matchMedia?.('(max-width: 900px)').matches) {$('selectedName').focus({preventScroll:true}); $('selectedName').scrollIntoView({block:'start',behavior:'auto'});} }
  function change(patch) {
    const scopeChanged = ['year','span','region','type','search'].some(k => k in patch && patch[k] !== state[k]);
    if (scopeChanged) {ui.eventLimit=8; ui.concurrentLimit=8; ui.nearLimit=8; ui.extraRows=0; ui.cell=null; ui.lastCell=null;}
    if (('mode' in patch || 'region' in patch || 'type' in patch || 'search' in patch) && !('event' in patch)) patch.event = null;
    if ('selected' in patch || 'event' in patch) {ui.sourceLimit=8; ui.cell=null;}
    Object.assign(state,patch);
    if(!('focusPinned' in patch)&&['region','type','search'].some(k=>k in patch))state.focusPinned=false;
    if (('region' in patch || 'type' in patch || 'search' in patch) && state.mode !== 'events') {
      const eligible = candidates(range());
      if (!eligible.some(c => c.id === state.selected)) state.selected = (eligible.find(c => active(c,state.year)) || eligible[0])?.id || null;
    }
    if ('selected' in patch) revealEntity(state.selected);
    if ('mode' in patch) {ui.cell=null; revealEntity(state.selected); for (const id of state.pinned) revealEntity(id);}
    render();
  }
  function moveYear(y) { if (Number.isFinite(y)) change({year:within(Math.round(y),-9999,2026),event:null}); }
  function choose(id) { ui.userRead=true; if (!entities.has(id)) return; change({selected:id,event:null}); readOnMobile(); }
  function togglePin() {
    const id = state.selected; if (!entities.has(id)) return;
    if(state.pinned.includes(id)) return removePin(id);
    if(state.pinned.length>=MAX_PINS) return;
    state.pinned=[...state.pinned,id];
    revealEntity(id); render();
  }
  function selectEvent(key) {
    const e = eventByKey.get(key); if (!e) return;
    change({selected:entities.has(e.civ) ? e.civ : state.selected,event:key});
    readOnMobile();
  }
  function navigateFromClick(target) {
    // Reordering is handled by the existing adapter and never selects a historical record.
    if (target.closest('[data-order-up],[data-order-down],[data-order-drag]')) return;
    const group = target.closest('[data-group]');
    if (group) {const key=group.dataset.group; ui.collapsed.has(key) ? ui.collapsed.delete(key) : ui.collapsed.add(key); render(); return;}
    const more = target.closest('[data-more]');
    if (more) {
      const key = more.dataset.more;
      const fields = {events:'eventLimit',concurrent:'concurrentLimit',near:'nearLimit',sources:'sourceLimit',cell:'cellLimit',rows:'extraRows'};
      if (fields[key]) {ui[fields[key]] += key === 'rows' ? 24 : 8; render();}
      return;
    }
    const era = target.closest('[data-era-slot]');
    if (era) {
      const r=range(),w=(r.end-r.start+1)/8,i=Number(era.dataset.eraSlot);
      ui.userRead=true;$('compareWorkspace').classList.toggle('show-era-reader',true);
      ui.cell={region:era.dataset.eraRegion,lo:r.start+i*w,hi:r.start+(i+1)*w}; ui.lastCell=ui.cell; ui.cellLimit=8;
      insight(); readOnMobile(); return;
    }
    const source = target.closest('[data-open-reader]');
    if (source) {const section=$(source.dataset.openReader); section.open=true; section.querySelector('summary').focus({preventScroll:true}); section.scrollIntoView({block:'nearest'}); return;}
    const unpin=target.closest('[data-unpin]');
    if(unpin){removePin(unpin.dataset.unpin);return;}
    const event = target.closest('[data-event-key]'); if (event) {selectEvent(event.dataset.eventKey); return;}
    const act = target.closest('[data-action]');
    if (act) {
      if(act.dataset.action==='reader'){ui.userRead=true;$('compareWorkspace').classList.toggle('show-era-reader',true);$('selectedName').scrollIntoView({block:'center'});}
      if (act.dataset.action === 'reset') reset();
      if (act.dataset.action === 'pin') togglePin();
      if (act.dataset.action === 'close-cell') {ui.cell=null; insight();}
      if (act.dataset.action === 'back-cell' && ui.lastCell) {ui.cell=ui.lastCell; insight();}
      if (act.dataset.action === 'event-date') {const e=eventByKey.get(state.event); if (e) change({year:within(e.year,-9999,2026),event:e.key});}
      if (act.dataset.action === 'focus') {
        const c=entities.get(state.selected);
        if (c) {const start=within(c.start,-9999,2026),end=within(c.end,-9999,2026); change({year:within(c.at??Math.round((start+end)/2),-9999,2026),span:spans.find(v => v >= end-start) || 12026});}
      }
      return;
    }
    const c=target.closest('[data-civ]'); if (c) choose(c.dataset.civ);
  }
  function reset() {
    Object.assign(state,{region:'all',type:'all',search:'',span:1000,limit:24,selected:'abbasid',year:1200,mode:'overlap',event:null,pinned:[],focusPinned:false});
    Object.assign(ui,{eventLimit:8,concurrentLimit:8,nearLimit:8,sourceLimit:8,cellLimit:8,extraRows:0,cell:null,lastCell:null}); ui.collapsed.clear();
    $('compareSearch').value=''; render();
  }
  function randomise() {
    const matching = candidates(range()), pool = matching.length >= 2 ? matching : all, c = pool[Math.floor(Math.random()*pool.length)];
    change({selected:c.id,year:within(Math.round(c.at??(c.start+c.end)/2),-9999,2026),region:'all',type:'all',search:'',event:null,mode:['overlap','eras','regions','events'][Math.floor(Math.random()*4)]});
  }
  function wire() {
    for (const region of regions) {const op=document.createElement('option'); op.value=region; op.textContent=region; $('compareRegion').append(op);}
    const tabs=[...document.querySelectorAll('[data-mode]')];
    tabs.forEach((b,i) => {
      b.addEventListener('click',() => change({mode:b.dataset.mode}));
      b.addEventListener('keydown',e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        e.preventDefault();
        const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
        tabs[next].focus(); change({mode:tabs[next].dataset.mode});
      });
    });
    $('compareRegion').addEventListener('change',e => change({region:e.target.value}));
    $('compareType').addEventListener('change',e => change({type:e.target.value}));
    $('compareSpan').addEventListener('change',e => change({span:Number(e.target.value)}));
    $('compareLimit').addEventListener('change',e => {ui.extraRows=0; change({limit:Number(e.target.value)});});
    $('compareSearch').addEventListener('input',e => change({search:e.target.value.toLowerCase().trim()}));
    $('compareSlider').addEventListener('input',e => moveYear(Number(e.target.value)));
    $('compareYear').addEventListener('change',e => {const y=parseDate(e.target.value); if(y===null) e.target.value=yearText(state.year); else moveYear(y);});
    $('compareYear').addEventListener('keydown',e => {if(e.key==='Enter') e.target.blur();});
    for (const id of ['compareBackCentury','insightBack']) $(id).addEventListener('click',() => moveYear(state.year-100));
    for (const id of ['compareForwardCentury','insightNext']) $(id).addEventListener('click',() => moveYear(state.year+100));
    $('zoomCompareIn').addEventListener('click',() => change({span:spans[Math.max(0,spans.indexOf(state.span)-1)]}));
    $('zoomCompareOut').addEventListener('click',() => change({span:spans[Math.min(spans.length-1,spans.indexOf(state.span)+1)]}));
    $('onlyPinned').addEventListener('click',()=>{
      if(state.pinned.length<2)return;
      const next=!state.focusPinned;
      change({focusPinned:next,...(next?{region:'all',type:'all',search:''}:{})});
    });
    $('fitPinned').addEventListener('click',fitPinned);
    $('clearPinned').addEventListener('click',()=>{state.pinned=[];state.focusPinned=false;render();});
    $('addCompareSociety').addEventListener('change',e=>{
      const id=e.target.value;
      if(entities.has(id) && !state.pinned.includes(id) && state.pinned.length<MAX_PINS){
        state.pinned.push(id);revealEntity(id);render();
      }
      e.target.value='';
    });
    $('cinematicCompareDeck')?.addEventListener('click',e=>{const b=e.target.closest('[data-deck-civ],[data-deck-pin]');if(!b)return;if(b.dataset.deckCiv)choose(b.dataset.deckCiv);else if(b.dataset.deckPin){change({selected:b.dataset.deckPin,event:null});togglePin();}});
    $('pinnedComparison').addEventListener('click',e=>navigateFromClick(e.target));
    $('pinCompare').addEventListener('click',togglePin); $('resetCompare').addEventListener('click',reset); $('randomComparison').addEventListener('click',randomise);
    $('comparisonChart').addEventListener('click',e => navigateFromClick(e.target));
    document.querySelector('.insight-body').addEventListener('click',e => navigateFromClick(e.target));
  }
  wire(); revealEntity(state.selected); render();
  window.HistoryCompare={state,render,change,moveYear,reset,yearText,parseDate};
})();
