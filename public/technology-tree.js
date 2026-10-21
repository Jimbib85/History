/* Compact technology explorer. Evidence identities are independent of the comparison society.
   Milestone dates and transmission links come from the existing curated data. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const year = value => value <= 0 ? `${Math.abs(value - 1).toLocaleString('en-AU')} BCE` : `${value.toLocaleString('en-AU')} CE`;
  const civs = new Map(CIVILISATIONS.filter(c => c.kind !== 'overview').map(c => [c.id,c]));
  const technologies = new Map(TECHNOLOGIES.map(t => [t.id,t]));
  const dialog = $('technologyDialog'), tree = $('technologyBranches'), details = $('technologyDetails'), select = $('technologyCivilisation'), search = $('technologySearch');
  if (!dialog || !tree || !details || !select) return;
  const BATCH = 8;
  const state = {tech:'paper',civ:'rome',view:'timeline',record:null,search:'',branches:new Set(['printing']),branchLimits:{},evidenceLimit:BATCH,timelineLimit:BATCH,mapLimit:BATCH,mapCiv:null,allEvidenceOpen:false,connectionsOpen:false};
  let opener;
  const kind = {
    independent:{label:'Independent development',colour:'#4f806c'},
    early:{label:'Early evidence',colour:'#a17848'},
    attested:{label:'Documented use',colour:'#8f8a7c'},
    adopted:{label:'Adoption / transmission',colour:'#507f9f'},
    developed:{label:'Development / refinement',colour:'#ad7950'}
  };
  const tag = status => kind[status] ?? kind.attested;
  const date = record => record.dateLabel || year(record.year);
  const project = c => ({x:(Number(c.lon)+180)/360*1200,y:(88-Number(c.lat))/176*590});
  // Imported research IDs remain stable. Starter records use their original, unsorted index.
  const recordsFor = t => t.appearances.map((a,index) => ({...a,key:`${t.id}:${a.researchId || a.id || index}`})).sort((a,b) => a.year-b.year || a.key.localeCompare(b.key));
  const pathwaysFor = t => (typeof TECH_PATHWAYS !== 'undefined' ? TECH_PATHWAYS : []).filter(l => l.tech===t.id);
  const recordText = a => `${civs.get(a.civ)?.name || ''} ${date(a)} ${a.label || ''} ${a.note || ''} ${a.sourceStatus || ''}`.toLocaleLowerCase();
  const terms = () => state.search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = (value,words=terms()) => words.every(word => value.toLocaleLowerCase().includes(word));
  const matchingRecords = t => {
    const words=terms(), heading=`${t.name} ${t.description} ${TECH_BRANCHES.find(b=>b.id===t.branch)?.name || ''}`;
    return recordsFor(t).filter(a => matches(`${heading} ${recordText(a)}`,words));
  };
  const matchesTechnology = t => matches(`${t.name} ${t.description} ${TECH_BRANCHES.find(b=>b.id===t.branch)?.name || ''} ${t.appearances.map(recordText).join(' ')}`);
  const precision = a => a.precision ? String(a.precision).replaceAll('_',' ') : '';
  function chooseInitialRecord(){
    const records=recordsFor(technologies.get(state.tech));
    const chosen=records.find(a=>a.civ===state.civ) || records[0];
    state.record=chosen?.key || null;state.mapCiv=chosen?.civ || null;
  }
  function ensureRecord(){
    const records=recordsFor(technologies.get(state.tech));
    if(!records.some(a=>a.key===state.record))chooseInitialRecord();
    return records.find(a=>a.key===state.record);
  }
  function focusWithin(container,attribute,value){
    const element=[...(container.querySelectorAll?.(`[${attribute}]`) || [])].find(node=>node.getAttribute(attribute)===String(value));
    element?.focus?.({preventScroll:true});
  }
  function showDetailStart(){
    details.scrollTo?.({top:0,behavior:'auto'});
    if(window.matchMedia?.('(max-width: 760px)')?.matches)details.scrollIntoView?.({block:'start',behavior:'auto'});
  }
  function selectTechnology(id){
    if(!technologies.has(id))return;
    state.tech=id;state.branches.add(technologies.get(id).branch);
    state.evidenceLimit=BATCH;state.timelineLimit=BATCH;state.mapLimit=BATCH;
    state.allEvidenceOpen=Boolean(state.search);state.connectionsOpen=false;chooseInitialRecord();
    const filtered=matchingRecords(technologies.get(id));
    if(state.search && filtered.length && !filtered.some(a=>a.key===state.record)){state.record=filtered[0].key;state.mapCiv=filtered[0].civ;}
    draw();focusWithin(tree,'data-tech',id);showDetailStart();
  }
  function renderTree(){
    const found=TECHNOLOGIES.filter(matchesTechnology), selected=technologies.get(state.tech);
    const filterSummary=state.search ? `<div class="tech-search-result" role="status">${found.length} matching technologies <button type="button" data-tech-clear>Clear search</button></div>${!found.some(t=>t.id===state.tech)?`<p class="tech-selected-note">Still reading ${esc(selected.name)}. Clear the search to find it in its family.</p>`:''}` : '';
    tree.innerHTML=filterSummary+TECH_BRANCHES.map(branch=>{
      const topics=found.filter(t=>t.branch===branch.id),limit=state.branchLimits[branch.id] || BATCH;
      const visible=topics.slice(0,limit),selectedTopic=topics.find(t=>t.id===state.tech);
      if(selectedTopic&&!visible.includes(selectedTopic))visible.push(selectedTopic);
      const open=state.search ? topics.length>0 : state.branches.has(branch.id);
      return `<details class="tech-branch" data-branch="${esc(branch.id)}" ${open?'open':''}><summary class="tech-branch-head"><span class="tech-branch-icon" aria-hidden="true">${esc(branch.icon)}</span><span class="tech-branch-title">${esc(branch.name)}</span><span class="tech-count" aria-label="${topics.length} technologies">${topics.length}</span><span class="tech-chevron" aria-hidden="true">›</span></summary><p class="tech-branch-intro">${esc(branch.intro)}</p><div class="tech-nodes">${visible.map(t=>{
        const local=t.appearances.filter(a=>a.civ===state.civ);
        return `<button class="tech-node ${state.tech===t.id?'selected':''} ${local.length?'documented':''}" type="button" data-tech="${esc(t.id)}" aria-pressed="${state.tech===t.id}"><span class="tech-node-copy"><strong>${esc(t.name)}</strong><small>${t.appearances.length} evidence ${t.appearances.length===1?'record':'records'}${local.length?` · ${local.length} for ${esc(civs.get(state.civ)?.short || civs.get(state.civ)?.name)}`:''}</small></span><span class="tech-node-arrow" aria-hidden="true">›</span></button>`;
      }).join('') || '<p class="tech-empty">No matching technologies in this family.</p>'}</div>${topics.length>visible.length?`<button type="button" class="tech-more" data-branch-more="${esc(branch.id)}">Show ${Math.min(BATCH,topics.length-visible.length)} more <span>${topics.length-visible.length} remaining</span></button>`:''}</details>`;
    }).join('');
  }
  function timeline(t,records){
    if(!records.length)return '<p class="tech-empty">No dated evidence is available for this technology.</p>';
    const min=records[0].year,max=records[records.length-1].year,span=max-min;
    const visible=records.slice(0,state.timelineLimit),selected=records.find(a=>a.key===state.record);
    if(selected&&!visible.includes(selected))visible.push(selected);
    return `<section class="tviz" aria-label="Shared chronological scale"><div class="tviz-scale"><span>${year(min)}</span><span>Same scale across societies</span><span>${year(max)}</span></div>${visible.map(a=>{
      const society=civs.get(a.civ),meta=tag(a.status),pos=span?Math.max(1,Math.min(99,((a.year-min)/span)*100)):50;
      return `<button type="button" class="tviz-row ${state.record===a.key?'chosen':''}" data-record="${esc(a.key)}" aria-pressed="${state.record===a.key}" aria-label="Read ${esc(a.label)}, ${esc(society?.name)}, ${esc(date(a))}"><span class="tviz-name">${esc(society?.name)}<small>${esc(a.label)}</small></span><span class="tviz-track"><i style="left:${pos.toFixed(2)}%;background:${meta.colour}"></i></span><span class="tviz-date">${esc(date(a))}</span></button>`;
    }).join('')}${records.length>visible.length?`<button class="tech-more" type="button" data-timeline-more>Show ${Math.min(BATCH,records.length-visible.length)} more milestones <span>${records.length-visible.length} remaining</span></button>`:''}<p class="tviz-count">${visible.length} of ${records.length} evidence records shown. The date scale stays fixed.</p></section>`;
  }
  function compactRecord(record,extraClass=''){
    return `<button type="button" class="tech-evidence-choice ${state.record===record.key?'chosen':''} ${extraClass}" data-record="${esc(record.key)}" aria-pressed="${state.record===record.key}"><span class="tech-evidence-date">${esc(date(record))}</span><span class="tech-evidence-copy"><strong>${esc(record.label)}</strong><small>${esc(civs.get(record.civ)?.name)} · ${esc(tag(record.status).label)}${record.sourceStatus?` · ${esc(record.sourceStatus.replaceAll('_',' '))}`:''}${precision(record)?` · ${esc(precision(record))}`:''}</small></span><span aria-hidden="true">›</span></button>`;
  }
  function mapGraphic(t,records){
    const edges=pathwaysFor(t),locations=new Map();
    records.forEach(a=>{const c=civs.get(a.civ);if(c&&Number.isFinite(c.lon)&&Number.isFinite(c.lat)){if(!locations.has(a.civ))locations.set(a.civ,[]);locations.get(a.civ).push(a);}});
    const arrows=edges.map(edge=>{
      const a=civs.get(edge.from),b=civs.get(edge.to);
      if(!a||!b||!Number.isFinite(a.lon)||!Number.isFinite(a.lat)||!Number.isFinite(b.lon)||!Number.isFinite(b.lat))return '';
      const p=project(a),q=project(b),dx=q.x-p.x,dy=q.y-p.y,bend=Math.max(12,Math.min(65,Math.hypot(dx,dy)*.11));
      const mx=(p.x+q.x)/2-dy/(Math.hypot(dx,dy)||1)*bend,my=(p.y+q.y)/2+dx/(Math.hypot(dx,dy)||1)*bend;
      return `<path class="tviz-route" d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}" stroke-dasharray="${edge.type==='continuity'?'8 6':'5 5'}" marker-end="url(#techArrow)"><title>${esc(edge.label)}: schematic connection, not a mapped itinerary</title></path>`;
    }).join('');
    const points=[...locations].map(([cid,local])=>{
      const c=civs.get(cid),p=project(c),chosen=cid===state.mapCiv,record=local.find(a=>a.key===state.record)||local[0],metadata=tag(record.status);
      return `<g class="tviz-pin ${chosen?'chosen':''}" tabindex="0" role="button" data-location="${esc(cid)}" aria-label="Browse ${local.length} evidence ${local.length===1?'record':'records'} from ${esc(c.name)}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${chosen?16:12}" fill="${metadata.colour}"/><text x="${p.x.toFixed(1)}" y="${(p.y-21).toFixed(1)}" text-anchor="middle">${esc(c.short||c.name)}${local.length>1?` (${local.length})`:''}</text><title>${esc(c.name)} · ${local.length} evidence records; select a dated milestone below the map</title></g>`;
    }).join('');
    const local=locations.get(state.mapCiv)||[],visible=local.slice(0,state.mapLimit),selected=local.find(a=>a.key===state.record);
    if(selected&&!visible.includes(selected))visible.push(selected);
    const listing=edges.length?edges.map(edge=>`<div class="tviz-connection"><strong>${esc(civs.get(edge.from)?.name)} → ${esc(civs.get(edge.to)?.name)}</strong><span>${edge.type==='continuity'?'Regional continuity':'Regional transmission'} · illustrative, not a precise route</span><p>${esc(edge.detail)}</p><a href="${esc(edge.source)}" target="_blank" rel="noopener noreferrer">Connection source ↗</a></div>`).join(''):'<p class="tviz-empty">No historically supported transmission link has been curated for these examples yet. Dots show evidence in different places, not a proven chain of invention.</p>';
    return `<section class="tviz-world" aria-label="Locations of technology milestones"><svg viewBox="0 0 1200 590" role="group" aria-label="Modern world geography with approximate historic reference locations"><defs><marker id="techArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#9b7c56"/></marker></defs><image href="world.svg" x="0" y="0" width="1200" height="590"></image>${arrows}${points}</svg>${locations.size?'':'<p class="tviz-empty">No reference locations are available for these records. Their dates and sources remain available in Time and Browse all evidence.</p>'}<p class="tviz-map-note">Modern basemap, representative locations. Dashed lines are conceptual links, <strong>not historical travel routes</strong>. Choose a place, then its dated evidence below.</p><div class="tviz-location-choices" role="group" aria-label="Evidence locations">${[...locations].map(([cid,entries])=>`<button type="button" data-location="${esc(cid)}" aria-pressed="${state.mapCiv===cid}">${esc(civs.get(cid)?.short||civs.get(cid)?.name)} <span>${entries.length}</span></button>`).join('')}</div>${local.length?`<div class="tviz-map-records"><h3>${esc(civs.get(state.mapCiv)?.name)} <span>${local.length} evidence records</span></h3>${visible.map(a=>compactRecord(a,'map-evidence-choice')).join('')}${local.length>visible.length?`<button type="button" class="tech-more" data-map-more>Show ${Math.min(BATCH,local.length-visible.length)} more <span>${local.length-visible.length} remaining</span></button>`:''}</div>`:''}<details class="tviz-connections" data-tech-disclosure="connections" ${state.connectionsOpen?'open':''}><summary>Curated connections <span class="tech-count">${edges.length}</span><span class="tech-chevron" aria-hidden="true">›</span></summary>${listing}</details></section>`;
  }
  function recordCard(record){
    if(!record)return '<p class="tech-empty">No dated evidence is available for this technology.</p>';
    const c=civs.get(record.civ),info=tag(record.status);
    return `<article class="tech-record selected" aria-labelledby="selectedTechEvidence"><div class="tech-record-head"><span>${esc(c?.name)}</span><strong>${esc(date(record))}</strong></div><h3 id="selectedTechEvidence" tabindex="-1">${esc(record.label)}</h3><div class="tech-kind"><span class="tech-status-dot" style="background:${info.colour}"></span>${esc(info.label)}${record.sourceStatus?` · ${esc(record.sourceStatus.replaceAll('_',' '))}`:''}</div>${precision(record)?`<p class="tech-precision">Date precision: ${esc(precision(record))}.</p>`:''}<p>${esc(record.note)}</p>${record.confidence?`<p class="tech-confidence">Research confidence: ${esc(record.confidence)}.</p>`:''}<div class="tech-record-actions"><a href="${esc(record.source)}" target="_blank" rel="noopener noreferrer">Historical source ↗</a><button type="button" data-tech-jump="${esc(record.civ)}" data-tech-year="${Number(record.year)}">Explore this year ↗</button></div></article>`;
  }
  function renderDetail(){
    const t=technologies.get(state.tech),society=civs.get(state.civ),records=recordsFor(t),chosen=ensureRecord(),local=records.filter(a=>a.civ===state.civ),filtered=matchingRecords(t);
    const visible=filtered.slice(0,state.evidenceLimit);
    details.innerHTML=`<section class="tech-intro"><div class="tech-kicker">${esc(TECH_BRANCHES.find(b=>b.id===t.branch).name)} · ${esc(t.era)}</div><h2>${esc(t.name)}</h2><p>${esc(t.description)}</p></section>
      <p class="tech-current"><strong>Comparing from ${esc(society?.name)}.</strong> ${local.length?`${local.length} evidence ${local.length===1?'record':'records'} in this atlas.`:'No entry in this sample. This does not mean the technology was unknown here.'}</p>
      <div class="tviz-head"><div><strong>Across societies</strong><span>${records.length} evidence records · ${new Set(records.map(a=>a.source)).size} source links</span></div><div class="tviz-modes" role="group" aria-label="Technology comparison view"><button type="button" data-viz="timeline" aria-pressed="${state.view==='timeline'}" class="${state.view==='timeline'?'active':''}">◫ Time</button><button type="button" data-viz="map" aria-pressed="${state.view==='map'}" class="${state.view==='map'?'active':''}">◎ World map</button></div></div>
      <div class="tviz-legend">${Object.values(kind).map(k=>`<span><i style="background:${k.colour}"></i>${esc(k.label)}</span>`).join('')}</div><p class="tech-plot-note">Dates may be approximate. A record covering a period is plotted at its midpoint, not an invention date. The full date label stays with its evidence.</p>
      ${state.view==='timeline'?timeline(t,records):mapGraphic(t,records)}
      <section class="tech-evidence-list"><div class="tech-evidence-heading"><h3>Selected evidence</h3><span>One milestone at a time</span></div>${recordCard(chosen)}<details class="tech-all-evidence" data-tech-disclosure="evidence" ${state.allEvidenceOpen?'open':''}><summary>Browse all evidence <span class="tech-count">${records.length}</span><span class="tech-chevron" aria-hidden="true">›</span></summary>${state.search?`<p class="tech-evidence-filter">${filtered.length} records match “${esc(state.search)}”. <button type="button" data-tech-clear>Clear search</button></p>`:''}<div class="tech-evidence-choices">${visible.map(a=>compactRecord(a)).join('')||'<p class="tech-empty">No evidence matches this search. Clear it to browse all records.</p>'}</div>${filtered.length>visible.length?`<button type="button" class="tech-more" data-evidence-more>Show ${Math.min(BATCH,filtered.length-visible.length)} more records <span>${filtered.length-visible.length} remaining</span></button>`:''}<p class="tviz-count">${visible.length} of ${filtered.length} ${state.search?'matching ':''}records shown.</p></details></section>
      <p class="tech-disclaimer">These are selected evidence points, not definitive invention dates. Independently developed technologies are not proof of cultural isolation. Chronology alone cannot establish contact or influence.</p>`;
  }
  function draw(){ensureRecord();renderTree();renderDetail();}
  function selectRecord(key){
    const record=recordsFor(technologies.get(state.tech)).find(a=>a.key===key);if(!record)return;
    state.record=key;state.mapCiv=record.civ;renderDetail();
    const heading=details.querySelector?.('#selectedTechEvidence');
    heading?.focus?.({preventScroll:true});heading?.scrollIntoView?.({block:'nearest',behavior:'auto'});
  }
  function selectLocation(cid){
    if(!civs.has(cid))return;state.mapCiv=cid;state.mapLimit=BATCH;renderDetail();
    const choices=details.querySelector?.('.tviz-map-records');
    choices?.scrollIntoView?.({block:'nearest',behavior:'auto'});
    choices?.querySelector?.('button')?.focus?.({preventScroll:true});
  }
  function clearSearch(){state.search='';if(search)search.value='';state.branches.add(technologies.get(state.tech).branch);state.evidenceLimit=BATCH;draw();search?.focus?.();}
  function open(){
    opener=document.activeElement;
    const selected=window.WorldHistoryAtlas?.state?.civ;
    if(selected&&civs.has(selected)&&selected!==state.civ){state.civ=selected;chooseInitialRecord();}
    select.value=state.civ;state.branches.add(technologies.get(state.tech).branch);
    draw();if(!dialog.open)dialog.showModal();
  }
  select.innerHTML=[...civs.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  select.addEventListener('change',()=>{state.civ=select.value;state.evidenceLimit=BATCH;chooseInitialRecord();draw();});
  search?.addEventListener('input',()=>{
    state.search=search.value;state.evidenceLimit=BATCH;
    const filtered=matchingRecords(technologies.get(state.tech));
    if(state.search&&filtered.length&&!filtered.some(a=>a.key===state.record)){state.record=filtered[0].key;state.mapCiv=filtered[0].civ;}
    if(state.search)state.allEvidenceOpen=true;
    renderTree();renderDetail();
  });
  tree.addEventListener('toggle',e=>{
    const branch=e.target.dataset?.branch;if(!branch || tree.contains?.(e.target)===false)return;
    if(e.target.open)state.branches.add(branch);else state.branches.delete(branch);
  },true);
  tree.addEventListener('click',e=>{
    const target=e.target.closest('[data-tech]');if(target){selectTechnology(target.dataset.tech);return;}
    const more=e.target.closest('[data-branch-more]');if(more){const id=more.dataset.branchMore,previous=state.branchLimits[id]||BATCH;state.branchLimits[id]=previous+BATCH;renderTree();const branch=[...(tree.querySelectorAll?.('[data-branch]')||[])].find(node=>node.dataset.branch===id);branch?.querySelectorAll?.('[data-tech]')?.[previous]?.focus?.({preventScroll:true});return;}
    if(e.target.closest('[data-tech-clear]'))clearSearch();
  });
  details.addEventListener('toggle',e=>{
    if(details.contains?.(e.target)===false)return;
    const section=e.target.dataset?.techDisclosure;
    if(section==='evidence')state.allEvidenceOpen=e.target.open;
    if(section==='connections')state.connectionsOpen=e.target.open;
  },true);
  details.addEventListener('click',e=>{
    const mode=e.target.closest('[data-viz]');if(mode){state.view=mode.dataset.viz;renderDetail();focusWithin(details,'data-viz',state.view);return;}
    const record=e.target.closest('[data-record]');if(record){selectRecord(record.dataset.record);return;}
    const location=e.target.closest('[data-location]');if(location){selectLocation(location.dataset.location);return;}
    if(e.target.closest('[data-evidence-more]')){const previous=state.evidenceLimit;state.evidenceLimit+=BATCH;renderDetail();details.querySelectorAll?.('.tech-evidence-choices [data-record]')?.[previous]?.focus?.({preventScroll:true});return;}
    if(e.target.closest('[data-timeline-more]')){const previous=state.timelineLimit;state.timelineLimit+=BATCH;renderDetail();details.querySelectorAll?.('.tviz-row')?.[previous]?.focus?.({preventScroll:true});return;}
    if(e.target.closest('[data-map-more]')){const previous=state.mapLimit;state.mapLimit+=BATCH;renderDetail();details.querySelectorAll?.('.map-evidence-choice')?.[previous]?.focus?.({preventScroll:true});return;}
    if(e.target.closest('[data-tech-clear]')){clearSearch();return;}
    const jumped=e.target.closest('[data-tech-jump]');if(jumped){
      const api=window.WorldHistoryAtlas;
      if(api)api.go({civ:jumped.dataset.techJump,year:Number(jumped.dataset.techYear),region:'All regions',catalogue:'all',search:'',view:'actual'},{zoomReset:true});
      dialog.close();
    }
  });
  details.addEventListener('keydown',e=>{
    const location=e.target.closest('svg [data-location]');
    if(location&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectLocation(location.dataset.location);}
  });
  $('technologyButton').addEventListener('click',open);
  $('closeTechnology').addEventListener('click',()=>dialog.close());
  $('randomTechnology').addEventListener('click',()=>{
    const choices=TECHNOLOGIES.filter(t=>t.id!==state.tech);if(!choices.length)return;
    state.search='';if(search)search.value='';selectTechnology(choices[Math.floor(Math.random()*choices.length)].id);
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>opener?.focus?.({preventScroll:true}));
  window.WorldHistoryTechnology={open,state,technologies:TECHNOLOGIES,pathways:typeof TECH_PATHWAYS!=='undefined'?TECH_PATHWAYS:[]};
})();
