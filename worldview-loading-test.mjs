import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';
const read=x=>readFileSync(new URL('./public/'+x,import.meta.url),'utf8');
const html=read('worldview.html');
const tags=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
assert.deepEqual(tags,['worldview-slim-data.js','worldview-model.js','worldview.js','atlas-links.js'],
 'Worldview must not transitively load heavyweight research and application adapters');
const size=statSync(new URL('./public/worldview-slim-data.js',import.meta.url)).size;
const archiveBytes=['research-classical-data.js','research-1000-1499.js','research-1500-2026-data.js']
 .reduce((sum,x)=>sum+statSync(new URL('./public/'+x,import.meta.url)).size,0);
assert.ok(size<170*1024,'Research-only index should remain below 170 KiB');
assert.ok(size<archiveBytes*.13,'Research-only index should be much smaller than full pack scripts');
const context=vm.createContext({});
vm.runInContext(read('worldview-slim-data.js'),context);
const stats=JSON.parse(vm.runInContext('JSON.stringify({societies:CIVILISATIONS.length,maps:ATLAS_CLASSICAL_PACK.historical_maps.length+ATLAS_MEDIEVAL_PACK.historical_maps.length+ATLAS_MODERN_PACK.historical_maps.length,knowledge:ATLAS_CLASSICAL_PACK.geographical_knowledge.length+ATLAS_MEDIEVAL_PACK.geographical_knowledge.length+ATLAS_MODERN_PACK.geographical_knowledge.length,relationships:ATLAS_CLASSICAL_PACK.relationships.length+ATLAS_MEDIEVAL_PACK.relationships.length+ATLAS_MODERN_PACK.relationships.length})',context));
assert.ok(stats.societies>=450,'Society names and IDs available for contextual links');
assert.equal(stats.maps,19);
assert.equal(stats.knowledge,42);
assert.equal(stats.relationships,127);
console.log('PASS worldview v0.21: 19 maps, 42 knowledge records and 127 relationships in '+(size/1024).toFixed(1)+' KiB source index, versus '+(archiveBytes/1024).toFixed(1)+' KiB original research packs');
