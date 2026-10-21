import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
const data=fs.readFileSync(new URL('./public/data.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./public/app.js',import.meta.url),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
for(const [,id] of [...app.matchAll(/\$\(['"]([^'"]+)['"]\)/g)])assert(ids.includes(id)||id==='sameYearButton',`Missing element #${id}`);
const names=['CIVILISATIONS','MOMENTS','EVENTS','MAPS','PLACES'];
const ctx=vm.createContext({});
vm.runInContext(`${data}\n({${names.join(',')}})`,ctx);
const result=vm.runInContext(`({${names.join(',')}})`,ctx);
assert(result.CIVILISATIONS.length>=30,'Expected at least 30 sample civilisations');
assert(result.MOMENTS.length>=10,'Expected broad historical time periods');
assert(result.EVENTS.length>=20,'Expected sampled historical events');
for(const c of result.CIVILISATIONS){
  assert(c.start<=c.end,`Bad date interval: ${c.name}`);
  assert(c.at>=c.start&&c.at<=c.end,`Sample year out of range: ${c.name}`);
  assert(Math.abs(c.lat)<=90&&Math.abs(c.lon)<=180,`Location invalid: ${c.name}`);
  assert(c.source.startsWith('https://'),`Missing source: ${c.name}`);
  if(c.mapId)assert(result.MAPS[c.mapId],`Map missing: ${c.name}`);
  for(const id of c.known||[])assert(result.PLACES[id],`Unknown sample place: ${id}`);
}
const rome=result.CIVILISATIONS.find(c=>c.id==='rome');
assert(rome.start===-26,'27 BCE should become astronomical year -26');
assert(result.MOMENTS.find(m=>m.year===-2599),'2600 BCE should become astronomical -2599');
// Barebones fake browser verifies initial render and public actions without a browser runtime.
class FakeEl{
  constructor(id){this.id=id;this.style={};this.dataset={};this.classList={toggle(){},add(){},remove(){}};this.innerHTML='';this.textContent='';this.value='';this.disabled=false;this.listeners={};}
  addEventListener(event,fn){this.listeners[event]=fn;}
  querySelector(){return null;}
  querySelectorAll(){return [];}
  setAttribute(){}
}
const elements=Object.fromEntries([...ids,'sameYearButton'].map(id=>[id,new FakeEl(id)]));
const document={getElementById:id=>elements[id],querySelectorAll:()=>[],addEventListener(){}};
const location={href:'https://example.com/atlas/'};
const window={location,history:{replaceState(){}}};
const globals={document,window,location,URL,URLSearchParams,HTMLInputElement:FakeEl,console};
const runtime=vm.createContext(globals);
vm.runInContext(data,runtime);
vm.runInContext(app,runtime);
assert(elements.sceneTitle.innerHTML.includes('200 CE'),'Initial date not rendered');
assert(elements.storyPanel.innerHTML.includes('Roman Empire'),'Initial civilisation not rendered');
assert(elements.mapMarkers.innerHTML.includes('map-marker'),'Markers not rendered');
window.WorldHistoryAtlas.selectCiv('joseon');
assert(window.WorldHistoryAtlas.state.civ==='joseon');
assert(window.WorldHistoryAtlas.state.year===1402);
window.WorldHistoryAtlas.state.view='historical';
window.WorldHistoryAtlas.setYear(-499);
assert(elements.sceneTitle.innerHTML.includes('500 BCE'));
window.WorldHistoryAtlas.randomise('all');
assert(window.WorldHistoryAtlas.state.civ);
console.log(`PASS: ${result.CIVILISATIONS.length} societies, ${result.EVENTS.length} events, ${result.MOMENTS.length} moments, dates, map links, initial render, navigation and randomisation.`);
