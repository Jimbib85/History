import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const get=p=>fs.readFileSync(new URL('./public/'+p,import.meta.url),'utf8');
const pages=['index','story','compare','interactions','worldview','discover','conflicts'];
for(const p of pages){
 const html=get(p+'.html');
 assert.match(html,/atlas-crossnav/,p+' must retain shared navigation');
 assert.match(html,/atlas-journey\.css/,p+' must retain the shared design');
 assert.doesNotMatch(html,/class="(?:honesty|reader-warning|evidence-note|interaction-explainer|research-note)"/,p+' still has a large research-warning panel');
}
const index=get('index.html'),interaction=get('interactions.html'),reader=get('interactions.js');
for(const id of ['mapPresenceClouds','mapCliopatriaShapes','mapPresenceNote','atlasSeshatStatus','togglePresenceClouds','mapInteractionContext','researchedExtentButtons'])assert.ok(index.includes('id="'+id+'"'),id+' map control missing');
assert.match(index,/Sources and credits/);
assert.match(index,/doi\.org\/10\.5281\/zenodo/);
assert.doesNotMatch(index,/Map honesty:/);
assert.doesNotMatch(index,/Not historical borders/);
for(const id of ['interactionSociety','interactionTimeRibbon','interactionNetwork','interactionDetailPanel','interactionPlayRecords'])assert.ok(interaction.includes('id="'+id+'"'),id+' interaction control missing');
assert.doesNotMatch(interaction,/Co-mention alone does not establish bilateral contact/);
assert.doesNotMatch(reader,/Evidence boundaries/);
assert.match(reader,/Sources ↗/);
assert.match(get('app.js'),/record-context/,'Optional record annotations remain accessible on demand');
assert.match(get('atlas-presence-map.js'),/note\.hidden/,'Non-actionable map notices are hidden');
assert.match(get('atlas-cliopatria-map.js'),/status\.textContent=count/,'Compact geographical status remains');
for(const p of ['app.js','atlas-presence.js','atlas-cliopatria.js','atlas-presence-map.js','atlas-cliopatria-map.js','interactions.js','story-app.js','compare.js','worldview.js','discovery.js','conflicts-app.js','technology-tree.js','technology-journey.js','research-expansion-view.js','modern-v2-view.js','classical-reviewed-view.js','map-intake-view.js']){
 new vm.Script(get(p),{filename:p});
}
console.log('PASS decluttered Atlas UI: navigation, sources, map controls and historical readers preserved');
