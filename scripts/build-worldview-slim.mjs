/* World Through Their Eyes slim index generator/validator.
 * Reads the existing 3 source research packs without altering them.
 * node scripts/build-worldview-slim.mjs [--check]
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext,runInContext} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=path=>readFileSync(resolve(root,path),'utf8');
const packPaths=['public/research-classical-data.js','public/research-1000-1499.js','public/research-1500-2026-data.js'];
const parse=source=>JSON.parse(source.slice(source.indexOf('{'),source.lastIndexOf('};')+1));
const packs=packPaths.map(path=>parse(read(path)));
function slimmer(p){
  const historical_maps=p.historical_maps||[],geographical_knowledge=p.geographical_knowledge||[],
    relationships=p.relationships||[];
  const ids=new Set([...historical_maps,...geographical_knowledge,...relationships].flatMap(r=>r.source_ids||[]));
  const source_register=(p.source_register||[]).filter(s=>ids.has(s.id)).map(s=>({
    id:s.id,title:s.title,url:s.url,access_status:s.access_status
  }));
  return {historical_maps,geographical_knowledge,relationships,source_register};
}
const slim=packs.map(slimmer);
const source=read('public/data.js');
const names=new Map();
for(const match of source.matchAll(/\{id:'([^']+)',name:'((?:\\'|[^'])+)'/g))
  names.set(match[1],match[2].replace(/\\'/g,"'"));
for(const p of packs)for(const s of p.societies||[])if(!names.has(s.id))names.set(s.id,s.name);
for(const p of slim)for(const r of p.relationships){
  for(const id of [r.source_society_id||r.society_a_id,r.target_society_id||r.society_b_id])
    if(id&&!names.has(id))names.set(id,id.replace(/[_-]/g,' '));
}
const curated={};
for(const id of ['ptolemy','kangnido','fra-mauro']){
  const match=source.match(new RegExp("(?:^|\\n)\\s*"+(id==='fra-mauro'?"'fra-mauro'":id)+":\\{([^}]+)\\}"));
  if(!match)throw Error('Cannot find curated map '+id);
  const image=match[1].match(/image:'([^']+)'/)?.[1],page=match[1].match(/page:'([^']+)'/)?.[1];
  if(!image||!page)throw Error('Missing catalogue references for '+id);
  curated[id]={image,page};
}
const expected={societies:[...names].map(([id,name])=>({id,name})).sort((a,b)=>a.id.localeCompare(b.id)),
  maps:curated,classical:slim[0],medieval:slim[1],modern:slim[2]};
const outfile=resolve(root,'public/worldview-slim-data.js');
if(process.argv.includes('--check')){
  const ctx=createContext({});
  runInContext(read('public/worldview-slim-data.js'),ctx,{timeout:2000});
  const actual=JSON.parse(runInContext('JSON.stringify({societies:CIVILISATIONS,maps:MAPS,classical:ATLAS_CLASSICAL_PACK,medieval:ATLAS_MEDIEVAL_PACK,modern:ATLAS_MODERN_PACK})',ctx,{timeout:2000}));
  for(const k of Object.keys(expected))if(JSON.stringify(actual[k])!==JSON.stringify(expected[k]))
    throw Error('Worldview research index out of date: '+k);
  console.log('PASS worldview compact index reproduces all source-derived map, geography and relationship records');
}else{
  const rows=[
    '/* Generated from classical, medieval and modern source archives. Do not hand edit. */',
    'const CIVILISATIONS = '+JSON.stringify(expected.societies)+';',
    'const MAPS = '+JSON.stringify(expected.maps)+';',
    'const ATLAS_CLASSICAL_PACK = '+JSON.stringify(expected.classical)+';',
    'const ATLAS_MEDIEVAL_PACK = '+JSON.stringify(expected.medieval)+';',
    'const ATLAS_MODERN_PACK = '+JSON.stringify(expected.modern)+';'
  ];
  writeFileSync(outfile,rows.join('\n')+'\n');
  console.log('Generated '+outfile);
}
