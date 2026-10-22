import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root=vm.createContext({URL,console});root.globalThis=root;
for(let i=1;i<=29;i++)vm.runInContext(read('public/atlas-master-core-'+String(i).padStart(2,'0')+'.js'),root);
const byId=new Map(root.ATLAS_MASTER_CORE_PARTS.map(r=>[r.i,r]));
const abc=(name)=>[...byId.values()].filter(r=>r.c==='societies'&&r.t===name)[0];
root.ATLAS_MASTER_CONTEXT={byId,forSociety(id){const sid=abc(id==='abbasid'?'Abbasid Caliphate':'Tang dynasty')?.i;return [...byId.values()].filter(r=>(r.l||[]).includes(sid));}};
vm.runInContext(read('public/atlas-history-stories.js'),root);
const a=root.AtlasHistoryStories;
assert.ok(a.seeds.length>=20,'At least twenty carefully sourced explorations');
for(const h of a.seeds){
 assert.ok(h.text.length>=120&&h.text.length<=950,'Short but substantive context for '+h.id);
 assert.equal(a.usedRefs(h).length,h.refs.length,'Every citation resolves for '+h.id);
 assert.ok(a.usedRefs(h).length>=2,'Each story combines separate records');
 assert.ok(a.usedRefs(h).every(r=>(r.u||[]).some(u=>/^https?:\/\//.test(u))),'Source link exists for '+h.id);
}
const ab=a.forSociety({id:'abbasid',name:'Abbasid Caliphate'});
assert.match(ab,/Baghdad: politics, paper and learning/);assert.match(ab,/Evidence to explore/);assert.match(ab,/href="https:\/\//);
assert.match(a.forEvent({title:'Paper manufacture is established in Baghdad',year:790,primaryId:'abbasid'}),/Baghdad/);
assert.match(a.forEvent({title:'Diamond Sutra printing in Tang China',year:868,primaryId:'tang'}),/surviving book/);
assert.equal(a.forEvent({title:'A completely unrelated observation',year:900,primaryId:'missing'}),'');
assert.match(a.forTechnology({name:'Papermaking and manuscript paper'},{civ:'abbasid'}),/Baghdad/);
assert.match(a.forTechnology({name:'Papermaking and manuscript paper'},{civ:'rome'}),/Paper travelled/);
assert.equal(a.forSociety({id:'unlinked',name:'Imaginary State'}),'');
for(const [page,consumer] of [['story.html','story-app.js'],['compare.html','compare.js'],['index.html','app.js']]){
 const html=read('public/'+page);assert.match(html,/atlas-history-stories\.js/);assert.match(html,/atlas-history-stories\.css/);
 const before=html.indexOf('atlas-master-core-apply.js'),after=html.indexOf('atlas-history-stories.js');
 assert.ok(before>=0&&after>before,'Context script must load after master bridge: '+page);
 assert.match(read('public/'+consumer),/AtlasHistoryStories/,consumer+' consumes richer research');
}
assert.match(read('public/technology-tree.js'),/AtlasHistoryStories/);
console.log('PASS enriched history stories: '+a.seeds.length+' curated topics, source references, Story/Map/Compare/Technology readers and fallback context');