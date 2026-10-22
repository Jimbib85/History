/* v0.18 — source-linked journeys and everyday-life snapshots; no fabricated events. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const M=window.AtlasDiscovery.create(ATLAS_DISCOVERY_DATA);
 const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));
 const params=new URLSearchParams(location.search);
 const chosen=M.journey(params.get('journey'))||M.journey('daily-life');
 const initialYear=Number(params.get('year'));
 const state={journey:chosen.id,step:Math.min(chosen.steps.length-1,Math.max(0,Number.isSafeInteger(Number(params.get('step')))?Number(params.get('step')):0)),
   year:params.has('year')&&Number.isSafeInteger(initialYear)&&initialYear>=-9999&&initialYear<=2026?initialYear:1600,
   random:null,recent:[]};
 const classicalRequested=params.has('classical')||location.hash==='#classicalEvidence';
 const modernV2Requested=params.has('modernV2')||location.hash==='#modernV2Evidence';
 const ids=new Set(M.all.map(r=>r.id));
 function parseYear(text){
   const match=String(text).trim().replace(/,/g,'').match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
   if(!match)return null;
   const raw=Number(match[1]),suffix=(match[2]||'').toUpperCase();
   if(!Number.isSafeInteger(raw))return null;
   const converted=/^(BCE|BC)$/.test(suffix)?raw>0?1-raw:null:/^(CE|AD)$/.test(suffix)?raw>0?raw:null:raw;
   return converted!==null&&converted>=-9999&&converted<=2026?converted:null;
 }
 function storyURL(r){
   const id=r.societyIds[0];
   if(!id)return null;
   const q=new URLSearchParams();
   q.set('entity',id);
   if(r.start!==null)q.set('year',String(r.start));
   return 'story.html?'+q.toString();
 }
 function entry(r,{compact=false}={}){
   const sources=M.src(r),first=sources[0],href=storyURL(r);
   const summary=r.summary||'No summary in the supplied research';
   const when=M.period(r);
   const places=r.societyIds.length?r.societyIds.join(', ').replaceAll('_',' '):r.region||'Society not linked in this source record';
   const sourcesLink=first?'<a href="'+esc(first.url)+'" target="_blank" rel="noopener noreferrer">Read registered source ↗</a>':'';
   const storyLink=href?'<a href="'+esc(href)+'">Explore associated society ↗</a>':'';
   const dateNote=r.start===null?'<p class="dated-note">The research provides no specific start/end dates for this practice. Its research batch does not establish the date.</p>':'';
   return '<article class="entry-card'+(compact?' compact':'')+'"><div class="entry-kicker"><span>'+esc(r.scope)+' research</span><span>'+esc(r.topic.replaceAll('_',' '))+'</span><span>'+esc(when)+'</span></div>'+
      '<h4>'+esc(r.title)+'</h4><p>'+esc(summary)+'</p>'+dateNote+
      '<p class="confidence">Linked research: '+esc(places)+' · Confidence from source pack: '+esc(r.confidence)+' (not independently verified)</p>'+
      '<div class="record-actions">'+sourcesLink+storyLink+
      '<small>'+(first?esc(first.access.replaceAll('_',' ')):'No linked source URL in this excerpt. This remains a research lead.')+
      (href&&r.start===null?' · Society link opens an overview, not a dated version of this record.':'')+'</small></div></article>';
 }
 function syncURL(){
   const q=new URLSearchParams({journey:state.journey,step:String(state.step),year:String(state.year)});
   if(state.random)q.set('record',state.random.id);
   if(classicalRequested)q.set('classical','1');
   if(modernV2Requested)q.set('modernV2','1');
   if(params.has('research'))q.set('research',params.get('research'));
   try{history.replaceState(null,'','discover.html?'+q.toString());}catch(_){}
   $('snapshotCompare').href='compare.html?year='+encodeURIComponent(state.year);
 }
 function renderChoices(){
   $('journeyChoices').innerHTML=M.JOURNEYS.map((g,i)=>'<button type="button" class="journey-choice" data-journey="'+esc(g.id)+'" aria-pressed="'+(g.id===state.journey)+'">'+
      '<small>JOURNEY 0'+(i+1)+'</small><strong>'+esc(g.title)+'</strong><span>'+esc(g.subtitle)+'</span></button>').join('');
 }
 function renderReader(){
   const journey=M.journey(state.journey),row=journey.steps[state.step];
   $('guideTitle').textContent=journey.title;
   $('guideNote').textContent=journey.note;
   $('guideProgress').textContent='STOP '+(state.step+1)+' OF '+journey.steps.length+' · EDITORIAL READING ORDER';
   $('guideStep').innerHTML=entry(row);
   $('prevStep').disabled=state.step===0;
   $('nextStep').disabled=state.step===journey.steps.length-1;
   $('nextStep').textContent=state.step===journey.steps.length-1?'Journey complete':'Next discovery →';
 }
 function renderSnapshot(){
   if(document.activeElement!==$('snapshotYear'))$('snapshotYear').value=M.year(state.year);
   document.querySelectorAll('[data-snapshot]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.snapshot)===state.year)));
   const rows=M.peers(state.year);
   $('snapshotSummary').textContent=rows.length?
      'Research intervals include '+M.year(state.year)+'. Showing '+rows.length+' records from distinct societies where possible. Broad intervals do not prove each activity occurred in that exact year, and overlap is not evidence of contact.':
      'No individually dated cultural-practice entries in this research index for '+M.year(state.year)+'. Undated records are not silently assigned to this year.';
   $('snapshotCards').innerHTML=rows.length?rows.map(r=>entry(r,{compact:true})).join(''):
     '<div class="empty">No sourced comparison for this particular year. Try 200 CE, 1600 CE or 1800 CE, or follow one of the curated journeys instead.</div>';
 }
 function renderRandom(){
   $('randomRecord').innerHTML=state.random?entry(state.random):'<p>Choose “Find another discovery” to start exploring.</p>';
 }
 function render(){
   renderChoices();renderReader();renderSnapshot();renderRandom();syncURL();
 }
 function chooseRandom(){
   const prior=state.random?.id?[state.random.id,...state.recent]:state.recent;
   const row=M.random({avoid:prior.slice(0,8)});
   if(!row)return;
   state.recent=[row.id,...state.recent].slice(0,8);
   state.random=row;
   renderRandom();syncURL();
 }
 function init(){
   $('journeyChoices').addEventListener('click',e=>{
      const target=e.target.closest('[data-journey]');
      if(target&&M.journey(target.dataset.journey)){state.journey=target.dataset.journey;state.step=0;render();}
   });
   $('prevStep').addEventListener('click',()=>{if(state.step>0){state.step--;renderReader();syncURL();}});
   $('nextStep').addEventListener('click',()=>{if(state.step<M.journey(state.journey).steps.length-1){state.step++;renderReader();syncURL();}});
   $('snapshotYear').addEventListener('change',e=>{
      const year=parseYear(e.target.value);
      if(year===null){e.target.value=M.year(state.year);return;}
      state.year=year;renderSnapshot();syncURL();
   });
   $('snapshotYear').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur();});
   document.querySelectorAll('[data-snapshot]').forEach(button=>button.addEventListener('click',()=>{
      state.year=Number(button.dataset.snapshot);renderSnapshot();syncURL();
   }));
   $('randomDiscovery').addEventListener('click',chooseRandom);
   if(params.has('record')&&ids.has(params.get('record')))state.random=M.get(params.get('record'));
   else if(params.get('random')==='1')chooseRandom();
   render();
 }
 init();
 window.AtlasDiscoveryUI={state,model:M,parseYear,chooseRandom,render};
})();
