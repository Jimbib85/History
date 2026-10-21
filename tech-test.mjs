import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data=fs.readFileSync(new URL('./public/data.js',import.meta.url),'utf8');
const tech=fs.readFileSync(new URL('./public/tech-data.js',import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(data+'\n'+tech+'\nthis.output={societies:CIVILISATIONS,events:EVENTS,techs:TECHNOLOGIES,branches:TECH_BRANCHES}',context);
const {societies,events,techs,branches}=context.output;
const civs=new Map(societies.map(c=>[c.id,c]));
assert.equal(civs.size,societies.length,'Unique society IDs');
assert.ok(societies.length>=60,'Broader historical coverage');
assert.ok(events.length>=50,'Broader historical events');
assert.ok(techs.length>=12,'Technology records loaded');
for(const c of societies){assert.ok(c.start<=c.end,c.id+' chronology');assert.ok(c.source.startsWith('https://'),c.id+' source');}
for(const event of events)assert.ok(civs.has(event.civ),'Invalid event: '+event.title);
for(const t of techs){
 assert.ok(branches.some(b=>b.id===t.branch),'Missing branch for '+t.id);
 assert.ok(t.appearances.length>=2,'Not comparable: '+t.id);
 for(const a of t.appearances){
  const c=civs.get(a.civ);
  assert.ok(c,'Unknown civilisation in '+t.id+': '+a.civ);
  assert.ok(c.start<=a.year&&a.year<=c.end,'Milestone outside society period: '+t.id+'/'+a.civ);
  assert.ok(a.source?.startsWith('https://'),'Missing source: '+t.id+'/'+a.civ);
 }
}
const html=fs.readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
for(const id of ['technologyDialog','technologyButton','technologyCivilisation','technologyBranches','technologyDetails']) assert.ok(html.includes('id="'+id+'"'), 'Missing UI '+id);
console.log('PASS:',societies.length,'societies,',events.length,'events,',techs.length,'technologies,',techs.reduce((n,t)=>n+t.appearances.length,0),'dated technology comparisons.');