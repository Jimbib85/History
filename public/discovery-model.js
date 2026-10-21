/* Read-only discovery and curation on top of the compact research excerpt.
 * Editorial pairings are prompts to compare, never assertions of historical contact.
 */
(function(root){
'use strict';
const JOURNEYS=Object.freeze([
 {id:'daily-life',title:'A day in different worlds',subtitle:'Homes, work and the shape of ordinary life',
  note:'These examples come from different societies and centuries. They are comparisons, not a shared historical experience.',
  ids:['classical:culture_roman_urban_households','classical:culture_rome_bath','medieval:song_urban','modern:swahili_household']},
 {id:'craft-exchange',title:'What people made and traded',subtitle:'Material culture, skilled labour and commerce',
  note:'Similar practices do not establish borrowing or contact. Read each record on its own evidence.',
  ids:['classical:culture_punic_trade','medieval:chola_bronze','medieval:goryeo_celadon','modern:akan_gold_weights']},
 {id:'learning-writing',title:'Learning, letters and scholarship',subtitle:'How knowledge appeared in different settings',
  note:'No linear invention story is implied. Each account reflects its own sources and traditions.',
  ids:['classical:culture_maurya_edicts','medieval:heian_literature','medieval:joseon_scholarship','modern:songhai_timbuktu']},
 {id:'belief-community',title:'Belief and community',subtitle:'Monastic networks, ritual traditions and institutions',
  note:'Different religious settings should not be merged into one tradition or treated as interchangeable.',
  ids:['classical:culture_south_asia_monasteries','medieval:chola_temples','medieval:goryeo_buddhism','modern:ethiopia_church']}
]);
function year(y){return y<=0?String(1-y)+' BCE':String(y)+' CE';}
function period(record){
 if(record.start===null)return 'Not dated in this research record';
 if(record.endExclusive===null||record.endExclusive===record.start+1)return year(record.start);
 return year(record.start)+' – '+year(record.endExclusive-1);
}
function src(record){
 return (record.sourceItems||[]).filter(item=>{try{return /^https?:$/.test(new URL(item.url).protocol)}catch(_){return false}});
}
function create(records){
 const data=records.filter(r=>r&&typeof r.id==='string');
 const byId=new Map(data.map(r=>[r.id,r]));
 if(byId.size!==data.length)throw Error('Duplicate cultural-practice ID');
 for(const guide of JOURNEYS)for(const id of guide.ids)if(!byId.has(id))throw Error('Missing curated source record: '+id);
 function journey(id){const g=JOURNEYS.find(x=>x.id===id);return g?{...g,steps:g.ids.map(key=>byId.get(key))}:null;}
 function peers(selectedYear,limit=6){
   if(!Number.isSafeInteger(selectedYear)||limit<=0)return [];
   const eligible=data.filter(r=>r.start!==null&&r.endExclusive!==null&&r.start<=selectedYear&&r.endExclusive>selectedYear);
   const results=[],seen=new Set();
   // Prefer distinct societies, then fill with remaining records, in stable title order.
   eligible.sort((a,b)=>a.scope.localeCompare(b.scope)||a.title.localeCompare(b.title));
   for(const item of eligible){
     const key=item.societyIds[0]||item.region||item.id;
     if(seen.has(key))continue;
     seen.add(key);results.push(item);
     if(results.length>=limit)return results;
   }
   for(const item of eligible)if(!results.includes(item)){results.push(item);if(results.length>=limit)break;}
   return results;
 }
 function random({avoid=[],rng=Math.random}={}){
   const pool=data.filter(r=>src(r).length);
   if(!pool.length)return null;
   const blacklist=new Set(avoid);
   const choices=pool.filter(r=>!blacklist.has(r.id));
   const list=choices.length?choices:pool;
   const n=rng(),fraction=Number.isFinite(n)?Math.max(0,Math.min(0.999999,n)):0;
   return list[Math.floor(fraction*list.length)];
 }
 function get(id){return byId.get(id)||null;}
 return Object.freeze({JOURNEYS,all:data,byId,journey,peers,random,get,period,year,src});
}
root.AtlasDiscovery=Object.freeze({create,JOURNEYS,period,year});
})(typeof window!=='undefined'?window:globalThis);
