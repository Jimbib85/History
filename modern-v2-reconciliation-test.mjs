import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const model=vm.createContext({URL,URLSearchParams,console});model.window=model;
const scriptFiles=[...read('./public/index.html').matchAll(/<script src="([^"?]+)[^"]*"/g)]
  .map(x=>x[1]).filter(f=>!['story-navigation.js','app.js','technology-tree.js','atlas-links.js'].includes(f)&&!f.startsWith('atlas-master-'));
for(const file of scriptFiles)vm.runInContext(read('./public/'+file),model,{filename:file});
const stats=JSON.parse(vm.runInContext('JSON.stringify({pack:AtlasModernV2Reconciled,ev:ATLAS_MODERN_V2_REPORT,tech:ATLAS_MODERN_V2_TECH_REPORT,events:ATLAS_MODERN_V2_NEW_EVENTS,societies:CIVILISATIONS.length,allEvents:EVENTS,allTech:TECHNOLOGIES})',model));
assert.equal(stats.pack.events.length,97);
assert.equal(stats.pack.tech.length,28);
assert.equal(stats.pack.conflicts.length,18);
assert.equal(stats.pack.additionalConflictEvidence.length,8);
assert.equal(stats.societies,511,'Identity-only actor references must not become societies');
assert.equal(stats.pack.report.events.existing+stats.pack.report.events.point+stats.pack.report.events.context+(stats.pack.report.events.review||0),97);
assert.equal(stats.ev.pointsAdded.length+stats.ev.sourceEnriched.length+stats.ev.context.length+stats.ev.ambiguous.length,97);
assert.equal(new Set(stats.ev.pointsAdded).size,stats.ev.pointsAdded.length);
assert.ok(stats.ev.sourceEnriched.length>=25,'Existing events should gain matching v2 evidence');
assert.ok(stats.ev.pointsAdded.length>=5,'New precise events should enter Story');
for(const e of stats.events){
 assert.equal(e.endExclusive,e.year+1,'Only truly single-year entries promoted');
 assert.equal(e.temporalKind,'POINT');
 assert.ok(e.sourceUrl?.startsWith('https://')||e.sourceUrl?.startsWith('http://'));
 assert.ok(e.claimIds.length>0);
 assert.ok(!e.id.includes('atlantic_slavery_system'),'Long processes must never become single-year entries');
 assert.ok(!e.id.includes('potosi_system'));
}
for(const t of stats.allTech)for(const a of t.appearances){
 if(!a.researchId?.startsWith('modern-v2-'))continue;
 assert.equal(a.validEndExclusive,a.validStart+1);
 assert.ok(a.source?.startsWith('http'));
 assert.ok(a.civ);
}
assert.equal(stats.tech.added.length+stats.tech.enriched.length+stats.tech.context.length+stats.tech.unmapped.length>=28,true);
assert.ok(stats.tech.context.includes('td_edo_urban_print'),'Edo observation window is not an invented precise invention year');
assert.equal(stats.pack.events.filter(e=>e.type==='review').length,0,'Shared historical IDs reconciled with same-year source variants');
assert.equal(stats.pack.events.filter(e=>e.match==='shared_id_same_year').length,39);
assert.equal(stats.ev.sourceEnriched.length,72);
assert.equal(stats.ev.ambiguous.length,0);
const c=vm.createContext({URL,URLSearchParams,console});
for(const file of ['conflicts-data.js','modern-v2-reconciled-data.js','modern-v2-reconcile-conflicts.js'])
 vm.runInContext(read('./public/'+file),c,{filename:file});
const wars=JSON.parse(vm.runInContext('JSON.stringify({records:ATLAS_CONFLICTS_DATA.records,report:ATLAS_MODERN_V2_CONFLICT_REPORT})',c));
assert.equal(wars.report.enriched.length+wars.report.added.length+wars.report.review.length,26,'Every conflict, battle and treaty reconciled');
assert.equal(new Set(wars.records.map(x=>x.id)).size,wars.records.length,'No duplicated conflict record IDs');
for(const id of wars.report.added){
 const row=wars.records.find(e=>e.id==='modern-v2-'+id);
 assert.ok(row);
 assert.ok(row.sources.length);
 assert.equal(row.independentlyCorroborated,false);
 if(row.type==='conflict'&&row.hierarchy!=='INDIVIDUAL_CONFLICT')
   assert.notEqual(row.hierarchy,'INDIVIDUAL_CONFLICT');
}
assert.ok(wars.records.some(e=>e.id==='modern-v2-complex_afghan_intervention'||e.additionalResearch?.some(x=>x.id==='modern-v2-complex_afghan_intervention')));
for(const page of ['index.html','story.html','compare.html'])assert.ok(read('./public/'+page).includes('modern-v2-reconcile-apply.js'));
assert.ok(read('./public/index.html').includes('modern-v2-reconcile-tech.js'));
assert.ok(read('./public/conflicts.html').includes('modern-v2-reconcile-conflicts.js'));
console.log('PASS v0.24 reconciliation',JSON.stringify({matched:stats.ev.sourceEnriched.length,newExactEvents:stats.ev.pointsAdded.length,context:stats.ev.context.length,review:stats.ev.ambiguous.length,tech:stats.tech,conflicts:wars.report}));
