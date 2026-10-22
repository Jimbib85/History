/* Master catalogue bridge v0.29: playful discovery without inventing facts.
 * Source dates and IDs stay attached; midpoint placement is a browsing aid.
 * The complete canonical record/claims remain in catalogue.html?record=ID.
 */
(function(root){
 'use strict';
 const rows=root.ATLAS_MASTER_CORE_PARTS||[];
 const report={input:rows.length,entitiesAdded:0,entitiesEstimated:0,entitiesMatched:0,entitiesContextOnly:0,eventsAdded:0,eventsEnriched:0,eventsUndated:0,eventsOutOfRange:0,eventsMidpoint:0,linksIndexed:0};
 const byId=new Map(rows.map(r=>[r.i,r]));
 const norm=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const urls=r=>[...new Set((r.u||[]).filter(u=>typeof u==='string'&&/^https?:\/\//.test(u)))];
 const dateOk=r=>Number.isSafeInteger(r.a)&&Number.isSafeInteger(r.b)&&r.b>r.a&&r.a>=-9999&&r.a<=2026;
 const colours={'Europe':'#ae725d','West Asia':'#a46c49','East Asia':'#777d9f','South Asia':'#4c877d','Southeast Asia':'#729073','North Africa':'#b68b45','Sub-Saharan Africa':'#618976','Americas':'#bb7d59','Oceania':'#598e97'};
 const regionMap={'Mesoamerica':'Americas','North America':'Americas','South America':'Americas','Central America':'Americas','Andes':'Americas','Caribbean':'Americas','Northern Andes':'Americas','Arctic':'Americas','Amazonia':'Americas','Eastern Mediterranean':'Europe','Northern Europe':'Europe','Western Europe':'Europe','Eastern Europe':'Europe','Southern Europe':'Europe','Central Asia':'West Asia','Anatolia':'West Asia','Middle East':'West Asia','Arabian Peninsula':'West Asia','Eurasian Steppe':'East Asia','West Africa':'Sub-Saharan Africa','East Africa':'Sub-Saharan Africa','Central Africa':'Sub-Saharan Africa','Southern Africa':'Sub-Saharan Africa','Northeast Africa':'North Africa','Australia':'Oceania','Pacific':'Oceania','Indian Ocean':'Southeast Asia'};
 const region=r=>regionMap[r]||r||'World';
 const isEmpire=r=>/^(empire|imperial_state)$/i.test(r.k||'')||/^(empire|empires)$/i.test(r.g||'');
 const isNonPolity=r=>/historical.period|period.reference|cultural.region|global.overview|historical.era|time.period|overview/i.test([r.k,r.g].join(' '));
 const civs=typeof CIVILISATIONS!=='undefined'?CIVILISATIONS:[];
 const events=typeof EVENTS!=='undefined'?EVENTS:[];
 const civById=new Map(civs.map(c=>[c.id,c]));
 const civByName=new Map();for(const c of civs){const key=norm(c.name);if(!civByName.has(key))civByName.set(key,c);}
 const societyIdMap=new Map(), societyRows=rows.filter(r=>r.c==='societies');
 // An undated society can receive a clearly labelled *evidence window* when
 // a directly linked, dated research record establishes its period. This is
 // not a claimed founding date, collapse date or continuous political lifespan.
 const datedBySociety=new Map();
 for(const record of rows){
   if(!Number.isSafeInteger(record.a)||!Number.isSafeInteger(record.b)||record.b<=record.a)continue;
   if(!['events','technology_developments','relationships','conflicts','engagements','cultural_practices','geographical_knowledge'].includes(record.c))continue;
   const point=record.b-record.a>150?Math.floor((record.a+record.b-1)/2):record.a;
   if(point< -9999||point>2026)continue;
   for(const sid of record.l||[]){
     if(!byId.has(sid)||byId.get(sid).c!=='societies')continue;
     if(!datedBySociety.has(sid))datedBySociety.set(sid,[]);
     datedBySociety.get(sid).push(point);
   }
 }
 const aliases=[typeof ATLAS_MEDIEVAL_ALIAS!=='undefined'?ATLAS_MEDIEVAL_ALIAS:{},typeof ATLAS_MODERN_ALIAS!=='undefined'?ATLAS_MODERN_ALIAS:{},typeof ATLAS_CLASSICAL_ALIAS!=='undefined'?ATLAS_CLASSICAL_ALIAS:{},typeof ATLAS_EXPANSION_REPORT!=='undefined'?ATLAS_EXPANSION_REPORT.societyAliases||{}:{}];
 const resolveAlias=id=>{if(civById.has(id))return civById.get(id);for(const m of aliases){if(m[id]&&civById.has(m[id]))return civById.get(m[id]);}return null;};
 function enrichEntity(c,r){
   c.masterCatalogueIds=[...new Set([...(c.masterCatalogueIds||[]),r.i])];
   c.sourceUrls=[...new Set([...(c.sourceUrls||[]),...urls(r)])];
   if(!c.source&&c.sourceUrls.length)c.source=c.sourceUrls[0];
 }
 for(const r of societyRows){
   let c=(r.o||[]).map(resolveAlias).find(Boolean);
   if(!c){const named=civByName.get(norm(r.t));if(named&&(!dateOk(r)||!Number.isFinite(named.start)||Math.max(named.start,r.a)<=Math.min(named.end,r.b-1)))c=named;}
   if(c){societyIdMap.set(r.i,c.id);enrichEntity(c,r);report.entitiesMatched++;continue;}
   // An undated reference can inform a story, but it cannot create a lifespan bar.
   const linkedDates=datedBySociety.get(r.i)||[];
   const inferred=!dateOk(r)&&linkedDates.length>0;
   if((!dateOk(r)&&!inferred)||isNonPolity(r)||dateOk(r)&&r.b-1>2026){report.entitiesContextOnly++;continue;}
   const start=inferred?Math.max(-9999,Math.min(...linkedDates)-(Math.max(...linkedDates)<1800?50:10)):r.a;
   const end=inferred?Math.min(2026,Math.max(...linkedDates)+(Math.max(...linkedDates)<1800?50:10)):r.b-1;
   const id='master-'+r.i;
   c={id,name:r.t,kind:isEmpire(r)?'empire':'society',researchKind:r.k||'historical reference',
     region:region(r.r),start,end,at:Math.round((start+end)/2),
     color:colours[region(r.r)]||'#6e8790',icon:'◆',summary:r.s||'Research-linked historical community.',
     location:(r.r||'Unspecified region')+' · no verified map point',
     source:urls(r)[0]||'',sourceUrls:urls(r),masterCatalogueIds:[r.i],
     researchBatch:'master-10000-years',researchId:r.i,dating:inferred?'Estimated evidence window from linked dated records':r.d||'',sourceDateText:r.d||'',datePrecision:inferred?'inferred evidence window':r.p||'estimated',
     periodScope:inferred||/unknown|unreviewed|approximate|phase|century/i.test(r.p||'')?'research-window':'source-range',
     coordinatesPrecision:'not-georeferenced',masterApproximate:true};
   civs.push(c);civById.set(id,c);if(!civByName.has(norm(c.name)))civByName.set(norm(c.name),c);
   societyIdMap.set(r.i,id);report.entitiesAdded++;if(inferred)report.entitiesEstimated++;
 }
 function associations(r,viaEvent=true){
   const result=new Set();
   for(const id of r.l||[]){const cid=societyIdMap.get(id);if(cid)result.add(cid);}
   // Some catalogue records link to an event, which itself names the society.
   if(viaEvent&&!result.size)for(const id of r.l||[]){const x=byId.get(id);if(x&&x.c==='events')for(const cid of associations(x,false))result.add(cid);}
   // For relationship records only: matching both explicit title participants is a
   // tentative association, not proof of a journey or a new historical claim.
   if(!result.size&&r.c==='relationships'&&r.t?.includes(' / ')){
     for(const part of r.t.split(' / ')){const c=civByName.get(norm(part));if(c)result.add(c.id);}
   }
   return [...result];
 }
 const context=new Map();
 for(const r of rows){
   if(r.c==='societies')continue;
   const ids=associations(r);
   if(!ids.length)continue;
   report.linksIndexed+=ids.length;
   for(const id of ids){if(!context.has(id))context.set(id,[]);context.get(id).push(r);}
 }
 const existingResearch=[
   typeof ATLAS_RESEARCH_EVENTS!=='undefined'?ATLAS_RESEARCH_EVENTS:[],
   typeof ATLAS_MEDIEVAL_EVENTS!=='undefined'?ATLAS_MEDIEVAL_EVENTS:[],
   typeof ATLAS_MODERN_EVENTS!=='undefined'?ATLAS_MODERN_EVENTS:[],
   typeof ATLAS_CLASSICAL_EVENTS!=='undefined'?ATLAS_CLASSICAL_EVENTS:[],
   typeof ATLAS_EXPANSION_EVENTS!=='undefined'?ATLAS_EXPANSION_EVENTS:[],
   typeof ATLAS_CONFLICT_STORY_EVENTS!=='undefined'?ATLAS_CONFLICT_STORY_EVENTS:[],root.ATLAS_MASTER_EVENTS||[],events
 ].flat();
 const existingById=new Map();const existingByTitle=new Map();
 for(const e of existingResearch){
   for(const id of [e.id,e.researchId].filter(Boolean))existingById.set(id,e);
   const key=norm(e.title);if(!existingByTitle.has(key))existingByTitle.set(key,[]);existingByTitle.get(key).push(e);
 }
 function datePoint(r){
   if(!dateOk(r))return null;
   const span=r.b-r.a;
   // Wide evidence windows are represented by a midpoint, not as centuries of
   // continuous activity. A genuine short duration may retain its interval.
   const point=span>40||/alternative|archaeological.phase|century|unreviewed/i.test(r.p||'')&&span>10;
   const year=point?Math.floor((r.a+r.b-1)/2):r.a;
   if(year< -9999||year>2026)return null;
   const end=point?year+1:Math.min(2027,r.b);
   return {year,end,midpoint:point};
 }
 function kind(r){
   const t=norm(r.k);
   const c=r.c;
   if(/war|battle|siege|conflict|conquest|invasion|military/.test(t)||['conflicts','engagements','campaigns','conflict_phases'].includes(c))return 'Conflict';
   if(c==='technology_developments'||c==='technology_transmission'||c==='weapons')return 'Technology';
   if(c==='cultural_practices'||c==='visual_assets'||c==='discovery_cards')return 'Culture';
   if(c==='geographical_knowledge')return 'Geography';
   if(c==='relationships'||c==='treaties')return /trade|commerce/.test(t)?'Trade':'Diplomacy';
   if(c==='organisations')return 'Politics';
   if(c==='social_impacts'||c==='statistics')return 'Society';
   return r.k||'Historical event';
 }
 function matchExisting(r,point){
   if(existingById.has('master-'+r.i))return existingById.get('master-'+r.i);
   for(const orig of r.o||[]){
     for(const key of [orig,'m1500-'+orig,'classical-'+orig,'expansion-'+orig]){
       const e=existingById.get(key);if(e&&Number.isFinite(e.year)&&Math.abs(e.year-point.year)<=Math.max(20,Math.min(250,(r.b-r.a)/2)))return e;
     }
     // Research pack IDs are often namespaced; original source ID is stable.
     const e=existingResearch.find(e=>typeof e.id==='string'&&e.id.endsWith('-'+orig)&&Number.isFinite(e.year)&&e.year>=r.a-2&&e.year<r.b+2);
     if(e)return e;
   }
   for(const e of existingByTitle.get(norm(r.t))||[]){
     if(!Number.isFinite(e.year))continue;
     const end=e.endExclusive||e.year+1;
     if(e.year<r.b&&end>r.a)return e;
   }
   return null;
 }
 const eventCategories=new Set(['events','technology_developments','relationships','cultural_practices','geographical_knowledge','conflicts','treaties','engagements','campaigns','conflict_phases','social_impacts','discoveries','technology_transmission','organisations','visual_assets','weapons','statistics','discovery_cards']);
 const masterEvents=[...(root.ATLAS_MASTER_EVENTS||[])];
 for(const r of rows){
   if(!eventCategories.has(r.c))continue;
   if(!dateOk(r)){report.eventsUndated++;continue;}
   const p=datePoint(r);if(!p){report.eventsOutOfRange++;continue;}
   const prior=matchExisting(r,p);
   if(prior){
     prior.sourceUrls=[...new Set([...(prior.sourceUrls||[]),...urls(r)])];
     prior.masterCatalogueIds=[...new Set([...(prior.masterCatalogueIds||[]),r.i])];
     report.eventsEnriched++;continue;
   }
   const ids=associations(r),linked=ids.filter(id=>{const c=civById.get(id);return c&&p.year>=c.start&&p.year<=c.end;});
   const note=['Master research catalogue',p.midpoint?'Approximate midpoint used for browsing; not an exact event year.':'',
     r.v==='SOURCE_CHECKED_THIS_RUN'?'Source checked in the research pack.':'Source reference inherited; not independently rechecked.',
     r.n||''].filter(Boolean).join(' ');
   const e={id:'master-'+r.i,year:p.year,endExclusive:p.end,humanDate:r.d||'',dateLabel:r.d||'',
     title:r.t,detail:r.s||'',kind:kind(r),region:region(r.r),originalRegion:r.r||'',
     civ:linked[0]||ids[0]||null,societyIds:ids,sourceUrls:urls(r),sourceUrl:urls(r)[0]||null,
     datePrecision:p.midpoint?'approximate midpoint':r.p||'source date',confidence:r.h||'Not rated',
     temporalKind:r.m||'',origin:'master-10000-years',evidenceStatus:r.v||'',evidenceNote:note,
     catalogueId:r.i,masterCategory:r.c,masterApproximate:p.midpoint};
   masterEvents.push(e);report.eventsAdded++;if(p.midpoint)report.eventsMidpoint++;
   existingById.set(e.id,e);if(!existingByTitle.has(norm(e.title)))existingByTitle.set(norm(e.title),[]);existingByTitle.get(norm(e.title)).push(e);
   // Map's local event collection needs an explicit society to display the event.
   if(e.civ&&civById.has(e.civ))events.push({...e,researchId:e.id});
 }
 root.ATLAS_MASTER_EVENTS=masterEvents;
 root.ATLAS_MASTER_CONTEXT=Object.freeze({byId,societyIdMap,associations,forSociety:id=>context.get(id)||[],report});
 root.ATLAS_MASTER_REPORT=report;
 // Remove the temporary array, but keep the catalogue index for technology
 // crosswalks and for linked Map reader evidence.
 delete root.ATLAS_MASTER_CORE_PARTS;
})(globalThis);