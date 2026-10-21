import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = file => fs.readFileSync(new URL(file,import.meta.url),'utf8');
const s = vm.createContext({});
const base=['./public/data.js','./public/entity-types.js'];
const imported=['./public/research-sources.js','./public/research-events-500a.js','./public/research-events-500b.js','./public/research-events-modern.js','./public/research-tech-records.js','./public/research-civilisations.js','./public/research-apply.js'];
const tech=['./public/tech-data.js','./public/tech-extensions.js','./public/research-tech.js'];
for(const f of [...base,...imported,...tech])vm.runInContext(read(f),s,{filename:f});
const data=vm.runInContext('({c:CIVILISATIONS,e:EVENTS,raw:ATLAS_RESEARCH_EVENTS,rawTech:ATLAS_RESEARCH_TECH_DEVELOPMENTS,sources:ATLAS_RESEARCH_SOURCES,tech:TECHNOLOGIES,stats:ATLAS_IMPORT_STATS,applied:ATLAS_TECH_IMPORTED,unmapped:ATLAS_TECH_UNMAPPED})',s);
const ids=new Map(data.c.map(c=>[c.id,c]));
assert.equal(ids.size,data.c.length,'No duplicate entity IDs');
assert.ok(data.c.length>=120,'Expanded catalogue');
assert.equal(data.raw.filter(x=>x.origin==='500-999').length,93);
assert.equal(data.raw.filter(x=>x.origin==='1500-2026').length,37);
assert.equal(data.rawTech.length,51);
assert.equal(Object.keys(data.sources).length,67);
assert.ok(data.c.find(c=>c.id==='aboriginal').kind==='overview','Pan-Australian overview must not occupy a dated society lane');
assert.ok(data.raw.every(e=>Number.isInteger(e.year)&&e.endExclusive>e.year&&e.sourceUrl?.startsWith('https://')&&e.confidence),'Sourced, bounded event evidence');
assert.ok(data.c.every(c=>c.kind==='overview'||(Number.isFinite(c.start)&&c.start<=c.end&&c.source?.startsWith('https://'))),'Dated entities retain sources');
assert.ok(data.c.every(c=>Number.isFinite(c.lon)&&Math.abs(c.lon)<=180&&Number.isFinite(c.lat)&&Math.abs(c.lat)<=90),'Representative coordinates valid');
const attached=data.e.filter(e=>e.researchId);
assert.ok(attached.length>=100,'At least 100 source-linked events attached to main atlas');
assert.ok(attached.every(e=>ids.has(e.civ)),'No invalid entity references in timeline events');
const historical=data.e.find(e=>e.title==='Haitian independence');assert.ok(historical.civ==='haiti','Correct 1804 historical attribution');
const colonial=data.e.find(e=>e.title==='British colony established at Sydney Cove');assert.ok(colonial.civ==='new-south-wales-colony','Correct NSW colonial event attribution');
assert.equal(data.applied+data.unmapped,51,'Technology records accounted for');
for(const topic of data.tech){
 for(const a of topic.appearances){const civ=ids.get(a.civ);assert.ok(civ,'Unknown tech society '+a.civ);assert.ok(civ.start<=a.year&&a.year<=civ.end,'Tech plot position outside society '+a.civ);assert.ok(a.source?.startsWith('https://'),'Unsourced technology claim');}
}
for(const f of ['./public/compare.html','./public/index.html']){
 const html=read(f);for(const res of ['research-sources.js','research-events-modern.js','research-apply.js'])assert.ok(html.includes(res),'Missing imported dataset from '+f);
}
const compare=read('./public/compare.js');
assert.ok(compare.includes('researchEvents')&&compare.includes('data-research-event'),'Missing research events comparison integration');
assert.ok(compare.includes('HistoryRowOrder'),'Missing custom sorting hook');
const compareHtml=read('./public/compare.html');
assert.ok(compareHtml.includes('compare-order.js')&&compareHtml.includes('compare-order.css'),'Custom reorder controls missing');
console.log('PASS Atlas v0.6:',data.c.length,'entities,',data.e.length,'timeline events,',data.raw.length,'research events,',data.tech.length,'technology topics,',data.applied,'new tech appearances,',data.unmapped,'unmapped retained,',Object.keys(data.sources).length,'sources.');