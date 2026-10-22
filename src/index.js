/* Living Atlas museum-media gateway. Static site assets remain asset-first.
   This route exists to avoid client-side API CORS failures and to prevent using
   photos unless the museum's current object record marks them public domain. */
import '../public/atlas-visual-assets.js';

const allowed = new Set(globalThis.AtlasVisualAssets.allowedObjectIds);
const imagePath = /^\/atlas\/media\/met\/([0-9]{1,8})$/;
const noStore = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const plain = (status,message) => new Response(message,{status,headers:{...noStore,'Content-Type':'text/plain; charset=utf-8'}});

async function getMetImage(id, method) {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),12500);
  try {
    const api='https://collectionapi.metmuseum.org/public/collection/v1/objects/'+id;
    const recordResponse=await fetch(api,{
      signal:controller.signal,redirect:'error',
      headers:{'Accept':'application/json'},
      cf:{cacheTtl:86400,cacheEverything:true}
    });
    if(!recordResponse.ok) return plain(502,'Museum catalogue temporarily unavailable');
    const byteHeader=Number(recordResponse.headers.get('content-length'));
    if(byteHeader>250000) return plain(502,'Unexpected catalogue response');
    const item=await recordResponse.json();
    if(item.objectID!==id || item.isPublicDomain!==true) return plain(404,'Open-access image not available');
    const source=item.primaryImageSmall || item.primaryImage;
    if(typeof source!=='string' || !source) return plain(404,'No open-access image for this object');
    let url;
    try {url=new URL(source)}catch(_){return plain(404,'Unusable source image')}
    if(url.protocol!=='https:' || url.hostname!=='images.metmuseum.org') return plain(404,'Unapproved source host');
    if(method==='HEAD') return new Response(null,{status:200,headers:{'Cache-Control':'public, max-age=3600'}});
    const image=await fetch(url.toString(),{
      signal:controller.signal,redirect:'follow',
      cf:{cacheTtl:86400,cacheEverything:true}
    });
    const delivered=new URL(image.url);
    if(delivered.protocol!=='https:' || delivered.hostname!=='images.metmuseum.org') return plain(502,'Unexpected media redirect');
    if(!image.ok) return plain(502,'Museum image temporarily unavailable');
    const mime=(image.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
    if(!['image/jpeg','image/png','image/webp'].includes(mime))return plain(502,'Unexpected media format');
    const bytes=Number(image.headers.get('content-length'));
    if(bytes && bytes>12000000)return plain(413,'Image exceeds size limit');
    const headers=new Headers({
      'Content-Type':mime,
      'Cache-Control':'public, max-age=86400, s-maxage=604800',
      'X-Content-Type-Options':'nosniff',
      'Cross-Origin-Resource-Policy':'same-origin',
      'X-Atlas-Image-Source':'The Metropolitan Museum of Art'
    });
    if(Number.isFinite(bytes)&&bytes>0)headers.set('Content-Length',String(bytes));
    return new Response(image.body,{status:200,headers});
  }catch(error){
    console.warn(JSON.stringify({area:'atlas-media',objectId:id,error:error?.name==='AbortError'?'timeout':'upstream error'}));
    return plain(502,'Museum image temporarily unavailable');
  }finally{
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const match=url.pathname.match(imagePath);
    if(!match) return env.ASSETS.fetch(request);
    if(request.method!=='GET'&&request.method!=='HEAD')return plain(405,'Method not allowed');
    const id=Number(match[1]);
    if(!allowed.has(id))return plain(404,'Unknown curated object');
    return getMetImage(id,request.method);
  }
};
