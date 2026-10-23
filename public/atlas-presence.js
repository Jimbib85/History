/* World History Atlas: geographical presence CLOUDS, not polity borders.
 * The source provides representative points, not documented territorial extents.
 * These decorative neighbourhood halos convey approximate location only.
 */
(function(root){
 'use strict';
 const safeColour=c=>/^#[a-f0-9]{6}$/i.test(c||'')?c:'#cbad77';
 const mapped=(c,geo)=>!!c&&c.kind!=='overview'&&geo.finite(c.lon,c.lat)&&typeof c.id==='string';
 const active=(c,y)=>Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start<=y&&c.end>=y;
 const escape=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 function choose(civs,geo,year,{selectedId='',participants=[],limit=26}={}){
  const byId=new Map(civs.filter(c=>mapped(c,geo)).map(c=>[c.id,c]));
  const first=[],used=new Set();
  function add(id,role){
   const c=byId.get(id);
   if(c&&!used.has(id)){used.add(id);first.push({c,role,active:active(c,year)});}
  }
  const validParticipants=[...new Set(participants)].filter(id=>byId.has(id));
  for(const id of validParticipants)add(id,'event');
  if(selectedId)add(selectedId,validParticipants.includes(selectedId)?'selected-event':'selected');
  const candidates=[...byId.values()].filter(c=>active(c,year)&&!used.has(c.id)).sort((a,b)=>a.lon-b.lon||a.lat-b.lat||a.id.localeCompare(b.id));
  // Sample by longitude to keep the decoration geographically distributed.
  const remaining=Math.max(0,Math.max(1,limit)-first.length);
  if(remaining>=candidates.length){for(const c of candidates)add(c.id,'background');}
  else if(remaining>0){for(let i=0;i<remaining;i++)add(candidates[Math.floor((i+.5)*candidates.length/remaining)].id,'background');}
  const drawPriority=({role})=>role==='background'?0:role==='event'?1:role==='selected-event'?3:2;
  return first.sort((a,b)=>drawPriority(a)-drawPriority(b)||a.c.id.localeCompare(b.c.id));
 }
 function path(c,geo,{selected=false}={}){
  if(!mapped(c,geo))return null;
  const [x,y]=geo.project(c.lon,c.lat);
  const id=String(c.id),seed=[...id].reduce((n,ch)=>(Math.imul(n,31)+ch.charCodeAt(0))>>>0,2166136261);
  const phase=(seed%628)/100;
  const rx=selected?42:33,ry=selected?29:23;
  const points=Array.from({length:40},(_,i)=>{
   const t=i/40*Math.PI*2;
   const ripple=1+.10*Math.sin(6*t+phase)+.06*Math.cos(9*t-phase*.7);
   return [x+rx*ripple*Math.cos(t),y+ry*ripple*Math.sin(t)];
  });
  return points.map(([px,py],i)=>(i?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)).join(' ')+' Z';
 }
 function cloudSvg(items,geo){
  return items.map(({c,role,active:isActive})=>{
   const highlighted=role!=='background';
   const d=path(c,geo,{selected:highlighted}),colour=safeColour(c.color);
   if(!d)return '';
   // All geometry is derived from a point + fixed visual halo size.
   // It does not encode historical area, influence radius or political claims.
   return '<path class="atlas-presence-cloud'+(highlighted?' is-highlighted':'')+(isActive?'':' is-outside-lifespan')+'" d="'+d+'" fill="'+colour+'" stroke="'+colour+'" stroke-width="'+(highlighted?3.6:2.3)+'" fill-opacity="'+(highlighted?.29:.16)+'" stroke-opacity="'+(highlighted?.95:.75)+'"><title>'+escape(c.name)+' · illustrative presence halo around reference location; not a historical border'+(isActive?'':' · atlas lifespan does not cover selected date')+'</title></path>';
  }).join('');
 }
 function interaction(sources,key,civs){
  if(!key||!/^[a-z0-9:_-]{1,180}$/i.test(key))return null;
  const byId=new Map(civs.filter(c=>c&&typeof c.id==='string').map(c=>[c.id,c]));
  // Match exact raw event identity resolution in the Interactions view.
  let record=null;
  sources.filter(e=>e&&Number.isFinite(e.year)&&e.title).forEach((e,i)=>{
   const ids=[...new Set((e.societyIds||e.allSocietyIds||[]).filter(id=>byId.has(id)))];
   if(ids.length<2)return;
   const id=e.id||'multi-'+i;
   if(id===key)record={key:id,title:e.title,year:e.year,participants:ids,sourceUrls:e.sourceUrls||[],sourceUrl:e.sourceUrl,detail:e.detail||'',confidence:e.confidence||null};
  });
  return record;
 }
 root.AtlasPresence=Object.freeze({safeColour,mapped,active,choose,path,cloudSvg,interaction});
})(typeof window!=='undefined'?window:globalThis);
