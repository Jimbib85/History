/* Offline contract tests: no museum network or Cloudflare account required. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from './src/index.js';

const assets=globalThis.AtlasVisualAssets;
assert.ok(assets,'Curated catalogue loads for both the browser and Worker');
assert.ok(assets.allowedObjectIds.length>=15,'A useful first-pass curated collection exists');
assert.equal(assets.forSociety('abbasid')?.id,451768);
assert.equal(assets.forSociety('song')?.id,40056);
assert.equal(assets.forSociety('byzantium')?.id,464531);
assert.equal(assets.forTechnology('woodblock')?.id,63404);
assert.equal(assets.forTechnology('irrigation'),null,'Water-clock manuscript is not irrigation evidence');
for(const item of assets.entries){
 assert.equal(item.sourceUrl,'https://www.metmuseum.org/art/collection/search/'+item.id);
 assert.ok(item.alt&&item.date&&item.type&&item.note,'Every item has explanatory metadata');
 assert.ok(!item.imageUrl.startsWith('https:'),'Museum images are never directly hotlinked from the browser');
}
for(const page of ['public/index.html','public/compare.html']){
 const html=readFileSync(new URL('./'+page,import.meta.url),'utf8');
 assert.ok(html.includes('atlas-visual-assets.js'),'Shared visual catalogue included: '+page);
 assert.ok(html.includes('atlas-artwork.css'),'Shared artwork CSS included: '+page);
}

const savedFetch=globalThis.fetch;
let count=0;
let publicDomain=true, imageHost='images.metmuseum.org';
const mockMeta=()=>({objectID:451768,isPublicDomain:publicDomain,primaryImageSmall:'https://'+imageHost+'/CRDImages/is/web-large/TEST.jpg'});
globalThis.fetch=async url=>{
 count++;
 const str=String(url);
 if(str.includes('collectionapi.metmuseum.org')) return new Response(JSON.stringify(mockMeta()),{status:200,headers:{'Content-Type':'application/json'}});
 const response=new Response(new Uint8Array([255,216,255,217]),{status:200,headers:{'Content-Type':'image/jpeg','Content-Length':'4'}});
 Object.defineProperty(response,'url',{value:str});
 return response;
};
const env={ASSETS:{fetch:()=>new Response('static asset ok')}};
try{
 let r=await worker.fetch(new Request('https://history.example/compare.html'),env,{});
 assert.equal(await r.text(),'static asset ok','Regular static assets remain unaffected');
 r=await worker.fetch(new Request('https://history.example/atlas/media/met/99999999'),env,{});
 assert.equal(r.status,404,'Unknown object not proxied');
 r=await worker.fetch(new Request('https://history.example/atlas/media/met/451768',{method:'POST'}),env,{});
 assert.equal(r.status,405,'Media endpoint is read-only');
 publicDomain=false;
 r=await worker.fetch(new Request('https://history.example/atlas/media/met/451768'),env,{});
 assert.equal(r.status,404,'Non-public-domain media is not shown');
 publicDomain=true;imageHost='untrusted.example';
 r=await worker.fetch(new Request('https://history.example/atlas/media/met/451768'),env,{});
 assert.equal(r.status,404,'Unapproved image host cannot be proxied');
 imageHost='images.metmuseum.org';
 r=await worker.fetch(new Request('https://history.example/atlas/media/met/451768'),env,{});
 assert.equal(r.status,200,'Verified public-domain media is served');
 assert.equal(r.headers.get('Content-Type'),'image/jpeg');
 assert.ok(Number(r.headers.get('Cache-Control').includes('max-age=')),'Image has cache policy');
 assert.equal((await r.arrayBuffer()).byteLength,4);
 assert.ok(count>=4);
}finally {globalThis.fetch=savedFetch;}
console.log('PASS visual catalogue identity, attribution and Worker media policy');
