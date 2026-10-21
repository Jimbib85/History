import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL('./public/'+file,import.meta.url),'utf8');
const html=read('index.html'),app=read('app.js');
const sandbox={window:{},console};
vm.createContext(sandbox);
vm.runInContext(read('geo-layers.js'),sandbox);
const geo=sandbox.window.WorldAtlasGeo;
assert.ok(geo);
assert.deepEqual([...geo.project(0,0)],[600,295]);
assert.deepEqual([...geo.project(-180,88)],[0,0]);
assert.equal(geo.finite(179.9,87.9),true);
assert.equal(geo.finite(Infinity,40),false);
assert.equal(geo.finite(201,10),false);
assert.equal(geo.finite(40,-91),false);
const items=[
 {id:'a',lon:20,lat:30},{id:'b',lon:20.1,lat:30.1},{id:'c',lon:70,lat:10},
 {id:'bad',lon:NaN,lat:30}
];
const groups=geo.cluster(items,{zoom:1,selectedId:'c'});
assert.equal(groups.reduce((n,g)=>n+g.count,0),3,'Invalid coordinates are never displayed');
assert.equal(groups.filter(g=>g.count>1).length,1,'Nearby representative points share one map symbol');
assert.equal(groups.find(g=>g.selected).items[0].id,'c','Selected society remains independently accessible');
assert.equal(groups.find(g=>g.count>1).count,2);
assert.equal(geo.cluster(items,{zoom:4,selectedId:'c'}).reduce((n,g)=>n+g.count,0),3);
assert.equal(geo.cluster(items.slice(0,3),{zoom:1}).map(g=>g.id).join('|'),
             geo.cluster(items.slice(0,3),{zoom:1}).map(g=>g.id).join('|'),'Group identities are stable');
assert.match(geo.grid(),/<line x1="600"/);
assert.match(geo.grid(),/30°N/);
assert.ok(!geo.grid().includes('polygon'),'Reference layer never invents historical borders');
assert.match(html,/id="mapGrid"/);
for(const id of ['groupGeo','toggleGrid','geoControls','mapClusterCount'])assert.ok(html.includes('id="'+id+'"'),'Missing map control '+id);
assert.ok(html.indexOf('geo-layers.js')<html.indexOf('app.js?v='),'Geographic helper loads before map application');
assert.match(app,/data-mapcluster/,'Clusters have a keyboard-accessible SVG action');
assert.match(app,/zoomToCluster/);
assert.match(app,/geoMode:params\.get\('geo'\)/);
assert.match(app,/geoGrid:params\.get\('grid'\)/);

// Full data boot and 511-entry UI regression happens in map-ux-test.mjs;
// this fixture additionally exercises map layer and zoom controls with real research imports.
class Element {
 constructor(){this.style={};this.dataset={};this.classList={toggle(){},add(){},remove(){}};this.innerHTML='';this.textContent='';this.listeners={};this.disabled=false;}
 addEventListener(t,fn){this.listeners[t]=fn;}
 querySelectorAll(){return []}
 querySelector(){return null}
 setAttribute(k,v){this[k]=v}
}
const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
elements.sameYearButton=new Element();
const location={href:'https://atlas.test/index.html?year=200&civ=rome',search:'?year=200&civ=rome'};
const window={location,history:{replaceState(){}},matchMedia:()=>({matches:false})};
const document={getElementById:id=>elements[id],querySelectorAll:()=>[],addEventListener(){}};
const context=vm.createContext({window,document,location,URL,URLSearchParams,HTMLInputElement:Element,console});
const excluded=new Set(['story-navigation.js','app.js','technology-tree.js']);
for(const file of [...html.matchAll(/<script src="([^"?]+)[^"]*"/g)].map(m=>m[1]).filter(s=>!excluded.has(s)))vm.runInContext(read(file),context,{filename:file});
vm.runInContext(app,context,{filename:'app.js'});
const atlas=window.WorldHistoryAtlas;
assert.equal(atlas.state.geoMode,'groups');
assert.ok(elements.mapEvidence.innerHTML.includes('not a measured historical boundary'));
assert.ok(elements.mapEvidence.innerHTML.includes('Background reading does not independently establish'));
assert.match(elements.mapMarkers.innerHTML,/data-mapcluster=|data-mapciv=/);
elements.toggleGrid.listeners.click();
assert.equal(atlas.state.geoGrid,true);
assert.ok(elements.mapGrid.innerHTML.includes('<line '),'Grid renders only when asked');
elements.groupGeo.listeners.click();
assert.equal(atlas.state.geoMode,'points');
assert.ok(!elements.mapMarkers.innerHTML.includes('data-mapcluster='));
elements.groupGeo.listeners.click();
assert.equal(atlas.state.geoMode,'groups');
elements.resetMap.listeners.click();
assert.equal(atlas.state.zoom,1);
assert.ok(elements.mapEvidence.innerHTML.includes('not a measured historical boundary'));
atlas.go({view:'historical'});
assert.equal(elements.geoControls.hidden,true,'No alignment controls on historical artwork');
atlas.go({view:'actual'});
assert.equal(elements.geoControls.hidden,false,'Modern reference basemap restores map tools');
console.log('PASS geography v0.16: valid coordinates, stable grouped points, selection, interactive grid, fallback-to-points, historic map safeguards');
