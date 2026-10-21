/* Expand-on-demand conflicts: hierarchy, source access, uncertainty and responsible discovery. */
(() => {
  'use strict';
  const D=typeof ATLAS_CONFLICTS_DATA!=='undefined'?ATLAS_CONFLICTS_DATA:null;
  const M=globalThis.HistoryConflictsModel;
  if(!D||!M)return;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url=v=>{try{const x=new URL(v);return x.protocol==='https:'||x.protocol==='http:'?x.href:null;}catch{return null;}};
  const names={individual:'Individual conflicts',battle:'Battles and sieges',context:'Conflict complexes and crises',phase:'Campaigns and phases',treaty:'Treaties and settlements',event:'Other historical events',civilian:'Civilian experience',archaeology:'Archaeological evidence',anecdote:'Stories and disputed claims',all:'All research records'};
  const icons={conflict:'⚔',battle:'⚔',campaign:'⚑',phase:'⚑',treaty:'⚖',event:'◎',civilian:'◉',archaeology:'◇',anecdote:'?'};
  const byId=new Map(D.records.map(row=>[row.id,row]));
  let state=M.safeFilters(location.search),current=[],sensitiveRequested=null;
  const pageSize=12;
  const sourceLinks=row=>row.sources.map(s=>{
    const href=url(s.url);
    return href?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(s.title||s.id)} ↗<small>${esc(s.access_status||'Access unknown')} · ${esc(s.limitations||'Consult the original evidence')}</small></a>`:'';
  }).join('');
  function directLink(row){
    const p=new URLSearchParams({record:row.id,kind:M.kindOf(row)});
    return 'conflicts.html?'+p.toString();
  }
  function detail(row){
    const ongoing=row.endStatus==='ONGOING'?'This record was ongoing at its research cutoff. The observed-through date is not an end date.':'';
    const unknown=row.endStatus==='UNKNOWN'?'The source does not establish an ending date.':'';
    const messages=[ongoing,unknown,...(row.notes||[])].filter(Boolean);
    const related=M.related(row,D.records),available=related.filter(r=>state.sensitive||!r.sensitive),hidden=related.length-available.length;
    const participants=row.participations||[],casualties=row.casualties||[];
    const yearLink=Number.isInteger(row.start)?`<a href="story.html?year=${row.start}&subject=conflict">Story timeline near ${esc(M.label(row.start))} ↗</a><a href="compare.html?year=${row.start}&mode=events">Compare this year ↗</a>`:'';
    return `<div class="details">
      <p>${esc(row.summary)}</p>
      <div class="tagline"><span class="tag">${esc((row.hierarchy||row.type).replaceAll('_',' '))}</span><span class="tag">${esc(row.confidence)} research confidence</span><span class="tag">${esc(row.review)} review status</span><span class="tag">${esc(row.datePrecision||'Date uncertain')}</span></div>
      ${messages.map(x=>`<p class="warning">${esc(x)}</p>`).join('')}
      <p><strong>Original source date:</strong> ${esc(row.dateText||'Not established')}</p>
      ${row.observedThrough?`<p><strong>Evidence observed through:</strong> ${esc(row.observedThrough)}</p>`:''}
      ${row.outcome?`<p><strong>Outcome described in research:</strong> ${esc(row.outcome)}</p>`:''}
      ${row.anecdoteStatus?`<p class="warning">Story status: ${esc(row.anecdoteStatus)}. Do not treat an unsupported tradition as a verified fact.</p>`:''}
      ${participants.length?`<h3 class="extra-title">Participants and roles</h3>${participants.map(p=>`<div class="entry"><strong>${esc(p.name)}</strong>${esc(p.role||'Role unknown')}<small>${esc(p.scope||'Involvement dates require separate evidence.')}</small></div>`).join('')}`:''}
      ${casualties.length?`<h3 class="extra-title">Scoped casualty observations — not additive</h3>${casualties.map(c=>`<div class="entry"><strong>${esc(c.title)}</strong>${c.estimate===null?'Estimate not established':esc(c.estimate)}<small>${esc(c.population_scope)} · ${esc(c.method)}</small></div>`).join('')}<p class="warning">Figures may overlap or describe different populations. Do not sum them into an unsupported total.</p>`:''}
      ${available.length?`<h3 class="extra-title">Explore connected evidence</h3><div class="related-records">${available.slice(0,12).map(r=>`<button type="button" data-focus-record="${esc(r.id)}"><span>${esc(r.title)}</span><small>${esc(M.label(r.start))} · ${esc(names[M.kindOf(r)]||r.type)}</small></button>`).join('')}</div>`:''}
      ${hidden&&!state.sensitive?`<p class="notes">${hidden} related record${hidden===1?' is':'s are'} hidden until you enable sensitive research.</p>`:''}
      <h3 class="extra-title">Sources and access limitations</h3><div class="sources">${sourceLinks(row)||'<p>No source URL supplied.</p>'}</div>
      <div class="record-actions">${yearLink}<a href="${esc(directLink(row))}" aria-label="Permalink to ${esc(row.title)}">Share this record ↗</a></div>
    </div>`;
  }
  function card(row){const active=row.id===state.record;
    return `<div class="card-row" id="record-${esc(row.id)}" data-record-id="${esc(row.id)}"><div class="date-col">${esc(M.label(row.start))}</div><details class="milestone" data-kind="${esc(row.type)}" ${active?'open':''}><summary><span class="icon-disc" aria-hidden="true">${esc(icons[row.type]||'◇')}</span><span class="summary-copy"><strong>${esc(row.title)}</strong><small>${esc(row.region)} · ${esc(row.dateText||'Uncertain date')}${row.review==='NEEDS_REVIEW'?' · Needs review':''}</small></span><span class="plus" aria-hidden="true">+</span></summary>${active?detail(row):'<div class="details-placeholder">Open to see participants, sources and related events.</div>'}</details></div>`;
  }
  // Lazily populate collapsed cards so full evidence markup is only drawn when asked for.
  function attachLazyDetails(){for(const el of $('results').querySelectorAll('.milestone'))el.addEventListener('toggle',()=>{
      if(!el.open)return;
      const id=el.closest('[data-record-id]')?.dataset.recordId,row=byId.get(id);
      if(!row)return;
      const placeholder=el.querySelector('.details-placeholder');
      if(placeholder){placeholder.outerHTML=detail(row);}
    });}
  function setURL(push=false){const p=new URLSearchParams();if(state.kind!=='individual')p.set('kind',state.kind);if(state.era!=='all')p.set('era',state.era);if(state.search)p.set('q',state.search);if(state.record)p.set('record',state.record);
    const loc=location.pathname+(p.size?'?'+p.toString():'');if(push)history.pushState(null,'',loc);else history.replaceState(null,'',loc);
  }
  function render(){
    current=M.sortRecords(D.records.filter(r=>M.matches(r,state)));
    $('kind').value=state.kind;$('era').value=state.era;$('sensitive').checked=state.sensitive;
    if(document.activeElement!==$('query'))$('query').value=state.search;
    $('resultsTitle').textContent=names[state.kind];$('count').textContent=current.length+' matching record'+(current.length===1?'':'s');
    const selectedIndex=current.findIndex(r=>r.id===state.record);
    if(selectedIndex>=0)state.page=Math.max(state.page,Math.floor(selectedIndex/pageSize));
    const visible=current.slice(0,(state.page+1)*pageSize);
    $('results').innerHTML=visible.length?visible.map(card).join(''):'<div class="empty">No records match these filters. Unknown dates are kept in the Undated group, not assigned a made-up year.</div>';
    $('more').hidden=visible.length>=current.length;$('more').textContent='Show '+Math.min(pageSize,current.length-visible.length)+' more';
    attachLazyDetails();
    const blocked=state.record&&byId.get(state.record)?.sensitive&&!state.sensitive;
    $('conflictNotice').hidden=!blocked;
    $('conflictNotice').textContent=blocked?'This record includes sensitive or provisional material. Enable the optional research control to view it.':'';
  }
  function focus(id,push=true){
    const row=byId.get(id);if(!row)return;
    if(row.sensitive&&!state.sensitive){sensitiveRequested=id;state.record=id;render();setURL(push);$('sensitive').focus();return;}
    sensitiveRequested=null;state.kind=M.kindOf(row);state.era='all';state.search='';state.page=0;state.record=id;render();setURL(push);
    const element=document.getElementById('record-'+id);element?.scrollIntoView({behavior:'smooth',block:'center'});
    element?.querySelector('summary')?.focus({preventScroll:true});
  }
  for(const [id,key] of [['kind','kind'],['era','era'],['query','search']])$(id).addEventListener(id==='query'?'input':'change',e=>{
    state[key]=e.target.value;state.page=0;state.record=null;sensitiveRequested=null;render();setURL();
  });
  $('sensitive').addEventListener('change',e=>{
    state.sensitive=e.target.checked;state.page=0;const requested=sensitiveRequested||state.record;state.record=null;render();setURL();
    if(state.sensitive&&requested)focus(requested,false);
  });
  $('more').addEventListener('click',()=>{state.page++;render();});
  $('results').addEventListener('click',e=>{const link=e.target.closest('[data-focus-record]');if(link)focus(link.dataset.focusRecord);});
  window.addEventListener('popstate',()=>{
    const priorSensitive=state.sensitive;
    state=M.safeFilters(location.search);
    // Browser history never silently grants access to sensitive material.
    state.sensitive=priorSensitive;
    const selected=byId.get(state.record);
    if(selected&&(!selected.sensitive||state.sensitive)){state.kind=M.kindOf(selected);state.era='all';state.search='';}
    render();
  });
  const selected=byId.get(state.record);
  if(selected&&(!selected.sensitive||state.sensitive)){state.kind=M.kindOf(selected);state.era='all';state.search='';}
  render();
  if(selected&&selected.sensitive&&!state.sensitive)sensitiveRequested=selected.id;
  globalThis.HistoryConflicts={get state(){return {...state};},focus,render,model:M};
})();