/* Regenerate the Discovery excerpt from existing research archives.
 * Usage: node scripts/build-discovery-data.mjs [--check]
 * Generated text is a presentation index, never a replacement for original research.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const packs=[
  ['Classical', 'public/research-classical-data.js'],
  ['Medieval', 'public/research-1000-1499.js'],
  ['Modern', 'public/research-1500-2026-data.js']
];
const validUrl=x=>{try{const u=new URL(x);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}};
function createIndex(packEntries) {
 const practices=[];
 for(const [scope,pack] of packEntries){
  const sources=new Map((pack.source_register||[]).map(s=>[s.id,s]));
  for(const row of pack.cultural_practices||[]){
   const years=[row.start_year,row.end_year_exclusive];
   const start=Number.isInteger(years[0])?years[0]:null;
   const end=Number.isInteger(years[1])&&years[1]>start?years[1]:null;
   const ids=[row.society_id,...(row.society_ids||[])].filter(id=>typeof id==='string'&&id);
   const links=(row.source_ids||[]).map(id=>{
      const src=sources.get(id);
      return {id,title:src?.title||id,url:validUrl(src?.url),access:src?.access_status||'Source lead; item not independently reviewed'};
   });
   for(const url of row.source_urls||[]){
     const safe=validUrl(url);
     if(safe&&!links.some(item=>item.url===safe))links.push({id:'direct',title:'Research source',url:safe,access:'Research link; item not independently reviewed'});
   }
   practices.push({
     id:scope.toLowerCase()+':'+row.id,rawId:row.id,scope,
     title:row.title||row.theme||row.practice_type||row.category||'Cultural practice',
     summary:row.description||row.summary||'No further detail in source record',
     topic:row.practice_type||row.category||row.theme||'Unclassified',
     societyIds:[...new Set(ids)],region:row.region||null,
     start,endExclusive:end,dateStatus:start===null?'not_dated_in_record':'record_interval',
     confidence:row.confidence||'NOT_RATED',sourceItems:links
   });
  }
 }
 return practices;
}
function render(records){
 return '/* Generated from research packs: do not edit. Run node scripts/build-discovery-data.mjs */\n'
 + 'const ATLAS_DISCOVERY_DATA = '+JSON.stringify(records).replace(/<\//g,'<\\/')+';\n';
}
const packEntries=packs.map(([scope,path])=>{
 const text=readFileSync(resolve(root,path),'utf8');
 const from=text.indexOf('{'),to=text.lastIndexOf('};');
 if(from<0||to<=from)throw Error('Cannot find research payload: '+path);
 return [scope,JSON.parse(text.slice(from,to+1))];
});
const expected=render(createIndex(packEntries)),output=resolve(root,'public/discovery-data.js');
if(process.argv.includes('--check')){
 const existing=readFileSync(output,'utf8');
 if(existing!==expected)throw Error('Discovery data out of date. Run node scripts/build-discovery-data.mjs');
 console.log('PASS discovery index matches unchanged source archives');
}else{
 writeFileSync(output,expected);
 console.log('Generated public/discovery-data.js');
}
