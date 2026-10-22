/* Flowing Compare ribbons + evidence-linked event gallery.
 * Purely visual curves: x positions use the same linear scale as compare.js.
 * No contact, route, territorial reach, or exact event depiction is inferred.
 */
(function(root){
  'use strict';
  const host=document.getElementById('cinematicCompareDeck'),api=root.HistoryCompare;
  if(!host||!api)return;
  const societies=new Map(CIVILISATIONS.filter(c=>c.kind!=='overview').map(c=>[c.id,c]));
  const sources=[
    ...EVENTS.filter(e=>societies.has(e.civ)&&Number.isFinite(e.year)).map((e,i)=>({...e,key:'native-'+i})),
    ...(typeof ATLAS_RESEARCH_EVENTS==='undefined'?[]:ATLAS_RESEARCH_EVENTS),
    ...(typeof ATLAS_MEDIEVAL_EVENTS==='undefined'?[]:ATLAS_MEDIEVAL_EVENTS),
    ...(typeof ATLAS_MODERN_EVENTS==='undefined'?[]:ATLAS_MODERN_EVENTS),
    ...(typeof ATLAS_CLASSICAL_EVENTS==='undefined'?[]:ATLAS_CLASSICAL_EVENTS),
    ...(typeof ATLAS_EXPANSION_EVENTS==='undefined'?[]:ATLAS_EXPANSION_EVENTS)
  ];
  const events=[...new Map(sources.filter(e=>Number.isFinite(e.year)&&e.title).map((e,i)=>[e.id||e.key||'event-'+i,{...e,key:e.id||e.key||'event-'+i}])).values()];
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const clamp=(a,b,c)=>Math.min(c,Math.max(b,a));
  const year=y=>y<=0?(1-y).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
  const range=()=>{
    const state=api.state;
    if(state.span===12026)return{start:-9999,end:2026};
    const half=state.span/2;
    let start=Math.round(state.year-half),end=Math.round(state.year+half);
    if(start< -9999){end+=-9999-start;start=-9999;}
    if(end>2026){start-=end-2026;end=2026;}
    return{start:Math.max(-9999,start),end:Math.min(2026,end)};
  };
  const fraction=(y,r)=>clamp((y-r.start)/(r.end-r.start),0,1);
  const colour=['#f2c678','#65d9ab','#c18ee9'];
  const linked=(e,id)=>{
    const associated=[e.civ,...(e.societyIds||[]),...(e.allSocietyIds||[])].filter(Boolean);
    return associated.includes(id);
  };
  const readableDate=e=>e.humanDate||e.dateLabel||e.original_date_text||
    (/approx|circa|century|decade/i.test(e.datePrecision||'')?'c. ':'')+year(e.year);
  function featured(society,r){
    return events.filter(e=>linked(e,society.id)&&e.year>=Math.max(society.start,r.start)&&e.year<=Math.min(society.end,r.end))
      .sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
  }
  function samples(rows,max=3){
    if(rows.length<=max)return rows;
    const result=[rows[0],rows[Math.floor((rows.length-1)/2)],rows[rows.length-1]];
    return result.filter((row,i)=>result.findIndex(x=>x.key===row.key)===i);
  }
  function drawRow(row,c,index,r){
    const line=row.querySelector('.cinematic-flow-line');if(!line)return;
    const lo=Math.max(c.start,r.start),hi=Math.min(c.end,r.end);
    const x=fraction(lo,r)*1000,xx=fraction(hi,r)*1000,width=xx-x;
    const start=Number.isFinite(x)?x:0,end=Number.isFinite(xx)?xx:0;
    const y=31,amplitude=index===1?8:6;
    const d=width<1 ? `M${start.toFixed(2)} 31 L${end.toFixed(2)} 31`:
      `M${start.toFixed(2)} ${y} C${(start+width*.18).toFixed(2)} ${y-amplitude} ${(start+width*.33).toFixed(2)} ${y-amplitude} ${(start+width*.5).toFixed(2)} ${y} S${(start+width*.82).toFixed(2)} ${y+amplitude} ${end.toFixed(2)} ${y}`;
    const visible=hi>=lo;
    const connected=featured(c,r);
    const chosen=samples(connected).filter((e,i,arr)=>arr.findIndex(v=>Math.abs(fraction(v.year,r)-fraction(e.year,r))<.035)===i);
    const fill=colour[index%3];
    const xStart=(fraction(lo,r)*100).toFixed(3),xWidth=Math.max(0,(fraction(hi,r)-fraction(lo,r))*100).toFixed(3);
    line.innerHTML='<svg class="atlas-ribbon-visual" viewBox="0 0 1000 62" preserveAspectRatio="none" role="img" aria-label="'+escape(c.name+' from '+year(c.start)+' to '+year(c.end)+' on the shared chronological scale')+'">'+
      '<defs><linearGradient id="atlas-ribbon-'+index+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff9de" stop-opacity=".96"/><stop offset=".2" stop-color="'+fill+'"/><stop offset=".75" stop-color="'+fill+'"/><stop offset="1" stop-color="#0d2330"/></linearGradient></defs>'+
      (visible?'<path d="'+d+'" stroke="'+fill+'" stroke-width="27" opacity=".17" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="url(#atlas-ribbon-'+index+')" stroke-width="17" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="#fff9e7" stroke-width="1.3" opacity=".57" fill="none" stroke-linecap="round"/>':'')+
      '</svg>'+
      (visible?'<button type="button" class="atlas-ribbon-select" data-deck-civ="'+escape(c.id)+'" style="left:'+xStart+'%;width:'+xWidth+'%" aria-label="Select '+escape(c.name+' historical period, '+year(c.start)+' to '+year(c.end))+'"></button>':'<span class="atlas-ribbon-none">Outside visible interval</span>')+
      chosen.map((e,i)=>'<button type="button" class="atlas-ribbon-event" data-atlas-event="'+escape(e.key)+'" data-atlas-civ="'+escape(c.id)+'" style="left:'+(fraction(e.year,r)*100).toFixed(3)+'%;--ribbon-accent:'+fill+'" title="'+escape(readableDate(e)+' — '+e.title)+'" aria-label="Open dated record: '+escape(e.title)+' ('+escape(readableDate(e))+')"><span></span></button>').join('')+
      '<i class="atlas-ribbon-now" style="left:'+(fraction(api.state.year,r)*100).toFixed(3)+'%" aria-hidden="true"></i>';
  }
  function renderAxis(r){
    const hostAxis=document.createElement('div');hostAxis.className='atlas-ribbon-axis';
    const ticks=Array.from({length:5},(_,i)=>Math.round(r.start+(r.end-r.start)*i/4));
    hostAxis.innerHTML='<div class="atlas-ribbon-axis-label">One historical scale</div><div class="atlas-ribbon-ticks">'+ticks.map((y,i)=>'<span style="left:'+(i*25)+'%">'+escape(year(y))+'</span>').join('')+'<b style="left:'+(fraction(api.state.year,r)*100).toFixed(3)+'%" title="Selected year">'+escape(year(api.state.year))+'</b></div>';
    document.querySelector('#cinematicCompareDeck .cinematic-flow-tracks')?.append(hostAxis);
  }
  function renderEvents(ids,r){
    const matches=[];
    for(const id of ids){const c=societies.get(id);if(!c)continue;const inEra=featured(c,r);
      const sorted=inEra.sort((a,b)=>Math.abs(a.year-api.state.year)-Math.abs(b.year-api.state.year)||a.year-b.year);
      for(const e of sorted.slice(0,2))if(!matches.some(v=>v.e.key===e.key))matches.push({e,c});
    }
    const section=document.createElement('section');section.className='atlas-compare-moments';section.id='atlasCompareMoments';
    section.setAttribute('aria-label','Selected societies historical events');
    const chosen=matches.slice(0,6).sort((a,b)=>a.e.year-b.e.year);
    section.innerHTML='<div class="atlas-moments-heading"><div><span>DATED RECORDS</span><h3>Turning points across these worlds</h3></div><small>Illustrations provide cultural atmosphere, not literal event scenes</small></div>'+
      (chosen.length?'<div class="atlas-moments-strip">'+chosen.map(({e,c})=>{
        const art=root.AtlasVisualAssets?.forSociety(c.id);
        const scene=['abbasid','song','byzantium'].includes(c.id)?'assets/scene-'+(c.id==='byzantium'?'byzantium':c.id)+'.svg':null;
        const visual=art?'<img src="'+escape(art.imageUrl)+'" alt="" loading="lazy" decoding="async" class="atlas-object-image" />':scene?'<img src="'+scene+'" alt="" loading="lazy" decoding="async"/>':'<span class="atlas-event-ornament" aria-hidden="true">✧</span>';
        return '<article class="atlas-moment-card"><div class="atlas-moment-image">'+visual+'<span>Contextual artwork · not an event depiction</span></div><div class="atlas-moment-copy"><b>'+escape(readableDate(e))+'</b><span>'+escape(c.name)+'</span><button type="button" data-atlas-event="'+escape(e.key)+'" data-atlas-civ="'+escape(c.id)+'">'+escape(e.title)+' <i aria-hidden="true">↗</i></button><small>'+escape(e.kind||'Historical event')+'</small></div></article>';
      }).join('')+'</div>':'<p class="atlas-moments-empty">No dated records are linked to the featured societies in this time window. Widen the date range or select another society.</p>')+
      '<p class="atlas-moments-foot">Event dates and society associations come from the atlas research records. Select a milestone to inspect sources and uncertainty.</p>';
    host.append(section);
    root.AtlasVisualAssets?.bindImages(section);
  }
  function enhance(){
    const cards=[...host.querySelectorAll('.cinematic-society[data-entity]')];
    const rows=[...host.querySelectorAll('.cinematic-flow-track')];
    if(!cards.length||!rows.length)return;
    const r=range();
    const ids=cards.map(card=>card.dataset.entity).filter(id=>societies.has(id));
    rows.forEach((row,i)=>{const c=societies.get(ids[i]);if(c)drawRow(row,c,i,r);});
    host.querySelector('.atlas-ribbon-axis')?.remove();
    renderAxis(r);
    host.querySelector('#atlasCompareMoments')?.remove();
    renderEvents(ids,r);
  }
  host.addEventListener('click',e=>{
    const action=e.target.closest('[data-atlas-event]');if(!action)return;
    const key=action.dataset.atlasEvent,civ=action.dataset.atlasCiv;
    const ev=events.find(row=>row.key===key);
    if(!ev||!linked(ev,civ))return;
    api.change({selected:civ,event:key});
    const panel=document.querySelector('.insight-panel');
    if(panel&&root.matchMedia?.('(max-width:940px)')?.matches)panel.scrollIntoView({block:'start',behavior:'smooth'});
  });
  const observer=new MutationObserver(changes=>{
    if(changes.some(c=>c.target===host&&c.type==='childList'))enhance();
  });
  observer.observe(host,{childList:true});
  enhance();
  root.AtlasCompareRibbons=Object.freeze({refresh:enhance,range,year,samples});
})(window);
