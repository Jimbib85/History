/* v0.20: user-uploaded reviewed classical claims. Lazy evidence reader, not a second timeline. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),root=window.AtlasClassicalReviewed;
 if(!$('classicalEvidence')||!root)return;
 let records=[],shown=18,loading=null;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const link=u=>{try{const p=new URL(u);return /^(https?:)$/.test(p.protocol)?p.href:null}catch{return null}};
 const status=r=>r.status==='SOURCE_CHECKED'?'Source checked':
   r.status==='EXCERPT_CHECKED'?'Excerpt checked':r.status==='ABSTRACT_CHECKED'?'Abstract checked':
   'Partially source checked (reviewed excerpt only)';
 function card(r){
   const point=root.isPoint(r),src=(r.sources||[]).map(link).filter(Boolean);
   const sources=src.slice(0,3).map((u,i)=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(u)+'">Research source '+(i+1)+' ↗</a>').join('');
   const toTimeline=point&&r.kind==='event'?
     '<a href="story.html?year='+r.year+'">Explore this year on Story ↗</a>':'';
   return '<details class="classical-card"><summary><span class="classical-badges">'+
     '<b>'+esc(r.kind)+'</b><span>'+esc(root.temporal(r))+'</span></span><strong>'+esc(r.name)+'</strong>'+
     '<small>'+esc(r.region||'')+'</small></summary><div class="classical-detail">'+
     '<p>'+esc(r.summary)+'</p><p><b>Collection:</b> '+esc(status(r))+
     '</p>'+
     '<p><b>Research batch:</b> '+esc((r.batches||[r.scope]).join(' and '))+'</p>'+
     ''+
     ''+
     '<div class="classical-source-links">'+(sources||'<span>No direct source URL in this imported excerpt.</span>')+toTimeline+'</div></div></details>';
 }
 function matches(){
   const query=$('classicalSearch').value||'';
   const kind=$('classicalKind').value||'all',batch=$('classicalBatch').value||'all';
   // browse has an optional limit. Pass the whole record count for accurate count.
   return root.browse(records,{kind,batch,query,limit:records.length});
 }
 function render(){
   if(!records.length)return;
   const rows=matches(),slice=rows.slice(0,shown);
   $('classicalCards').innerHTML=slice.map(card).join('')||
     '<p class="classical-empty">No matches. Try adjusting the filters.</p>';
   $('classicalStatus').textContent=rows.length+' distinct reviewed records in this selection · '+slice.length+
    ' visible';
   $('classicalMore').hidden=shown>=rows.length;
   $('classicalMore').textContent='Show more reviewed records ('+(rows.length-shown)+' remaining)';
 }
 function lazy(){
   if(loading)return loading;
   $('classicalStatus').textContent='Loading checked claim excerpts…';
   loading=new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src='classical-reviewed-data.js?v=0.20.0';
     script.onload=()=>root.load().then(resolve,reject);
     script.onerror=()=>reject(new Error('Offline classical evidence data did not load'));
     document.head.appendChild(script);
   }).then(pack=>{
      records=pack.records;render();return pack;
   }).catch(err=>{
     $('classicalStatus').textContent='Classical evidence unavailable: '+err.message+
       '. The rest of Discover can still be used.';
     loading=null;
   });
   return loading;
 }
 $('classicalEvidence').addEventListener('toggle',()=>{
   if($('classicalEvidence').open)lazy();
 });
 for(const id of ['classicalSearch','classicalKind','classicalBatch'])
   $(id).addEventListener(id==='classicalSearch'?'input':'change',()=>{shown=18;render();});
 $('classicalMore').addEventListener('click',()=>{shown+=18;render();});
 if(location.hash==='#classicalEvidence'||new URLSearchParams(location.search).has('classical')){
   $('classicalEvidence').open=true;lazy();
 }
 window.AtlasClassicalReviewUI={lazy,render,matches};
})();
