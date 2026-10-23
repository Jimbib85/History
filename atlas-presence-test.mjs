import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('./public/'+p,import.meta.url),'utf8');
const html=read('index.html'),interactionHtml=read('interactions.html'),linkUI=read('interactions.js');
const css=read('atlas-presence.css'),mapUI=read('atlas-presence-map.js'),presenceCode=read('atlas-presence.js');
const ctx=vm.createContext({window:{}});vm.runInContext(read('geo-layers.js'),ctx);vm.runInContext(presenceCode,ctx);
const geo=ctx.window.WorldAtlasGeo,presence=ctx.window.AtlasPresence;
assert.ok(geo&&presence);
const civs=[
 {id:'rome',name:'Roman Empire',kind:'empire',lon:12.5,lat:41.9,start:-26,end:476,color:'#bd7656'},
 {id:'han',name:'Han China',kind:'empire',lon:112,lat:35,start:-205,end:220,color:'#668db4'},
 {id:'parthia',name:'Parthian Empire',kind:'empire',lon:52,lat:35,start:-246,end:224,color:'#cdad79'},
 {id:'nowhere',name:'Research society without location',kind:'society',start:100,end:400,color:'#446677'},
 {id:'bad',name:'Bad coordinates',kind:'society',lat:0,lon:250,start:0,end:400,color:'#ffffff'},
 {id:'modern',name:'Future society',kind:'society',lat:0,lon:0,start:1500,end:2026,color:'#FFFFFF'}
];
assert.equal(presence.mapped(civs[0],geo),true);
assert.equal(presence.mapped(civs[3],geo),false);
assert.equal(presence.mapped(civs[4],geo),false);
const normal=presence.choose(civs,geo,100,{selectedId:'rome',limit:26});
assert.ok(normal.some(x=>x.c.id==='rome'&&x.role==='selected'));
assert.ok(normal.some(x=>x.c.id==='han'));
assert.ok(!normal.some(x=>x.c.id==='modern'||x.c.id==='nowhere'||x.c.id==='bad'));
const eventSelection=presence.choose(civs,geo,100,{selectedId:'rome',participants:['rome','han','nowhere'],limit:2});
assert.deepEqual([...eventSelection].map(x=>x.c.id).sort(),['han','rome']);
assert.equal(presence.safeColour('red'), '#cbad77');
assert.equal(presence.safeColour('url(javascript:alert(1))'),'#cbad77');
assert.match(presence.path(civs[0],geo),/^M[\d.]+ [\d.]+ L/);
const svg=presence.cloudSvg(eventSelection,geo);
assert.equal((svg.match(/<path /g)||[]).length,2);
assert.match(svg,/fill="#bd7656"/);
assert.match(svg,/fill="#668db4"/);
assert.doesNotMatch(svg,/<line\b|<polygon\b/,'No invented borders or routes');
assert.match(svg,/not a historical border/);
const evidence=[
 {title:'Undated',id:'skip',societyIds:['rome','han']},
 {id:'rome-han-record',title:'Documented record',year:100,societyIds:['rome','han'],detail:'Co-mentioned'},
 {title:'Unrelated',year:102,societyIds:['rome']},
 {title:'Second shared event',year:111,societyIds:['rome','parthia']},
 {title:'Malformed participants',year:120,societyIds:['rome','nonexistent']}
];
const match=presence.interaction(evidence,'rome-han-record',civs);
assert.equal(match.title,'Documented record');
assert.equal(match.year,100);
assert.deepEqual(Array.from(match.participants),['rome','han']);
assert.equal(presence.interaction(evidence,'multi-2',civs)?.title,'Second shared event',
 'Fallback keys follow the Interactions view filtered index, not original raw source index');
assert.equal(presence.interaction(evidence,'multi-0',civs),null);
assert.equal(presence.interaction(evidence,'missing',civs),null);
assert.equal(presence.interaction(evidence,'../../evil',civs),null);
for(const id of ['togglePresenceClouds','mapPresenceClouds','mapPresenceNote','mapInteractionContext'])assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(html.indexOf('geo-layers.js')<html.indexOf('atlas-presence.js'));
assert.ok(html.indexOf('atlas-presence.js')<html.indexOf('app.js'));
assert.ok(html.indexOf('app.js')<html.indexOf('atlas-presence-map.js'));
assert.match(html,/atlas-presence\.css/);
assert.match(html,/Not historical borders/);
assert.match(linkUI,/&interaction='\+encodeURIComponent\(e\.key\)/);
assert.match(mapUI,/state\.view==='actual'/);
assert.match(mapUI,/new root\.MutationObserver\(render\)\.observe\(markers/);
assert.match(mapUI,/clouds\.length/);
assert.match(mapUI,/representative map points/);
assert.match(css,/pointer-events:none/,'Cloud overlays must not block map marker interaction');
assert.match(interactionHtml,/id="interactionDetailPanel"/);
new vm.Script(mapUI,{filename:'atlas-presence-map.js'});
console.log('PASS presence clouds: deterministic location halos, year-aware society selection, safe evidence map links and explicit non-border warnings');
