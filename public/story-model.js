/* Story Timeline: read-only presentation of the existing Atlas records. */
(function(root) {
  'use strict';
  const SUBJECTS = [
    {id:'states',name:'States & power',icon:'temple',colour:'#527386',pattern:/politic|state|empire|dynast|law|govern|independ|revolut|diplom|decoloni/},
    {id:'conflict',name:'War & conflict',icon:'swords',colour:'#ad5b50',pattern:/war|conflict|conquest|militar|battle|siege/},
    {id:'technology',name:'Science & technology',icon:'flask',colour:'#5e8492',pattern:/technolog|science|engineer|printing|mathematic|astronom|invention|information|industrial/},
    {id:'belief',name:'Belief & religion',icon:'book',colour:'#877297',pattern:/religio|belief|buddhi|christian|islam|spiritual/},
    {id:'culture',name:'Art & culture',icon:'palette',colour:'#b18848',pattern:/cultur|art|architect|monument|literature|writing|music/},
    {id:'trade',name:'Trade & economy',icon:'coins',colour:'#799070',pattern:/trade|econom|commerc|agricult|financ|money|exchange/},
    {id:'exploration',name:'Travel & geography',icon:'compass',colour:'#438e87',pattern:/explor|geograph|cartograph|navigat|maritime|travel/},
    {id:'life',name:'Society & daily life',icon:'people',colour:'#b27c65',pattern:/societ|social|migration|settle|demograph|cit|colon|slav|human|comparison/},
    {id:'environment',name:'Environment & health',icon:'leaf',colour:'#738d50',pattern:/environment|climate|disease|disaster|pandemic|epidemic|health|medicin|ecolog/}
  ];
  const subjectMap = new Map(SUBJECTS.map(s=>[s.id,s]));
  const text = v => typeof v === 'string' ? v : '';
  const list = v => Array.isArray(v) ? v : [];
  const normal = v => text(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const validURL = v => {try {const u=new URL(v); return ['https:','http:'].includes(u.protocol)?u.href:null;}catch(_){return null;}};
  const unique = a => [...new Set(a)];
  function yearLabel(y) {return y<=0 ? `${(1-y).toLocaleString('en-AU')} BCE` : `${y.toLocaleString('en-AU')} CE`;}
  function parseYear(input) {
    const m=String(input).trim().replace(/,/g,'').match(/^(-?\d+)\s*(BCE|BC|CE|AD)?$/i);
    if(!m) return null;
    const n=Number(m[1]),era=(m[2]||'').toUpperCase();
    if(!Number.isSafeInteger(n)||era&&n<=0) return null;
    const y=/^BC/.test(era)?1-n:n;
    return y>=-9999&&y<=2026?y:null;
  }
  function category(raw) {
    const name=normal(raw);
    // Explicit categories only. Never derive history or causal links from a headline.
    return SUBJECTS.find(s=>s.pattern.test(name))?.id || 'life';
  }
  function spanLabel(start,end) {
    if(end===start+1) return yearLabel(start);
    if(start<=0 && end<=1) return `${(1-start).toLocaleString('en-AU')}\u2013${(2-end).toLocaleString('en-AU')} BCE`;
    if(start>0) return `${start.toLocaleString('en-AU')}\u2013${(end-1).toLocaleString('en-AU')} CE`;
    return `${yearLabel(start)}\u2013${yearLabel(end-1)}`;
  }
  function recordDate(e) {
    if(e.dateLabel) return e.dateLabel;
    return (/approx|circa|century|decade/.test(e.precision)?'c. ':'')+spanLabel(e.start,e.end);
  }
  function build(input) {
    const entities = new Map(list(input.entities).map(c=>[c.id,c]));
    const research=list(input.research).flat().filter(Boolean),researchIDs=new Set(research.map(e=>e.id));
    const native=list(input.events).filter(e=>!(e.researchId&&researchIDs.has(e.researchId)));
    const byKey=new Map(),idMap=new Map();let skipped=0;
    for(const raw of [...research,...native]) {
      const start=raw.year??raw.start_year;
      if(!Number.isSafeInteger(start)||!text(raw.title).trim()) {skipped++;continue;}
      const endValue=raw.endExclusive??raw.end_year_exclusive;
      const end=Number.isSafeInteger(endValue)&&endValue>start?endValue:start+1;
      const key=normal(raw.title)+'|'+start+'|'+end;
      const id=text(raw.id)||text(raw.researchId)||'native-'+normal(raw.title).replace(/ /g,'-')+'-'+start;
      const primary=entities.get(raw.civ);
      const ids=unique([raw.civ,...list(raw.societyIds),...list(raw.society_ids)].filter(id=>entities.has(id)));
      const explicit=list(raw.sourceUrls).concat(list(raw.source_urls),raw.sourceUrl||raw.source||[]);
      const urls=unique(explicit.map(validURL).filter(Boolean));
      const originalCategory=text(raw.kind)||text(raw.category)||'Unclassified';
      const entry={id,start,end,title:raw.title,summary:text(raw.detail)||text(raw.summary),
        originalCategory,subject:category(originalCategory),
        region:text(raw.region)||primary?.region||'Unspecified',originalRegion:text(raw.originalRegion)||text(raw.region)||'Unspecified',
        entityIds:ids,primaryId:primary?.id||null,sourceURLs:urls,
        backgroundURL:urls.length?null:validURL(primary?.source),
        sourceIds:list(raw.sourceIds||raw.source_ids),confidence:text(raw.confidence)||'Not rated',
        precision:text(raw.datePrecision||raw.date_precision)||'unspecified',dateLabel:text(raw.humanDate||raw.dateLabel),
        notes:text(raw.evidenceNote),batch:text(raw.origin)||'Original atlas',aliases:[id],variants:[]};
      if(byKey.has(key)) {
        const prior=byKey.get(key);prior.entityIds=unique([...prior.entityIds,...ids]);
        prior.sourceURLs=unique([...prior.sourceURLs,...urls]);prior.aliases=unique([...prior.aliases,id]);
        // Exact-title/date duplicates share a card, but alternate text/provenance remains inspectable.
        prior.variants.push(entry);idMap.set(id,prior);continue;
      }
      byKey.set(key,entry);idMap.set(id,entry);
    }
    const events=[...byKey.values()].sort((a,b)=>a.start-b.start||a.title.localeCompare(b.title));
    return {events,entities,idMap,skipped,inputCount:research.length+native.length,duplicates:research.length+native.length-skipped-events.length};
  }
  function range(year,span) {
    if(span===12026) return {start:-9999,end:2027};
    const width=Math.max(1,span);let start=Math.round(year-width/2),end=start+width;
    if(start < -9999){end+=-9999-start;start=-9999;}
    if(end>2027){start-=end-2027;end=2027;}
    return {start:Math.max(-9999,start),end:Math.min(2027,end)};
  }
  function filter(data,state,ignoreSubject=false) {
    const r=range(state.year,state.span),q=normal(state.search);
    return data.events.filter(e=>{
      if(e.start>=r.end||e.end<=r.start) return false;
      if(!ignoreSubject&&state.subject!=='all'&&e.subject!==state.subject) return false;
      if(state.region!=='all'&&e.region!==state.region&&!e.entityIds.some(id=>data.entities.get(id).region===state.region)) return false;
      if(state.entity!=='all'&&!e.entityIds.includes(state.entity)) return false;
      if(state.type!=='all'&&!e.entityIds.some(id=>data.entities.get(id).kind===state.type)) return false;
      if(q&&!normal([e.title,e.summary,e.originalCategory,e.region,...e.entityIds.map(id=>data.entities.get(id).name)].join(' ')).includes(q))return false;
      return true;
    });
  }
  function bucket(year,size) {
    if(size===1) return {start:year,end:year+1};
    if(year<=0){const start=1-Math.ceil((1-year)/size)*size;return {start,end:start+size};}
    const start=1+Math.floor((year-1)/size)*size;
    return {start,end:start+size};
  }
  function group(events,state) {
    const r=range(state.year,state.span),size=state.group|| (state.span<=100?10:state.span<=500?50:state.span<=2000?100:500);
    const buckets=new Map();
    for(const e of events){const b=bucket(Math.max(e.start,r.start),size),key=String(b.start);
      if(!buckets.has(key))buckets.set(key,{...b,key,subjects:new Map(),events:[]});
      const row=buckets.get(key);row.events.push(e);
      if(!row.subjects.has(e.subject))row.subjects.set(e.subject,[]);
      row.subjects.get(e.subject).push(e);
    }
    return [...buckets.values()].sort((a,b)=>a.start-b.start);
  }
  function link(page,e,extra={}) {
    const p=new URLSearchParams({year:String(e.start),...extra});
    if(e.primaryId)p.set('civ',e.primaryId);
    return page+'?'+p.toString();
  }
  root.HistoryStoryModel={SUBJECTS,subjectMap,normal,category,validURL,yearLabel,parseYear,spanLabel,recordDate,build,range,filter,bucket,group,link};
})(typeof globalThis==='undefined'?window:globalThis);
