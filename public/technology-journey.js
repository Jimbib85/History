/* Illustrated Technology Journeys: same filtered, sourced evidence as technology-tree.js.
 * Visual motifs are original explanatory art, never photographs of an invention.
 */
(function(root){
  'use strict';
  // Browser-only visual layer; research test sandboxes may have no DOM.
  if(typeof document==='undefined'||typeof document.getElementById!=='function')return;
  const details=document.getElementById('technologyDetails'),tech=root.WorldHistoryTechnology;
  if(!details||!tech)return;
  // Only activate in a full browser DOM; VM unit tests use minimal fixtures.
  if(typeof MutationObserver!=='function'||typeof document.createElement!=='function')return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"\'":'&#39;'}[c]));
  const byId=new Map(tech.technologies.map(t=>[t.id,t]));
  const civs=new Map(CIVILISATIONS.map(c=>[c.id,c]));
  const year=y=>y<=0?(1-y).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
  const artId=t=>{
    if(['paper','woodblock','movable-type'].includes(t.id))return 'paper';
    if(['compass','oceanic-navigation'].includes(t.id))return 'compass';
    if(['agriculture','irrigation'].includes(t.id))return 'fields';
    if(['bronze','iron'].includes(t.id))return 'metal';
    if(['gunpowder'].includes(t.id))return 'warfare';
    return 'writing';
  };
  const kinds={early:'Early evidence',adopted:'Adopted / used',developed:'Development',attested:'Attested use',independent:'Independent tradition'};
  function recordList(t){
    const state=tech.state;
    const terms=state.search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return (t.appearances||[]).map((a,i)=>({...a,key:t.id+':'+(a.researchId||a.id||i)}))
      .filter(a=>state.civ==='all'||a.civ===state.civ)
      .filter(a=>terms.every(term=>[t.name,civs.get(a.civ)?.name,a.label,a.note,a.sourceStatus].join(' ').toLocaleLowerCase().includes(term)))
      .sort((a,b)=>a.year-b.year||a.key.localeCompare(b.key));
  }
  function sample(items,max=5){
    if(items.length<=max)return items;
    const result=[];
    for(let i=0;i<max;i++)result.push(items[Math.round(i*(items.length-1)/(max-1))]);
    const selected=items.find(x=>x.key===tech.state.record);
    if(selected&&!result.some(x=>x.key===selected.key))result[Math.floor(max/2)]=selected;
    return [...new Map(result.map(x=>[x.key,x])).values()].sort((a,b)=>a.year-b.year);
  }
  function enhancement(){
    const intro=details.querySelector('.tech-intro'),t=byId.get(tech.state.tech);
    if(!intro||!t)return;
    const records=recordList(t),selected=records.find(a=>a.key===tech.state.record);
    if(!records.length)return;
    const track=sample(records);
    const lo=records[0].year,hi=records[records.length-1].year,span=hi-lo;
    const id=artId(t),asset=root.AtlasVisualAssets?.forTechnology(t.id);
    const section=document.createElement('section');section.className='atlas-tech-journey';
    section.setAttribute('aria-label','Illustrated technology journey');
    const tabs=track.map((a,i)=>{
      const c=civs.get(a.civ),p=span?Math.round((a.year-lo)/span*100):50;
      return '<button type="button" data-record="'+esc(a.key)+'" aria-pressed="'+(a.key===tech.state.record)+'" class="atlas-tech-stop '+(a.key===tech.state.record?'chosen':'')+'" style="--stop:'+p+'%"><i class="atlas-tech-stop-pip" aria-hidden="true"></i><span class="atlas-tech-stop-date">'+esc(a.dateLabel||year(a.year))+'</span><strong>'+esc(a.label)+'</strong><small>'+esc(c?.name||'Unknown society')+'</small><em>'+esc(kinds[a.status]||'Sourced observation')+'</em></button>';
    }).join('');
    section.innerHTML='<div class="atlas-tech-journey-head"><div class="atlas-tech-journey-art"><svg role="img" aria-label="Technology illustration" viewBox="0 0 240 180"><use href="assets/tech-journey-symbols.svg#'+id+'"></use></svg></div><div class="atlas-tech-journey-intro"><span>THE JOURNEY OF AN IDEA</span><h3>'+esc(t.name)+'</h3><p>Explore dated observations and developments without assuming one universal inventor or a direct transmission route.</p><div class="atlas-tech-journey-count">'+records.length+' sourced evidence '+(records.length===1?'record':'records')+' · '+esc(tech.state.civ==='all'?'Across societies':civs.get(tech.state.civ)?.name||'Current society')+'</div></div></div>'+
      '<div class="atlas-tech-track-heading"><strong>Explore milestones</strong><span>'+esc(year(lo))+' — '+esc(year(hi))+'</span></div>'+
      '<div class="atlas-tech-journey-scroll"><div class="atlas-tech-journey-track">'+tabs+'</div></div>'+
      '';
    intro.insertAdjacentElement('afterend',section);
    if(asset){
      const evidence=details.querySelector('.atlas-artwork--tech');
      if(evidence){evidence.classList.add('atlas-tech-linked-object');evidence.setAttribute('aria-label','Original historical object accompanying the technology journey, with separate provenance');}
    }
  }
  const observer=new MutationObserver(changes=>{
    if(!changes.some(c=>c.target===details&&c.type==='childList'))return;
    observer.disconnect();
    enhancement();
    observer.observe(details,{childList:true});
  });
  enhancement();
  observer.observe(details,{childList:true});
  root.AtlasTechnologyJourney=Object.freeze({refresh:enhancement,artId,recordList,sample});
})(window);
