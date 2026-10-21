import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const context=vm.createContext({});
const modules=[
 './public/data.js','./public/entity-types.js',
 './public/research-sources.js','./public/research-events-500a.js','./public/research-events-500b.js','./public/research-events-modern.js','./public/research-tech-records.js','./public/research-civilisations.js','./public/research-apply.js',
 './public/research-1000-1499.js','./public/research-1000-1499-apply.js',
 './public/research-1500-2026-data.js','./public/research-1500-2026-apply.js',
 './public/research-classical-data.js','./public/research-classical-apply.js',
 './public/tech-data.js','./public/tech-extensions.js','./public/research-tech.js','./public/research-1000-1499-tech.js','./public/research-1500-2026-tech.js','./public/research-classical-tech.js'];
for(const file of modules)vm.runInContext(read(file),context,{filename:file,timeout:2500});
const result=vm.runInContext('({c:CIVILISATIONS,e:EVENTS,t:TECHNOLOGIES,pack:ATLAS_CLASSICAL_PACK,raw:ATLAS_CLASSICAL_EVENTS,stats:ATLAS_CLASSICAL_STATS,aliases:ATLAS_CLASSICAL_ALIAS,techImported:ATLAS_CLASSICAL_TECH_IMPORTED,techUnmapped:ATLAS_CLASSICAL_TECH_UNMAPPED})',context);
const {c,e,t,pack,raw,stats,aliases,techImported,techUnmapped}=result;
const byId=new Map(c.map(s=>[s.id,s]));
assert.equal(byId.size,c.length,'Every society must have one canonical ID');
assert.equal(pack.societies.length,153);
assert.equal(pack.events.length,83);
assert.equal(pack.technology_developments.length,63);
assert.equal(pack.source_register.length,61);
assert.equal(pack.source_claims.length,618);
assert.equal(stats.added+stats.reused+stats.researchOnly,153,'Each input entity accounted for');
assert.equal(raw.length,83,'All original events preserved, even without a society');
assert.equal(techImported+techUnmapped,63,'Every technology development accounted for');
assert.equal(byId.get('athens').start,-507,'No double BCE normalization (508 BCE => -507)');
assert.equal(byId.get('rome').start,-26,'Roman Principate begins 27 BCE');
assert.ok(byId.get('byzantium').end>=1453,'Eastern Roman state survives 476 CE');
assert.equal(byId.get('aboriginal').kind,'overview','No single Australian political entity');
assert.ok(!c.some(x=>x.researchBatch==='500BCE-500CE'&&x.id==='west_polynesia'),'Region-wide overview not imported as a new polity bar');
assert.ok(byId.has('roman_republic'),'Republic distinct from imperial Rome');
assert.ok(byId.has('western_han')&&byId.has('eastern_han'),'Period-specific Han political records preserved');
assert.ok(c.every(x=>x.kind==='overview'||(Number.isInteger(x.start)&&Number.isInteger(x.end)&&x.start<=x.end)));
assert.ok(c.every(x=>x.lon===undefined||Number.isFinite(x.lon)&&Math.abs(x.lon)<=180));
assert.ok(c.every(x=>x.lat===undefined||Number.isFinite(x.lat)&&Math.abs(x.lat)<=90));
const sourceId=new Set(pack.source_register.map(s=>s.id));
for(const row of pack.source_claims)assert.ok(sourceId.has(row.source_id),'Source claim must resolve '+row.source_id);
const eventIds=new Set();for(const ev of e){assert.ok(byId.has(ev.civ),'Linked event society missing: '+ev.civ);const key=ev.title.toLowerCase()+'|'+ev.year;assert.ok(!eventIds.has(key),'Repeated event with identical title/year '+key);eventIds.add(key);}
for(const topic of t){assert.ok(topic.appearances.length,'No empty technology topic '+topic.id);for(const obs of topic.appearances){assert.ok(byId.has(obs.civ),'Unlinked technology '+obs.civ);assert.ok(obs.year>=byId.get(obs.civ).start&&obs.year<=byId.get(obs.civ).end,'Tech record point outside society date range');assert.ok(obs.source?.startsWith('https://'),'Technology source missing');}}
const ancient=t.flatMap(x=>x.appearances.filter(o=>o.researchBatch==='500BCE-500CE'));
assert.equal(ancient.length,techImported);
assert.ok(ancient.every(x=>x.sourceStatus&&x.dateLabel&&x.validStart<x.validEndExclusive),'Uncertain technology date/status lost');
assert.ok(raw.some(x=>x.year<=0&&x.humanDate?.includes('BCE')),'BCE event labels missing');
assert.ok(raw.every(x=>x.sourceUrl?.startsWith('https://')),'Missing source URL on imported event');
for(const page of ['./public/index.html','./public/compare.html']){
 const html=read(page);
 assert.ok(html.includes('research-classical-data.js')&&html.includes('research-classical-apply.js'));
 assert.ok(html.indexOf('research-classical-data.js')<html.indexOf('research-classical-apply.js'));
}
assert.ok(read('./public/index.html').includes('research-classical-tech.js'));
assert.ok(read('./public/compare.js').includes('ATLAS_CLASSICAL_EVENTS'));
console.log('PASS classical merge',JSON.stringify({entities:c.length,events:e.length,technologyTopics:t.length,added:stats.added,reused:stats.reused,researchOnly:stats.researchOnly,eventsAttached:stats.eventsAttached,techImported,techUnmapped,rawEvents:raw.length,sources:pack.source_register.length,claims:pack.source_claims.length}));