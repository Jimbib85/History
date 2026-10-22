/* Optional real-Chromium smoke test and local-load measurement.
 * npm install --no-save playwright-core@1.56.1
 * CHROME_PATH=/usr/bin/google-chrome node scripts/browser-audit.mjs
 * Run in GitHub Actions to compare desktop/mobile layouts, not as a synthetic
 * global performance score or a substitute for a real network Lighthouse audit.
 */
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const output=fileURLToPath(new URL('../artifacts/browser-audit/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
 '.webp':'image/webp','.ico':'image/x-icon','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
   const u=new URL(req.url,'http://127.0.0.1');
   const path=resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/story.html':u.pathname));
   if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
   if(!(await stat(path)).isFile()){res.writeHead(404).end();return;}
   const data=await readFile(path);
   res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':data.length});res.end(data);
 }catch(_){res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/';
const executablePath=process.env.CHROME_PATH;
if(!executablePath){console.error('CHROME_PATH required, e.g. /usr/bin/google-chrome');server.close();process.exitCode=1;}
else{
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 await mkdir(output,{recursive:true});
 const routes=[
  ['story.html','#storyTimeline'],['index.html','#worldMap'],['compare.html','#comparisonChart'],
  ['worldview.html','#mapsRecords'],['discover.html','#journeyReader'],['conflicts.html','#results']
 ];
 const devices=[{name:'desktop',width:1280,height:800},{name:'mobile',width:390,height:844}];
 const results=[],fatal=[];
 for(const device of devices){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  for(const [name,selector] of routes){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   try{
    await page.goto(base+name,{waitUntil:'load',timeout:30000});
    await page.locator(selector).first().waitFor({state:'attached',timeout:12000});
    const info=await page.evaluate(()=>{
      const n=performance.getEntriesByType('navigation')[0];
      const resources=performance.getEntriesByType('resource');
      const menu=document.querySelector('.atlas-crossnav');
      return {loadMs:Math.round(n?.loadEventEnd||0),
       domContentMs:Math.round(n?.domContentLoadedEventEnd||0),
       transferBytes:Math.round(resources.filter(x=>x.name.startsWith(location.origin)).reduce((a,r)=>a+(r.transferSize||0),0)),
       viewport:window.innerWidth,bodyWidth:document.documentElement.scrollWidth,
       navLinks:menu?.querySelectorAll('[data-atlas-view]').length||0,
       navScrollable:menu?menu.scrollWidth>menu.clientWidth:false};
    });
    if(info.navLinks!==7)errors.push('Not all seven view destinations are accessible');
    if(device.name==='mobile'&&info.bodyWidth>info.viewport+24)errors.push('Page overflows mobile viewport by '+(info.bodyWidth-info.viewport)+' px');
    await page.screenshot({path:output+name.replace('.html','')+'-'+device.name+'.png',fullPage:false});
    results.push({page:name,device:device.name,...info,errors});
    if(errors.length)fatal.push({page:name,device:device.name,errors});
   }catch(err){fatal.push({page:name,device:device.name,errors:[String(err)]});}
   await page.close();
  }
  // One actual navigation exercise per device, including horizontally scrolled
  // mobile links and a selected BCE year. Do not rely only on the href unit test.
  const journey=await context.newPage();
  try{
    await journey.goto(base+'story.html?year=-499&entity=athens',{waitUntil:'load',timeout:30000});
    const link=journey.locator('[data-atlas-view="map"]');
    await link.click({timeout:10000});
    await journey.waitForURL(u=>u.pathname.endsWith('/index.html')&&
      u.searchParams.get('year')==='-499'&&u.searchParams.get('civ')==='athens',{timeout:15000});
    const actual=await journey.evaluate(()=>({year:window.WorldHistoryAtlas?.state?.year,civ:window.WorldHistoryAtlas?.state?.civ}));
    if(actual.year!==-499||actual.civ!=='athens')
      fatal.push({device:device.name,page:'cross-view navigation',errors:['Selected Story BCE year and society not retained on Map']});
    else console.log('PASS',device.name,'selected Story 500 BCE/Athens → Map context navigation');
  }catch(err){fatal.push({device:device.name,page:'cross-view navigation',errors:[String(err)]});}
  finally{await journey.close();}
  const classical=await context.newPage();
  const reviewedErrors=[];
  classical.on('pageerror',err=>reviewedErrors.push(err.message));
  try{
    await classical.goto(base+'discover.html?classical=1#classicalEvidence',{waitUntil:'load',timeout:30000});
    await classical.waitForFunction(()=>document.querySelector('#classicalStatus')?.textContent.includes('72 distinct reviewed records'),{timeout:15000});
    const result=await classical.evaluate(()=>({
      open:document.querySelector('#classicalEvidence')?.open,
      count:document.querySelectorAll('#classicalCards .classical-card').length,
      hasSources:document.querySelectorAll('#classicalCards .classical-source-links a').length,
      loaded:performance.getEntriesByType('resource').some(r=>r.name.includes('classical-reviewed-data.js'))
    }));
    if(!result.open||result.count!==18||result.hasSources<18||!result.loaded)
      fatal.push({device:device.name,page:'reviewed classical evidence',errors:['Source-checked lazy import did not render as expected: '+JSON.stringify(result)]});
    if(reviewedErrors.length)fatal.push({device:device.name,page:'reviewed classical evidence',errors:reviewedErrors});
    else console.log('PASS',device.name,'72 deduplicated classical review excerpts loaded lazily');
  }catch(err){fatal.push({device:device.name,page:'reviewed classical evidence',errors:[String(err)]});}
  finally{await classical.close();}
  await context.close();
 }
 await browser.close();
 await writeFile(output+'measurements.json',JSON.stringify({environment:'Local static server; GitHub Actions hosted Chrome',method:'Browser navigation timings and first-party transfer sizes (uncompressed static files)',results,fatal},null,2));
 for(const row of results)console.log(row.device.padEnd(7),row.page.padEnd(16),'load',String(row.loadMs).padStart(6)+'ms','DOM',String(row.domContentMs).padStart(6)+'ms','transfer',String(Math.round(row.transferBytes/1024)).padStart(5)+'KiB','overflow',String(Math.max(0,row.bodyWidth-row.viewport))+'px');
 await new Promise(r=>server.close(r));
 if(fatal.length){console.error('Browser smoke failures:',JSON.stringify(fatal));process.exitCode=1;}
 else console.log('PASS browser: six screens at 1280px and 390px, navigation, runtime exceptions and mobile layout');
}
