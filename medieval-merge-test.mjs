import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const scripts=['./public/data.js','./public/entity-types.js','./public/research-sources.js','./public/research-events-500a.js','./public/research-events-500b.js','./public/research-events-modern.js','./public/research-tech-records.js','./public/research-civilisations.js','./public/research-apply.js','./public/research-1000-1499.js','./public/research-1000-1499-apply.js','./public/tech-data.js','./public/tech-extensions.js','./public/research-tech.js','./public/research-1000-1499-tech.js'];
const context=vm.createContext({});
for(const file of scripts)vm.runInContext(read(file),context,{filename:file});
const x=vm.runInContext('({c:CIVILISATIONS,e:EVENTS,raw:ATLAS_MEDIEVAL_PACK,events:ATLAS_MEDIEVAL_EVENTS,stats:ATLAS_MEDIEVAL_STATS,technologies:TECHNOLOGIES,imported:ATLAS_MEDIEVAL_TECH_IMPORTED,unmapped:ATLAS_MEDIEVAL_TECH_UNMAPPED,aliases:ATLAS_MEDIEVAL_ALIAS})',context);
const counts={societies:193,events:108,technologies:39,technology_developments:71,figures:54,places:28,relationships:47,historical_maps:6,geographical_knowledge:19,cultural_practices:30,connections:20,source_claims:723,source_register:95,research_gaps:22};
for(const [kind,count] of Object.entries(counts))assert.equal(x.raw[kind].length,count,`Preserve ${kind}`);
const ids=new Map(x.c.map(c=>[c.id,c]));assert.equal(ids.size,x.c.length,'No duplicate society IDs');
assert.equal(x.events.length,108,'All raw medieval events accessible');
assert.equal(x.imported+x.unmapped,71,'All 71 technology observations accounted for');
assert.ok(x.technologies.every(t=>t.appearances.length),'No empty technology topics');
assert.equal(ids.get('aboriginal').kind,'overview','Pan-Australian culture must not become a continuous dated society');
for(const c of x.c){if(c.kind==='overview')continue;assert.ok(c.start<=c.end&&Number.isFinite(c.start),'Invalid society dates '+c.id);if(c.researchBatch==='1000-1499')assert.ok(c.source?.startsWith('https://'),'Missing research source '+c.id);}
for(const e of x.e)assert.ok(ids.has(e.civ),'Event invalid civilisation '+e.title);
for(const e of x.events){assert.ok(Number.isInteger(e.year)&&e.endExclusive>e.year);if(e.civ)assert.ok(ids.has(e.civ));}
for(const t of x.technologies)for(const a of t.appearances){const c=ids.get(a.civ);assert.ok(c,'Invalid technology society');assert.ok(c.start<=a.year&&a.year<=c.end,'Technology date outside civilisation');}
for(const id of ['great_zim','maori','mongols','mali','ottomans'])assert.ok(ids.has(x.aliases[id]),'Legacy crosswalk missing '+id);
const compare=read('./public/compare.js');const app=read('./public/app.js');const tech=read('./public/technology-tree.js');
assert.ok(compare.includes('ATLAS_MEDIEVAL_EVENTS'),'Compare must surface imported events');
assert.ok(app.includes('Number.isFinite(c.lon)'),'Map must guard against missing coordinates');
assert.ok(tech.includes('records.filter(record'),'Technology map must guard missing coordinates');
for(const file of ['./public/index.html','./public/compare.html']){
 const content=read(file);for(const script of ['research-1000-1499.js','research-1000-1499-apply.js'])assert.ok(content.includes(script),'Missing import script in '+file);
}
assert.ok(read('./public/index.html').includes('research-1000-1499-tech.js'),'Missing technology adapter');
console.log('PASS medieval merge',JSON.stringify({entities:x.c.length,linkedEvents:x.e.length,medievalSourceEvents:x.events.length,techImported:x.imported,techResearchOnly:x.unmapped,sources:x.raw.source_register.length}));