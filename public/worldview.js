/* A compact, evidence-first visual reader. It never fabricates maps, routes or polygons. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const model=window.WorldViewModel.build([
    {scope:'Classical · 500 BCE–500 CE',pack:ATLAS_CLASSICAL_PACK},
    {scope:'Medieval · 1000–1499 CE',pack:ATLAS_MEDIEVAL_PACK},
    {scope:'Modern · 1500–2026 CE',pack:ATLAS_MODERN_PACK}
  ],CIVILISATIONS,MAPS);
  const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
  const params=new URLSearchParams(location.search);
  function parseYear(value){
    const m=String(value).trim().replace(/,/g,'').match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
    if(!m)return null;
    const n=Number(m[1]),era=(m[2]||'').toUpperCase();
    if(!Number.isSafeInteger(n))return null;
    if(era==='BCE'||era==='BC')return n>0?1-n:null;
    if(era==='CE'||era==='AD')return n>0?n:null;
    return n;
  }
  const allNames=new Map(CIVILISATIONS.map(c=>[c.id,c.name]));
  const initial=params.get('civ');
  const selected=initial&&(allNames.has(initial)||model.societies.has(initial))?initial:'all';
  const parsed=Number(params.get('year'));
  const state={society:selected,period:params.get('period')==='near'?'near':'all',
    year:params.has('year')&&Number.isSafeInteger(parsed)&&parsed>=-9999&&parsed<=2026?parsed:1200,
    search:(params.get('search')||'').slice(0,250),
    limits:{maps:8,knowledge:8,connections:8}};
  function rowSources(row){
    const valid=row.sources.filter(x=>x.url);
    if(!valid.length)return '<p class="missing-source">No source link available.</p>';
    return '<div class="sources"><div class="micro-heading">REGISTERED SOURCES</div>'+
      valid.slice(0,8).map(s=>'<a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">'+
      '<strong>'+escape(s.title)+'</strong><small>'+escape(s.access.replaceAll('_',' '))+'</small></a>').join('')+'</div>';
  }
  function tags(row){
    const tags=[row.scope,Number.isFinite(row.year)?model.yearText(row.year):'Date unspecified'];
    if(row.recordKind==='knowledge')tags.push(row.certainty==='attested'?'Attested claim':'Inferred awareness');
    if(row.recordKind==='relationship')tags.push(row.assessment);
    if(row.recordKind==='map')tags.push(row.type.replaceAll('_',' '));
    return tags.map(t=>'<span>'+escape(t)+'</span>').join('');
  }
  function entry(row){
    const names=row.associated.map(id=>allNames.get(id)||model.societies.get(id)||id).join(' · ');
    const image=row.recordKind==='map'&&row.image
      ?'<figure class="artefact-image"><img loading="lazy" src="'+escape(row.image)+'" alt="Curated reference reproduction of '+escape(row.title)+'"><figcaption> <a href="'+escape(row.imagePage)+'" target="_blank" rel="noopener noreferrer">Original catalogue ↗</a></figcaption></figure>':'';
    const metadata=row.recordKind==='map'
      ?'<p><b>Object or copy:</b> '+escape(row.objectDate)+'</p>'+(row.contentDate?'<p><b>Composition context:</b> '+escape(row.contentDate)+'</p>':'')+
        '<p><b>Catalogue location:</b> '+escape(row.place)+'</p>'
      :row.recordKind==='knowledge'
      ?'<p><b>Geographic scope:</b> '+escape(row.area)+'</p>'
      :'<p><b>Evidence classification:</b> '+escape(row.assessment)+'</p>';
    const duplicate=(window.AtlasMapIntake||[]).find(m=>m.existingId===row.rawId);
    const variant=duplicate?'<p><a href="#uploadedMapCollection">Supplied alternative reproduction catalogued below; same map identity.</a></p>':'';
    const seen=row.recordKind==='map'?'MAP RECORD':row.recordKind==='knowledge'?'GEOGRAPHIC ACCOUNT':'RELATIONSHIP RECORD';
    return '<details class="evidence-card"><summary><span class="record-type">'+seen+'</span><strong>'+escape(row.title)+'</strong>'+
      '<span class="record-tags">'+tags(row)+'</span>'+(names?'<small class="associated">Societies: '+escape(names)+'</small>':'')+
      '<i class="disclosure-indicator" aria-hidden="true">⌄</i></summary><div class="evidence-detail">'+
      image+'<p class="record-description">'+escape(row.description)+'</p>'+metadata+
      ''+
      variant+rowSources(row)+'</div></details>';
  }
  function records(section,items,limitKey){
    const list=model.filter(items,{society:state.society,period:state.period,year:state.year,search:state.search});
    $(section+'Count').textContent=String(list.length);
    const container=$(section+'Records');
    container.innerHTML=list.length?list.slice(0,state.limits[limitKey]).map(entry).join(''):
      '<div class="empty-state"><b>No matches.</b><p>Try another society, year or search.</p><button type="button" data-reset-society>Browse all societies</button></div>';
    const more=$(section+'More');
    const n=state.limits[limitKey];
    more.innerHTML=n<list.length?'<button type="button" data-more="'+limitKey+'">Show '+Math.min(8,list.length-n)+' more of '+list.length+' records ↓</button>':
      '<small>Showing '+Math.min(n,list.length)+' of '+list.length+' matching records</small>';
    return list.length;
  }
  function link(view){
    const q=new URLSearchParams({year:String(state.year)});
    if(state.society!=='all')q.set('civ',state.society);
    return view==='map'?'index.html?'+q.toString()+'&view=known':
      view==='story'?'story.html?year='+encodeURIComponent(state.year)+(state.society!=='all'?'&entity='+encodeURIComponent(state.society):''):
      'compare.html?'+q.toString();
  }
  function updateLink(){
    const q=new URLSearchParams();
    q.set('year',String(state.year));
    if(state.society!=='all')q.set('civ',state.society);
    if(state.period==='near')q.set('period','near');
    if(state.search)q.set('search',state.search);
    try{history.replaceState(null,'','worldview.html?'+q.toString()+(location.hash||''));}catch(_){}
    $('mapNav').href=link('map');$('returnMap').href=link('map');
    $('storyNav').href=link('story');
    $('compareNav').href=link('compare');$('returnCompare').href=link('compare');
  }
  function render(){
    const values={society:state.society,period:state.period,year:model.yearText(state.year),search:state.search};
    if(document.activeElement!==$('worldSociety'))$('worldSociety').value=values.society;
    if(document.activeElement!==$('worldPeriod'))$('worldPeriod').value=values.period;
    if(document.activeElement!==$('worldYear'))$('worldYear').value=values.year;
    if(document.activeElement!==$('worldSearch'))$('worldSearch').value=values.search;
    const maps=records('maps',model.maps,'maps');
    const knowledge=records('knowledge',model.knowledge,'knowledge');
    const connections=records('connections',model.relationships,'connections');
    $('worldContext').textContent=(state.society==='all'?'All recorded societies':(allNames.get(state.society)||model.societies.get(state.society)||state.society))+
       ' · '+(state.period==='near'?'Within about 125 years of '+model.yearText(state.year):'Any documented period')+
       ' · '+maps+' map records · '+knowledge+' knowledge records · '+connections+' relationship records';
    updateLink();
  }
  function change(patch){
    const broad=['society','period','year','search'].some(k=>Object.prototype.hasOwnProperty.call(patch,k)&&patch[k]!==state[k]);
    Object.assign(state,patch);
    if(broad)state.limits={maps:8,knowledge:8,connections:8};
    render();
  }
  function initialise(){
    const ids=new Set([...model.societies.keys(),...(selected!=='all'?[selected]:[])]);
    const sorted=[...ids].sort((a,b)=>(allNames.get(a)||model.societies.get(a)||a).localeCompare(allNames.get(b)||model.societies.get(b)||b));
    $('worldSociety').innerHTML='<option value="all">All recorded societies</option>'+
      sorted.map(id=>'<option value="'+escape(id)+'">'+escape(allNames.get(id)||model.societies.get(id)||id)+'</option>').join('');
    $('worldSociety').addEventListener('change',e=>change({society:e.target.value}));
    $('worldPeriod').addEventListener('change',e=>change({period:e.target.value}));
    $('worldYear').addEventListener('change',e=>{
      const year=parseYear(e.target.value);
      if(year===null||year< -9999||year>2026){e.target.value=model.yearText(state.year);return;}
      change({year});
    });
    $('worldYear').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur();});
    $('worldSearch').addEventListener('input',e=>change({search:e.target.value.slice(0,250)}));
    $('resetWorld').addEventListener('click',()=>change({society:'all',period:'all',search:''}));
    document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>change({society:'all',period:'near',year:Number(b.dataset.preset),search:''})));
    $('records').addEventListener('click',e=>{
      const more=e.target.closest('[data-more]');
      if(more){const key=more.dataset.more;if(Object.hasOwn(state.limits,key)){state.limits[key]+=8;render();}return;}
      if(e.target.closest('[data-reset-society]'))change({society:'all',period:'all',search:''});
    });
    render();
  }
  initialise();
  window.AtlasWorldView={state,model,change,parseYear,render};
})();
