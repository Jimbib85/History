/* Render-boot smoke test of the full historical WorldView page with actual research imports. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=file=>fs.readFileSync(new URL('./public/'+file,import.meta.url),'utf8');
const html=read('worldview.html');
const nodes=new Map();
function fake(id=''){
 return {id,innerHTML:'',textContent:'',value:'',href:'',listeners:new Map(),dataset:{},disabled:false,
  addEventListener(type,cb){this.listeners.set(type,cb);},setAttribute(){},focus(){},blur(){},
  closest(){return null}};
}
for(const [,id] of html.matchAll(/id="([^"]+)"/g))nodes.set(id,fake(id));
const preset=[fake(),fake()];preset[0].dataset.preset='1402';preset[1].dataset.preset='-170';
const location={href:'https://atlas.example/worldview.html?year=200&civ=rome',search:'?year=200&civ=rome'};
let lastUrl='';
const document={
 activeElement:null,
 getElementById:id=>nodes.get(id),
 querySelectorAll:selector=>selector==='[data-preset]'?preset:[]
};
const history={replaceState(_state,_title,url){lastUrl=String(url)}};
const context=vm.createContext({URL,URLSearchParams,document,location,history,console});
context.window=context;
for(const match of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)){
 const file=match[1];vm.runInContext(read(file),context,{filename:file});
}
const app=context.AtlasWorldView;
assert.ok(app,'WorldView initialises with the full page script chain');
assert.equal(app.state.society,'rome','Deep linked society retained');
assert.equal(app.state.year,200,'Deep linked historical date retained');
assert.ok(nodes.get('worldSociety').innerHTML.includes('western_han'));
assert.match(nodes.get('worldContext').textContent,/map records/);
assert.ok(nodes.get('returnMap').href.includes('year=200'));
assert.ok(nodes.get('returnMap').href.includes('civ=rome'));
assert.equal(nodes.get('mapsCount').textContent,'1','Rome has a linked Tabula Peutingeriana map record');
app.change({society:'all',period:'all',search:''});
assert.equal(nodes.get('mapsCount').textContent,'19');
assert.equal(nodes.get('connectionsCount').textContent,'127');
assert.ok(nodes.get('mapsRecords').innerHTML.includes('evidence-card'));
assert.ok(nodes.get('mapsRecords').innerHTML.includes('record-tags'));
assert.ok(nodes.get('mapsMore').innerHTML.includes('data-more="maps"'));
nodes.get('records').listeners.get('click')({target:{closest:s=>s==='[data-more]'?{dataset:{more:'maps'}}:null}});
assert.equal((nodes.get('mapsRecords').innerHTML.match(/class="evidence-card"/g)||[]).length,16,'Progressive reveal appends next eight');
app.change({society:'western_han',period:'near',year:-170,search:''});
assert.equal(nodes.get('mapsCount').textContent,'3','Han map objects filtered correctly');
assert.equal(app.parseYear('500 BCE'),-499);
assert.equal(app.parseYear('0 CE'),null);
assert.equal(app.parseYear('1 BCE'),0);
nodes.get('worldSearch').listeners.get('input')({target:{value:'Mawangdui'}});
assert.equal(app.state.search,'Mawangdui');
assert.ok(lastUrl.includes('civ=western_han'));
assert.ok(lastUrl.includes('period=near'));
nodes.get('resetWorld').listeners.get('click')();
assert.equal(app.state.society,'all');
assert.equal(app.state.period,'all');
assert.equal(app.state.search,'');
preset[0].listeners.get('click')();
assert.equal(app.state.year,1402);
assert.equal(app.state.period,'near');
assert.equal(nodes.get('mapsCount').textContent.length>0,true);
console.log('PASS v0.17 worldview page boot, research scripts, society context, evidence cards, progressive disclosure and period filters');
