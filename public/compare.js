/* World History Atlas Compare v0.5: all views derive from a single shared selection. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = CIVILISATIONS.filter(c => c.kind !== 'overview' && Number.isFinite(c.start) && Number.isFinite(c.end));
  const entities = new Map(all.map(c => [c.id, c]));
  const events = EVENTS.filter(e => entities.has(e.civ) && Number.isFinite(e.year));
  const researchEvents = typeof ATLAS_RESEARCH_EVENTS !== 'undefined' ? ATLAS_RESEARCH_EVENTS : [];
  const params = new URLSearchParams(location.search);
  const within = (x,min,max) => Math.min(max,Math.max(min,x));
  const parseDate = input => {
    const match = String(input).trim().replace(/,/g,'').match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
    if (!match) return null;
    const n = Number(match[1]);
    const era = (match[2] || '').toUpperCase();
    if (!Number.isFinite(n)) return null;
    if (era === 'BCE' || era === 'BC') return n > 0 ? 1 - n : null;
    if (era === 'CE' || era === 'AD') return n > 0 ? n : null;
    return n;
  };
  const yearText = y => y <= 0 ? `${Math.abs(y - 1).toLocaleString('en-AU')} BCE` : `${y.toLocaleString('en-AU')} CE`;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[x]));
  const regions = [...new Set(all.map(c => c.region))].sort();
  const regionColours = {'Europe':'#497ead','West Asia':'#9c668f','North Africa':'#b98a3c','Sub-Saharan Africa':'#8a9148','East Asia':'#b86f63','South Asia':'#a86b56','Southeast Asia':'#3b9293','Americas':'#5a9872','Oceania':'#6977a7'};
  const colour = c => regionColours[c.region] || '#678595';
  const initialYear = parseDate(params.get('year')) ?? 1200;
  const state = {
    year:within(initialYear,-9999,2026),
    mode:['overlap','eras','regions','events'].includes(params.get('mode'))?params.get('mode'):'overlap',
    selected:entities.has(params.get('civ'))?params.get('civ'):'abbasid',
    region:regions.includes(params.get('region'))?params.get('region'):'all',
    type:['all','empire','society'].includes(params.get('type'))?params.get('type'):'all',
    span:[500,1000,2000,4000,12026].includes(Number(params.get('span')))?Number(params.get('span')):1000,
    limit:[12,24,60,150].includes(Number(params.get('limit')))?Number(params.get('limit')):24,
    search:'', pinned:[], event:null
  };
  const active = (c,y) => c.start<=y && y<=c.end;
  const range = () => {
    if(state.span===12026)return {start:-9999,end:2026};
    const half=state.span/2;
    let start=Math.round(state.year-half),end=Math.round(state.year+half);
    if(start < -9999){end+=-9999-start;start=-9999;}
    if(end > 2026){start-=end-2026;end=2026;}
    return {start:Math.max(-9999,start),end:Math.min(2026,end)};
  };
  const pct = (v, r) => within((v-r.start)/(r.end-r.start)*100,0,100);
  const overlaps = (c,r) => c.end>=r.start && c.start<=r.end;
  const pass = c => (state.region==='all'||c.region===state.region) && (state.type==='all'||c.kind===state.type) && (!state.search||(`${c.name} ${c.region} ${c.summary}`).toLowerCase().includes(state.search));
  const candidates = r => all.filter(c=>pass(c)&&overlaps(c,r));
  function chooseRows(r){
    const group=candidates(r);
    group.sort((a,b)=> {
      const pinDiff=Number(state.pinned.includes(b.id))-Number(state.pinned.includes(a.id));if(pinDiff)return pinDiff;
      if(a.id===state.selected)return -1;if(b.id===state.selected)return 1;
      const concurrent=Number(active(b,state.year))-Number(active(a,state.year));if(concurrent)return concurrent;
      const overlapA=Math.max(0,Math.min(a.end,r.end)-Math.max(a.start,r.start));
      const overlapB=Math.max(0,Math.min(b.end,r.end)-Math.max(b.start,r.start));
      return overlapB-overlapA || a.region.localeCompare(b.region)||a.name.localeCompare(b.name);
    });
    if(window.HistoryRowOrder) window.HistoryRowOrder.sort(group);
    return {rows:group.slice(0,state.limit),total:group.length};
  }
  function qs(extra={}){
    const url = new URL('index.html', document.baseURI);url.searchParams.set('year',String(state.year));
    if(extra.civ || state.selected)url.searchParams.set('civ',extra.civ || state.selected);
    return url.toString();
  }
  function updateLink(){const u=new URL(location.href);
    for(const [k,v] of Object.entries({year:state.year,mode:state.mode,civ:state.selected,region:state.region,type:state.type,span:state.span,limit:state.limit}))u.searchParams.set(k,v);
    if (location.protocol==='http:' || location.protocol==='https:' || location.protocol==='file:') history.replaceState(null,'',u.pathname+u.search+u.hash);
    $('mapLink').href=qs();$('topMapLink').href=qs();
  }
  function marker(r){const p=pct(state.year,r);return state.year>=r.start&&state.year<=r.end ? `<span class="current-line" style="left:${p.toFixed(3)}%" aria-hidden="true"><b>${safe(yearText(state.year))}</b></span>`:'';}
  function axis(r){const n=5;const ticks=Array.from({length:n+1},(_,i)=>Math.round(r.start+(r.end-r.start)*i/n));return `<div class="axis"><div class="axis-label">${safe(yearText(r.start))} → ${safe(yearText(r.end))}</div><div class="axis-track">${ticks.map((y,i)=>`<span class="axis-tick" style="left:${i/n*100}%">${safe(yearText(y))}</span>`).join('')}${marker(r)}</div></div>`;}
  function bar(c,r){const left=pct(Math.max(c.start,r.start),r),right=pct(Math.min(c.end,r.end),r);const width=Math.max(0,right-left);
    const points=events.filter(e=>e.civ===c.id&&e.year>=r.start&&e.year<=r.end).slice(0,5);
    const ms=points.map((e,i)=>`<button type="button" class="milestone" data-event="${safe(e.title)}" data-civ="${safe(c.id)}" data-year="${e.year}" style="left:${pct(e.year,r).toFixed(3)}%" title="${safe(yearText(e.year)+' · '+e.title)}" aria-label="${safe(e.title)} ${safe(yearText(e.year))}"></button>`).join('');
    return `<div class="lane ${c.id===state.selected?'selected':''} ${active(c,state.year)?'contemporary':''}"><button type="button" class="lane-name" data-civ="${safe(c.id)}" title="${safe(c.name)}"><i style="background:${colour(c)}"></i><span><strong>${safe(c.name)}</strong><small>${safe(c.region)} · ${c.kind==='empire'?'Empire':'Society'}</small></span></button><div class="lane-track"><div class="lane-grid"></div><button type="button" data-civ="${safe(c.id)}" class="duration ${c.kind}" style="left:${left.toFixed(3)}%;width:${Math.max(width,.35).toFixed(3)}%;--bar:${colour(c)}" title="${safe(c.name+' · '+yearText(c.start)+' to '+yearText(c.end))}"><span>${safe(c.name)}</span></button>${ms}${marker(r)}</div><span class="lane-dates">${safe(yearText(c.start))}<br>${safe(yearText(c.end))}</span></div>`;
  }
  function sectionHeading(label, count){return `<div class="group-heading"><span>${safe(label)}</span><b>${count} ${count===1?'entry':'entries'}</b></div>`;}
  function empty(message){return `<div class="empty-state"><strong>Nothing charted in this range</strong><p>${safe(message)}</p><button type="button" data-action="reset">Reset comparison ↗</button></div>`;}
  function overlapView(r){const {rows,total}=chooseRows(r);if(!rows.length)return empty('Try a wider time span, another region, or reset the filters.');
    const societies=rows.filter(c=>c.kind==='society'),empires=rows.filter(c=>c.kind==='empire');
    return axis(r)+`<div class="comparison-lanes">${societies.length?sectionHeading('SOCIETIES',societies.length)+societies.map(c=>bar(c,r)).join(''):''}${empires.length?sectionHeading('EMPIRES',empires.length)+empires.map(c=>bar(c,r)).join(''):''}</div>`;
  }
  function regionsView(r){const {rows}=chooseRows(r);if(!rows.length)return empty('No historical entry matches the selected filters and dates.');
    const grouped=regions.filter(g=>rows.some(c=>c.region===g));
    return axis(r)+`<div class="comparison-lanes">${grouped.map(group=>{const groupRows=rows.filter(c=>c.region===group).sort((a,b)=>window.HistoryRowOrder?.compare(a,b) ?? a.start-b.start);return `<div class="regional-title"><i style="background:${regionColours[group]||'#739' }"></i>${safe(group)}<span>${groupRows.length}</span></div>${groupRows.map(c=>bar(c,r)).join('')}`;}).join('')}</div>`;
  }
  function eraView(r){const {rows}=chooseRows(r);if(!rows.length)return empty('No societies or empires overlap this period.');
    const slots=8,w=(r.end-r.start)/slots,groups=regions.filter(g=>rows.some(c=>c.region===g));
    const cells=groups.map(g=>`<div class="era-region"><div class="era-name"><i style="background:${regionColours[g]||'#739'}"></i>${safe(g)}</div>${Array.from({length:slots},(_,i)=>{const lo=r.start+i*w,hi=lo+w;const matches=rows.filter(c=>c.region===g && c.start<=hi && c.end>=lo);return `<div class="era-cell">${matches.slice(0,3).map(c=>`<button type="button" data-civ="${safe(c.id)}" class="era-entry ${c.kind}" style="--bar:${colour(c)}" title="${safe(c.name+' '+yearText(c.start)+' to '+yearText(c.end))}">${safe(c.name)}</button>`).join('')}${matches.length>3?`<small>+${matches.length-3} more</small>`:''}</div>`;}).join('')}</div>`).join('');
    return `<div class="era-explain">A broad look across eight equal time windows. An entry appears in every window intersecting its dated span; columns are not separate civilisations or exact cultural eras.</div><div class="era-grid-scroll"><div class="era-grid"><div class="era-colhead"><span>REGIONS</span>${Array.from({length:slots},(_,i)=>`<div style="--era:${i}"><b>${safe(yearText(Math.round(r.start+i*w)))}</b><small>to ${safe(yearText(Math.round(r.start+(i+1)*w)))}</small></div>`).join('')}</div>${cells}</div></div>`;
  }
  function researchEventDate(e){
    if(e.humanDate)return e.humanDate;
    const endExclusive=Number.isFinite(e.endExclusive)?e.endExclusive:e.year+1;
    const exact=endExclusive===e.year+1;
    if(!exact)return (e.datePrecision==='approximate'?'c. ':'')+yearText(e.year)+'–'+yearText(endExclusive-1);
    return (e.datePrecision==='approximate'?'c. ':'')+yearText(e.year);
  }
  function eventsView(r){
    // Native records plus every new research record. Imported native mirrors are omitted to prevent doubles.
    const combined=[...events.filter(e=>!e.researchId),...researchEvents];
    const filtered=combined.filter(e=>{
      if(e.year>r.end||(e.endExclusive||e.year+1)<=r.start)return false;
      const c=entities.get(e.civ);
      if(state.region!=='all'&&e.region!==state.region&&(c?.region!==state.region))return false;
      if(state.type!=='all'&&c?.kind!==state.type)return false;
      if(state.search&&!`${e.title} ${e.detail} ${e.kind} ${c?.name||''} ${e.region||''}`.toLowerCase().includes(state.search))return false;
      return true;
    });
    const selected=[...filtered].sort((a,b)=>Math.abs(a.year-state.year)-Math.abs(b.year-state.year)||a.year-b.year).slice(0,200);
    const listed=selected.sort((a,b)=>a.year-b.year);
    if(!listed.length)return empty('No dated research events match this time period. Try a wider range.');
    return axis(r)+`<div class="events-intro">${listed.length} of ${filtered.length} sourced or curated milestones in this window. Date windows and editorial confidence are shown; an event is not proof of contact with every contemporary society.</div><div class="event-lanes">${listed.map(e=>{
      const c=entities.get(e.civ),isResearch=Boolean(e.id&&researchEvents.some(x=>x.id===e.id));
      const attrs=isResearch?`data-research-event="${safe(e.id)}"`:`data-year="${e.year}" data-civ="${safe(c?.id||'')}" data-event="${safe(e.title)}"`;
      const label=researchEventDate(e);
      const color=c?colour(c):(regionColours[e.region]||'#967858');
      const confidence=e.confidence?` · ${safe(e.confidence)}`:'';
      return `<button type="button" class="event-lane" ${attrs} title="${safe(e.title)} · ${safe(label)}"><span class="event-year">${safe(label)}</span><span class="event-track"><i style="left:${pct(e.year,r).toFixed(3)}%;background:${color}"></i>${marker(r)}</span><span class="event-copy"><strong>${safe(e.title)}</strong><small>${safe(c?.name||e.originalRegion||e.region||'Global history')} · ${safe(e.kind)}${confidence}</small><span class="event-context">${safe(e.detail||'')}</span></span></button>`;
    }).join('')}</div>`;
  }
  function cardEvent(e){const c=entities.get(e.civ);return `<button type="button" class="insight-event" data-year="${e.year}" data-civ="${safe(c.id)}" data-event="${safe(e.title)}"><b>${safe(yearText(e.year))}</b><span><strong>${safe(e.title)}</strong><small>${safe(e.detail)}</small></span></button>`;}
  function insight(){const selected=entities.get(state.selected),now=all.filter(c=>active(c,state.year)&&(state.region==='all'||c.region===state.region)&&(state.type==='all'||c.kind===state.type));
    const concurrent=now.filter(c=>c.id!==state.selected).sort((a,b)=>a.region.localeCompare(b.region)||a.name.localeCompare(b.name)).slice(0,8);
    const near=events.filter(e=>Math.abs(e.year-state.year)<=200 && (state.region==='all'||entities.get(e.civ).region===state.region)).sort((a,b)=>Math.abs(a.year-state.year)-Math.abs(b.year-state.year)).slice(0,4);
    $('insightYear').textContent=yearText(state.year);
    $('yearCaption').textContent=`${now.length} curated ${now.length===1?'entity':'entities'} active at this time${state.region==='all'?' worldwide':' in '+state.region}.`;
    $('selectedName').textContent=selected?.name || 'Select an entry';
    $('selectedLife').textContent=selected?`${yearText(selected.start)} – ${yearText(selected.end)} · ${selected.kind==='empire'?'Empire':'Society'} · ${selected.region}`:'';
    $('selectedSummary').textContent=selected?`${selected.summary}${active(selected,state.year)?'':' This entry is not dated as active in the selected year.'}`:'';
    $('selectedActions').innerHTML=selected?`<a href="${safe(selected.source)}" target="_blank" rel="noopener noreferrer">Read source ↗</a><button data-action="focus" type="button">Focus its period</button><button data-action="pin" type="button">${state.pinned.includes(selected.id)?'★ Unpin':'☆ Pin'}</button>`:'';
    $('pinCompare').textContent=state.pinned.includes(state.selected)?'★ Unpin selected':'☆ Pin selected';$('pinCompare').setAttribute('aria-pressed',String(state.pinned.includes(state.selected)));
    $('activeNumber').textContent=String(now.length);
    $('concurrentList').innerHTML=concurrent.length?concurrent.map(c=>`<button type="button" data-civ="${safe(c.id)}" class="concurrent"><i style="background:${colour(c)}"></i><span><b>${safe(c.name)}</b><small>${safe(c.region)}</small></span><em>${safe(yearText(c.end))}</em></button>`).join(''):'<p class="small-caption">No other matching entry in this sample. That does not mean the region was uninhabited.</p>';
    $('nearEvents').innerHTML=near.length?near.map(cardEvent).join(''):'<p class="small-caption">No curated events within 200 years in the current region filter.</p>';
    // Selecting an unlinked research event shows the actual evidence instead of inventing a civilisation.
    const evidence=researchEvents.find(e=>e.id===state.event);
    if(evidence){
      $('selectedName').textContent=evidence.title;
      $('selectedLife').textContent=researchEventDate(evidence)+' · '+evidence.originalRegion+' · '+evidence.confidence;
      $('selectedSummary').textContent=evidence.detail+(evidence.datePrecision==='approximate'?' (Approximate dating.)':'');
      $('selectedActions').innerHTML=evidence.sourceUrl?'<a href="'+safe(evidence.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read the research source ↗</a>':'';
    }
  }
  function render(){const r=range(),{total}=chooseRows(r);
    const modes={overlap:['OVERLAPPING HISTORIES','A world of overlapping stories','Societies and empires share one chronological scale. Coloured bars show their approximate duration.'],eras:['BIG-PICTURE COMPARISON','Eight windows across time','Quickly see which societies and empires existed across different broad periods.'],regions:['REGIONAL COMPARISON','Different regions, same time','Track contemporaries by their geographic region.'],events:['HISTORICAL MILESTONES','Important moments in context','Compare dated events on the same time axis, across regions.']};
    $('modeKicker').textContent=modes[state.mode][0];$('chartTitle').textContent=modes[state.mode][1];$('chartSubtitle').textContent=modes[state.mode][2];
    $('resultsCount').textContent=`${total} ${total===1?'entry':'entries'}`;
    $('compareYear').value=yearText(state.year);$('compareSlider').value=state.year;
    for(const [id,value] of [['compareRegion',state.region],['compareType',state.type],['compareSpan',state.span],['compareLimit',state.limit]])$(id).value=String(value);
    document.querySelectorAll('[data-mode]').forEach(b=>{const is=b.dataset.mode===state.mode;b.classList.toggle('active',is);b.setAttribute('aria-selected',String(is));});
    const html=state.mode==='eras'?eraView(r):state.mode==='regions'?regionsView(r):state.mode==='events'?eventsView(r):overlapView(r);
    $('comparisonChart').innerHTML=html;
    insight();updateLink();
  }
  function change(patch){if(('mode' in patch||'region' in patch||'type' in patch||'search' in patch)&&!('event' in patch))patch.event=null;Object.assign(state,patch);if('region' in patch||'type' in patch||'search' in patch){const eligible=candidates(range());if(!eligible.some(c=>c.id===state.selected)){const nearest=eligible.find(c=>active(c,state.year))||eligible[0];state.selected=nearest?.id||null;}}render();}
  function moveYear(y){if(!Number.isFinite(y))return;change({year:within(Math.round(y),-9999,2026),event:null});}
  function choose(id){if(!entities.has(id))return;change({selected:id,event:null});}
  function togglePin(){const id=state.selected;if(!entities.has(id))return;state.pinned=state.pinned.includes(id)?state.pinned.filter(p=>p!==id):[...state.pinned.slice(-4),id];render();}
  function navigateFromClick(target){
    const researchLink=target.closest('[data-research-event]');
    if(researchLink){const e=researchEvents.find(x=>x.id===researchLink.dataset.researchEvent);if(e)change({year:e.year,selected:entities.has(e.civ)?e.civ:state.selected,event:e.id});return;}
    const act=target.closest('[data-action]');if(act){
    if(act.dataset.action==='reset'){reset();return;}if(act.dataset.action==='pin'){togglePin();return;}
    if(act.dataset.action==='focus'){const c=entities.get(state.selected);if(c){const start=within(c.start,-9999,2026),end=within(c.end,-9999,2026),span=end-start;change({year:within(c.at??Math.round((start+end)/2),-9999,2026),span:[500,1000,2000,4000,12026].find(v=>v>=span)||12026});}return;}
  }
  const e=target.closest('[data-event]');if(e){change({selected:e.dataset.civ,year:Number(e.dataset.year),event:e.dataset.event});return;}
  const c=target.closest('[data-civ]');if(c)choose(c.dataset.civ);
  }
  function reset(){state.region='all';state.type='all';state.search='';state.span=1000;state.limit=24;state.selected='abbasid';state.year=1200;state.mode='overlap';state.event=null;state.pinned=[];$('compareSearch').value='';render();}
  function randomise(){const r=range();let matching=candidates(r);if(matching.length<2)matching=all;const c=matching[Math.floor(Math.random()*matching.length)];const yr=within(Math.round(c.at??(c.start+c.end)/2),-9999,2026);change({selected:c.id,year:yr,region:'all',type:'all',search:'',mode:['overlap','eras','regions','events'][Math.floor(Math.random()*4)]});$('compareSearch').value='';}
  function wire(){for(const region of regions){const op=document.createElement('option');op.value=region;op.textContent=region;$('compareRegion').append(op);}
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>change({mode:b.dataset.mode})));
    $('compareRegion').addEventListener('change',e=>change({region:e.target.value}));
    $('compareType').addEventListener('change',e=>change({type:e.target.value}));
    $('compareSpan').addEventListener('change',e=>change({span:Number(e.target.value)}));
    $('compareLimit').addEventListener('change',e=>change({limit:Number(e.target.value)}));
    $('compareSearch').addEventListener('input',e=>change({search:e.target.value.toLowerCase().trim()}));
    $('compareSlider').addEventListener('input',e=>moveYear(Number(e.target.value)));
    $('compareYear').addEventListener('change',e=>{const y=parseDate(e.target.value);if(y===null){e.target.value=yearText(state.year);return;}moveYear(y);});
    $('compareYear').addEventListener('keydown',e=>{if(e.key==='Enter'){e.target.blur();}});
    for(const id of ['compareBackCentury','insightBack'])$(id).addEventListener('click',()=>moveYear(state.year-100));
    for(const id of ['compareForwardCentury','insightNext'])$(id).addEventListener('click',()=>moveYear(state.year+100));
    const spans=[500,1000,2000,4000,12026];
    $('zoomCompareIn').addEventListener('click',()=>change({span:spans[Math.max(0,spans.indexOf(state.span)-1)]}));
    $('zoomCompareOut').addEventListener('click',()=>change({span:spans[Math.min(spans.length-1,spans.indexOf(state.span)+1)]}));
    $('pinCompare').addEventListener('click',togglePin);
    $('resetCompare').addEventListener('click',reset);
    $('randomComparison').addEventListener('click',randomise);
    $('comparisonChart').addEventListener('click',e=>navigateFromClick(e.target));
    $('concurrentList').addEventListener('click',e=>navigateFromClick(e.target));
    $('nearEvents').addEventListener('click',e=>navigateFromClick(e.target));
    $('selectedActions').addEventListener('click',e=>navigateFromClick(e.target));
  }
  wire();render();
  window.HistoryCompare={state,render,change,moveYear,reset,yearText,parseDate};
})();