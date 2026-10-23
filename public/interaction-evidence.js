/* Evidence-only relationship summaries for the Atlas Interactions explorer.
 * Shared research records establish co-mention, not necessarily direct contact.
 * Pure functions keep filtering, bucketing and partner counts testable.
 */
(function(root){
 'use strict';
 const includes=(r,id)=>Array.isArray(r?.participants)&&r.participants.includes(id);
 const dated=r=>Number.isFinite(r?.year);
 function partners(rows,focus,societies){
  if(!focus)return [];
  const result=new Map();
  for(const r of rows){
   if(!includes(r,focus))continue;
   for(const id of new Set(r.participants)){
    if(id===focus||!societies.has(id))continue;
    const item=result.get(id)||{id,name:societies.get(id).name,count:0,from:Infinity,to:-Infinity,types:new Set()};
    item.count++;
    if(dated(r)){item.from=Math.min(item.from,r.year);item.to=Math.max(item.to,r.year);}
    if(r.type)item.types.add(r.type);
    result.set(id,item);
   }
  }
  return [...result.values()].map(r=>({...r,types:[...r.types],from:Number.isFinite(r.from)?r.from:null,to:Number.isFinite(r.to)?r.to:null}))
   .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 }
 function timeline(rows,start,end,size=12){
  const lo=Math.max(-9999,Math.min(2026,Math.trunc(start)));
  const hi=Math.max(lo,Math.min(2026,Math.trunc(end)));
  const count=Math.max(1,Math.min(24,Math.trunc(size)||12));
  const width=(hi-lo+1)/count;
  const bins=Array.from({length:count},(_,i)=>({start:Math.ceil(lo+i*width),end:i===count-1?hi:Math.ceil(lo+(i+1)*width)-1,count:0}));
  for(const r of rows){
   if(!dated(r)||r.year<lo||r.year>hi)continue;
   const idx=Math.min(count-1,Math.floor((r.year-lo)/width));
   bins[idx].count++;
  }
  return bins;
 }
 function filter(rows,options={}){
  const {start=-9999,end=2026,type='All',focus='',partner='',search=''}=options;
  const needle=String(search).trim().toLocaleLowerCase();
  const societyNames=options.societyNames;
  return rows.filter(r=>dated(r)&&r.year>=start&&r.year<=end&&(!r.endExclusive||r.endExclusive>start))
   .filter(r=>type==='All'||r.type===type)
   .filter(r=>!focus||includes(r,focus))
   .filter(r=>!partner||(focus&&partner!==focus&&includes(r,partner)))
   .filter(r=>!needle||[r.title,r.detail,r.kind,...(r.participants||[]).map(id=>societyNames?.get(id)?.name||id)].join(' ').toLocaleLowerCase().includes(needle))
   .sort((a,b)=>a.year-b.year||String(a.title).localeCompare(String(b.title)));
 }
 root.AtlasInteractionEvidence=Object.freeze({partners,timeline,filter});
})(typeof window!=='undefined'?window:globalThis);
