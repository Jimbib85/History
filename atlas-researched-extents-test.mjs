import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('./public/'+p,import.meta.url),'utf8');
const ctx=vm.createContext({window:{}});vm.runInContext(read('geo-layers.js'),ctx);vm.runInContext(read('atlas-researched-extents.js'),ctx);
const geo=ctx.window.WorldAtlasGeo,m=ctx.window.AtlasResearchedExtents;
assert.ok(geo&&m);
assert.deepEqual(Array.from(m.atYear(117)).map(x=>x.id),['rome']);
assert.deepEqual(Array.from(m.atYear(1279)).map(x=>x.id),['mongols']);
assert.deepEqual(Array.from(m.atYear(1921)).map(x=>x.id),['british']);
for(const year of [118,1170,1206,1350,1901,2024])assert.equal(m.atYear(year).length,0,'Never display peak snapshot geometry outside its documented date');
const rome=m.SNAPSHOTS[0],url=new URL(m.queryUrl(rome));
assert.equal(url.protocol,'https:');
assert.equal(url.searchParams.get('where'),"Name='Roman Empire'");
assert.equal(url.searchParams.get('f'),'geojson');
assert.equal(url.searchParams.get('outSR'),'4326');
assert.equal(m.queryUrl({name:'Unknown'}),null,'Unknown external source requests are disallowed');
const polygon={type:'Polygon',coordinates:[[[10,35],[15,35],[15,43],[10,35]]]};
const paths=m.geometryPaths(polygon,geo);
assert.equal(paths.length,1);
assert.match(paths[0],/^M\d/);
assert.match(paths[0],/Z$/);
assert.equal(m.geometryPaths({type:'Point',coordinates:[10,20]},geo).length,0);
assert.equal(m.geometryPaths({type:'Polygon',coordinates:[[[10,35],[500,35],[15,43],[10,35]]]},geo).length,0);
assert.equal(m.geometryPaths({type:'Polygon',coordinates:[[[179,10],[-179,10],[-179,15],[179,10]]]},geo).length,0,'No dateline-spanning artefact');
const multipolygon={type:'MultiPolygon',coordinates:[polygon.coordinates,[[[50,10],[55,10],[55,15],[50,10]]]]};
assert.equal(m.geometryPaths(multipolygon,geo).length,2);
assert.equal(m.normalize({features:[{properties:{Name:'Not Rome'},geometry:polygon}]},rome,geo).length,0);
assert.equal(m.normalize({features:[{properties:{Name:'Roman Empire'},geometry:polygon}]},rome,geo).length,1);
assert.equal(m.normalize({features:[]},rome,geo).length,0);
assert.equal(m.render(paths,rome,'#af805d').includes('University of Minnesota'),true);
assert.equal(m.render(paths,rome,'#af805d').includes('fill-rule="evenodd"'),true);
const civs=[{id:'rome'},{id:'han'},{id:'mongols'}];
const events=[
 {id:'one',title:'Rome and Han',year:100,societyIds:['rome','han']},
 {title:'Unrelated record',year:105,societyIds:['rome']},
 {title:'Mongols and Han',year:1279,societyIds:['mongols','han']},
 {id:'skip',title:'Undated',societyIds:['rome','han']},
 {title:'Another Rome and Han',year:150,societyIds:['rome','han']}
];
const seq=m.linkedRecords(events,civs);
assert.equal(seq.length,3);
assert.deepEqual([...seq].map(x=>x.year),[100,150,1279]);
assert.equal(seq[1].key,'multi-3','Fallback keys follow the dated source index, including single-society records');
assert.equal(m.step(seq,'one',-1).key,'one');
assert.equal(m.step(seq,'one',1).key,'multi-2');
assert.equal(m.step(seq,seq.at(-1).key,1).key,seq.at(-1).key);
assert.equal(m.step([],'none',1),null);
const html=read('index.html'),js=read('atlas-presence-map.js'),css=read('atlas-presence.css'),interactions=read('interactions.js');
for(const id of ['researchedExtentChoices','researchedExtentButtons','mapInteractionContext','mapPresenceClouds'])assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(html.indexOf('atlas-researched-extents.js')<html.indexOf('app.js'));
assert.ok(html.indexOf('app.js')<html.indexOf('atlas-presence-map.js'));
assert.match(css,/atlas-researched-extent/);
assert.match(js,/const researched=new Map\(\),pending=new Set\(\),failed=new Set\(\)/);
assert.match(js,/extents\.atYear\(state\.year\)/);
assert.match(js,/researchedIds\.has\(x\.c\.id\)/);
assert.match(js,/data-map-evidence-step/);
assert.match(js,/visitRecord\(extents\.step/);
assert.match(js,/fitParticipants/);
assert.match(js,/root\.fetch\(extents\.queryUrl\(snapshot\)/);
assert.match(interactions,/&interaction='\+encodeURIComponent\(e\.key\)/);
assert.match(js,/exact borders or routes/i);
new vm.Script(js,{filename:'atlas-presence-map.js'});
console.log('PASS sourced historical extents: dated GIS snapshots, validated polygon projection, missing geography and linked evidence stepping');
