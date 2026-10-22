/* Add master-catalogue technologies and society-linked milestones to the
 * existing six-family Technology tree. Never infer transmission from chronology.
 */
(function(root){
 'use strict';
 const core=root.ATLAS_MASTER_CONTEXT,rows=root.ATLAS_MASTER_TECH_PARTS||[];
 if(!core||typeof TECHNOLOGIES==='undefined')return;
 const report={topicsAdded:0,topicsMatched:0,milestonesAdded:0,milestonesEnriched:0,milestonesUnlinked:0,milestonesUndated:0,milestonesMidpoint:0};
 const norm=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const valid=r=>Number.isSafeInteger(r.a)&&Number.isSafeInteger(r.b)&&r.b>r.a&&r.a>=-9999&&r.a<=2026;
 const urls=r=>(r.u||[]).filter(u=>typeof u==='string'&&/^https?:\/\//.test(u));
 const byId=new Map(rows.map(r=>[r.i,r]));
 const topics=rows.filter(r=>r.c==='technologies');
 const byName=new Map(TECHNOLOGIES.map(t=>[norm(t.name),t]));
 const byTechId=new Map(TECHNOLOGIES.map(t=>[t.id,t]));
 const explicitAliases={'papermaking':'paper','paper making':'paper','woodblock printing':'woodblock',
   'movable type printing':'movable-type','gunpowder':'gunpowder','magnetic compass':'compass',
   'hindu arabic numerals and zero':'zero','the concept of zero':'zero',
   'rice agriculture':'rice','irrigation':'irrigation','bronze metallurgy':'bronze'};
 const branchFor=r=>{
   const t=norm([r.t,r.k,r.s].join(' '));
   if(/war|weapon|gunpowder|cannon|artillery|militar|armour|siege/.test(t))return 'warfare';
   if(/print|paper|information|communication|comput|telegraph|internet|radio|broadcast|photograph/.test(t))return 'printing';
   if(/navigat|compass|ship|sail|maritime|trade|transport|road|rail|aviation/.test(t))return 'navigation';
   if(/writ|math|astronom|algebra|numeral|calendar|knowledge|measurement|record/.test(t))return 'records';
   if(/farm|crop|agricultur|irrigat|water|food|medicin|sanitation|rice|grain|livestock/.test(t))return 'food';
   return 'materials';
 };
 const techFor=new Map();
 for(const r of topics){
   const orig=(r.o||[]).map(x=>String(x).replace(/^tech_/,'')).find(x=>byTechId.has(x));
   const t=orig?byTechId.get(orig):byName.get(norm(r.t))||byTechId.get(explicitAliases[norm(r.t)]);
   if(t){techFor.set(r.i,t);report.topicsMatched++;t.masterCatalogueIds=[...new Set([...(t.masterCatalogueIds||[]),r.i])];
     if(!t.description&&r.s)t.description=r.s;continue;}
   // Topics without dated, linked milestones are kept in the Research Explorer
   // rather than adding empty branches to the Technology tree.
   const candidate={id:'master-'+r.i,branch:branchFor(r),name:r.t,era:'Research across history',
     description:r.s||'Technology topic from the master research catalogue.',related:[],appearances:[],
     masterCatalogueIds:[r.i],masterApproximate:true};
   techFor.set(r.i,candidate);
 }
 const developments=[...(core.byId.values())].filter(r=>r.c==='technology_developments');
 for(const r of developments){
   const associated=core.associations(r),linked=(r.l||[]).map(id=>techFor.get(id)).filter(Boolean);
   if(!linked.length||!associated.length){report.milestonesUnlinked++;continue;}
   if(!valid(r)){report.milestonesUndated++;continue;}
   const span=r.b-r.a,mid=span>40||/alternative|archaeological.phase|century|unreviewed/i.test(r.p||'')&&span>10;
   const year=mid?Math.floor((r.a+r.b-1)/2):r.a;
   if(year< -9999||year>2026){report.milestonesUndated++;continue;}
   const note=[r.s||'',mid?'Approximate midpoint of the research period, not an invention date.':'',
     r.n||'','Source references are inherited unless independently checked.'].filter(Boolean).join(' ');
   for(const t of linked)for(const civ of associated){
     const previous=(t.appearances||[]).find(a=>a.catalogueId===r.i&&a.civ===civ||a.civ===civ&&Math.abs(a.year-year)<=8&&norm(a.label)===norm(r.t));
     if(previous){previous.sourceUrls=[...new Set([...(previous.sourceUrls||[]),...urls(r)])];
       previous.additionalResearch=[...(previous.additionalResearch||[]),{summary:r.s||'',date:r.d||'',reviewStatus:r.v||'',catalogueId:r.i}];
       report.milestonesEnriched++;continue;}
     (t.appearances??=[]).push({civ,year,status:'attested',label:r.t,note,source:urls(r)[0]||'',
       sourceUrls:urls(r),sourceStatus:r.v||'INHERITED_NOT_RECHECKED_THIS_RUN',
       precision:mid?'approximate midpoint':r.p||'estimated',dateLabel:r.d||'',confidence:r.h||'',
       catalogueId:r.i,researchId:r.i});
     report.milestonesAdded++;if(mid)report.milestonesMidpoint++;
   }
 }
 for(const t of new Set(techFor.values())){
   if(byTechId.has(t.id)||!t.appearances.length)continue;
   TECHNOLOGIES.push(t);byTechId.set(t.id,t);report.topicsAdded++;
 }
 root.ATLAS_MASTER_TECH_REPORT=report;
 delete root.ATLAS_MASTER_TECH_PARTS;
})(globalThis);