/* World History Atlas: comparative technologies v0.3.
   All milestone dates and transmission links are curated data, not computed guesses. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const year = value => value <= 0 ? `${Math.abs(value - 1).toLocaleString('en-AU')} BCE` : `${value.toLocaleString('en-AU')} CE`;
  const civs = new Map(CIVILISATIONS.filter(c => c.kind !== 'overview').map(c => [c.id,c]));
  const technologies = new Map(TECHNOLOGIES.map(t => [t.id,t]));
  const dialog = $('technologyDialog');
  const tree = $('technologyBranches');
  const details = $('technologyDetails');
  const select = $('technologyCivilisation');
  if (!dialog || !tree || !details || !select) return;
  const state = {tech:'paper',civ:'rome',view:'timeline'};
  const kind = {
    independent:{label:'Independent development',colour:'#4f806c'},
    early:{label:'Early evidence',colour:'#a17848'},
    attested:{label:'Documented use',colour:'#8f8a7c'},
    adopted:{label:'Adoption / transmission',colour:'#507f9f'},
    developed:{label:'Development / refinement',colour:'#ad7950'}
  };
  const tag = status => kind[status] ?? kind.attested;
  const project = c => ({x:(Number(c.lon)+180)/360*1200,y:(88-Number(c.lat))/176*590});
  const recordsFor = t => [...t.appearances].sort((a,b) => a.year-b.year);
  const pathwaysFor = t => (typeof TECH_PATHWAYS !== 'undefined' ? TECH_PATHWAYS : []).filter(l => l.tech===t.id);
  function renderTree(){
    tree.innerHTML = TECH_BRANCHES.map(branch => `<section class="tech-branch"><div class="tech-branch-head"><span aria-hidden="true">${esc(branch.icon)}</span><div><h3>${esc(branch.name)}</h3><p>${esc(branch.intro)}</p></div></div><div class="tech-nodes">${TECHNOLOGIES.filter(t => t.branch===branch.id).map((t,index)=>{
      const milestone=t.appearances.find(a=>a.civ===state.civ);
      return `<button class="tech-node ${state.tech===t.id?'selected':''} ${milestone?'documented':''}" type="button" data-tech="${esc(t.id)}" aria-pressed="${state.tech===t.id}"><span class="tech-num">${index+1}</span><span class="tech-node-copy"><strong>${esc(t.name)}</strong><small>${milestone?`Sample: ${esc(milestone.dateLabel||year(milestone.year))}`:'No entry in this sample'}</small></span><span class="tech-node-arrow">↗</span></button>`;
    }).join('')}</div></section>`).join('');
  }
  function timeline(t,records){
    const min=records[0].year, max=records[records.length-1].year, span=Math.max(1,max-min);
    return `<section class="tviz" aria-label="Shared chronological scale"><div class="tviz-scale"><span>${year(min)}</span><span>Same scale across societies</span><span>${year(max)}</span></div>${records.map((a,index)=>{
      const society=civs.get(a.civ),meta=tag(a.status);
      const pos= Math.max(1,Math.min(99,((a.year-min)/span)*100));
      return `<button type="button" class="tviz-row ${state.civ===a.civ?'chosen':''}" data-compare="${esc(a.civ)}" aria-label="Compare ${esc(society.name)} at ${esc(a.dateLabel||year(a.year))}"><span class="tviz-name">${esc(society.name)}</span><span class="tviz-track"><i style="left:${pos.toFixed(2)}%;background:${meta.colour}"></i></span><span class="tviz-date">${esc(a.dateLabel||year(a.year))}</span></button>`;
    }).join('')}</section>`;
  }
  function mapGraphic(t,records){
    const edges=pathwaysFor(t);
    const selected=state.civ;
    const arrows=edges.map((edge,i)=>{
      const a=civs.get(edge.from),b=civs.get(edge.to);
      if(!a||!b)return '';
      const p=project(a),q=project(b), dx=q.x-p.x,dy=q.y-p.y;
      const bend= Math.max(12,Math.min(65,Math.hypot(dx,dy)*.11));
      const mx=(p.x+q.x)/2-dy/(Math.hypot(dx,dy)||1)*bend;
      const my=(p.y+q.y)/2+dx/(Math.hypot(dx,dy)||1)*bend;
      const dashed=edge.type==='continuity'?'stroke-dasharray="8 6"':'stroke-dasharray="5 5"';
      return `<path class="tviz-route" d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}" ${dashed} marker-end="url(#techArrow)"><title>${esc(edge.label)}: schematic connection, not a mapped itinerary</title></path>`;
    }).join('');
    const points=records.map((record,i)=>{
      const c=civs.get(record.civ),p=project(c),metadata=tag(record.status),chosen=record.civ===selected;
      return `<g class="tviz-pin ${chosen?'chosen':''}" tabindex="0" role="button" data-compare="${esc(c.id)}" aria-label="Select ${esc(c.name)}, ${esc(record.dateLabel||year(record.year))}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${chosen?16:12}" fill="${metadata.colour}"/><text x="${p.x.toFixed(1)}" y="${(p.y-21).toFixed(1)}" text-anchor="middle">${esc(c.name)}</text><title>${esc(c.name)} · ${esc(record.dateLabel||year(record.year))} · ${esc(metadata.label)}</title></g>`;
    }).join('');
    const listing=edges.length?edges.map(edge=>`<div class="tviz-connection"><strong>${esc(civs.get(edge.from)?.name)} → ${esc(civs.get(edge.to)?.name)}</strong><span>${edge.type==='continuity'?'Regional continuity':'Regional transmission'} · illustrative, not a precise route</span><p>${esc(edge.detail)}</p><a href="${esc(edge.source)}" target="_blank" rel="noopener noreferrer">Connection source ↗</a></div>`).join(''):
      '<div class="tviz-empty">No historically supported transmission link has been curated for these examples yet. Dots show evidence in different places, not a proven chain of invention.</div>';
    return `<section class="tviz-world" aria-label="Locations of technology milestones"><svg viewBox="0 0 1200 590" role="img" aria-label="Modern world geography with approximate historic reference locations"><defs><marker id="techArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#9b7c56"/></marker></defs><image href="world.svg" x="0" y="0" width="1200" height="590"></image>${arrows}${points}</svg><p class="tviz-map-note">Modern basemap, representative locations. Dashed lines are conceptual links, <strong>not historical travel routes</strong>.</p><div class="tviz-connections"><h3>Curated connections</h3>${listing}</div></section>`;
  }
  function recordCard(record){
    const c=civs.get(record.civ),info=tag(record.status);
    return `<article class="tech-record ${record.civ===state.civ?'selected':''}"><div class="tech-record-head"><strong>${esc(c.name)}</strong><span>${esc(record.dateLabel||year(record.year))}</span></div><div class="tech-kind"><span class="tech-status-dot" style="background:${info.colour}"></span>${esc(info.label)} · ${esc(record.label)}</div><p>${esc(record.note)}</p><div class="tech-record-actions"><a href="${esc(record.source)}" target="_blank" rel="noopener noreferrer">Historical source ↗</a><button type="button" data-tech-jump="${esc(record.civ)}" data-tech-year="${Number(record.year)}">Explore this year ↗</button></div></article>`;
  }
  function renderDetail(){
    const t=technologies.get(state.tech),society=civs.get(state.civ),records=recordsFor(t);
    const chosen=records.find(a=>a.civ===state.civ);
    details.innerHTML=`<section class="tech-intro"><div class="tech-kicker">${esc(TECH_BRANCHES.find(b=>b.id===t.branch).name.toUpperCase())} · ${esc(t.era)}</div><h2>${esc(t.name)}</h2><p>${esc(t.description)}</p></section>
      <section class="tech-current"><span>${esc(society.name)}</span><strong>${chosen?year(chosen.year):'Not yet documented here'}</strong><p>${chosen?`${esc(chosen.label)}. ${esc(chosen.note)}`:'An empty entry in our database does not mean this society did not know the technology.'}</p></section>
      <div class="tviz-head"><div><strong>Across civilisations</strong><span>${records.length} dated examples · ${new Set(records.map(a=>a.source)).size} source links</span></div><div class="tviz-modes" role="group" aria-label="Technology comparison view"><button type="button" data-viz="timeline" aria-pressed="${state.view==='timeline'}" class="${state.view==='timeline'?'active':''}">◫ Time</button><button type="button" data-viz="map" aria-pressed="${state.view==='map'}" class="${state.view==='map'?'active':''}">◎ World map</button></div></div>
      <div class="tviz-legend"><span><i style="background:${kind.independent.colour}"></i>Independent</span><span><i style="background:${kind.adopted.colour}"></i>Adoption</span><span><i style="background:${kind.developed.colour}"></i>Development</span><span><i style="background:${kind.attested.colour}"></i>Other evidence</span></div>
      ${state.view==='timeline'?timeline(t,records):mapGraphic(t,records)}
      <div class="tech-evidence-list"><h3>Read the evidence</h3>${records.map(recordCard).join('')}</div>
      <p class="tech-disclaimer">The dates are approximate selected evidence points, not definitive invention dates. Independently developed technologies are not proof of cultural isolation. Chronology alone cannot establish contact or influence.</p>`;
  }
  function draw(){renderTree();renderDetail();}
  function open(){
    const selected=window.WorldHistoryAtlas?.state?.civ;
    if(selected&&civs.has(selected))state.civ=selected;
    select.value=state.civ;
    draw();dialog.showModal();
  }
  select.innerHTML=[...CIVILISATIONS].filter(c=>c.kind!=='overview').sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  select.addEventListener('change',()=>{state.civ=select.value;draw();});
  tree.addEventListener('click',e=>{
    const target=e.target.closest('[data-tech]');if(!target)return;
    state.tech=target.dataset.tech;draw();details.scrollTo({top:0,behavior:'instant'});
  });
  details.addEventListener('click',e=>{
    const mode=e.target.closest('[data-viz]');if(mode){state.view=mode.dataset.viz;renderDetail();return;}
    const compared=e.target.closest('[data-compare]');if(compared){state.civ=compared.dataset.compare;select.value=state.civ;draw();return;}
    const jumped=e.target.closest('[data-tech-jump]');if(jumped){
      const api=window.WorldHistoryAtlas;
      if(api){api.go({civ:jumped.dataset.techJump,year:Number(jumped.dataset.techYear),region:'All regions',catalogue:'all',search:'',view:'actual'},{zoomReset:true});}
      dialog.close();
    }
  });
  details.addEventListener('keydown',e=>{
    const compared=e.target.closest('svg [data-compare]');
    if(compared&&(e.key==='Enter'||e.key===' ')){e.preventDefault();state.civ=compared.dataset.compare;select.value=state.civ;draw();}
  });
  $('technologyButton').addEventListener('click',open);
  $('closeTechnology').addEventListener('click',()=>dialog.close());
  $('randomTechnology').addEventListener('click',()=>{
    const choices=TECHNOLOGIES.filter(t=>t.id!==state.tech);
    state.tech=choices[Math.floor(Math.random()*choices.length)].id;draw();
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  window.WorldHistoryTechnology={open,state,technologies:TECHNOLOGIES,pathways:TECH_PATHWAYS};
})();