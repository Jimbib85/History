/* Compare: a shared chronological scale with compact, progressively disclosed readers. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = CIVILISATIONS.filter(c => c.kind !== 'overview' && Number.isFinite(c.start) && Number.isFinite(c.end));
  const entities = new Map(all.map(c => [c.id, c]));
  const nativeEvents = EVENTS.filter(e => entities.has(e.civ) && Number.isFinite(e.year));
  const researchEvents = [...(typeof ATLAS_RESEARCH_EVENTS !== 'undefined' ? ATLAS_RESEARCH_EVENTS : []), ...(typeof ATLAS_MEDIEVAL_EVENTS !== 'undefined' ? ATLAS_MEDIEVAL_EVENTS : []), ...(typeof ATLAS_MODERN_EVENTS !== 'undefined' ? ATLAS_MODERN_EVENTS : []), ...(typeof ATLAS_CLASSICAL_EVENTS !== 'undefined' ? ATLAS_CLASSICAL_EVENTS : [])];
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
  const regions = [...new Set(all.map(c => c.region))].sort();
  const regionColours = {'Europe':'#497ead','West Asia':'#9c668f','North Africa':'#b98a3c','Sub-Saharan Africa':'#8a9148','East Asia':'#b86f63','South Asia':'#a86b56','Southeast Asia':'#3b9293','Americas':'#5a9872','Oceania':'#6977a7'};
  const colour = c => regionColours[c?.region] || '#678595';
  const spans = [500, 1000, 2000, 4000, 12026];
  const state = {
    year:within(parseDate(params.get('year')) ?? 1200, -9999, 2026),
    mode:['overlap','eras','regions','events'].includes(params.get('mode')) ? params.get('mode') : 'overlap',
    selected:entities.has(params.get('civ')) ? params.get('civ') : 'abbasid',
    region:regions.includes(params.get('region')) ? params.get('region') : 'all',
    type:['all','empire','society'].includes(params.get('type')) ? params.get('type') : 'all',
    span:spans.includes(Number(params.get('span'))) ? Number(params.get('span')) : 1000,
    limit:[12,24,60,150,9999].includes(Number(params.get('limit'))) ? Number(params.get('limit')) : 24,
    search:(params.get('search') || '').trim().toLowerCase(), pinned:[],
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
  const candidates = r => all.filter(c => pass(c) && overlaps(c, r));
  const eventPass = e => {
    const linked = [e.civ, ...(e.societyIds || e.allSocietyIds || [])].map(id => entities.get(id)).filter(Boolean);
    if (state.region !== 'all' && e.region !== state.region && !linked.some(c => c.region === state.region)) return false;
    if (state.type !== 'all' && !linked.some(c => c.kind === state.type)) return false;
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
    const take = Math.min(group.length, state.limit + ui.extraRows);
    const required = new Set([state.selected, ...state.pinned]);
    const ids = new Set(group.slice(0, take).map(c => c.id));
    for (const c of group) if (required.has(c.id) && !ids.has(c.id)) {
      const replace = [...ids].reverse().find(id => !required.has(id));
      if (replace) ids.delete(replace);
      ids.add(c.id);
    }
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
    for (const [k,v] of Object.entries({year:state.year,mode:state.mode,civ:state.selected,region:state.region,type:state.type,span:state.span,limit:state.limit,search:state.search,event:state.event})) {
      if (v === null || v === '') u.searchParams.delete(k); else u.searchParams.set(k, v);
    }
    if (['http:','https:','file:'].includes(location.protocol)) history.replaceState(null, '', u.pathname + u.search + u.hash);
    $('mapLink').href = qs(); $('topMapLink').href = qs();
    document.querySelectorAll('[data-atlas-nav="map"],[data-atlas-nav="technology"]').forEach(a => {a.href = qs() + (a.dataset.atlasNav === 'technology' ? '#technology' : '');});
  }
  function marker(r) {
    return state.year >= r.start && state.year <= r.end ? '<span class="current-line" style="left:' + pct(state.year,r).toFixed(3) + '%" aria-hidden="true"></span>' : '';
  }
  function axis(r) {
    const ticks = Array.from({length:6}, (_,i) => Math.round(r.start + (r.end-r.start)*i/5));
    return '<div class="axis"><div class="axis-label">' + safe(yearText(r.start)) + ' → ' + safe(yearText(r.end)) + '</div><div class="axis-track">' + ticks.map((y,i) => '<span class="axis-tick" style="left:' + i/5*100 + '%">' + safe(yearText(y)) + '</span>').join('') + marker(r) + '</div></div>';
  }
  function bar(c,r) {
    const left = pct(Math.max(c.start,r.start),r), right = pct(Math.min(c.end,r.end),r);
    const points = events.filter(e => e.civ === c.id && e.year >= r.start && e.year <= r.end).slice(0,5);
    const ms = points.map(e => '<button type="button" class="milestone" data-event-key="' + safe(e.key) + '" style="left:' + pct(e.year,r).toFixed(3) + '%" title="' + safe(researchEventDate(e) + ' · ' + e.title) + '" aria-label="Read ' + safe(e.title + ', ' + researchEventDate(e)) + '"></button>').join('');
    return '<div class="lane ' + (c.id === state.selected ? 'selected ' : '') + (active(c,state.year) ? 'contemporary' : '') + '"><button type="button" class="lane-name" data-civ="' + safe(c.id) + '" aria-pressed="' + (c.id === state.selected) + '" title="' + safe(c.name) + '"><i style="background:' + colour(c) + '"></i><span><strong>' + safe(c.name) + (state.pinned.includes(c.id) ? ' ★' : '') + '</strong><small>' + safe(c.region) + ' · ' + (c.kind === 'empire' ? 'Empire' : 'Society') + '</small></span></button><div class="lane-track"><div class="lane-grid"></div><button type="button" data-civ="' + safe(c.id) + '" class="duration ' + c.kind + '" style="left:' + left.toFixed(3) + '%;width:' + Math.max(right-left,.35).toFixed(3) + '%;--bar:' + colour(c) + '" title="' + safe(c.name + ' · ' + entityDates(c)) + '"><span>' + safe(c.name) + '</span></button>' + ms + marker(r) + '</div><span class="lane-dates">' + safe(yearText(c.start)) + '<br>' + safe(yearText(c.end)) + '</span></div>';
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
  function overlapView(r) {
    const {rows,total} = chooseRows(r);
    if (!rows.length) return empty('Try a wider time span, another region, or reset the filters.');
    const sections = ['society','empire'].map(kind => {
      const found = rows.filter(c => c.kind === kind), key = 'type:' + kind, id = 'lanes-' + kind;
      return found.length ? groupHeading(kind === 'society' ? 'Societies' : 'Empires',found.length,key,id) + '<div id="' + id + '"' + (ui.collapsed.has(key) ? ' hidden' : '') + '>' + found.map(c => bar(c,r)).join('') + '</div>' : '';
    }).join('');
    return '<div class="timeline-scroll" tabindex="0" aria-label="Scrollable timeline"><div class="timeline-canvas">' + axis(r) + '<div class="comparison-lanes">' + sections + '</div></div></div>' + moreButton('rows',rows.length,total,'entries');
  }
  function regionsView(r) {
    const {rows,total} = chooseRows(r);
    if (!rows.length) return empty('No historical entry matches the selected filters and dates.');
    const sections = regions.filter(g => rows.some(c => c.region === g)).map((g,i) => {
      const found = rows.filter(c => c.region === g), key = 'region:' + g, id = 'lanes-region-' + i;
      return groupHeading(g,found.length,key,id) + '<div id="' + id + '"' + (ui.collapsed.has(key) ? ' hidden' : '') + '>' + found.map(c => bar(c,r)).join('') + '</div>';
    }).join('');
    return '<div class="timeline-scroll" tabindex="0" aria-label="Scrollable regional timeline"><div class="timeline-canvas">' + axis(r) + '<div class="comparison-lanes">' + sections + '</div></div></div>' + moreButton('rows',rows.length,total,'entries');
  }
  function cellMatches(cell) {
    return candidates(range()).filter(c => c.region === cell.region && c.start < cell.hi && c.end >= cell.lo).sort((a,b) => a.name.localeCompare(b.name));
  }
  function eraView(r) {
    const rows = candidates(r);
    if (!rows.length) return empty('No societies or empires overlap this period.');
    const slots = 8, w = (r.end-r.start+1)/slots, groups = regions.filter(g => rows.some(c => c.region === g));
    const cells = groups.map(g => '<div class="era-region"><div class="era-name"><i style="background:' + colour({region:g}) + '"></i>' + safe(g) + '</div>' + Array.from({length:slots},(_,i) => {
      const lo = r.start+i*w, hi = lo+w, matches = rows.filter(c => c.region === g && c.start < hi && c.end >= lo);
      return '<div class="era-cell">' + matches.slice(0,3).map(c => '<button type="button" data-civ="' + safe(c.id) + '" class="era-entry ' + c.kind + (c.id === state.selected ? ' selected' : '') + '" style="--bar:' + colour(c) + '" title="' + safe(c.name + ' · ' + entityDates(c)) + '">' + safe(c.name) + '</button>').join('') + (matches.length > 3 ? '<button type="button" class="era-more" data-era-region="' + safe(g) + '" data-era-slot="' + i + '">+' + (matches.length-3) + ' more <span class="sr-only">in ' + safe(g) + ', ' + safe(yearText(Math.ceil(lo)) + ' to ' + yearText(Math.ceil(hi)-1)) + '</span></button>' : '') + '</div>';
    }).join('') + '</div>').join('');
    return '<p class="era-explain">Eight equal time windows; entries repeat where their dated spans overlap a window. Open “more” to read every entry in a cell. All ' + rows.length + ' matching entries are included.</p><div class="era-grid-scroll" tabindex="0" aria-label="Scrollable era bands"><div class="era-grid"><div class="era-colhead"><span>REGIONS</span>' + Array.from({length:slots},(_,i) => '<div style="--era:' + i + '"><b>' + safe(yearText(Math.ceil(r.start+i*w))) + '</b><small>to ' + safe(yearText(Math.ceil(r.start+(i+1)*w)-1)) + '</small></div>').join('') + '</div>' + cells + '</div></div>';
  }
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
    return '<button type="button" data-civ="' + safe(c.id) + '" class="concurrent"><i style="background:' + colour(c) + '"></i><span><b>' + safe(c.name) + '</b><small>' + safe(c.region + ' · ' + entityDates(c)) + (c.periodScope === 'research-window' ? ' · Researched period only' : '') + '</small></span><em aria-hidden="true">›</em></button>';
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
    $('selectedSources').innerHTML = (isEvent && !explicit ? '<p class="source-caution">This atlas record has no claim-specific source link. Any background reference below should not be treated as verification of this event.</p>' : '<p class="small-caption">' + (isEvent ? 'References attached to this record. Editorial confidence is not a verification status.' : 'Background references for this entry; individual events have their own evidence.') + '</p>') + sources.slice(0,ui.sourceLimit).map(s => '<a class="reader-source" href="' + safe(s.url) + '" target="_blank" rel="noopener noreferrer"><strong>' + safe(s.title) + ' ↗</strong><small>' + safe(s.kind) + '</small></a>').join('') + (sources.length ? moreButton('sources',ui.sourceLimit,sources.length,'references') : '<p class="small-caption">No source link is attached.</p>');
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
    $('concurrentList').innerHTML = concurrent.length ? concurrent.slice(0,ui.concurrentLimit).map(entityButton).join('') + moreButton('concurrent',ui.concurrentLimit,concurrent.length,'entries') : '<p class="small-caption">No other matching entry in this sample. This does not mean the region was uninhabited.</p>';
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
    $('selectedLife').textContent = evidence ? researchEventDate(evidence) + ' · ' + eventMeta(evidence) : selected ? entityDates(selected) + ' · ' + (selected.kind === 'empire' ? 'Empire' : 'Society') + ' · ' + selected.region + (selected.periodScope === 'research-window' ? ' · Researched period only' : '') : '';
    $('selectedSummary').textContent = evidence ? evidence.detail || '' : selected?.summary || '';
    const notes = [];
    if (evidence?.evidenceNote) notes.push(evidence.evidenceNote);
    if (evidence?.evidenceStatus) notes.push('Evidence status: ' + evidence.evidenceStatus.replace(/_/g,' '));
    if (!evidence && selected && !active(selected,state.year)) notes.push('This entry is not dated as active in the selected year.');
    if (!evidence && selected?.datePrecision && !selected?.dating) notes.push('Dating: ' + selected.datePrecision.replace(/_/g,' '));
    $('selectedNotes').innerHTML = notes.map(note => '<p>' + safe(note) + '</p>').join('');
    const sourceAction = '<button type="button" data-open-reader="sourcesDetails">Sources (' + n + ')</button>';
    $('selectedActions').innerHTML = evidence ? '<button type="button" data-action="event-date">Go to this date</button>' + (entities.has(evidence.civ) ? '<button type="button" data-civ="' + safe(evidence.civ) + '">Read ' + safe(entities.get(evidence.civ).name) + '</button>' : '') + sourceAction : selected ? '<button data-action="focus" type="button">Focus its period</button><button data-action="pin" type="button">' + (pinned ? '★ Unpin' : '☆ Pin') + '</button>' + sourceAction + (ui.lastCell ? '<button type="button" data-action="back-cell">Back to era entries</button>' : '') : '';
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
    insight(); updateLink();
    if (focusAttr && !focused.isConnected) {
      const replacement = [...document.querySelectorAll('[' + focusAttr + ']')].find(el => el.getAttribute(focusAttr) === focusValue);
      replacement?.focus({preventScroll:true});
    }
    window.AtlasNavigation?.refresh();
  }
  function revealEntity(id) { const c = entities.get(id); if (c) {ui.collapsed.delete('type:' + c.kind); ui.collapsed.delete('region:' + c.region);} }
  function readOnMobile() { if (window.matchMedia?.('(max-width: 900px)').matches) {$('selectedName').focus({preventScroll:true}); $('selectedName').scrollIntoView({block:'start',behavior:'auto'});} }
  function change(patch) {
    const scopeChanged = ['year','span','region','type','search'].some(k => k in patch && patch[k] !== state[k]);
    if (scopeChanged) {ui.eventLimit=8; ui.concurrentLimit=8; ui.nearLimit=8; ui.extraRows=0; ui.cell=null; ui.lastCell=null;}
    if (('mode' in patch || 'region' in patch || 'type' in patch || 'search' in patch) && !('event' in patch)) patch.event = null;
    if ('selected' in patch || 'event' in patch) {ui.sourceLimit=8; ui.cell=null;}
    Object.assign(state,patch);
    if (('region' in patch || 'type' in patch || 'search' in patch) && state.mode !== 'events') {
      const eligible = candidates(range());
      if (!eligible.some(c => c.id === state.selected)) state.selected = (eligible.find(c => active(c,state.year)) || eligible[0])?.id || null;
    }
    if ('selected' in patch) revealEntity(state.selected);
    if ('mode' in patch) {ui.cell=null; revealEntity(state.selected); for (const id of state.pinned) revealEntity(id);}
    render();
  }
  function moveYear(y) { if (Number.isFinite(y)) change({year:within(Math.round(y),-9999,2026),event:null}); }
  function choose(id) { if (!entities.has(id)) return; change({selected:id,event:null}); readOnMobile(); }
  function togglePin() {
    const id = state.selected; if (!entities.has(id)) return;
    state.pinned = state.pinned.includes(id) ? state.pinned.filter(p => p !== id) : [...state.pinned.slice(-4),id];
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
      ui.cell={region:era.dataset.eraRegion,lo:r.start+i*w,hi:r.start+(i+1)*w}; ui.lastCell=ui.cell; ui.cellLimit=8;
      insight(); readOnMobile(); return;
    }
    const source = target.closest('[data-open-reader]');
    if (source) {const section=$(source.dataset.openReader); section.open=true; section.querySelector('summary').focus({preventScroll:true}); section.scrollIntoView({block:'nearest'}); return;}
    const event = target.closest('[data-event-key]'); if (event) {selectEvent(event.dataset.eventKey); return;}
    const act = target.closest('[data-action]');
    if (act) {
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
    Object.assign(state,{region:'all',type:'all',search:'',span:1000,limit:24,selected:'abbasid',year:1200,mode:'overlap',event:null,pinned:[]});
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
    $('pinCompare').addEventListener('click',togglePin); $('resetCompare').addEventListener('click',reset); $('randomComparison').addEventListener('click',randomise);
    $('comparisonChart').addEventListener('click',e => navigateFromClick(e.target));
    document.querySelector('.insight-body').addEventListener('click',e => navigateFromClick(e.target));
  }
  wire(); revealEntity(state.selected); render();
  window.HistoryCompare={state,render,change,moveYear,reset,yearText,parseDate};
})();
