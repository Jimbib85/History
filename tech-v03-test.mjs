import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir = new URL('./public/',import.meta.url);
const source = name => fs.readFileSync(new URL(name,dir),'utf8');
const context=vm.createContext({});
for(const path of ['data.js','tech-data.js','tech-extensions.js','tech-pathways.js']) vm.runInContext(source(path),context,{filename:path});
const summary=vm.runInContext('({civilisations:CIVILISATIONS,technologies:TECHNOLOGIES,pathways:TECH_PATHWAYS,branches:TECH_BRANCHES})',context);
const ids=new Map(summary.civilisations.map(c=>[c.id,c]));
assert.equal(summary.technologies.length,14);
const keys=new Set(summary.technologies.map(t=>t.id));
for(const t of summary.technologies){
 assert.ok(t.appearances.length>=2,`Too few dated records: ${t.id}`);
 for(const a of t.appearances){
   assert.ok(ids.has(a.civ),`Unknown society ${a.civ}`);
   assert.ok(a.year>=ids.get(a.civ).start&&a.year<=ids.get(a.civ).end,`Date mismatch ${t.id}/${a.civ}`);
   assert.ok(/^https:\/\//.test(a.source),`Missing source ${t.id}/${a.civ}`);
 }
}
for(const link of summary.pathways){
 const t=summary.technologies.find(t=>t.id===link.tech);
 assert.ok(t,`Missing technology ${link.tech}`);
 assert.ok(t.appearances.some(a=>a.civ===link.from),`Invalid link start ${link.tech}`);
 assert.ok(t.appearances.some(a=>a.civ===link.to),`Invalid link end ${link.tech}`);
 assert.ok(link.source.startsWith('https://'));
 assert.ok(link.detail.length>70);
}
const html=source('index.html');
for(const asset of ['technology-viz.css','tech-pathways.js','tech-extensions.js','technology-tree.js'])assert.ok(html.includes(asset),`Not loading ${asset}`);
class El {
 constructor(){this.innerHTML='';this.value='';this.listeners={};this.showing=false;}
 addEventListener(n,f){this.listeners[n]=f;}
 showModal(){this.showing=true;}
 close(){this.showing=false;}
 scrollTo(){}
}
const dom=Object.fromEntries(['technologyDialog','technologyBranches','technologyDetails','technologyCivilisation','technologyButton','closeTechnology','randomTechnology'].map(id=>[id,new El()]));
context.document={getElementById:id=>dom[id]};
context.window={WorldHistoryAtlas:{state:{civ:'rome'},selectCiv(){},setYear(){}}};
vm.runInContext(source('technology-tree.js'),context,{filename:'technology-tree.js'});
context.window.WorldHistoryTechnology.open();
assert.ok(dom.technologyDialog.showing);
assert.ok(dom.technologyBranches.innerHTML.includes('Road and courier networks'));
assert.ok(dom.technologyDetails.innerHTML.includes('Same scale across societies'));
dom.technologyDetails.listeners.click({target:{closest:selector=>selector==='[data-viz]'?{dataset:{viz:'map'}}:null}});
assert.ok(dom.technologyDetails.innerHTML.includes('Modern basemap'));
assert.ok(dom.technologyDetails.innerHTML.includes('Curated connections'));
console.log(`PASS: ${summary.technologies.length} technologies, ${summary.pathways.length} curated connections, two display modes`);