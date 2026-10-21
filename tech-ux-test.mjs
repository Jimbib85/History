import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const directory=new URL('./public/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,directory),'utf8');
class Element {
  constructor(){this.innerHTML='';this.value='';this.listeners={};this.open=false;}
  addEventListener(name,handler){this.listeners[name]=handler;}
  showModal(){this.open=true;}
  close(){this.open=false;this.listeners.close?.();}
  scrollTo(){}
  focus(){}
}
function mount(context){
  const dom=Object.fromEntries(['technologyDialog','technologyBranches','technologyDetails','technologyCivilisation','technologySearch','technologyButton','closeTechnology','randomTechnology'].map(id=>[id,new Element()]));
  context.document={getElementById:id=>dom[id]};
  context.window={WorldHistoryAtlas:{state:{civ:'rome'},go(){}}};
  vm.runInContext(read('technology-tree.js'),context,{filename:'technology-tree.js'});
  context.window.WorldHistoryTechnology.open();
  return {dom,api:context.window.WorldHistoryTechnology};
}
const click=(container,selector,dataset={})=>container.listeners.click({target:{closest:query=>query===selector?{dataset}:null}});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Reused by the medieval merge suite: coordinate validity is behavior, not a source-code substring.
export function assertTechnologyCoordinateGuard(context){
  const societies=vm.runInContext('CIVILISATIONS',context);
  const positions=societies.map(c=>({c,lat:c.lat,lon:c.lon}));
  try {
    societies.forEach(c=>{c.lon=undefined;c.lat=undefined;});
    const {dom}=mount(context);
    click(dom.technologyDetails,'[data-viz]',{viz:'map'});
    const output=dom.technologyDetails.innerHTML;
    assert.ok(!output.includes('NaN'),'Missing coordinates must never become SVG coordinates');
    assert.ok(!output.includes('<g class="tviz-pin '),'Unlocated societies must not get invented map pins');
    assert.ok(output.includes('No reference locations are available'),'An empty map must explain its missing locations');
    assert.ok(output.includes('Historical source'),'Evidence stays readable when its location is unknown');
    click(dom.technologyDetails,'[data-viz]',{viz:'timeline'});
    assert.ok(dom.technologyDetails.innerHTML.includes('class="tviz-row '),'Dated evidence remains available without coordinates');
  } finally {
    positions.forEach(({c,lat,lon})=>{c.lat=lat;c.lon=lon;});
  }
}

function run(){
  const context=vm.createContext({});
  const scripts=[...read('index.html').matchAll(/<script src="([^?" ]+)/g)].map(match=>match[1]).filter(name=>/^(data|entity-types|research-|tech-)/.test(name));
  for(const file of scripts)vm.runInContext(read(file),context,{filename:file});
  const {dom,api}=mount(context);
  const technologies=vm.runInContext('TECHNOLOGIES',context);
  assert.equal(dom.technologyDialog.open,true);
  assert.equal((dom.technologyBranches.innerHTML.match(/<details class="tech-branch"/g)||[]).length,6,'Six technology families stay visible');
  assert.equal((dom.technologyBranches.innerHTML.match(/data-branch="[^"]+" open/g)||[]).length,1,'Only the active family opens initially');

  const t=technologies.find(t=>t.id==='paper');
  assert.ok(t.appearances.length>8,'Fixture exercises a full evidence batch');
  click(dom.technologyBranches,'[data-tech]',{tech:t.id});
  const before=dom.technologyDetails.innerHTML;
  const scale=before.match(/<div class="tviz-scale">(.*?)<\/div>/s)[1];
  const rowCount=markup=>(markup.match(/class="tviz-row /g)||[]).length;
  assert.ok(rowCount(before)<=9&&rowCount(before)>=8,'Time rows show eight plus an out-of-batch selection if needed');
  click(dom.technologyDetails,'[data-timeline-more]');
  assert.ok(rowCount(dom.technologyDetails.innerHTML)>rowCount(before),'More milestones become reachable');
  assert.equal(dom.technologyDetails.innerHTML.match(/<div class="tviz-scale">(.*?)<\/div>/s)[1],scale,'Loading more rows preserves the full shared time scale');

  const same=t.appearances.map((a,index)=>({...a,key:`${t.id}:${a.researchId||a.id||index}`})).filter(a=>a.civ==='tang');
  assert.ok(same.length>=2,'Fixture includes separate Tang papermaking observations');
  const beforeCiv=api.state.civ;
  click(dom.technologyDetails,'[data-record]',{record:same[0].key});
  assert.equal(api.state.record,same[0].key);
  click(dom.technologyDetails,'[data-record]',{record:same[1].key});
  assert.equal(api.state.record,same[1].key,'Two records from the same society remain individually selectable');
  assert.equal(api.state.civ,beforeCiv,'Evidence selection does not replace the compare-from society');
  assert.ok(dom.technologyDetails.innerHTML.includes(escape(same[1].note)),'The selected record supplies the evidence body');
  assert.ok(dom.technologyDetails.innerHTML.includes(escape(same[1].dateLabel)),'Its original qualified date label remains visible');

  click(dom.technologyDetails,'[data-viz]',{viz:'map'});
  assert.ok(dom.technologyDetails.innerHTML.includes('representative locations'));
  assert.ok(dom.technologyDetails.innerHTML.includes('not historical travel routes'));
  const priorRecord=api.state.record;
  click(dom.technologyDetails,'[data-location]',{location:'tang'});
  assert.equal(api.state.record,priorRecord,'Opening a place does not silently choose another milestone');
  assert.ok(dom.technologyDetails.innerHTML.includes(`data-record="${same[1].key}"`),'Exact same-place milestones are accessible below the map');

  dom.technologySearch.value='Gutenberg';dom.technologySearch.listeners.input();
  assert.ok(dom.technologyBranches.innerHTML.includes('Movable type printing'),'Search covers evidence beyond the selected technology');
  click(dom.technologyBranches,'[data-tech]',{tech:'movable-type'});
  assert.ok(dom.technologyDetails.innerHTML.includes('Gutenberg Bible'));
  assert.equal(api.state.allEvidenceOpen,true,'Search opens the containing evidence group');
  assert.ok(technologies.find(t=>t.id==='movable-type').appearances.some((a,index)=>a.label.includes('Gutenberg')&&api.state.record===`movable-type:${a.researchId||a.id||index}`),'Search selects the matching individual milestone');

  assertTechnologyCoordinateGuard(context);
  console.log('PASS technology UX:',technologies.length,'technologies,',technologies.reduce((n,t)=>n+t.appearances.length,0),'evidence records; batching, exact milestones, search, shared time scale and coordinate guards');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run();
