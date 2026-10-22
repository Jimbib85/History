/* v0.15 pinned comparison: real datasets, scope safety, shared ruler and URLs. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const html=read('./public/compare.html');
const nodes=new Map();
function node(id=''){
  return {id,innerHTML:'',textContent:'',value:'',dataset:{},disabled:false,hidden:false,isConnected:true,
    listeners:new Map(),classList:{toggle(){}},addEventListener(type,fn){this.listeners.set(type,fn)},
    setAttribute(name,value){this[name]=value},append(){},focus(){},scrollIntoView(){},
    querySelector(){return node()}};
}
for(const match of html.matchAll(/id="([^"]+)"/g))nodes.set(match[1],node(match[1]));
const tabs=['overlap','eras','regions','events'].map(mode=>({...node(),dataset:{mode}}));
const body=node(),written=[],store=new Map();
const context={
 URL,URLSearchParams,
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
 document:{
   activeElement:null,baseURI:'https://atlas.test/compare.html',
   getElementById:id=>nodes.get(id),
   createElement:()=>node(),
   querySelectorAll:selector=>selector==='[data-mode]'?tabs:[],
   querySelector:selector=>selector==='.insight-body'?body:null
 },
 location:{href:'https://atlas.test/compare.html?year=800&civ=abbasid&pins=abbasid,tang&focus=1',search:'?year=800&civ=abbasid&pins=abbasid,tang&focus=1',protocol:'https:'},
 history:{replaceState(...args){written.push(args[2])}},
 matchMedia:()=>({matches:false}),AtlasNavigation:{refresh(){}}
};
context.window=context;
vm.createContext(context);
for(const match of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)){
 if(['story-navigation.js','compare-order.js'].includes(match[1]))continue;
 vm.runInContext(read('./public/'+match[1]),context,{filename:match[1]});
}
const compare=context.HistoryCompare,chart=nodes.get('comparisonChart');
const rows=()=>[...chart.innerHTML.matchAll(/class="lane-name[^"]*" data-civ="([^"]+)"/g)].map(x=>x[1]);
assert.ok(compare,'Compare API available');
assert.deepEqual([...compare.state.pinned],['abbasid','tang']);
assert.equal(compare.state.focusPinned,true);
assert.deepEqual(rows().sort(),['abbasid','tang'].sort(),'Focused ruler displays only pinned society tracks');
assert.match(chart.innerHTML,/class="axis"/,'Pinned lanes retain shared date ruler');
assert.match(nodes.get('pinSummary').textContent,/Recorded overlap:.*Contemporaneity/);
assert.match(nodes.get('pinnedComparison').innerHTML,/data-unpin="tang"/);
assert.match(String(written.at(-1)),/pins=abbasid%2Ctang/);
assert.match(store.get('world-history-atlas-compare-pins-v1'),/tang/);

const y=compare.state.year,span=compare.state.span;
compare.change({selected:'tang'});
assert.equal(compare.state.year,y);
assert.equal(compare.state.span,span);
assert.deepEqual(rows().sort(),['abbasid','tang'].sort(),'Reading another pinned society retains timeline and tracks');
compare.change({mode:'events'});
const eventHTML=chart.innerHTML;
assert.match(eventHTML,/data-event-key=/,'Pinned histories have explicit research events');
compare.change({mode:'overlap'});
assert.deepEqual(rows().sort(),['abbasid','tang'].sort(),'Mode change retains spotlight');
nodes.get('onlyPinned').listeners.get('click')();
assert.equal(compare.state.focusPinned,false,'Spotlight toggle restores full collection');
assert.ok(rows().length>2,'Unfocused chart includes unpinned records');
nodes.get('onlyPinned').listeners.get('click')();
assert.equal(compare.state.focusPinned,true);
compare.change({region:'Europe'});
assert.equal(compare.state.focusPinned,false,'Changing filters exits focus instead of silently ignoring them');
assert.deepEqual([...compare.state.pinned],['abbasid','tang'],'Changing filters does not discard pinned entries');

compare.change({region:'all',mode:'overlap',year:800});
nodes.get('fitPinned').listeners.get('click')();
assert.ok(compare.state.span>=508,'Fit periods includes both documented intervals');
assert.ok(compare.state.year>=750&&compare.state.year<=1200,'Fit chooses a central historical year');
const before=compare.state.pinned.length;
const shelf=nodes.get('pinnedComparison');
shelf.listeners.get('click')({target:{closest:selector=>selector==='[data-unpin]'?{dataset:{unpin:'tang'}}:null}});
assert.equal(compare.state.pinned.length,before-1);
assert.equal(nodes.get('onlyPinned').disabled,true,'One pin cannot activate pinned-only comparison');
compare.change({selected:'abbasid'});
nodes.get('pinCompare').listeners.get('click')();
assert.deepEqual([...compare.state.pinned],[],'Pin button unpins selected safely');
assert.equal(nodes.get('onlyPinned').disabled,true);
assert.ok(!written.at(-1).includes('pins='),'Clearing pins removes sharing query');

compare.change({selected:'tang',year:800,span:1000,mode:'overlap'});
nodes.get('pinCompare').listeners.get('click')();
assert.deepEqual([...compare.state.pinned],['tang']);
assert.equal(compare.state.year,800,'Pinning does not navigate away');
assert.equal(compare.state.span,1000,'Pinning does not alter chart scale');
nodes.get('clearPinned').listeners.get('click')();
assert.deepEqual([...compare.state.pinned],[],'Clear pins removes all');
assert.equal(store.get('world-history-atlas-compare-pins-v1'),'[]');

const source=read('./public/compare.js');
assert.match(source,/e\.societyIds \|\| e\.allSocietyIds/,'Event dots include recorded society participants');
assert.match(source,/selectedKeys\.add\(state\.event\)/,'Chosen event marker remains visible');
assert.match(source,/Math\.floor\(i\*\(linked\.length-1\)/,'Markers distributed across the available time scale');
assert.match(read('./public/compare.css'),/\.pinned-workbench/);
console.log('PASS Compare v0.15 spotlight: pinned tracks, URL and browser persistence, safe focused filters, fit range, evidence markers, existing date scale.');
