/* Sourced conflicts explorer. Never reads invented coordinates or treats uncertainty as duration. */
(() => {
  'use strict';
  const D=typeof ATLAS_CONFLICTS_DATA!=='undefined'?ATLAS_CONFLICTS_DATA:null;
  if(!D)return;
  const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[c]));
  const formatYear=y=>y<=0?`${1-y} BCE`:`${y} CE`;
  const periods={individual:'Individual conflicts',battle:'Battles and sieges',context:'Conflict complexes and crises',phase:'Campaigns and phases',treaty:'Treaties and settlements',event:'Other historical events',civilian:'Civilian experience',archaeology:'Archaeological evidence',anecdote:'Stories and disputed claims',all:'All research records'};
  const icons={conflict:'\u2694',battle:'\u2694',campaign:'\u2691',phase:'\u2691',treaty:'\u2696',event:'\u2609',civilian:'\u2667',archaeology:'\u25c8',anecdote:'?',};
  const state={kind:'individual',era:'all',search:'',sensitive:false,page:0};
  const sliceSize=12;
  function isKind(row){switch(state.kind){case 'individual':return row.type==='conflict'&&row.hierarchy==='INDIVIDUAL_CONFLICT';case 'context':return row.type==='conflict'&&row.hierarchy!=='INDIVIDUAL_CONFLICT';case 'phase':return row.type==='campaign'||row.type==='phase';default:return state.kind==='all'||row.type===state.kind;}}
  function isEra(row){if(state.era==='all')return true;const y=row.start;if(state.era==='undated')return y===null;if(y===null)return false;return state.era==='bce'?y<1:state.era==='early'?y>=1&&y<1000:state.era==='medieval'?y>=1000&&y<1500:state.era==='modern'?y>=1500&&y<1900:y>=1900;}
  function matches(row){if(!isKind(row)||!isEra(row)||(!state.sensitive&&row.sensitive))return false;const q=state.search.toLowerCase();return !q||[row.title,row.summary,row.region,row.dateText,...row.participations.map(p=>p.name)].join(' ').toLowerCase().includes(q);}
  function details(row){const label=(row.endStatus==='ONGOING'?'Ongoing at research cutoff. The absent end date is not a peace settlement.':row.endStatus==='UNKNOWN'?'Ending date not established in this source pack.':'');
    const warns=[label,...row.notes].filter(Boolean);
    return `<div class="details"><p>${esc(row.summary)}</p><div class="tagline"><span class="tag">${esc(row.hierarchy||row.type)}</span><span class="tag">${esc(row.confidence)} confidence</span><span class="tag">${esc(row.review)} review status</span><span class="tag">${esc(row.datePrecision||'Date uncertain')}</span></div>${warns.map(x=>`<p class="warning">${esc(x)}</p>`).join('')}
    <p><strong>Source date:</strong> ${esc(row.dateText)}</p>${row.outcome?`<p><strong>Outcome in pack:</strong> ${esc(row.outcome)}</p>`:''}${row.anecdoteStatus?`<p class="warning">Interpretation status: ${esc(row.anecdoteStatus)}. Treat this as a myth-check or research claim, not independently verified fact.</p>`:''}
    ${row.participations.length?`<div class="extra-title">Participants and roles</div>${row.participations.map(p=>`<div class="entry"><strong>${esc(p.name)}</strong>${esc(p.role||'Role not specified')}<small>${esc(p.scope||'')}</small></div>`).join('')}`:''}
    ${row.casualties.length?`<div class="extra-title">Scoped numerical observations (not additive)</div>${row.casualties.map(c=>`<div class="entry"><strong>${esc(c.title)}</strong>${c.estimate===null?'Estimate not established':esc(c.estimate)} <small>${esc(c.population_scope)}. ${esc(c.method)}</small></div>`).join('')}<p class="warning">Different casualty records may overlap; never sum these figures into an unsupported total.</p>`:''}
    ${row.parentIds.length?`<p class="notes">Parent conflict references: ${esc(row.parentIds.join(', '))}</p>`:''}
    <div class="extra-title">Evidence and source access</div><div class="sources">${row.sources.length?row.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||s.id)} &nearr;<small>${esc(s.access_status||'Access not recorded')} - ${esc(s.limitations||'Check the original source')}</small></a>`).join(''):'<p>No verified link attached to this record.</p>'}</div></div>`;
  }
  function card(row){const date=row.start===null?'Date uncertain':formatYear(row.start);
    return `<div class="card-row"><div class="date-col">${esc(date)}</div><details class="milestone" data-kind="${esc(row.type)}"><summary><span class="icon-disc" aria-hidden="true">${esc(icons[row.type]||'\u25c8')}</span><span class="summary-copy"><strong>${esc(row.title)}</strong><small>${esc(row.region)} | ${esc(row.dateText)}${row.review==='NEEDS_REVIEW'?' | Needs review':''}</small></span><span class="plus" aria-hidden="true">+</span></summary>${details(row)}</details></div>`;}
  let current=[];
  function render(){current=D.records.filter(matches).sort((a,b)=>(a.start===null?Infinity:a.start)-(b.start===null?Infinity:b.start)||a.title.localeCompare(b.title));$('resultsTitle').textContent=periods[state.kind];$('count').textContent=current.length+' matching records';const visible=current.slice(0,(state.page+1)*sliceSize);$('results').innerHTML=visible.length?visible.map(card).join(''):'<div class="empty">No records match this view. Try a different period or remove filters. Undated entries are kept separate from the chronology.</div>';$('more').hidden=visible.length>=current.length;$('more').textContent='Show '+Math.min(sliceSize,current.length-visible.length)+' more';}
  for(const [id,key] of [['kind','kind'],['era','era'],['query','search']])$(id).addEventListener(id==='query'?'input':'change',e=>{state[key]=e.target.value;state.page=0;render();});
  $('sensitive').addEventListener('change',e=>{state.sensitive=e.target.checked;state.page=0;render();});
  $('more').addEventListener('click',()=>{state.page++;render();});
  render();
})();