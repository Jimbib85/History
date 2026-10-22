import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=x=>readFileSync(new URL('./public/'+x,import.meta.url),'utf8');
const html=read('index.html'),base=read('styles.css'),tokens=read('atlas-cinematic.css'),map=read('atlas-cinematic-map.css');
assert.match(html,/<body class="atlas-cinematic">/);
assert.match(html,/atlas-cinematic\.css\?v=0\.26\.0/);
assert.match(html,/atlas-cinematic-map\.css\?v=0\.26\.0/);
assert.ok(html.indexOf('styles.css?v=0.26.0')<html.indexOf('atlas-cinematic-map.css'),'Map visual styles must override base styles');
for(const id of ['worldMap','mapMarkers','yearSlider','yearInput','civilisationList','technologyButton','historicalMap','mapGrid','zoomIn','zoomOut','resetMap','mapEvidence','timelineRows','storyPanel'])
 assert.ok(html.includes('id="'+id+'"'),id+' must remain accessible');
for(const view of ['actual','historical','known'])assert.ok(html.includes('data-view="'+view+'"'));
for(const q of ['--atlas-night','--atlas-gold','--atlas-muted','prefers-reduced-motion'])
 assert.ok(tokens.includes(q),'Missing reusable design token '+q);
for(const q of ['.map-stage','.map-marker','.right-panel','.time-card','@media(max-width:820px)','@media(max-width:480px)'])
 assert.ok(map.includes(q),'Missing responsive cinematic selector '+q);
assert.ok(!/https?:\/\//.test(map),'No external map wallpapers or per-screen image downloads');
assert.ok(statSync(new URL('./public/atlas-cinematic.css',import.meta.url)).size<5000);
assert.ok(statSync(new URL('./public/atlas-cinematic-map.css',import.meta.url)).size<16000);
assert.ok(read('app.js').includes("const activeAt ="),'Historical filtering logic remains untouched');
console.log('PASS cinematic map: static overlay tokens, original data controls and map modes, reduced motion and responsive styles');
