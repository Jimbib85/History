/* Readable modern source research, loaded only when opened. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const panel=$('modernV2Evidence'),model=window.AtlasModernV2;
 if(!panel||!model)return;
 let pack=null,pending=null,limit=15;
 const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const label=row=>row.title||row.preferred_name||row.name||row.id.replaceAll('_',' ');
 const eligible=(row,type)=>type==='events'&&model.isPreciseEvent(row)&&row.start_year<=2026&&row.start_year>=-9999;
 function record(type,row){
   const source=model.sourceLinks(pack,row).slice(0,4);
   const claims=model.reviewedClaims(pack,row);
   const year=row.original_date_text||((row.start_year??'Uncertain date')+' (research date; precision unspecified)');
   const contact=Array.isArray(row.society_ids)?row.society_ids.join(', '):'';
   const href=eligible(row,type)?'<a href="story.html?year='+row.start_year+'">Explore this historical year ↗</a>':'';
   const citations=source.map((u,i)=>'<a href="'+esc(u)+'" rel="noopener noreferrer" target="_blank">Source '+(i+1)+' ↗</a>').join('');
   const interpretation=['EVIDENCE_WINDOW','CONFLICT_COMPLEX','OBSERVATION_WINDOW','DURATION','ESTIMATE','PERIOD'].includes(row.temporal_kind)?'This is a research or event interval, not a single-year occurrence.':'';
   return '<details class="expansion-card"><summary><span>'+esc(type.replaceAll('_',' '))+' · source-linked revision v2</span><strong>'+esc(label(row))+'</strong><small>'+esc(year)+'</small></summary><div class="expansion-detail">'+
     '<p>'+esc(row.summary||row.description||row.scope||row.notes||'Source-linked reference, not an independently audited historical account.')+'</p>'+
     '<p><b>Evidence meaning:</b> '+esc(row.temporal_kind||'Context record without a sourced complete lifespan')+'. '+esc(interpretation)+'</p>'+
     (contact?'<p><b>Linked actors:</b> '+esc(contact)+' (actor references are not automatically political map bars)</p>':'')+
     '<p><b>Review:</b> '+esc(row.review_status||'Not specified')+'; confidence '+esc(row.confidence||'not assessed')+'. Independently corroborated: '+(row.independently_corroborated===true?'recorded as yes':'not established')+'.</p>'+
     (row.content_level?'<p><b>Content note:</b> '+esc(row.content_level)+'</p>':'')+
     (claims.length?'<details><summary>Source-scoped claims ('+claims.length+')</summary>'+claims.slice(0,8).map(c=>'<p><b>'+esc(c.id)+':</b> '+esc(c.claim_text)+'</p>').join('')+'</details>':'')+
     '<div class="expansion-sources">'+citations+href+'</div>'+
     '<small>Record '+esc(row.id)+' · pack wha_1501_2026_priority_v2 · 22 October 2026 cutoff</small></div></details>';
 }
 function render(){
   if(!pack)return;
   const type=$('modernV2Type').value||'events';
   const answer=model.list(pack,{type,search:$('modernV2Search').value,limit,includeSensitive:$('modernV2Sensitive').checked});
   $('modernV2Status').textContent=answer.count+' '+type.replaceAll('_',' ')+' matching. '+answer.rows.length+' shown. Source text, abstract and search extracts differ in review depth; none is independently corroborated by this import.';
   $('modernV2Cards').innerHTML=answer.rows.map(r=>record(type,r)).join('')||'<p>No matching records in this revision. Other research packs may contain relevant evidence.</p>';
   $('modernV2More').hidden=answer.count<=answer.rows.length;
 }
 function load(){
   if(pending)return pending;
   $('modernV2Status').textContent='Loading versioned evidence and source register…';
   pending=new Promise((resolve,reject)=>{
     if(typeof window.ATLAS_MODERN_V2_GZIP==='string')return resolve();
     const script=document.createElement('script');script.src='modern-v2-data.js?v=0.23.0';
     script.onload=resolve;script.onerror=()=>reject(Error('Research archive unavailable'));
     document.head.appendChild(script);
   }).then(()=>model.load()).then(x=>{pack=x;render();return x;}).catch(e=>{
     pending=null;$('modernV2Status').textContent='Could not open the modern v2 research collection: '+e.message;
   });
   return pending;
 }
 panel.addEventListener('toggle',()=>{if(panel.open)load();});
 for(const id of ['modernV2Type','modernV2Search','modernV2Sensitive'])
   $(id).addEventListener(id==='modernV2Search'?'input':'change',()=>{limit=15;render();});
 $('modernV2More').addEventListener('click',()=>{limit+=15;render();});
 if(new URLSearchParams(location.search).has('modernV2')||location.hash==='#modernV2Evidence'){panel.open=true;load();}
 window.AtlasModernV2UI={load,render,model};
})();
