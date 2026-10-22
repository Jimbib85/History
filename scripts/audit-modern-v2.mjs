import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const b64=read('./public/modern-v2-data.js').match(/ATLAS_MODERN_V2_GZIP = '([^']+)'/)[1];
const pack=JSON.parse(gunzipSync(Buffer.from(b64,'base64')));
const earlier=JSON.parse(read('./public/research-1500-2026-data.js').split('ATLAS_MODERN_PACK=')[1].replace(/;\s*$/,''));
const index=(earlier.events||[]).map(e=>({id:e.id,title:e.title,year:e.start_year,end:e.end_year_exclusive}));
const types=['events','technology_developments','conflicts','conflict_participations','battles_and_sieges','treaties_and_settlements','societies','technology_transmission'];
function normalized(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
for(const k of types){
 const rows=pack.tables[k]||[];
 const fields=[...new Set(rows.slice(0,4).flatMap(x=>Object.keys(x)))];
 const examples=rows.slice(0,5).map(x=>Object.fromEntries(['id','title','name','summary','original_date_text','temporal_kind','start_year','end_year_exclusive','society_ids','technology_id','development_type','review_status','claim_ids','source_ids','category','parent_id','parent_ids'].filter(f=>x[f]!==undefined).map(f=>[f,x[f]])));
 const match=rows.filter(x=>index.some(y=>normalized(y.id)===normalized(x.id)||normalized(y.title)===normalized(x.title))).length;
 console.log('AUDIT',JSON.stringify({table:k,count:rows.length,fields,match,examples}).slice(0,11500));
}
console.log('PACK_TOP',JSON.stringify({keys:Object.keys(pack),quality:pack.quality,metadata:pack.metadata}).slice(0,4000));
console.log('EARLIER',JSON.stringify({events:index.slice(0,8),tech:(earlier.technology_developments||[]).slice(0,4)}).slice(0,4500));
