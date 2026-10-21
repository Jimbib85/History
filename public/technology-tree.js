(() => {
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const year=y=>y<=0?Math.abs(y-1).toLocaleString('en-AU')+' BCE':y.toLocaleString('en-AU')+' CE';
const civs=Object.fromEntries(CIVILISATIONS.map(c=>[c.id,c]));
const techs=Object.fromEntries(TECHNOLOGIES.map(t=>[t.id,t]));
const dlg=$('technologyDialog'),tree=$('technologyBranches'),details=$('technologyDetails'),select=$('technologyCivilisation');
if(!dlg||!tree||!details||!select)return;
const state={tech:'movable-type',civ:'rome'};
const status=s=>({independent:'Independent development',early:'Early evidence',attested:'Documented use',adopted:'Adopted or transmitted',developed:'Further development'}[s]||'Recorded use');
function renderTree(){
tree.innerHTML=TECH_BRANCHES.map(b=>'<section class="tech-branch"><header class="tech-branch-head"><span>'+esc(b.icon)+'</span><div><h3>'+esc(b.name)+'</h3><p>'+esc(b.intro)+'</p></div></header><div class="tech-nodes">'+TECHNOLOGIES.filter(t=>t.branch===b.id).map((t,i)=>{
const match=t.appearances.find(a=>a.civ===state.civ);
return '<button type="button" class="tech-node '+(state.tech===t.id?'selected ':'')+(match?'documented':'')+'" data-tech="'+esc(t.id)+'" aria-pressed="'+(state.tech===t.id)+'"><span class="tech-num">'+(i+1)+'</span><span class="tech-node-copy"><strong>'+esc(t.name)+'</strong><small>'+(match?year(match.year):'Not in sample')+'</small></span><span class="tech-node-arrow">↗</span></button>';
}).join('')+'</div></section>').join('');
tree.querySelectorAll('[data-tech]').forEach(btn=>btn.addEventListener('click',()=>{state.tech=btn.dataset.tech;draw();details.scrollIntoView({block:'nearest',behavior:'smooth'});}));
}
function renderDetail(){
const t=techs[state.tech],soc=civs[state.civ],records=[...t.appearances].sort((a,b)=>a.year-b.year);
const current=records.find(a=>a.civ===soc.id),min=records[0].year,max=records[records.length-1].year,span=Math.max(1,max-min);
const sourceCount=new Set(records.map(a=>a.source)).size;
details.innerHTML='<div class="tech-intro"><div class="tech-kicker">'+esc(TECH_BRANCHES.find(b=>b.id===t.branch).name.toUpperCase())+' · '+esc(t.era)+'</div><h2>'+esc(t.name)+'</h2><p>'+esc(t.description)+'</p></div>'+
'<div class="tech-current"><span>'+esc(soc.name)+'</span><strong>'+(current?year(current.year):'No curated milestone yet')+'</strong><p>'+(current?esc(current.label)+'. '+esc(current.note):'No record in this small collection does not mean this society lacked the technology.')+'</p></div>'+
'<div class="tech-compare-head"><div><strong>Across civilisations</strong><span>'+records.length+' dated examples · '+sourceCount+' linked sources</span></div><span>Earlier ↔ Later</span></div>'+
'<div class="tech-ends"><span>'+year(min)+'</span><span>'+year(max)+'</span></div>'+
records.map(a=>{
const c=civs[a.civ],pct=Math.max(2,Math.min(98,100*(a.year-min)/span));
return '<article class="tech-record '+(a.civ===state.civ?'selected':'')+'"><div class="tech-record-head"><strong>'+esc(c.name)+'</strong><span>'+year(a.year)+'</span></div><div class="tech-track"><i style="left:'+pct.toFixed(2)+'%"></i></div><div class="tech-kind">'+esc(status(a.status))+' · '+esc(a.label)+'</div><p>'+esc(a.note)+'</p><div class="tech-record-actions"><a target="_blank" rel="noopener noreferrer" href="'+esc(a.source)+'">Historical source ↗</a><button type="button" data-tech-jump="'+esc(a.civ)+'" data-tech-year="'+a.year+'">Explore this year ↗</button></div></article>';
}).join('')+
'<p class="tech-disclaimer">These are selected evidence dates, not a ranking of civilisations or proof of who invented something first. Different societies may have had different methods. Missing entries are research gaps in this toy.</p>';
details.querySelectorAll('[data-tech-jump]').forEach(btn=>btn.addEventListener('click',()=>{
if(window.WorldHistoryAtlas){window.WorldHistoryAtlas.selectCiv(btn.dataset.techJump);window.WorldHistoryAtlas.setYear(Number(btn.dataset.techYear));}
dlg.close();
}));
}
function draw(){renderTree();renderDetail();}
function open(){
const selected=window.WorldHistoryAtlas?.state?.civ;
if(selected&&civs[selected])state.civ=selected;
select.value=state.civ;draw();dlg.showModal();
}
select.innerHTML=[...CIVILISATIONS].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
select.addEventListener('change',()=>{state.civ=select.value;draw();});
$('technologyButton').addEventListener('click',open);
$('closeTechnology').addEventListener('click',()=>dlg.close());
$('randomTechnology').addEventListener('click',()=>{const choices=TECHNOLOGIES.filter(t=>t.id!==state.tech);state.tech=choices[Math.floor(Math.random()*choices.length)].id;draw();});
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
window.WorldHistoryTechnology={open,state,technologies:TECHNOLOGIES};
})();