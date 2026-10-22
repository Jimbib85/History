/* v0.28 — complete, additive source-linked research archive.
 * No inherited dates, polity spans or relational claims are copied into established timeline arrays.
 * An explicit relationship record may form a graph edge; contemporaneity cannot.
 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const url=x=>{try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
 const desc=s=>String(s||'').replaceAll('_',' ').toLowerCase();
 const yearText=y=>!Number.isSafeInteger(y)?'Unknown':y<=0?`${Math.abs(y-1)} BCE`:`${y} CE`;
 const present=r=>Number.isSafeInteger(r.start_year)&&Number.isSafeInteger(r.end_year_exclusive)&&r.end_year_exclusive>r.start_year;
 const displayDate=r=>r.date_text|| (present(r)?`${yearText(r.start_year)}–${yearText(r.end_year_exclusive-1)}`:'Not securely dated');
 const plausiblePeriod=r=>Number.isSafeInteger(r.start_year)&&r.start_year>=-9999&&r.start_year<=2026&&['POINT','EVENT','DURATION','DATE_WINDOW','APPROXIMATE_DATE','CONVENTIONAL_MARKER'].includes(r.temporal_kind)&&!['UNKNOWN','TEXT_NOT_PARSED','UNREVIEWED'].includes(r.date_precision);
 const label={societies:'Societies & empires',events:'Historical events',figures:'People',relationships:'Relationships',connections:'Meanwhile comparisons',technologies:'Technology topics',technology_developments:'Technology evidence',technology_dependencies:'Technology dependencies',technology_transmission:'Technology transmission',cultural_practices:'Culture & daily life',geographical_knowledge:'Geographical knowledge',visual_assets:'Maps & visual references',discovery_cards:'Discovery stories',conflicts:'Conflicts',weapons:'Historical military artefacts',statistics:'Statistics',organisations:'Organisations',social_impacts:'Social impacts',treaties:'Treaties',engagements:'Battles & engagements',campaigns:'Campaigns',conflict_phases:'Conflict phases',discoveries:'Scientific discoveries'};
 const current=new URLSearchParams(location.search),initialYear=current.has('year')?Number(current.get('year')):NaN;
 const state={data:null,byId:null,claims:null,sourceIndex:null,sourceClaims:null,mode:current.get('mode')==='network'?'network':'browse',category:current.get('category')||'all',region:'all',period:Number.isSafeInteger(initialYear)&&initialYear>=-9999&&initialYear<=2026?'near':'all',year:Number.isSafeInteger(initialYear)&&initialYear>=-9999&&initialYear<=2026?initialYear:1200,search:'',leads:false,sensitive:false,limit:12,active:null,networkCenter:null,networkNeighbor:null};
 let opener;
 function isSensitive(r){return (r.content_warnings||[]).length>0 || (r.category==='visual_assets'&&/propaganda|poster|persuasion/i.test(r.record_subtype||''));}
 function eligible(r){return (state.leads||r.review_status!=='LEAD_ONLY')&&(state.sensitive||!isSensitive(r));}
 function periodMatch(r){const k=state.period;if(k==='all')return true;if(k==='undated')return !present(r);if(!present(r))return false;
   if(k==='near')return r.start_year<=state.year+50&&r.end_year_exclusive>state.year-50;
   const ranges={bce:[-99999,1],early:[1,1000],medieval:[1000,1500],earlymodern:[1500,1900],modern:[1900,2027]};const [a,b]=ranges[k]||[-99999,99999];return r.start_year<b&&r.end_year_exclusive>a;
 }
 function matches(r){const words=state.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!words.length)return true;
  const hay=[r.title,r.summary,r.region,r.date_text,r.category,r.record_subtype,...(r.original_labels||[]),...(r.original_ids||[])].join(' ').toLowerCase();return words.every(w=>hay.includes(w));
 }
 function rows(){return state.data.master_catalogue.filter(r=>eligible(r)&&(state.category==='all'||state.category===r.category)&&(state.region==='all'||state.region===r.region)&&periodMatch(r)&&matches(r));}
 function categoryName(k){return label[k]||String(k||'Historical record').replaceAll('_',' ');}
 function statusName(r){return r.review_status==='SOURCE_CHECKED_THIS_RUN'?'Source checked this run':r.review_status==='LEAD_ONLY'?'Unresolved research lead':'Inherited, not rechecked';}
 function card(r){return `<button type="button" class="record-card" data-open="${esc(r.id)}"><span class="meta"><span>${esc(categoryName(r.category))}</span><span class="badge ${r.review_status==='LEAD_ONLY'?'low':''}">${esc(r.historical_confidence||'Unrated')}</span></span><strong>${esc(r.title)}</strong><small>${esc(displayDate(r))} · ${esc(r.region||'Region unspecified')}</small><span class="intro">${esc(r.summary||'Source-linked research record; open for provenance and dating context.')}</span><span class="bottom">${esc(statusName(r))} · ${r.source_ids?.length||0} linked ${r.source_ids?.length===1?'source':'sources'} →</span></button>`;}
 function render(){if(!state.data)return;const found=rows();const visible=found.slice(0,state.limit);
  $('resultCount').textContent=`${found.length.toLocaleString()} matching records · ${visible.length} shown`;
  $('cards').innerHTML=visible.length?visible.map(card).join(''):'<p>No matching catalogue records. This is a limitation of this research collection, not proof that the subject did not exist.</p>';
  $('more').hidden=visible.length>=found.length;
  $('more').textContent=`Show ${Math.min(12,found.length-visible.length)} more records · ${found.length-visible.length} remaining`;
  $('resultTitle').textContent=state.category==='all'?'Explore historical evidence':categoryName(state.category);
  $('shortcuts').querySelectorAll?.('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
 }
 function setupFilters(){const items=state.data.master_catalogue;
  const kinds=[...new Set(items.map(r=>r.category))].sort((a,b)=>categoryName(a).localeCompare(categoryName(b)));
  $('category').innerHTML='<option value="all">All record categories</option>'+kinds.map(k=>`<option value="${esc(k)}">${esc(categoryName(k))} (${items.filter(r=>r.category===k).length})</option>`).join('');
  $('category').value=kinds.includes(state.category)?state.category:'all';state.category=$('category').value;
  const regions=[...new Set(items.map(r=>r.region).filter(Boolean))].sort();
  $('region').innerHTML='<option value="all">Every region</option>'+regions.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');
  $('period').value=state.period;$('year').value=yearText(state.year);
  $('shortcuts').innerHTML=[['all','Everything'],['societies','Societies'],['events','Events'],['relationships','Relationships'],['technology_developments','Technology'],['figures','People'],['visual_assets','Maps & visual references']].map(([value,title])=>`<button type="button" data-category="${value}" aria-pressed="${state.category===value}">${title}</button>`).join('');
  for(const [id,key] of [['search','search'],['category','category'],['region','region'],['period','period']])$(id).addEventListener(id==='search'?'input':'change',()=>{state[key]=$(id).value;state.limit=12;render();});
  $('shortcuts').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;state.category=b.dataset.category;$('category').value=state.category;state.limit=12;render();});
  $('year').addEventListener('change',()=>{const raw=$('year').value.trim().replace(/,/g,'');const m=raw.match(/^(\d+)\s*(BCE|BC|CE|AD)?$/i);let y=m?Number(m[1]):NaN;if(m&&/^(BCE|BC)$/i.test(m[2]||''))y=1-y;if(Number.isSafeInteger(y)&&y>=-9999&&y<=2026){state.year=y;$('year').value=yearText(y);state.limit=12;render();}else{$('year').value=yearText(state.year);}});
  $('showLeads').addEventListener('change',e=>{state.leads=e.target.checked;state.limit=12;render();});
  $('showSensitive').addEventListener('change',e=>{state.sensitive=e.target.checked;state.limit=12;render();});
  $('reset').addEventListener('click',()=>{state.search='';state.category='all';state.region='all';state.period='all';state.leads=false;state.sensitive=false;state.limit=12;for(const id of ['search','category','region'])$(id).value=id==='search'?'':'all';$('period').value='all';$('showLeads').checked=false;$('showSensitive').checked=false;render();});
  $('more').addEventListener('click',()=>{state.limit+=12;render();});
  $('cards').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)show(b.dataset.open,b);});
 }
 function sourceLink(s){const u=url(s?.url);if(!u)return '';const status=s?.current_access_level||'Source registration; not independently verified';return `<a class="reader-source" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(s.title||s.author_or_institution||u)} ↗<small>${esc(s.author_or_institution||'Research reference')} · ${esc(desc(status))}${s.rights_note?` · Rights: ${esc(s.rights_note)}`:''}</small></a>`;}
 function linkedRecordButtons(r){const links=(r.linked_catalogue_ids||[]).map(id=>state.byId.get(id)).filter(x=>x&&eligible(x));if(!links.length)return '';
  return `<div class="reader-section"><h3>Linked research entries (${links.length})</h3><div class="linked-buttons">${links.slice(0,24).map(x=>`<button data-open="${esc(x.id)}" type="button">${esc(x.title)} ↗</button>`).join('')}</div>${links.length>24?`<p>${links.length-24} more recorded cross-references are preserved in the archive.</p>`:''}</div>`;
 }
 function claimDetail(r){const claims=(r.claim_ids||[]).map(id=>state.claims.get(id)).filter(Boolean);
  return `<div class="reader-section"><h3>Evidence statements (${claims.length})</h3>${claims.length?claims.map(c=>{const links=state.sourceClaims.get(c.id)||[];return `<details><summary>${esc(c.claim_text)}</summary><p><strong>Verification:</strong> ${esc(desc(c.verification_status))}. <strong>Confidence:</strong> ${esc(c.confidence)}. ${c.independently_corroborated?'Independent corroboration noted.':'No independent corroboration established by this package.'}</p><p>${links.map(l=>`Source ${esc(l.source_id)}: ${esc(desc(l.support_status))}`).join(' · ')||'No source-claim link supplied.'}</p></details>`;}).join(''):'<p>No separate claim statement is available for this entry.</p>'}</div>`;
 }
 function openReader(r){const sources=[...new Set((r.source_ids||[]).map(id=>state.sourceIndex.get(id)).filter(Boolean))];const external=[...new Set(r.source_urls||[])].filter(s=>url(s)&&!sources.some(row=>row.url===s));
  const notes=[r.notes,r.confidence_basis&&r.historical_confidence!=='HIGH'?`Confidence basis: ${r.confidence_basis}`:'',...((r.content_warnings||[]).length?[`Sensitive content: ${r.content_warnings.join(', ')}`]:[])].filter(Boolean);
  const approximate=!plausiblePeriod(r);
  $('readerType').textContent=categoryName(r.category);
  $('readerBody').innerHTML=`<h2 id="readerTitle">${esc(r.title)}</h2><div class="reader-meta"><span>${esc(displayDate(r))}</span><span>${esc(r.region||'Unknown region')}</span><span>${esc(r.historical_confidence||'Not rated')}</span></div><p>${esc(r.summary||'No descriptive summary supplied.')}</p><p class="reader-warning"><b>Research status:</b> ${esc(statusName(r))}. Source-linked references do not equal independent scholarly verification.${approximate?' Its date information is not suitable for a precise event marker without review.':''}</p><div class="reader-section"><h3>Dates and interpretation</h3><p><b>Original date wording:</b> ${esc(displayDate(r))}<br><b>Temporal interpretation:</b> ${esc(desc(r.temporal_kind))}<br><b>Date precision:</b> ${esc(desc(r.date_precision))}${r.end_status?`<br><b>End status:</b> ${esc(desc(r.end_status))}`:''}</p>${(r.date_alternatives||[]).length?`<details><summary>Alternative source dates (${r.date_alternatives.length})</summary><pre>${esc(JSON.stringify(r.date_alternatives,null,2))}</pre></details>`:''}${notes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>
  ${linkedRecordButtons(r)}${claimDetail(r)}<div class="reader-section"><h3>Original references (${sources.length+external.length})</h3>${sources.map(sourceLink).join('')}${external.map(s=>`<a href="${esc(url(s))}" class="reader-source" target="_blank" rel="noopener noreferrer">Additional source reference ↗ <small>${esc(s)}</small></a>`).join('')||''}${sources.length||external.length?'':'<p>No resolved source URL. Treat this as a research lead, not an asserted fact.</p>'}</div><div class="reader-actions">${plausiblePeriod(r)?`<a href="story.html?year=${r.start_year}">Explore this period ↗</a><a class="secondary" href="index.html?year=${r.start_year}">Open world map ↗</a>`:''}<a class="secondary" href="catalogue.html?record=${encodeURIComponent(r.id)}">Link to this record ↗</a></div><p class="smallid">Research ID: ${esc(r.id)} · Source pack(s): ${esc((r.input_packs||[]).join(', '))} · Original IDs: ${esc((r.original_ids||[]).join(', '))}</p>`;
  if(!$('reader').open)$('reader').showModal();
 }
 function show(id,from){const r=state.byId.get(id);if(!r)return;
  // Sensitive or source-unresolved material remains behind an explicit user choice, including deep links.
  if(!eligible(r))return;
  opener=from||document.activeElement;state.active=id;openReader(r);
  const q=new URLSearchParams(location.search);q.set('record',id);history.replaceState(null,'',location.pathname+'?'+q.toString());
 }
 function setupReader(){$('closeReader').addEventListener('click',()=>$('reader').close());$('reader').addEventListener('click',e=>{if(e.target===$('reader'))$('reader').close();const b=e.target.closest('[data-open]');if(b)show(b.dataset.open,b);});$('reader').addEventListener('close',()=>{opener?.focus?.({preventScroll:true});const q=new URLSearchParams(location.search);if(q.has('record')){q.delete('record');history.replaceState(null,'',location.pathname+(q.size?'?'+q.toString():''));}});}
 function mode(which){state.mode=which;for(const [name,id] of [['browse','browseMode'],['network','networkMode']])$(id).setAttribute('aria-pressed',String(name===which));$('browseSection').hidden=which!=='browse';$('networkSection').hidden=which!=='network';const q=new URLSearchParams(location.search);if(which==='network')q.set('mode','network');else q.delete('mode');history.replaceState(null,'',location.pathname+(q.size?'?'+q.toString():''));if(which==='network')renderNetwork();}
 function setupMode(){for(const [name,id] of [['browse','browseMode'],['network','networkMode']])$(id).addEventListener('click',()=>mode(name));}
 function relations(){return state.data.master_catalogue.filter(r=>r.category==='relationships'&&eligible(r)&&r.linked_catalogue_ids?.filter(id=>state.byId.get(id)?.category==='societies').length>=2);}
 function relationshipsWith(cid){return relations().filter(r=>r.linked_catalogue_ids.includes(cid));}
 function pairConnections(center){const count=new Map();for(const r of relationshipsWith(center))for(const id of r.linked_catalogue_ids){if(id===center)continue;const s=state.byId.get(id);if(s?.category!=='societies'||!eligible(s))continue;count.set(id,(count.get(id)||0)+1);}return [...count.entries()].sort((a,b)=>b[1]-a[1]||state.byId.get(a[0]).title.localeCompare(state.byId.get(b[0]).title));}
 function chooseDefaultCenter(){const deg=new Map();for(const r of relations())for(const id of r.linked_catalogue_ids){if(state.byId.get(id)?.category==='societies')deg.set(id,(deg.get(id)||0)+1);}return [...deg].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;}
 function setupNetwork(){const ids=new Set(relations().flatMap(r=>r.linked_catalogue_ids.filter(id=>state.byId.get(id)?.category==='societies')));
  const sels=[...ids].map(id=>state.byId.get(id)).filter(Boolean).sort((a,b)=>a.title.localeCompare(b.title));
  $('networkSociety').innerHTML=sels.map(r=>`<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
  const incoming=current.get('society');state.networkCenter=ids.has(incoming)?incoming:chooseDefaultCenter();$('networkSociety').value=state.networkCenter||'';
  $('networkSociety').addEventListener('change',()=>{state.networkCenter=$('networkSociety').value;state.networkNeighbor=null;renderNetwork();});
  $('networkDiagram').addEventListener('click',e=>{const node=e.target.closest('[data-neighbor]');if(node){state.networkNeighbor=node.dataset.neighbor;renderNetwork();}});
  $('networkEvidence').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)show(b.dataset.open,b);});
  $('meanwhileRecords').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)show(b.dataset.open,b);});
 }
 function renderNetwork(){if(!state.data)return;const center=state.byId.get(state.networkCenter);
  if(!center){$('networkDiagram').innerHTML='<p>No sourced society-to-society relationship records available.</p>';return;}
  const neighbours=pairConnections(center).slice(0,8);if(!neighbours.some(([id])=>id===state.networkNeighbor))state.networkNeighbor=neighbours[0]?.[0]||null;
  const positions=neighbours.map(([id,count],i)=>({id,count,x:50+34*Math.cos(i*2*Math.PI/neighbours.length-Math.PI/2),y:50+34*Math.sin(i*2*Math.PI/neighbours.length-Math.PI/2)}));
  const curve=positions.map(p=>`<path d="M500 300 Q${500+(p.x-50)*10*.55} ${300+(p.y-50)*6*.55-45} ${p.x*10} ${p.y*6}"/>`).join('');
  $('networkDiagram').innerHTML=`<svg viewBox="0 0 1000 600" aria-hidden="true" preserveAspectRatio="none">${curve}</svg><button type="button" class="node center" style="left:50%;top:50%" aria-pressed="false" title="Selected network centre">${esc(center.title)}</button>`+positions.map(p=>`<button type="button" class="node" data-neighbor="${esc(p.id)}" aria-pressed="${p.id===state.networkNeighbor}" style="left:${p.x}%;top:${p.y}%" title="${p.count} linked relationship records">${esc(state.byId.get(p.id).title)}<br><small>${p.count} ${p.count===1?'link':'links'}</small></button>`).join('');
  const n=state.byId.get(state.networkNeighbor);const matching=relationshipsWith(center).filter(r=>r.linked_catalogue_ids.includes(n?.id));
  $('networkTitle').textContent=n?center.title+' ↔ '+n.title:'No other linked society in this sample';
  $('networkIntro').textContent=`${matching.length} explicit relationship ${matching.length===1?'record':'records'} connect these entries in the catalogue. These are source-linked research claims, not a measure of trade volume or relationship strength.`;
  $('networkEvidence').innerHTML=matching.length?matching.map(r=>`<article class="edge-card"><div class="type">${esc(r.record_subtype||'Relationship')} · ${esc(r.historical_confidence||'Unrated')}</div><strong>${esc(r.title)}</strong><p>${esc(displayDate(r))} · ${esc(r.summary)}</p><button type="button" data-open="${esc(r.id)}">Read source and details →</button></article>`).join(''):'<p>There are no explicit relationship edges for this pair.</p>';
  const meanwhile=state.data.master_catalogue.filter(r=>r.category==='connections'&&eligible(r));$('meanwhileCount').textContent=`${meanwhile.length} comparisons`;
  $('meanwhileRecords').innerHTML=meanwhile.slice(0,12).map(r=>`<article class="edge-card"><strong>${esc(r.title)}</strong><p>${esc(displayDate(r))} — ${esc(r.summary)}</p><button type="button" data-open="${esc(r.id)}">Read source ↗</button></article>`).join('');
 }
 async function unpack(){const raw=(globalThis.ATLAS_MASTER_CHUNKS||[]).join('');if(!raw)throw Error('Research catalogue payload is missing');if(typeof DecompressionStream==='undefined')throw Error('A modern browser with gzip stream support is required.');
  const binary=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));const stream=new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip'));
  const text=await new Response(stream).text();const data=JSON.parse(text);
  if(data.master_catalogue?.length!==3125||data.source_register?.length!==621||data.claims?.length!==3001||data.source_claims?.length!==3784)throw Error('Research file validation failed: an incomplete collection was loaded.');
  if(new Set(data.master_catalogue.map(r=>r.id)).size!==3125)throw Error('Research catalogue contains duplicate record identifiers.');
  return data;
 }
 async function init(){setupReader();setupMode();try{state.data=await unpack();state.byId=new Map(state.data.master_catalogue.map(r=>[r.id,r]));state.claims=new Map(state.data.claims.map(c=>[c.id,c]));state.sourceIndex=new Map(state.data.source_register.map(s=>[s.id,s]));state.sourceClaims=new Map();for(const c of state.data.source_claims){if(!state.sourceClaims.has(c.claim_id))state.sourceClaims.set(c.claim_id,[]);state.sourceClaims.get(c.claim_id).push(c);}setupFilters();setupNetwork();$('loadStatus').hidden=true;mode(state.mode);render();
   const id=current.get('record');if(id&&state.byId.has(id)){const r=state.byId.get(id);if(!eligible(r)){$('loadStatus').hidden=false;$('loadStatus').textContent='This record requires opting in to unresolved or sensitive research before opening. Use the filters above.';}else show(id);}
  }catch(e){$('loadStatus').textContent='Catalogue unavailable: '+e.message;console.error(e);}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 globalThis.AtlasMasterReader={state,yearText,plausiblePeriod};
})();