import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const html=read('./public/index.html'),css=read('./public/atlas-cinematic-map.css'),script=read('./public/living-map.js');
for(const id of ['livingConnections','livingMapControls','livingConnectToggle','livingPlay','livingSpeed','livingStep','livingMapExplanation','mapYear','worldMap'])assert.ok(html.includes('id="'+id+'"'),id);
assert.match(html,/living-map\.js\?v=0\.(?:27|33)\.0/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/atlas-arc-flow/);
const layer={children:[],attributes:{},classList:{toggle(){},add(){}},replaceChildren(){this.children=[]},appendChild(v){this.children.push(v)},setAttribute(k,v){this.attributes[k]=v}};
const attrs={},handlers={};
function element(id){return {id,textContent:'',value:id==='livingSpeed'?'1':'25',classList:{toggle(){}},style:{},setAttribute(k,v){attrs[id+':'+k]=v},addEventListener(k,f){handlers[id+':'+k]=f},querySelector(){return null},querySelectorAll(){return []}};}
const elements=Object.fromEntries(['livingMapControls','livingMapExplanation','livingMapCount','livingConnectToggle','livingPlay','livingSpeed','livingStep','mapYear'].map(x=>[x,element(x)]));elements.livingConnections=layer;
elements.livingMapControls.querySelector=q=>elements[q.replace('#','')];
const document={hidden:false,getElementById:id=>elements[id],createElementNS(ns,tag){return {tag,style:{setProperty(){}},appendChild(v){this.title=v},setAttribute(k,v){this[k]=v}}},addEventListener(){}};
const state={civ:'rome',year:200,view:'actual',region:'All regions',catalogue:'all'};
const civilisations=[{id:'rome',name:'Rome',lon:12,lat:42,start:-100,end:500,region:'Europe',kind:'empire'},
{id:'parthia',name:'Parthia',lon:50,lat:34,start:-300,end:230,region:'West Asia',kind:'empire'},
{id:'han',name:'Han',lon:110,lat:35,start:-200,end:220,region:'East Asia',kind:'empire'}];
const atlas={state,civilisations,setYear(y){state.year=y}};
const window={document,WorldHistoryAtlas:atlas,WorldAtlasGeo:{project:(lon,lat)=>[((lon+180)/360)*1200,((88-lat)/176)*590]},history:{replaceState(){}},location:{},addEventListener(){},MutationObserver:class{observe(){}},setInterval(){return 1},clearInterval(){},matchMedia(){return {matches:false}}};
window.window=window;
vm.runInNewContext(script,{window,globalThis:window,document,console,URL,Number,Math});
assert.equal(layer.children.length,0,'Inferred proximity arcs must start hidden');
handlers['livingConnectToggle:click']();
assert.equal(layer.children.length,2,'Explicitly enabling illustration shows two contemporaries');
assert.ok(layer.children.every(x=>x.d?.startsWith('M')&&x.tag==='path'));
const exposed=window.AtlasLivingMap;
assert.equal(exposed.choices().length,2);
handlers['livingConnectToggle:click']();
assert.equal(layer.children.length,0,'Toggle hides illustrative links');
handlers['livingConnectToggle:click']();
state.view='historical';exposed.draw();
assert.equal(layer.children.length,0,'Never overlay inferred routes on surviving historic maps');
state.view='actual';state.year=900;exposed.draw();
assert.equal(layer.children.length,0,'No active societies produces no links');
const reducedWindow={...window,matchMedia(){return {matches:true}}}; // separate accessibility rule checked in CSS
assert.ok(script.includes('if(reduced())return'));
assert.ok(html.includes('Not historical borders'),'Historical marker caveat preserved');
console.log('PASS v0.27 interactive living map: arcs, toggle, date filtering, historical-map isolation, controls and reduced-motion safety');
