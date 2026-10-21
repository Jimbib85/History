import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const directory=new URL('./public/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,directory),'utf8');
class Element {
  constructor(){this.innerHTML='';this.value='';this.listeners={};this.open=false;this.disabled=false;this.attributes={};}
  addEventListener(name,handler){this.listeners[name]=handler;}
  setAttribute(name,value){this.attributes[name]=String(value);}
  getAttribute(name){return this.attributes[name]??null;}
  removeAttribute(name){delete this.attributes[name];}
  showModal(){this.open=true;}
  close(){this.open=false;this.listeners.close?.();}
  scrollTo(){}
  focus(){}
}
function mount(context){
  const ids=new Set([...read('index.html').matchAll(/id="([^"]+)"/g)].map(match=>match[1]));
  const dom=Object.fromEntries([...ids].map(id=>[id,new Element()]));
  context.document={getElementById:id=>dom[id]};
  context.window={WorldHistoryAtlas:{state:{civ:'rome'},go(){}}};
  vm.runInContext(read('technology-tree.js'),context,{filename:'technology-tree.js'});
  context.window.WorldHistoryTechnology.open();
  return {dom,api:context.window.WorldHistoryTechnology};
}
const click=(container,selector,dataset={})=>container.listeners.click({target:{closest:query=>query===selector?{dataset}:null}});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const changeScope=(dom,civ)=>{dom.technologyCivilisation.value=civ;dom.technologyCivilisation.listeners.change();};
const searchFor=(dom,value)=>{dom.technologySearch.value=value;dom.technologySearch.listeners.input();};
const attributeValues=(markup,attribute)=>[...markup.matchAll(new RegExp('\\b'+attribute+'="([^"]*)"','g'))].map(match=>match[1]);

// Reused by the medieval merge suite: coordinate validity is behavior, not a source-code substring.
export function assertTechnologyCoordinateGuard(context){
  const societies=vm.runInContext('CIVILISATIONS',context);
  const positions=societies.map(c=>({c,lat:c.lat,lon:c.lon}));
  try {
    societies.forEach(c=>{c.lon=undefined;c.lat=undefined;});
    const {dom}=mount(context);
    changeScope(dom,'all');
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


function assertSocietyScopes({context,dom,api,technologies,societies,pathways}){
  const topics=Array.from(technologies);
  const topicById=new Map(topics.map(t=>[t.id,t]));
  const scopedTopics=civ=>topics.filter(t=>t.appearances.some(a=>civ==='all'||a.civ===civ));
  const keyedRecords=t=>Array.from(t.appearances,(a,index)=>({...a,key:t.id+':'+(a.researchId||a.id||index)}));
  const scopedRecords=(t,civ)=>keyedRecords(t).filter(a=>civ==='all'||a.civ===civ);
  const topicIds=()=>attributeValues(dom.technologyBranches.innerHTML,'data-tech');
  const recordKeys=()=>attributeValues(dom.technologyDetails.innerHTML,'data-record');
  const locationIds=()=>attributeValues(dom.technologyDetails.innerHTML,'data-location');
  const chooseTech=id=>click(dom.technologyBranches,'[data-tech]',{tech:id});
  const chooseRecord=key=>click(dom.technologyDetails,'[data-record]',{record:key});
  function blankSelection(message){
    assert.equal(api.state.tech,null,message+': no stale topic');
    assert.equal(api.state.record,null,message+': no stale milestone');
    assert.equal(api.state.mapCiv,null,message+': no stale map society');
    assert.equal(recordKeys().length,0,message+': no stale evidence controls');
    assert.equal(locationIds().length,0,message+': no stale map places');
    assert.ok(!dom.technologyDetails.innerHTML.includes('data-tech-jump='),message+': no stale historical jump');
    assert.equal(dom.randomTechnology.disabled,true,message+': Random disabled');
  }
  function assertScope(civ){
    assert.equal(api.state.civ,civ);
    const eligible=scopedTopics(civ),eligibleIds=new Set(eligible.map(t=>t.id));
    const shown=topicIds();
    assert.ok(shown.every(id=>eligibleIds.has(id)),'Only related topics appear for '+civ);
    const expectedFamilies=[...new Set(eligible.map(t=>t.branch))].sort();
    assert.deepEqual([...new Set(attributeValues(dom.technologyBranches.innerHTML,'data-branch'))].sort(),expectedFamilies,'Empty families are hidden for '+civ);
    const buttons=dom.technologyBranches.innerHTML.match(/<button\b[\s\S]*?<\/button>/g)||[];
    for(const id of shown){
      const count=scopedRecords(topicById.get(id),civ).length;
      const button=buttons.find(markup=>markup.includes('data-tech="'+escape(id)+'"'));
      assert.ok(button?.includes(count+' evidence '),'Topic count uses scoped evidence for '+civ+'/'+id);
    }
    if(!eligible.length){
      assert.equal(shown.length,0,'No unrelated fallback topic for '+civ);
      blankSelection('Empty scope '+civ);
      return;
    }
    assert.ok(eligibleIds.has(api.state.tech),'Selected topic belongs to '+civ);
    const available=scopedRecords(topicById.get(api.state.tech),civ);
    const keys=new Set(available.map(a=>a.key));
    assert.ok(keys.has(api.state.record),'Selected record belongs to '+civ);
    assert.ok(recordKeys().every(key=>keys.has(key)),'Rendered evidence is scoped for '+civ);
    const selected=available.find(a=>a.key===api.state.record);
    assert.equal(api.state.mapCiv,selected.civ,'Map selection follows the exact scoped milestone for '+civ);
    if(civ!=='all')assert.ok(locationIds().every(id=>id===civ),'Map places are scoped for '+civ);
    assert.equal(dom.randomTechnology.disabled,eligible.length<2,'Random availability follows eligible topics for '+civ);
  }

  // These exact fixture totals detect accidental broadening from society notes or relationships.
  for(const [civ,expectedTopics,expectedRecords] of [['abbasid',6,7],['tang',5,8],['rome',11,13],['olmec',0,0]]){
    const related=scopedTopics(civ);
    assert.equal(related.length,expectedTopics,'Real-data topic fixture '+civ);
    assert.equal(related.reduce((sum,t)=>sum+scopedRecords(t,civ).length,0),expectedRecords,'Real-data evidence fixture '+civ);
    changeScope(dom,civ);
    assertScope(civ);
    assert.equal(topicIds().length,expectedTopics,'Every small scoped topic set is visible for '+civ);
  }

  changeScope(dom,'abbasid');chooseTech('paper');
  assert.equal(api.state.tech,'paper');
  const firstAbbasidRecord=api.state.record;
  changeScope(dom,'tang');
  assert.equal(api.state.tech,'paper','A topic valid in both societies remains selected');
  assert.notEqual(api.state.record,firstAbbasidRecord,'The exact record changes with society scope');
  assertScope('tang');
  const paper=topicById.get('paper'),tangPaper=scopedRecords(paper,'tang');
  assert.ok(tangPaper.length>=2,'Multiple Tang observations exercise stable record identity');
  for(const observation of tangPaper){
    chooseRecord(observation.key);
    assert.equal(api.state.record,observation.key,'Original pre-filter record key remains selectable');
    assert.ok(dom.technologyDetails.innerHTML.includes(escape(observation.note)),'Selected scoped record supplies its own evidence');
  }
  const foreignPaper=keyedRecords(paper).find(a=>a.civ!=='tang');
  const exactTangRecord=api.state.record;
  chooseRecord(foreignPaper.key);
  assert.equal(api.state.record,exactTangRecord,'A stale record action cannot select another society');
  const unrelatedTopic=topics.find(t=>!t.appearances.some(a=>a.civ==='tang'));
  chooseTech(unrelatedTopic.id);
  assert.equal(api.state.tech,'paper','A stale topic action cannot escape the society scope');

  click(dom.technologyDetails,'[data-viz]',{viz:'map'});
  assertScope('tang');
  assert.ok(locationIds().length>0,'Tang evidence retains its real reference place');
  assert.ok(!dom.technologyDetails.innerHTML.includes('class="tviz-route"'),'Single-society maps omit cross-society routes');
  assert.ok(!/Abbasid[^<]*→|→[^<]*Abbasid/.test(dom.technologyDetails.innerHTML),'Unrelated connection descriptions are omitted');
  const currentMap=api.state.mapCiv;
  click(dom.technologyDetails,'[data-location]',{location:'abbasid'});
  assert.equal(api.state.mapCiv,currentMap,'A stale place action cannot escape the society scope');

  changeScope(dom,'all');chooseTech('paper');
  click(dom.technologyDetails,'[data-viz]',{viz:'map'});
  const allPaperCivs=new Set(keyedRecords(paper).map(a=>a.civ));
  const chartedRoutes=Array.from(pathways).filter(link=>link.tech==='paper'&&allPaperCivs.has(link.from)&&allPaperCivs.has(link.to));
  assert.ok(chartedRoutes.length>0,'Global paper fixture contains curated cross-society connections');
  assert.ok(dom.technologyDetails.innerHTML.includes('class="tviz-route"'),'All restores supported global routes');
  changeScope(dom,'rome');
  assert.notEqual(api.state.tech,'paper','An ineligible topic is replaced on society change');
  assertScope('rome');

  // Search must inspect the scoped observations, never notes from another society.
  changeScope(dom,'abbasid');
  searchFor(dom,'Gutenberg');
  assert.equal(topicIds().length,0,'A European evidence note does not match Abbasid scope');
  blankSelection('No matching scoped search');
  dom.randomTechnology.listeners.click();
  blankSelection('Random in an empty search');
  click(dom.technologyBranches,'[data-tech-clear]');
  assert.equal(api.state.search,'');
  assert.equal(dom.technologySearch.value,'');
  assertScope('abbasid');

  changeScope(dom,'all');
  searchFor(dom,'Gutenberg');
  assert.ok(topicIds().includes('movable-type'),'All restores the same globally matching evidence');
  chooseTech('movable-type');
  assert.ok(dom.technologyDetails.innerHTML.includes('Gutenberg Bible'));
  const gutenbergRecord=api.state.record;
  assert.equal(dom.randomTechnology.disabled,true,'Random is disabled with a single matching topic');
  dom.randomTechnology.listeners.click();
  assert.equal(api.state.record,gutenbergRecord,'Disabled Random cannot replace the exact search match');

  // Switching the society clears the prior search and every progressive-list page.
  api.state.evidenceLimit=24;api.state.timelineLimit=32;api.state.mapLimit=40;
  api.state.branchLimits={printing:24,materials:32};
  changeScope(dom,'tang');
  assert.equal(api.state.search,'');assert.equal(dom.technologySearch.value,'');
  for(const key of ['evidenceLimit','timelineLimit','mapLimit'])assert.equal(api.state[key],8,'Society switch resets '+key);
  assert.ok(Object.values(api.state.branchLimits).every(n=>n===8),'Society switch resets branch pagination');
  assertScope('tang');

  searchFor(dom,'printing');
  const matchingIds=new Set(topicIds());
  assert.ok(matchingIds.size>=2,'Scoped printing search has multiple eligible Random choices');
  assert.ok([...matchingIds].every(id=>scopedTopics('tang').some(t=>t.id===id)));
  vm.runInContext('Math.random=()=>0.999999',context);
  for(let i=0;i<12;i++){
    dom.randomTechnology.listeners.click();
    assert.ok(matchingIds.has(api.state.tech),'Random stays inside both society and search');
    assert.equal(api.state.search,'printing','Random preserves search');
    assert.equal(dom.technologySearch.value,'printing');
    const selected=scopedRecords(topicById.get(api.state.tech),'tang').find(a=>a.key===api.state.record);
    assert.ok(selected,'Random chooses an exact scoped record');
  }
  searchFor(dom,'zz-no-matching-historical-evidence-zz');
  blankSelection('Zero-result search');
  searchFor(dom,'');
  assertScope('tang');

  // Reopening remembers a deliberate dropdown scope until the Map context actually changes.
  changeScope(dom,'all');dom.technologyDialog.close();api.open();
  assert.equal(api.state.civ,'all','All survives reopening while Map society is unchanged');
  changeScope(dom,'abbasid');dom.technologyDialog.close();api.open();
  assert.equal(api.state.civ,'abbasid','A deliberate dropdown society survives reopening');
  context.window.WorldHistoryAtlas.state.civ='tang';
  dom.technologyDialog.close();api.open();assertScope('tang');
  searchFor(dom,'printing');
  context.window.WorldHistoryAtlas.state.civ='rome';
  dom.technologyDialog.close();api.open();
  assert.equal(api.state.search,'','New Map context clears the old scoped search');
  assertScope('rome');

  // Cheap full-catalogue invariant: every selectable society either has exact records or a clean empty state.
  for(const society of Array.from(societies)){
    changeScope(dom,society.id);
    assertScope(society.id);
    const permitted=new Set(scopedTopics(society.id).map(t=>t.id));
    dom.randomTechnology.listeners.click();
    if(permitted.size)assert.ok(permitted.has(api.state.tech),'Random never leaves '+society.id);
    else blankSelection('Empty Random scope '+society.id);
  }
  changeScope(dom,'olmec');searchFor(dom,'paper');
  blankSelection('Search within an empty society');
  click(dom.technologyBranches,'[data-tech-clear]');
  blankSelection('Clear search within an empty society');
  changeScope(dom,'all');assertScope('all');
  console.log('PASS technology society scopes:',societies.length,'selectable societies; exact topic/evidence counts, source-safe empty states, scoped search/maps/Random, stable keys, resets and reopen behavior');
}

function run(){
  const context=vm.createContext({});
  const scripts=[...read('index.html').matchAll(/<script src="([^?" ]+)/g)].map(match=>match[1]).filter(name=>/^(data|entity-types|research-|tech-)/.test(name));
  for(const file of scripts)vm.runInContext(read(file),context,{filename:file});
  const {dom,api}=mount(context);
  const technologies=vm.runInContext('TECHNOLOGIES',context);
  const societies=vm.runInContext('CIVILISATIONS.filter(c=>c.kind!=="overview")',context);
  const pathways=vm.runInContext('TECH_PATHWAYS',context);
  const sourceSnapshot=JSON.stringify({technologies,societies,pathways});
  assert.equal(dom.technologyDialog.open,true);
  assert.equal(api.state.civ,'rome','Opening the explorer adopts the Map society initially');
  changeScope(dom,'all');
  assert.equal(api.state.civ,'all','Global comparison is an explicit scope');
  assert.ok(dom.technologyCivilisation.innerHTML.includes('value="all"'),'The scope selector offers All societies & empires');
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

  assertSocietyScopes({context,dom,api,technologies,societies,pathways});
  assert.equal(JSON.stringify({technologies,societies,pathways}),sourceSnapshot,'Scope, search, Random and map browsing do not mutate research data');
  assertTechnologyCoordinateGuard(context);
  console.log('PASS technology UX:',technologies.length,'technologies,',technologies.reduce((n,t)=>n+t.appearances.length,0),'evidence records; batching, exact milestones, search, shared time scale and coordinate guards');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run();
