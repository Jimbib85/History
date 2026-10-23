import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const pages=['story','index','compare','conflicts','worldview','discover','interactions'];
const views=['story','map','compare','technology','interactions','worldview','discover','conflicts'];
for(const page of pages){
 const html=read('./public/'+page+'.html');
 const nav=html.match(/<nav class="[^"]*atlas-crossnav[^"]*"[^>]*>[\s\S]*?<\/nav>/)?.[0];
 assert.ok(nav,'Missing shared navigation on '+page);
 assert.equal((nav.match(/data-atlas-view=/g)||[]).length,views.length,page+' must expose every view');
 for(const v of views)assert.ok(nav.includes('data-atlas-view="'+v+'"'),page+' missing '+v);
 assert.equal((nav.match(/aria-current="page"/g)||[]).length,1,'Current view label for '+page);
 assert.match(html,/atlas-nav\.css\?v=0\.19\.0/);
 assert.match(html,/atlas-links\.js\?v=0\.(?:19|33|41)\.0/);
 assert.ok(html.indexOf('atlas-links.js')>html.indexOf('app.js?v=') || !html.includes('app.js?v='));
}
assert.match(read('./public/atlas-nav.css'),/overflow-x:auto/);
assert.match(read('./public/atlas-nav.css'),/min-height:44px/);
function scenario(url,states={}){
 const listeners=new Map(),items=views.map(view=>({dataset:{atlasView:view},href:'',setAttribute(k,v){this[k]=v}}));
 const location={href:url,search:new URL(url).search};
 const document={readyState:'complete',querySelectorAll:q=>q==='[data-atlas-view]'?items:[],
   addEventListener(type,handler){listeners.set(type,handler)}};
 const context={URL,URLSearchParams,document,location,addEventListener(){},...states};
 context.window=context;
 vm.runInNewContext(read('./public/atlas-links.js'),context,{filename:'atlas-links.js'});
 const nav=context.AtlasCrossLinks;
 return {nav,items,listeners};
}
let {nav,items,listeners}=scenario('https://atlas.test/story.html?year=-499&entity=athens',
   {HistoryStory:{state:{year:-499,entity:'athens'}}});
assert.equal(nav.href('story'),'story.html?year=-499&entity=athens');
assert.equal(nav.href('map'),'index.html?year=-499&civ=athens');
assert.equal(nav.href('compare'),'compare.html?year=-499&civ=athens');
assert.equal(nav.href('technology'),'index.html?year=-499&civ=athens#technology');
assert.equal(nav.href('interactions'),'interactions.html?year=-499&civ=athens');
assert.equal(nav.href('worldview'),'worldview.html?year=-499&civ=athens');
assert.equal(nav.href('discover'),'discover.html?year=-499');
assert.equal(nav.href('conflicts'),'conflicts.html');
assert.equal(items.find(a=>a.dataset.atlasView==='map').href,'index.html?year=-499&civ=athens');
assert.ok(listeners.has('focusin')&&listeners.has('contextmenu')&&listeners.has('pointerdown'));
({nav}=scenario('https://atlas.test/compare.html?year=0&civ=rome',
   {HistoryCompare:{state:{year:0,selected:'rome'}}}));
assert.equal(nav.href('worldview'),'worldview.html?year=0&civ=rome','1 BCE must retain year zero');
({nav}=scenario('https://atlas.test/worldview.html?year=1402',
   {AtlasWorldView:{state:{year:1402,society:'all'}}}));
assert.equal(nav.href('story'),'story.html?year=1402');
({nav}=scenario('https://atlas.test/discover.html?year=1800',
   {AtlasDiscoveryUI:{state:{year:1800}}}));
assert.equal(nav.href('compare'),'compare.html?year=1800');
({nav}=scenario('https://atlas.test/conflicts.html'));
assert.equal(nav.href('story'),'story.html','Do not invent a year on the unfiltered Conflicts page');
({nav}=scenario('https://atlas.test/story.html?year=bad&entity=invalid%20id'));
assert.equal(nav.href('map'),'index.html','Never propagate malformed historical context');
assert.equal(nav.href('nonexistent'),null);
console.log('PASS navigation v0.33: 7 screens, 8 consistent links, BCE/year zero, context, accessible mobile scroll and safe unfiltered routes.');
