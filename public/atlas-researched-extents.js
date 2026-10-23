/* Reviewed historical extent snapshots. Polygon coordinates are fetched
 * from a published GIS feature service, NEVER generated from a society point.
 * Peak snapshots cannot be used to infer a polity's boundaries at other dates.
 * Source: University of Minnesota, Major Empires (2016), research/teaching reuse
 * with credit: https://www.arcgis.com/home/item.html?id=1bb885a34b44491eb06c5681dd009d11
 */
(function(root){
 'use strict';
 const SOURCE='https://www.arcgis.com/home/item.html?id=1bb885a34b44491eb06c5681dd009d11';
 const ENDPOINT='https://services.arcgis.com/8df8p0NlLFEShl0r/arcgis/rest/services/Major_Empires/FeatureServer/0/query';
 const SNAPSHOTS=Object.freeze([
  Object.freeze({id:'rome',name:'Roman Empire',year:117,label:'Rome · 117 CE',sourceName:'University of Minnesota · Major Empires GIS',source:SOURCE}),
  Object.freeze({id:'mongols',name:'Mongol Empire',year:1279,label:'Mongols · 1279 CE',sourceName:'University of Minnesota · Major Empires GIS',source:SOURCE}),
  Object.freeze({id:'british',name:'British Empire',year:1921,label:'British · 1921 CE',sourceName:'University of Minnesota · Major Empires GIS',source:SOURCE})
 ]);
 const safeColour=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c:'#d0a76c';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function atYear(year){return SNAPSHOTS.filter(s=>s.year===year);}
 function queryUrl(snapshot){
  if(!SNAPSHOTS.includes(snapshot))return null;
  const q=new URLSearchParams({
   where:"Name='"+snapshot.name.replace(/'/g,"''")+"'",
   outFields:'Name,Date_of_Greatest_Extent',outSR:'4326',
   returnGeometry:'true',maxAllowableOffset:'0.3',
   geometryPrecision:'2',f:'geojson'
  });
  return ENDPOINT+'?'+q.toString();
 }
 function validPoint(p,geo){return Array.isArray(p)&&p.length>=2&&geo.finite(p[0],p[1]);}
 function geometryPaths(geometry,geo){
  if(!geometry||!['Polygon','MultiPolygon'].includes(geometry.type)||!Array.isArray(geometry.coordinates))return [];
  const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  const paths=[];let vertices=0;
  for(const rings of polygons){
   if(!Array.isArray(rings))continue;
   let d='';
   for(const ring of rings){
    if(!Array.isArray(ring)||ring.length<4||ring.length>12000||ring.some(p=>!validPoint(p,geo)))continue;
    vertices+=ring.length;
    if(vertices>75000)break;
    // A polygon crossing +/-180 cannot safely draw a world-spanning line.
    // Omit that ring rather than inventing a connection over the map.
    if(ring.some((p,i)=>i>0&&Math.abs(p[0]-ring[i-1][0])>180))continue;
    const projected=ring.map(p=>geo.project(p[0],p[1]));
    d+=projected.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' Z ';
   }
   if(d.trim())paths.push(d.trim());
  }
  return paths;
 }
 function normalize(response,snapshot,geo){
  if(!SNAPSHOTS.includes(snapshot)||!response||!Array.isArray(response.features))return [];
  return response.features.filter(f=>f?.properties?.Name===snapshot.name)
   .flatMap(f=>geometryPaths(f.geometry,geo));
 }
 function render(shapes,snapshot,colour){
  if(!SNAPSHOTS.includes(snapshot)||!Array.isArray(shapes)||!shapes.length)return '';
  const color=safeColour(colour);
  return shapes.map(d=>'<path class="atlas-researched-extent" d="'+esc(d)+'" fill="'+color+
   '" stroke="'+color+'" fill-opacity=".26" stroke-opacity=".95" stroke-width="2.5" fill-rule="evenodd"'+
   '><title>'+esc(snapshot.name)+' · approximate GIS extent at '+snapshot.year+
   ' CE only. Simplified and subject to contested border interpretations. University of Minnesota.</title></path>').join('');
 }
 function linkedRecords(sources,civs){
  const byId=new Set(civs.map(c=>c.id)),seen=new Map();
  const dated=sources.filter(e=>e&&Number.isFinite(e.year)&&e.title);
  dated.forEach((e,i)=>{
   const ids=[...new Set((e.societyIds||e.allSocietyIds||[]).filter(id=>byId.has(id)))];
   if(ids.length<2)return;
   const key=e.id||'multi-'+i;
   seen.set(key,{key,title:e.title,year:e.year,participants:ids,detail:e.detail||'',confidence:e.confidence||null,sourceUrls:e.sourceUrls||[],sourceUrl:e.sourceUrl});
  });
  return [...seen.values()].sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
 }
 function step(rows,key,direction){
  if(!rows.length)return null;
  const i=rows.findIndex(r=>r.key===key);
  return rows[Math.max(0,Math.min(rows.length-1,i<0?0:i+(direction<0?-1:1)))];
 }
 root.AtlasResearchedExtents=Object.freeze({SNAPSHOTS,SOURCE,atYear,queryUrl,geometryPaths,normalize,render,linkedRecords,step});
})(typeof window!=='undefined'?window:globalThis);
