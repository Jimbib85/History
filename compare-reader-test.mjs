import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = name => fs.readFileSync(new URL(name,import.meta.url),'utf8');
const html = read('./public/compare.html');
const nodes = new Map();
function node(id='') {
  return {
    id, innerHTML:'', textContent:'', value:'', dataset:{}, disabled:false, hidden:false,
    listeners:new Map(), classList:{toggle(){}},
    addEventListener(type,fn){this.listeners.set(type,fn);},
    setAttribute(name,value){this[name]=value;},
    append(){}, focus(){}, scrollIntoView(){},
    querySelector(){return node();}
  };
}
for(const id of html.matchAll(/id="([^"]+)"/g)) nodes.set(id[1],node(id[1]));
const tabs = ['overlap','eras','regions','events'].map(mode => ({...node(),dataset:{mode}}));
const body = node('insight-body');
const context = {
  URL, URLSearchParams,
  document:{
    activeElement:null, baseURI:'https://atlas.test/compare.html',
    getElementById:id => nodes.get(id),
    createElement:() => node(),
    querySelectorAll:selector => selector==='[data-mode]' ? tabs : [],
    querySelector:selector => selector==='.insight-body' ? body : null
  },
  location:{href:'https://atlas.test/compare.html',search:'',protocol:'https:'},
  history:{replaceState(){}},
  matchMedia:() => ({matches:false}),
  AtlasNavigation:{refresh(){}}
};
context.window=context;
vm.createContext(context);
for(const script of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)) {
  if(script[1]==='story-navigation.js' || script[1]==='compare-order.js') continue;
  vm.runInContext(read('./public/'+script[1]),context,{filename:script[1]});
}
const compare=context.HistoryCompare, chart=nodes.get('comparisonChart');
const click=(selector,dataset) => chart.listeners.get('click')({target:{closest:value => value===selector ? {dataset} : null}});
const rowIds=() => [...chart.innerHTML.matchAll(/class="lane-name" data-civ="([^"]+)"/g)].map(m=>m[1]);
const eventCount=() => (chart.innerHTML.match(/class="event-lane(?: selected)?"/g)||[]).length;

assert.equal(compare.parseDate('1 BCE'),0);
assert.equal(compare.parseDate('0 CE'),null);
assert.equal(compare.yearText(0),'1 BCE');
const initialOrder=rowIds();
assert.ok(initialOrder.length>8);
compare.change({selected:initialOrder.at(-1)});
assert.deepEqual(rowIds(),initialOrder,'Opening a visible entity must not reorder the chart');
const year=compare.state.year, span=compare.state.span;
click('[data-group]',{group:'type:society'});
assert.ok(chart.innerHTML.includes('id="lanes-society" hidden'),'Society section closes');
const societyId=vm.runInContext("CIVILISATIONS.find(c=>c.kind==='society'&&c.start<=1200&&c.end>=1200).id",context);
click('[data-civ]',{civ:societyId});
assert.ok(!chart.innerHTML.includes('id="lanes-society" hidden'),'Selecting a society reveals its section');
assert.equal(compare.state.year,year);
assert.equal(compare.state.span,span);

compare.change({mode:'events',span:12026,search:''});
assert.equal(eventCount(),8,'Events begin with eight compact headings');
for(let i=0;i<25;i++) click('[data-more]',{more:'events'});
assert.ok(eventCount()>200,'Records after the old 200-event cutoff remain reachable');
const allResearch=vm.runInContext('[...ATLAS_RESEARCH_EVENTS,...ATLAS_MEDIEVAL_EVENTS,...ATLAS_MODERN_EVENTS,...ATLAS_CLASSICAL_EVENTS]',context);
const hidden=allResearch.at(-1);
compare.change({search:hidden.title.toLowerCase()});
assert.ok(chart.innerHTML.includes(hidden.id),'Search includes records outside the current batch');
const beforeYear=compare.state.year,beforeSpan=compare.state.span;
click('[data-event-key]',{eventKey:hidden.id});
assert.equal(nodes.get('selectedName').textContent,hidden.title);
assert.equal(nodes.get('selectedSummary').textContent,hidden.detail);
assert.equal(compare.state.year,beforeYear,'Opening evidence keeps selected year');
assert.equal(compare.state.span,beforeSpan,'Opening evidence keeps shared scale');
if(hidden.humanDate) assert.ok(nodes.get('selectedLife').textContent.includes(hidden.humanDate),'Human date qualifier retained');
compare.change({search:'',event:null,year:1200,span:1000,mode:'eras'});
const cell=[...chart.innerHTML.matchAll(/data-era-region="([^"]+)" data-era-slot="(\d+)"/g)][0];
assert.ok(cell,'Dense era cell has a real more button');
const unchanged=chart.innerHTML;
click('[data-era-slot]',{eraRegion:cell[1],eraSlot:cell[2]});
assert.equal(chart.innerHTML,unchanged,'Opening a cell does not reshape era columns');
assert.equal(nodes.get('selectedName').textContent,cell[1]);
assert.ok(nodes.get('readerRecords').innerHTML.includes('data-civ='),'Cell list contains selectable entity headings');
assert.ok(!html.includes('id="concurrentDetails" open')&&!html.includes('id="nearDetails" open')&&!html.includes('id="sourcesDetails" open'),'Supporting topics start closed');
console.log('PASS Compare readers: real imports, eight-record batches, >200 records reachable, full search, fixed selection scale/order, section reveal and era-cell detail.');

// Imported dating qualifiers must never replace year spans or imply continuous alternate dates.
const alternate=allResearch.find(e=>e.datePrecision==='alternative_years_not_continuous'&&!e.humanDate);
assert.ok(alternate,'Alternative chronology fixture exists');
compare.change({event:alternate.id});
assert.ok(nodes.get('selectedLife').textContent.includes(' or '),'Alternative dates remain alternatives');
const genericDating=vm.runInContext("CIVILISATIONS.find(c=>c.kind!=='overview'&&['approximate','range'].includes(c.dating))",context);
assert.ok(genericDating,'Generic dating qualifier fixture exists');
compare.change({selected:genericDating.id,event:null});
assert.ok(nodes.get('selectedLife').textContent.includes(compare.yearText(genericDating.start)),'Entity year span is not replaced by a generic dating qualifier');
let sortedTypes=0;
context.HistoryRowOrder={sort:rows=>{
  if(!rows.length)return;
  assert.equal(new Set(rows.map(c=>c.kind)).size,1,'Order comparator receives one type at a time');
  rows.sort((a,b)=>b.name.localeCompare(a.name));sortedTypes++;
}};
compare.change({mode:'overlap',span:12026,limit:9999,search:'',region:'all',type:'all'});
assert.ok(sortedTypes>=2,'Both saved order lists applied');
const nameById=vm.runInContext("new Map(CIVILISATIONS.map(c=>[c.id,c]))",context);
for(const kind of ['society','empire']){
  const names=rowIds().map(id=>nameById.get(id)).filter(c=>c.kind===kind).map(c=>c.name);
  assert.deepEqual(names,[...names].sort((a,b)=>b.localeCompare(a)),'Saved '+kind+' order survives interleaved candidate rows');
}
console.log('PASS Compare date/order regressions: alternate chronologies, actual entity spans and independent saved type ordering.');
