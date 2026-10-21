/* Conflict research UI helpers: evidence-preserving date filters and links. */
(function(root){
  'use strict';
  const kinds=['individual','battle','context','phase','treaty','event','civilian','archaeology','anecdote','all'];
  const eras=['all','bce','early','medieval','modern','contemporary','undated'];
  const bands={bce:[-Infinity,1],early:[1,1000],medieval:[1000,1500],modern:[1500,1900],contemporary:[1900,2027]};
  const kindOf=row=>row.type==='conflict'?(row.hierarchy==='INDIVIDUAL_CONFLICT'?'individual':'context'):(row.type==='campaign'||row.type==='phase'?'phase':row.type);
  function periodMatches(row,era){
    if(era==='all')return true;
    // Undated evidence belongs only in the undated bin; do not infer a precise date from an endpoint bound.
    if(era==='undated')return row.start===null;
    if(!Number.isInteger(row.start))return false;
    const bounds=bands[era];if(!bounds)return true;
    // An unknown end is not treated as an open-ended conflict. Only explicitly ONGOING records
    // extend to their observed-through date, never to a conjectured peace or to infinity.
    let end=Number.isInteger(row.endExclusive)?row.endExclusive:row.start+1;
    if(row.endStatus==='ONGOING'&&typeof row.observedThrough==='string'){
      const y=Number(row.observedThrough.slice(0,4));if(Number.isInteger(y)&&y>=row.start)end=y+1;
    }
    return row.start<bounds[1]&&end>bounds[0];
  }
  function matches(row,state){
    if(state.kind!=='all'&&kindOf(row)!==state.kind)return false;
    if(!periodMatches(row,state.era))return false;
    if(!state.sensitive&&row.sensitive)return false;
    const q=String(state.search||'').toLocaleLowerCase().trim();
    return !q||[row.title,row.summary,row.region,row.dateText,...(row.participations||[]).map(p=>p.name)].join(' ').toLocaleLowerCase().includes(q);
  }
  function sortRecords(rows){return [...rows].sort((a,b)=>(a.start===null?Infinity:a.start)-(b.start===null?Infinity:b.start)||a.title.localeCompare(b.title));}
  function related(row,all){
    const ids=new Set([...(row.links||[]),...(row.parentIds||[])]);
    return sortRecords(all.filter(x=>x.id!==row.id&&(ids.has(x.id)||(x.parentIds||[]).includes(row.id)||(x.links||[]).includes(row.id))));
  }
  function safeFilters(search){
    const p=new URLSearchParams(search||'');
    return {kind:kinds.includes(p.get('kind'))?p.get('kind'):'individual',era:eras.includes(p.get('era'))?p.get('era'):'all',search:(p.get('q')||'').slice(0,160),sensitive:false,page:0,record:p.get('record')||null};
  }
  function label(y){return Number.isInteger(y)?y<=0?`${1-y} BCE`:`${y} CE`:'Undated / uncertain';}
  root.HistoryConflictsModel={kinds,eras,kindOf,periodMatches,matches,sortRecords,related,safeFilters,label};
})(typeof globalThis==='undefined'?window:globalThis);