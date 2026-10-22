import fs from 'node:fs';import vm from 'node:vm';import {gunzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const r=JSON.parse(read('public/modern-v2-reconciled-data.js').split(' = ')[1].replace(/;\s*$/,''));
const base=JSON.parse(read('public/research-1500-2026-data.js').split('ATLAS_MODERN_PACK=')[1].replace(/;\s*$/,''));
const c=vm.createContext({});vm.runInContext(read('public/research-expansion-data.js'),c);const expansion=vm.runInContext('AtlasExpansionData.packs',c).find(p=>p.id==='modern');
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const all=[...base.events,...expansion.tables.events];
for(const e of r.events.filter(e=>e.type==='review')){
 const matches=all.map(a=>({r:a,score:(a.start_year===e.start?5:0)+(norm(a.title)===norm(e.title)?8:0)+(Math.abs(a.start_year-e.start)<5?2:0)+(norm(a.title).split(' ').filter(w=>w.length>3&&norm(e.title).includes(w)).length)})).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>({id:x.r.id,title:x.r.title,year:x.r.start_year,score:x.score}));
 console.log('EVENT',JSON.stringify({id:e.id,title:e.title,year:e.start,kind:e.temporal,reason:e.match,candidates:matches}));
}
const names=JSON.parse(read('public/worldview-slim-data.js').match(/const CIVILISATIONS = (\[[^;]+\]);/)?.[1]||'[]');
const nmap=new Map(names.map(x=>[x.id,x.name]));
for(const t of r.tech.filter(t=>t.temporal==='POINT')){
 console.log('TECH',JSON.stringify({id:t.id,title:t.title,year:t.start,societies:t.societyIds.map(id=>({id,name:nmap.get(id)||''})),topic:t.topicId}));
}
