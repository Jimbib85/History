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
    await classical.waitForFunction(()=>/distinct reviewed records|unavailable/i.test(document.querySelector('#classicalStatus')?.textContent||''),null,{timeout:12000});
    const status=await classical.locator('#classicalStatus').textContent();
    if(!status.includes('72 distinct reviewed records'))throw Error('Review loader status: '+status);
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
  }catch(err){
    const diag=await classical.evaluate(()=>({
      status:document.querySelector('#classicalStatus')?.textContent,
      sectionOpen:document.querySelector('#classicalEvidence')?.open,
      hasModel:!!window.AtlasClassicalReviewed,
      hasUI:!!window.AtlasClassicalReviewUI,
      hasPayload:typeof window.ATLAS_CLASSICAL_REVIEW_DEFLATE_BASE64==='string',
      resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('classical-reviewed')).map(r=>r.name+' '+r.responseStatus)
    })).catch(()=>null);
    fatal.push({device:device.name,page:'reviewed classical evidence',errors:[String(err),JSON.stringify(diag),...reviewedErrors]});
  }
  finally{await classical.close();}
  const modern=await context.newPage();
  const modernErrors=[];modern.on('pageerror',e=>modernErrors.push(e.message));
  try{
    await modern.goto(base+'discover.html?modernV2=1#modernV2Evidence',{waitUntil:'load',timeout:30000});
    await modern.waitForFunction(()=>/events matching|Could not open/.test(document.querySelector('#modernV2Status')?.textContent||''),null,{timeout:15000});
    const state=await modern.evaluate(()=>({
      status:document.querySelector('#modernV2Status')?.textContent,
      expanded:document.querySelector('#modernV2Evidence')?.open,
      cards:document.querySelectorAll('#modernV2Cards .expansion-card').length,
      hasSources:document.querySelectorAll('#modernV2Cards a[href^="https://"]').length,
      fetched:performance.getEntriesByType('resource').some(r=>r.name.includes('modern-v2-data.js'))
    }));
    if(!state.expanded||state.cards!==15||!state.fetched||state.hasSources<5)
      fatal.push({device:device.name,page:'modern v2 evidence',errors:['Modern v2 lazy loading/card data: '+JSON.stringify(state)]});
    await modern.locator('#modernV2Type').selectOption('conflicts');
    const conflicts=await modern.locator('#modernV2Status').textContent();
    if(!conflicts.includes('16 conflicts matching'))fatal.push({device:device.name,page:'modern v2 conflicts',errors:[conflicts]});
    await modern.locator('#modernV2Sensitive').check();
    const fullConflicts=await modern.locator('#modernV2Status').textContent();
    if(!fullConflicts.includes('18 conflicts matching'))fatal.push({device:device.name,page:'modern v2 sensitive opt-in',errors:[fullConflicts]});
    if(modernErrors.length)fatal.push({device:device.name,page:'modern v2 evidence JS',errors:modernErrors});
    else console.log('PASS',device.name,'modern v2 archive opened lazily and conflict category switches');
  }catch(e){fatal.push({device:device.name,page:'modern v2 evidence',errors:[String(e),...modernErrors]});}
  finally{await modern.close();}
  const extra=await context.newPage();
  const errors=[];extra.on('pageerror',e=>errors.push(e.message));
  try{
    await extra.goto(base+'discover.html?research=1#researchExpansion',{waitUntil:'load',timeout:30000});
    await extra.locator('#expansionCards .expansion-card').first().waitFor({timeout:12000});
    await extra.selectOption('#expansionType','events');
    if(!(await extra.locator('#expansionCount').textContent()).includes('123 source records'))throw Error('Missing imported event records');
    await extra.goto(base+'worldview.html#uploadedMapCollection',{waitUntil:'load',timeout:30000});
    await extra.locator('.map-upload-card').first().waitFor();
    if(await extra.locator('.map-upload-card').count()!==14)throw Error('Map metadata count');
    if(await extra.locator('[data-map-image]').count()!==4)throw Error('Map reuse gating');
    await extra.locator('[data-map-image]').first().click();
    if(!await extra.locator('#mapImageDialog').evaluate(d=>d.open))throw Error('Image viewer did not open');
    await extra.keyboard.press('Escape');
    await extra.goto(base+'compare.html?year=1200&span=4000&limit=12',{waitUntil:'load',timeout:30000});
    const aligned=await extra.evaluate(()=>{const a=document.querySelector('.axis-track').getBoundingClientRect();return [...document.querySelectorAll('.atlas-lane .lane-track')].every(n=>{const b=n.getBoundingClientRect();return Math.abs(a.left-b.left)<2&&Math.abs(a.width-b.width)<2})});
    if(!aligned)throw Error('Timeline ruler alignment');
    await extra.screenshot({path:output+'compare-overlap-'+device.name+'.png',fullPage:true});
    await extra.locator('[data-mode="eras"]').click();
    const widths=await extra.locator('.atlas-era-head').evaluateAll(a=>a.map(n=>n.getBoundingClientRect().width));
    if(widths.length!==8||Math.max(...widths)-Math.min(...widths)>1)throw Error('Era column scale');
    await extra.screenshot({path:output+'compare-eras-'+device.name+'.png',fullPage:true});
    if(errors.length)throw Error(errors.join('; '));
    console.log('PASS',device.name,'research, map provenance and Compare geometry');
  }catch(e){fatal.push({device:device.name,page:'v0.22 integration',errors:[String(e)]});}
  finally{await extra.close();}
  await context.close();
 }
 await browser.close();
 await writeFile(output+'measurements.json',JSON.stringify({environment:'Local static server; GitHub Actions hosted Chrome',method:'Browser navigation timings and first-party transfer sizes (uncompressed static files)',results,fatal},null,2));
 for(const row of results)console.log(row.device.padEnd(7),row.page.padEnd(16),'load',String(row.loadMs).padStart(6)+'ms','DOM',String(row.domContentMs).padStart(6)+'ms','transfer',String(Math.round(row.transferBytes/1024)).padStart(5)+'KiB','overflow',String(Math.max(0,row.bodyWidth-row.viewport))+'px');
 await new Promise(r=>server.close(r));
 if(fatal.length){console.error('Browser smoke failures:',JSON.stringify(fatal));process.exitCode=1;}
 else console.log('PASS browser: six screens at 1280px and 390px, navigation, runtime exceptions and mobile layout');
}
