/* v0.16 geographical display helpers. Points are representative locations, NEVER polity borders. */
(function(root) {
  'use strict';
  const finite=(lon,lat)=>Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=-180&&lon<=180&&lat>=-90&&lat<=90;
  // Match the bundled coastline's existing equirectangular-style reference transform.
  const project=(lon,lat)=>[((lon+180)/360)*1200,((88-lat)/176)*590];
  function cluster(items,{zoom=1,selectedId=null,radius=34}={}) {
    const valid=items.filter(c=>c&&finite(c.lon,c.lat)&&typeof c.id==='string');
    // A regular, deterministic visual grouping grid. Counts are map symbols, not territories.
    const cell=Math.max(8,radius/Math.max(1,zoom));
    const bins=new Map(),singles=[];
    for(const c of valid) {
      const [x,y]=project(c.lon,c.lat);
      if(c.id===selectedId){singles.push({id:c.id,x,y,items:[c],count:1,selected:true});continue;}
      const key=Math.floor(x/cell)+':'+Math.floor(y/cell);
      if(!bins.has(key))bins.set(key,[]);
      bins.get(key).push({c,x,y});
    }
    const groups=[...bins.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,entries])=>{
      const x=entries.reduce((sum,e)=>sum+e.x,0)/entries.length;
      const y=entries.reduce((sum,e)=>sum+e.y,0)/entries.length;
      return {id:key,x,y,items:entries.map(e=>e.c),count:entries.length,selected:false};
    });
    return [...singles,...groups];
  }
  function grid() {
    const lines=[];
    for(let lon=-150;lon<=150;lon+=30) {
      const [x]=project(lon,0);
      lines.push('<line x1="'+x+'" x2="'+x+'" y1="0" y2="590"/>');
      if(lon!==0)lines.push('<text x="'+(x+4)+'" y="572">'+Math.abs(lon)+'°'+(lon<0?'W':'E')+'</text>');
    }
    for(let lat=-60;lat<=60;lat+=30) {
      const [,y]=project(0,lat);
      lines.push('<line x1="0" x2="1200" y1="'+y+'" y2="'+y+'"/>');
      if(lat!==0)lines.push('<text x="5" y="'+(y-5)+'">'+Math.abs(lat)+'°'+(lat<0?'S':'N')+'</text>');
    }
    return lines.join('');
  }
  root.WorldAtlasGeo=Object.freeze({finite,project,cluster,grid});
})(typeof window!=='undefined'?window:globalThis);
