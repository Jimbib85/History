/* Progressive disclosure UI. Historical arrays are read, never edited. */
(function() {
  'use strict';
  const $=id=>document.getElementById(id),M=globalThis.HistoryStoryModel;
  const error=message=>{const el=$('storyError');el.hidden=false;el.textContent=message;$('resultStatus').textContent='Timeline unavailable';$('storyPagination').hidden=true;};
  if(!M||typeof CIVILISATIONS==='undefined'||typeof EVENTS==='undefined'||typeof ATLAS_RESEARCH_EVENTS==='undefined'||typeof ATLAS_MEDIEVAL_EVENTS==='undefined'||typeof ATLAS_MODERN_EVENTS==='undefined'||typeof ATLAS_CLASSICAL_EVENTS==='undefined'||typeof ATLAS_CONFLICT_STORY_EVENTS==='undefined') {
    error('A required history file did not load. Refresh to retry; no partial timeline has been substituted.');return;
  }
  const data=M.build({entities:CIVILISATIONS,events:EVENTS,research:[ATLAS_RESEARCH_EVENTS,ATLAS_MEDIEVAL_EVENTS,ATLAS_MODERN_EVENTS,ATLAS_CLASSICAL_EVENTS,ATLAS_CONFLICT_STORY_EVENTS]});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths={
    temple:'M3 9h18L12 3 3 9Zm2 2v8m5-8v8m4-8v8m5-8v8M3 21h18',
    swords:'m4 3 9 9-3 3-7-9 1-3Zm16 0-9 9 3 3 7-9-1-3ZM5 16l3 3m-5 2 5-5m11 0-3 3m5 2-5-5',
    flask:'M9 3h6m-5 0v6L4 19c-.5 1 .1 2 1.4 2h13.2c1.3 0 1.9-1 1.4-2L14 9V3M8 14h8m-6 3h.1m4 2h.1',
    book:'M12 6c-3-3-6-3-9-2v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 2Zm0 0v15',
    palette:'M12 3a9 9 0 1 0 0 18c2 0 3-1 2-3-1-2 0-3 2-3h3c3 0 3-4 1-7-2-3-5-5-8-5ZM7 9h.1M10 6h.1M15 7h.1M18 10h.1',
    coins:'M16 6c0 2-3 3-6 3S4 8 4 6s3-3 6-3 6 1 6 3ZM4 6v9c0 2 3 3 6 3m-6-7c0 2 3 3 6 3m6-8v4m-1 1c3 0 6 1 6 3s-3 3-6 3-5-1-5-3 2-3 5-3Zm-5 3v4c0 2 2 3 5 3s6-1 6-3v-4',
    compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 5-3 7-7 3 3-7 7-3Z',
    people:'M9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-6 16v-3c0-5 12-5 12 0v3m1-16c5 0 5 6 0 6m2 3c3 0 4 2 4 4v3',
    leaf:'M20 3C5 2 1 12 7 18c7 6 16-2 13-15ZM4 21 16 9m-7 8-1-6m5 2 5 1'
  };
  const icon=key=>'<svg class="subject-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+paths[key]+'"/></svg>';
  const regions=[...new Set(data.events.map(e=>e.region))].sort();
  const entities=[...data.entities.values()].filter(e=>e.kind!=='overview').sort((a,b)=>a.name.localeCompare(b.name));
  const defaults={year:1200,span:500,group:0,subject:'all',region:'all',entity:'all',type:'all',search:'',mode:'story',density:'labels',page:0};
  const oneOf=(v,values,fallback)=>values.includes(v)?v:fallback;
  function readState() {
    const p=new URLSearchParams(location.search);
    return {...defaults,year:M.parseYear(p.get('year'))??defaults.year,
      span:oneOf(Number(p.get('span')),[100,500,1000,12026],500),group:oneOf(Number(p.get('group')),[0,1,10,50,100],0),
      subject:oneOf(p.get('subject'),['all',...M.SUBJECTS.map(s=>s.id)],'all'),region:oneOf(p.get('region'),regions,'all'),
      entity:data.entities.has(p.get('entity'))?p.get('entity'):'all',type:oneOf(p.get('type'),['all','society','empire'],'all'),
      mode:oneOf(p.get('mode'),['story','subjects'],'story'),density:oneOf(p.get('density'),['labels','icons'],'labels'),
      search:(p.get('q')||'').slice(0,250),page:Math.max(0,Math.min(2000,Number(p.get('page'))||0))};
  }
  let state=readState(),groups=[],matching=[],drawerRecords=[],drawerLimit=8,expanded=null,opener=null,currentSubject=null;
  const drawer=$('storyDrawer');
  function syncURL(push=false,eventID=null) {
    const u=new URL(location.href);u.search='';
    for(const k of ['year','span','group','subject','region','entity','type','mode','density','page']) if(state[k]!==defaults[k]||k==='year')u.searchParams.set(k,String(state[k]));
    if(state.search)u.searchParams.set('q',state.search);
    if(eventID)u.searchParams.set('event',eventID);
    if(push&&u.href!==location.href)history.pushState(null,'',u.pathname+u.search);
    else history.replaceState(null,'',u.pathname+u.search);
  }
  function update(patch,push=true) {
    if(drawer.open)drawer.close();
    state={...state,...patch,page:'page' in patch?patch.page:0};render();syncURL(push);
  }
  function controls() {
    $('storyYear').value=M.yearLabel(state.year);$('storySpan').value=state.span;
    if(document.activeElement!==$('storySearch'))$('storySearch').value=state.search;
    for(const [id,k] of [['storyRegion','region'],['storyEntity','entity'],['storyType','type'],['storyGroup','group'],['storyDensity','density']])$(id).value=state[k];
    document.querySelectorAll('[data-story-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.toggle('active',b.dataset.storyMode===state.mode))));
    $('subjectFilters').innerHTML='<button class="filter-pill '+(state.subject==='all'?'active':'')+'" type="button" data-subject="all" aria-pressed="'+(state.subject==='all')+'">All subjects</button>'+M.SUBJECTS.map(s=>'<button type="button" class="filter-pill '+(s.id===state.subject?'active':'')+'" data-subject="'+s.id+'" aria-pressed="'+(s.id===state.subject)+'" style="--subject:'+s.colour+'">'+icon(s.icon)+esc(s.name)+'</button>').join('');
    const base='?year='+state.year+(state.entity!=='all'?'&civ='+encodeURIComponent(state.entity):'');
    $('headerMap').href='index.html'+base;$('headerTech').href='index.html'+base+'#technology';
    $('headerCompare').href='compare.html'+base;$('footerCompare').href='compare.html'+base;
    $('earlierStory').disabled=state.year<=-9999;$('laterStory').disabled=state.year>=2026;
  }
  function capsule(subject,records,key) {
    const s=M.subjectMap.get(subject);
    return '<button type="button" class="subject-capsule" style="--subject:'+s.colour+'" data-group="'+key+'" data-open-subject="'+s.id+'" aria-expanded="false" aria-controls="storyDrawer" aria-haspopup="dialog" title="'+esc(s.name)+': '+records.length+' records" aria-label="'+esc(s.name)+': '+records.length+' records. Open details.">'+icon(s.icon)+'<span class="capsule-label">'+esc(s.name)+'</span><b>'+records.length+'</b></button>';
  }
  function render() {
    matching=M.filter(data,state);groups=M.group(matching,state);state.page=Math.min(state.page,Math.max(0,Math.ceil(groups.length/6)-1));
    controls();const r=M.range(state.year,state.span);$('readingRange').textContent=M.spanLabel(r.start,r.end).toUpperCase();
    $('readingTitle').textContent=state.mode==='subjects'?'Pick a thread to follow.':'Open a subject. Follow a story.';
    $('resultStatus').textContent=matching.length+' records in this window. Details stay closed until you choose.';
    $('storyTimeline').classList.toggle('compact',state.density==='icons');
    const counts=new Map(M.SUBJECTS.map(s=>[s.id,matching.filter(e=>e.subject===s.id)]));
    if(!matching.length){$('storyTimeline').innerHTML='<div class="empty-story"><h3>No matching stories in this window.</h3><p>This is a gap in the current selection, not in human history. Try a wider time window or clear the filters.</p><button type="button" data-reset="true">Clear filters</button></div>';$('storyPagination').hidden=true;return;}
    if(state.mode==='subjects') {
      $('storyTimeline').innerHTML='<div class="subject-grid">'+M.SUBJECTS.filter(s=>state.subject==='all'||state.subject===s.id).map(s=>'<button class="subject-tile" style="--subject:'+s.colour+'" type="button" data-open-subject="'+s.id+'" data-group="all" aria-haspopup="dialog" aria-controls="storyDrawer" aria-expanded="false" '+(!counts.get(s.id).length?'disabled':'')+'>'+icon(s.icon)+'<strong>'+esc(s.name)+'</strong><small>'+counts.get(s.id).length+' records in this window</small><span class="tile-arrow" aria-hidden="true">Explore →</span></button>').join('')+'</div>';
      $('storyPagination').hidden=true;return;
    }
    const pageGroups=groups.slice(state.page*6,state.page*6+6);
    $('storyTimeline').innerHTML='<ol class="story-spine">'+pageGroups.map(g=>{
      const countries=new Set(g.events.flatMap(e=>e.entityIds)).size;
      return '<li class="period-row"><div class="period-date">'+esc(M.spanLabel(g.start,g.end))+'<small>'+g.events.length+' records</small></div><section class="period-card" aria-label="'+esc(M.spanLabel(g.start,g.end))+'"><div class="period-meta"><span>'+g.subjects.size+' subjects to explore</span><span>'+countries+' linked entities</span></div><div class="capsules">'+M.SUBJECTS.filter(s=>g.subjects.has(s.id)).map(s=>capsule(s.id,g.subjects.get(s.id),g.key)).join('')+'</div><p class="period-hint"><span aria-hidden="true">↗</span> Select an icon to open its stories.</p></section><div class="period-spacer" aria-hidden="true">'+(g.events.some(e=>e.start<g.start)?'Includes events continuing into this period':'Different places. Shared centuries.')+'</div></li>';
    }).join('')+'</ol>';
    $('storyPagination').hidden=false;$('previousGroups').disabled=state.page===0;$('nextGroups').disabled=(state.page+1)*6>=groups.length;
    $('pageStatus').textContent='Periods '+(state.page*6+1)+'–'+Math.min(groups.length,(state.page+1)*6)+' of '+groups.length;
  }
  function sourceHTML(e) {
    const links=e.sourceURLs.map(url=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(new URL(url).hostname)+' ↗</a>').join('');
    return '<div class="source-list"><strong>SOURCES & PROVENANCE</strong>'+(links||'<p>No claim-level source link is attached to this original atlas record.</p>')+(!links&&e.backgroundURL?'<a href="'+esc(e.backgroundURL)+'" target="_blank" rel="noopener noreferrer">Society background (not a claim-level citation) ↗</a>':'')+'<p>'+esc(e.batch)+(e.sourceIds.length?' · '+esc(e.sourceIds.join(', ')):'')+'</p></div>';
  }
  function detailHTML(e) {
    const caveat=e.precision!=='year'&&e.precision!=='exact'?'Date precision: '+e.precision+'. Read the source interval as given; the timeline group is only a browsing aid.':'';
    return '<p>'+esc(e.summary||'No explanatory text is attached to this record.')+'</p><div class="record-metadata"><span>'+esc(e.originalCategory)+'</span><span>'+esc(e.originalRegion)+'</span><span>'+esc(e.confidence)+' research confidence</span></div>'+(caveat?'<p class="evidence-warning">'+esc(caveat)+'</p>':'')+(e.notes?'<p class="evidence-warning">'+esc(e.notes)+'</p>':'')+
      '<div class="record-entities">'+e.entityIds.map(id=>'<a href="'+esc(M.link('index.html',{...e,primaryId:id}))+'">'+esc(data.entities.get(id).name)+' ↗</a>').join('')+'</div>'+sourceHTML(e)+
      (e.variants.length?'<details class="variant-details"><summary>'+e.variants.length+' additional imported record'+(e.variants.length===1?'':'s')+' with the same title and dates</summary>'+e.variants.map(v=>'<p>'+esc(v.batch)+' · '+esc(v.confidence)+'<br>'+esc(v.summary)+'</p>').join('')+'</details>':'')+
      '<div class="record-links">'+(e.id.startsWith('gc-')?'<a href="conflicts.html?record='+encodeURIComponent(e.id.slice(3))+'">Explore conflict evidence ↗</a>':'')+'<a href="'+esc(M.link('compare.html',e))+'">Compare this date</a><a href="'+esc(M.link('index.html',e))+'">Open world map</a><a href="'+esc(M.link('index.html',e))+'#technology">Technology explorer</a></div>';
  }
  function renderDrawer() {
    $('drawerList').innerHTML=drawerRecords.slice(0,drawerLimit).map(e=>'<article class="drawer-record"><button type="button" class="record-toggle" data-open-event="'+esc(e.id)+'" aria-expanded="'+(expanded===e.id)+'" aria-controls="record-'+esc(e.id)+'"><span><span class="record-date">'+esc(M.recordDate(e))+'</span><strong>'+esc(e.title)+'</strong><small>'+esc(e.originalRegion)+'</small></span><span aria-hidden="true">'+(expanded===e.id?'−':'+')+'</span></button><div class="record-detail" id="record-'+esc(e.id)+'" '+(expanded===e.id?'':'hidden')+'>'+(expanded===e.id?detailHTML(e):'')+'</div></article>').join('');
    $('moreDrawerRecords').hidden=drawerLimit>=drawerRecords.length;
    $('moreDrawerRecords').textContent='Show '+Math.min(8,drawerRecords.length-drawerLimit)+' more records';
  }
  function openSubject(id,key,button,eventID=null) {
    const subject=M.subjectMap.get(id);if(!subject)return;
    drawerRecords=key==='all'?matching.filter(e=>e.subject===id):(groups.find(g=>g.key===key)?.subjects.get(id)||[]);
    if(eventID&&!drawerRecords.some(e=>e.id===eventID)){const e=data.idMap.get(eventID);if(e)drawerRecords=[e];}
    if(!drawerRecords.length)return;
    currentSubject=id;opener=button;expanded=eventID;drawerLimit=Math.max(8,drawerRecords.findIndex(e=>e.id===eventID)+1);
    const group=groups.find(g=>g.key===key),r=M.range(state.year,state.span);
    $('drawerEyebrow').textContent=group?M.spanLabel(group.start,group.end):M.spanLabel(r.start,r.end);
    $('drawerTitle').textContent=subject.name;$('drawerSubtitle').textContent=drawerRecords.length+' records. Open a title to read its evidence.';
    renderDrawer();if(!drawer.open)drawer.showModal();if(button)button.setAttribute('aria-expanded','true');
    $('closeStoryDrawer').focus();
  }
  $('storyRegion').innerHTML='<option value="all">All regions</option>'+regions.map(r=>'<option value="'+esc(r)+'">'+esc(r)+'</option>').join('');
  $('storyEntity').innerHTML='<option value="all">Any society or empire</option>'+entities.map(e=>'<option value="'+esc(e.id)+'">'+esc(e.name)+'</option>').join('');
  $('subjectFilters').addEventListener('click',e=>{const b=e.target.closest('[data-subject]');if(b)update({subject:b.dataset.subject});});
  document.querySelectorAll('[data-story-mode]').forEach(b=>b.addEventListener('click',()=>update({mode:b.dataset.storyMode})));
  for(const [id,key,cast] of [['storySpan','span',Number],['storyRegion','region',String],['storyEntity','entity',String],['storyType','type',String],['storyGroup','group',Number],['storyDensity','density',String]])$(id).addEventListener('change',e=>update({[key]:cast(e.target.value)}));
  let searchTimer;const search=()=>{clearTimeout(searchTimer);const value=$('storySearch').value.slice(0,250);if(value!==state.search)update({search:value},false);};
  $('storySearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,180);});
  $('storySearch').addEventListener('change',search);
  function commitYear() {const input=$('storyYear'),value=M.parseYear(input.value);if(value===null){input.setCustomValidity('Enter 500 BCE or 1200 CE, between 10,000 BCE and 2026 CE.');input.reportValidity();return false;}input.setCustomValidity('');if(value!==state.year)update({year:value});else input.value=M.yearLabel(state.year);return true;}
  $('yearForm').addEventListener('submit',e=>{e.preventDefault();if(commitYear())$('storyYear').blur();});
  $('storyYear').addEventListener('blur',commitYear);$('storyYear').addEventListener('input',e=>e.target.setCustomValidity(''));
  const shift=dir=>update({year:Math.max(-9999,Math.min(2026,state.year+dir*(state.span===12026?500:state.span)))});
  $('earlierStory').addEventListener('click',()=>shift(-1));$('laterStory').addEventListener('click',()=>shift(1));
  const reset=()=>{clearTimeout(searchTimer);$('storySearch').value='';update({...defaults,year:state.year});};$('resetStory').addEventListener('click',reset);
  $('previousGroups').addEventListener('click',()=>{if(state.page>0)update({page:state.page-1});$('readingTitle').scrollIntoView({block:'start'});});
  $('nextGroups').addEventListener('click',()=>{if((state.page+1)*6<groups.length)update({page:state.page+1});$('readingTitle').scrollIntoView({block:'start'});});
  $('storyTimeline').addEventListener('click',e=>{const resetButton=e.target.closest('[data-reset]');if(resetButton){reset();return;}const b=e.target.closest('[data-open-subject]');if(b)openSubject(b.dataset.openSubject,b.dataset.group,b);});
  $('surpriseStory').addEventListener('click',()=>{
    const pool=data.events.filter(e=>e.start>=-9999&&e.start<=2026);const chosen=pool[Math.floor(Math.random()*pool.length)];
    if(!chosen)return;update({...defaults,year:chosen.start});
    const g=groups.find(g=>g.events.some(e=>e.id===chosen.id));if(g){state.page=Math.floor(groups.indexOf(g)/6);render();syncURL(false);}
    openSubject(chosen.subject,g?.key||'all',null,chosen.id);syncURL(false,chosen.id);
  });
  $('drawerList').addEventListener('click',e=>{const b=e.target.closest('[data-open-event]');if(!b)return;expanded=expanded===b.dataset.openEvent?null:b.dataset.openEvent;renderDrawer();syncURL(false,expanded);const next=[...$('drawerList').querySelectorAll('[data-open-event]')].find(x=>x.dataset.openEvent===b.dataset.openEvent);next?.focus({preventScroll:true});});
  $('moreDrawerRecords').addEventListener('click',()=>{drawerLimit+=8;renderDrawer();});
  $('closeStoryDrawer').addEventListener('click',()=>drawer.close());
  drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)drawer.close();}});
  let navigatingHistory=false;
  drawer.addEventListener('close',()=>{opener?.setAttribute('aria-expanded','false');if(!navigatingHistory)opener?.focus({preventScroll:true});opener=null;expanded=null;if(!navigatingHistory)syncURL(false);navigatingHistory=false;});
  window.addEventListener('popstate',()=>{if(drawer.open){navigatingHistory=true;drawer.close();}state=readState();render();});
  render();const initialEvent=new URLSearchParams(location.search).get('event');
  if(data.idMap.has(initialEvent)){const e=data.idMap.get(initialEvent);openSubject(e.subject,'all',null,e.id);}else syncURL(false);
  globalThis.HistoryStory={get state(){return {...state};},data,render,update,model:M};
})();
