/* Historical technology claims tied to organisations, not to whole civilisations.
   v0.25 deliberately keeps these out of society-filtered technology appearances. */
(function(){
 'use strict';
 const data=globalThis.AtlasModernV2Reconciled;
 const panel=document.getElementById('modernV2InstitutionEvidence');
 const records=document.getElementById('modernV2InstitutionRecords');
 const scope=document.getElementById('technologyCivilisation');
 if(!data||!panel||!records||!scope)return;
 const excluded=new Set(['td_moon_1969','td_obninsk_1954','td_telegraph_1844','td_trinity_1945',
   'td_edo_urban_print','td_human_genome_1990','td_meiji_industrialisation','td_penicillin_scale','td_potosi_system']);
 const rows=data.tech.filter(x=>!excluded.has(x.id)&&x.temporal==='POINT'&&x.endExclusive===x.start+1);
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const groups=new Map();
 for(const row of rows){const key=row.topicName||row.topicId;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 const ordered=[...groups].sort((a,b)=>a[0].localeCompare(b[0]));
 records.innerHTML=ordered.map(([topic,items])=>'<section class="tech-institution-group"><h3>'+esc(topic)+'</h3>'+items.map(row=>{
   const links=row.sources.filter(s=>/^https?:\/\//.test(s.url)).slice(0,3).map(s=>
     '<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||'Research source')+' ↗</a>').join('');
   const actors=row.societyIds.join(', ');
   return '<details class="tech-institution-item"><summary><strong>'+esc(row.title)+'</strong><small>'+esc(row.dateText||row.start+' CE')+'</small></summary><p>'+esc(row.summary||'Evidence attached to a named research institution.')+'</p>'+
     '<p><b>Attributed actor IDs:</b> '+esc(actors)+'. These are not evidence of society-wide adoption.</p>'+
     '<p><b>Claim IDs:</b> '+esc(row.claimIds.join(', '))+' · <b>Review:</b> '+esc(row.review||'Not evaluated')+'. Not independently corroborated.</p>'+
     '<div class="tech-institution-sources">'+links+'</div></details>';
 }).join('')+'</section>').join('');
 function renderScope(){
   // An institution is not a civilisation. Never expose unlinked observations as
   // evidence for a specifically selected society.
   const all=scope.value==='all';
   panel.hidden=!all;
   if(!all)panel.open=false;
 }
 scope.addEventListener('change',renderScope);
 document.getElementById('technologyDialog')?.addEventListener('toggle',renderScope);
 renderScope();
 globalThis.AtlasModernV2InstitutionEvidence=Object.freeze({count:rows.length,topics:ordered.length,renderScope});
})();