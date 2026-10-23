import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('./public/'+p,import.meta.url),'utf8');
const calls=[];
const responses={
 'seshat/index.json':{schema:1,version:'v0.2.1',coverage:{rome:{file:'seshat/rome.json',records:2}}},
 'seshat/rome.json':{atlasId:'rome',version:'v0.2.1',records:[
   {name:'Roman Empire',from:0,to:117,geometry:{type:'Polygon',coordinates:[[[10,30],[20,30],[20,40],[10,30]]]}},
   {name:'Roman Empire',from:118,to:200,geometry:{type:'Polygon',coordinates:[[[20,30],[25,30],[25,40],[20,30]]]}}
 ]}
};
const sandbox={window:{fetch:async url=>{calls.push(url);return {ok:!!responses[url],json:async()=>responses[url]};}},URLSearchParams};
vm.createContext(sandbox);
for(const p of ['geo-layers.js','atlas-researched-extents.js','atlas-cliopatria.js'])vm.runInContext(read(p),sandbox);
const geo=sandbox.window.WorldAtlasGeo,projector=sandbox.window.AtlasResearchedExtents,cli=sandbox.window.AtlasCliopatria;
assert.ok(geo&&projector&&cli);
assert.ok(cli.CITATION.includes('zenodo'));
assert.ok(cli.LICENSE.includes('creativecommons'));
assert.equal(cli.safeId('rome'),true);
assert.equal(cli.safeId('../etc/passwd'),false);
const index=await cli.loadIndex();
assert.equal(index.schema,1);
assert.equal((await cli.load('nonexistent')),null);
const rome=await cli.load('rome');
assert.equal(rome.records.length,2);
assert.equal(cli.atYear(rome,0).length,1);
assert.equal(cli.atYear(rome,117).length,1);
assert.equal(cli.atYear(rome,118).length,1);
assert.equal(cli.atYear(rome,201).length,0);
assert.equal(cli.atYear(rome,-1).length,0);
assert.equal(cli.atYear(rome,NaN).length,0);
const svg=cli.svg(cli.atYear(rome,117),geo,projector,'#aabbcc','rome');
assert.match(svg,/class="atlas-cliopatria-extent"/);
assert.match(svg,/fill-rule="evenodd"/);
assert.match(svg,/Roman Empire/);
assert.match(svg,/0–117/); // compact source interval remains visible in tooltip
assert.equal(cli.svg(cli.atYear(rome,201),geo,projector,'#aabbcc','rome'),'');
assert.equal(cli.svg(cli.atYear(rome,117),geo,projector,'url(javascript:alert(1))','rome').includes('url(javascript'),false);
await cli.load('rome');
assert.deepEqual(calls,['seshat/index.json','seshat/rome.json'],'Cached population should not repeat network requests');
const html=read('index.html'),map=read('atlas-cliopatria-map.js'),links=read('atlas-links.js'),css=read('atlas-presence.css');
for(const tag of ['atlas-cliopatria.js','atlas-cliopatria-map.js','mapCliopatriaShapes','atlasSeshatStatus'])assert.ok(html.includes(tag),tag);
assert.ok(html.indexOf('atlas-researched-extents.js')<html.indexOf('atlas-cliopatria-map.js'));
assert.ok(html.indexOf('atlas-cliopatria.js')<html.indexOf('app.js'));
assert.match(map,/source\.atYear\(data,year\)/);
assert.match(map,/document\.querySelectorAll\('#mapPresenceClouds \[data-atlas-id\]'\)/);
assert.match(map,/index\.coverage/);
assert.match(map,/root\.MutationObserver/);
assert.match(links,/atlas-journey-rail/);
assert.match(links,/q\.get\('interaction'\)\|\|q\.get\('event'\)/);
assert.match(css,/atlas-cliopatria-extent/);
const pages=['index','story','compare','interactions','worldview','discover','conflicts'];
for(const p of pages){
 const page=read(p+'.html');
 assert.match(page,/atlas-journey\.css/,'Shared contextual styling missing: '+p);
 assert.match(page,/atlas-links\.js\?v=0\.42\.0/,'Cross-page reader not updated: '+p);
}
const generated=JSON.parse(fs.readFileSync(new URL('./public/seshat/index.json',import.meta.url),'utf8'));
assert.equal(generated.schema,1);
assert.equal(generated.version,'v0.2.1');
assert.ok(generated.matchedFeatures>=5,'Use actual reviewed Cliopatria source data');
assert.ok(Object.keys(generated.coverage).length>=5,'Multiple curated atlas identities should be matched');
for(const [id,info] of Object.entries(generated.coverage)){
 assert.match(id,/^[a-z0-9_-]+$/);
 assert.equal(info.file,'seshat/'+id+'.json');
 assert.ok(info.from<=info.to);
 assert.ok(fs.existsSync(new URL('./public/'+info.file,import.meta.url)));
}
new vm.Script(map);
new vm.Script(links);
console.log('PASS Seshat Cliopatria: safe dated geometry loader, curated imports, cross-page context and seven styled readers');
