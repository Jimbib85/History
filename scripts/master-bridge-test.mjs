import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../public');
const files=(await readdir(root)).filter(n=>/^atlas-master-(core|tech)-\d\d\.js$/.test(n)).sort();
assert(files.length>=2,'Generated master data missing');
const CIVILISATIONS=[
 {id:'abbasid',name:'Abbasid Caliphate',region:'West Asia',kind:'empire',start:750,end:1258,at:900,source:'https://example.com',color:'#aa'},
 {id:'song',name:'Song dynasty',region:'East Asia',kind:'empire',start:960,end:1279,at:1100,source:'https://example.com',color:'#bb'},
 {id:'olmec',name:'Olmec cultures',region:'Americas',kind:'society',start:-1499,end:-399,at:-900,source:'https://example.com',color:'#cc'},
];
const EVENTS=[{year:868,title:'Diamond Sutra printed',civ:'song',kind:'Printing',detail:'Original atlas milestone'}];
const TECHNOLOGIES=[{id:'paper',name:'Papermaking',branch:'printing',era:'Medieval',description:'Paper',appearances:[]},
 {id:'woodblock',name:'Woodblock printing',branch:'printing',era:'Medieval',description:'Printing',appearances:[]}];
const TECH_BRANCHES=[{id:'food'},{id:'materials'},{id:'records'},{id:'printing'},{id:'navigation'},{id:'warfare'}];
const sandbox=vm.createContext({CIVILISATIONS,EVENTS,TECHNOLOGIES,TECH_BRANCHES});
for(const name of files.filter(n=>n.includes('-core-'))){vm.runInContext(await readFile(resolve(root,name),'utf8'),sandbox,{filename:name});}
vm.runInContext(await readFile(resolve(root,'atlas-master-core-apply.js'),'utf8'),sandbox,{filename:'atlas-master-core-apply.js'});
for(const name of files.filter(n=>n.includes('-tech-'))){vm.runInContext(await readFile(resolve(root,name),'utf8'),sandbox,{filename:name});}
vm.runInContext(await readFile(resolve(root,'atlas-master-tech-apply.js'),'utf8'),sandbox,{filename:'atlas-master-tech-apply.js'});
const m=sandbox.ATLAS_MASTER_REPORT,t=sandbox.ATLAS_MASTER_TECH_REPORT;
assert.equal(m.input,2816,'Core row count differs from the canonical archive');
assert(m.entitiesAdded>150,'Dated societies should appear in the map and comparison');
assert(m.entitiesMatched>=1,'Existing identities must be enriched instead of duplicated');
assert(m.eventsAdded>400,'Bulk event integration is incomplete');
assert(m.eventsMidpoint>20,'Broad dates should be represented by labelled midpoints');
console.log("BEFORE ASSERT",JSON.stringify({m,t}));
assert(t.milestonesAdded>100,'Technology evidence did not connect to society records');
assert(t.topicsAdded>5,'Missing technology topics should be added');
assert(CIVILISATIONS.filter(c=>c.researchBatch==='master-10000-years').every(c=>Number.isSafeInteger(c.start)&&Number.isSafeInteger(c.end)&&c.end>=c.start&&!('lat' in c)&&!('lon' in c)),'Imported society spans or map points are invalid');
assert(sandbox.ATLAS_MASTER_EVENTS.every(e=>e.catalogueId&&e.sourceUrls.length&&Number.isSafeInteger(e.year)&&e.year>=-9999&&e.year<=2026),'Every imported event must retain a source and valid year');
assert(sandbox.ATLAS_MASTER_EVENTS.some(e=>e.masterApproximate&&/midpoint/i.test(e.evidenceNote)),'Approximate placement not disclosed');
assert(TECHNOLOGIES.every(t=>TECH_BRANCHES.some(b=>b.id===t.branch)),'Invalid technology family');
assert(TECHNOLOGIES.every(t=>t.appearances.every(a=>CIVILISATIONS.some(c=>c.id===a.civ))),'Technology milestones must have a linked society');
assert(!sandbox.ATLAS_MASTER_EVENTS.some(e=>/LEAD_ONLY/.test(e.evidenceStatus)),'Unresolved leads cannot become timeline events');
const count1=EVENTS.length,tech1=TECHNOLOGIES.reduce((n,x)=>n+x.appearances.length,0);
// Re-run adapters with their data loaded again: IDs must not duplicate.
for(const name of files.filter(n=>n.includes('-core-'))){vm.runInContext(await readFile(resolve(root,name),'utf8'),sandbox,{filename:name});}
vm.runInContext(await readFile(resolve(root,'atlas-master-core-apply.js'),'utf8'),sandbox);
for(const name of files.filter(n=>n.includes('-tech-'))){vm.runInContext(await readFile(resolve(root,name),'utf8'),sandbox,{filename:name});}
vm.runInContext(await readFile(resolve(root,'atlas-master-tech-apply.js'),'utf8'),sandbox);
assert.equal(EVENTS.length,count1,'Reimport should not duplicate map events');
assert.equal(TECHNOLOGIES.reduce((n,x)=>n+x.appearances.length,0),tech1,'Reimport should not duplicate technology evidence');
console.log('Master bridge:',JSON.stringify({first:m,technology:t,afterReimport:sandbox.ATLAS_MASTER_REPORT}));