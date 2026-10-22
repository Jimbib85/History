import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('./public/'+p,import.meta.url),'utf8');
const html=read('index.html');
assert.match(html,/id="modernV2InstitutionEvidence"/);
assert.match(html,/modern-v2-institution-tech\.js\?v=0\.25\.0/);
assert.match(read('technology-viz.css'),/tech-institutional\[hidden\]/);
const listeners={};
const controls={
 modernV2InstitutionEvidence:{hidden:true,open:false,addEventListener(n,f){listeners.panel=f}},
 modernV2InstitutionRecords:{innerHTML:''},
 technologyCivilisation:{value:'all',addEventListener(n,f){listeners.scope=f}},
 technologyDialog:{addEventListener(n,f){listeners.dialog=f}}
};
const document={getElementById:id=>controls[id]||null};
const context=vm.createContext({document,console});
vm.runInContext(read('modern-v2-reconciled-data.js'),context);
vm.runInContext(read('modern-v2-institution-tech.js'),context);
const api=context.AtlasModernV2InstitutionEvidence;
assert.equal(api.count,19,'All remaining precise institutional technology records should remain visible globally');
assert.ok(api.topics>=8,'The reader should group institutional evidence by distinct research topics');
assert.equal(controls.modernV2InstitutionEvidence.hidden,false);
assert.equal((controls.modernV2InstitutionRecords.innerHTML.match(/class="tech-institution-item"/g)||[]).length,19);
assert.ok(controls.modernV2InstitutionRecords.innerHTML.includes('source'));
assert.ok(controls.modernV2InstitutionRecords.innerHTML.includes('Claim IDs:'));
controls.technologyCivilisation.value='some-society';
listeners.scope();
assert.equal(controls.modernV2InstitutionEvidence.hidden,true,'Institution-only records must disappear in society filter');
controls.technologyCivilisation.value='all';
listeners.scope();
assert.equal(controls.modernV2InstitutionEvidence.hidden,false);
const reconciled=JSON.parse(vm.runInContext('JSON.stringify(AtlasModernV2Reconciled)',context));
assert.equal(reconciled.events.filter(e=>e.match==='shared_id_same_year').length,39);
assert.ok(reconciled.events.filter(e=>e.match==='shared_id_same_year').every(e=>
 e.type==='existing'&&e.canonicalTargets?.length===2),'Each shared ID should retain both archive references');
assert.equal(reconciled.events.filter(e=>e.type==='review').length,0);
assert.equal(reconciled.events.filter(e=>e.type==='existing').length,72);
assert.equal(reconciled.events.filter(e=>e.type==='context').length,15);
assert.equal(reconciled.events.filter(e=>e.type==='point').length,10);
console.log('PASS v0.25: all 39 shared historical IDs reconciled without new events, 19 institution-only tech observations accessible with society-scope isolation');
