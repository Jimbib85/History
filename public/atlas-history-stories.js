/* Source-linked historical context for Atlas readers (v0.30).
 * These are short editorial syntheses of the named catalogue observations,
 * NOT quotations from linked external pages or verified new primary research.
 * Additional contextual snippets show associated evidence, not asserted causation.
 */
(function(root){
 'use strict';
 const source=root.ATLAS_MASTER_CONTEXT;
 if(!source)return;
 const H=Object.freeze([
  {id:'persian-world',soc:['persia'],titles:['Achaemenid Persian Empire'],events:/achaemenid|cyrus.*babylon|ionian revolt|greco.persian/i,
   heading:'How the Persian Empire held together',text:'The Achaemenid Empire connected very different regions through royal administration, regional governors and roads. Satrapies were important, but the provinces did not all function identically: local institutions continued alongside imperial authority. Persian contact with Greek city-states included both wars and complicated diplomacy, rather than an unbroken conflict.',
   refs:['cultural_practice_d593bb518a5b79','event_bfd7a7fa744232','relationship_9dd96ca08d6f43']},
  {id:'ashoka',soc:['maurya'],titles:['Maurya Empire'],events:/ashoka|maurya|seleucid.mauryan/i,
   heading:'What we can still hear from Ashoka',text:'The Mauryan world is unusually interesting because inscriptions preserve messages issued in the ruler’s name. Ashoka’s edicts show public statements about ethical conduct and royal policy, although they do not amount to a complete record of how the empire was governed. References to western rulers also reveal diplomatic awareness; they are not evidence of a detailed Mauryan map of those territories.',
   refs:['societie_6e96425d3c1869','event_63edea8eff00fa','geographical_knowledge_df6d0d83f50127']},
  {id:'han',soc:['han'],titles:['Han dynasty / imperial administration'],events:/han dynasty|zhang qian|xiongnu/i,
   heading:'Frontiers that changed with diplomacy',text:'Han relationships on the northern and western frontiers were not simply battles between two fixed blocs. The record includes conflict, tribute arrangements, marriages and negotiation with the Xiongnu, with policies changing across reigns. Diplomatic journeys widened Chinese court information about distant peoples, while traded objects could travel much farther than a single government’s direct contacts.',
   refs:['relationship_5f0c78d91e1936','relationship_7b223c800ce3f4','relationship_9ea35ab19a78fc']},
  {id:'rome-persia',soc:['rome','byzantium','sasanian'],titles:['Eastern Roman (Byzantine) Empire','Sasanian Empire'],events:/sasanian|roman.persian|justinian/i,
   heading:'Rivals, neighbours and changing states',text:'Rome and its eastern successor interacted with Iranian dynasties through war, disputed frontiers and diplomacy. Control of Armenia and Mesopotamia mattered, while merchants and local communities lived through shifts in political power. The last great Byzantine–Sasanian war weakened both empires before the early Islamic conquests; a change in royal rule did not mean the people or their traditions vanished.',
   refs:['relationship_37cec851ece27b','event_9546877b041326','event_2bc4666183c79b']},
  {id:'aksum',soc:['aksum'],titles:['Aksumite Kingdom','Kingdom of Aksum'],events:/aksum|adulis/i,
   heading:'The Red Sea was a connection, not a boundary',text:'Aksum’s rulers drew strength from highland centres and links to the Red Sea port of Adulis. Surviving coins document both political authority and trading connections, and changes in their imagery offer evidence of religious transformation. Its decline was a gradual reorganisation, not a single year when all Aksumite communities disappeared.',
   refs:['relationship_a2c92c35d79095','event_3996e308eb1998','cultural_practice_49b8795da022c0']},
  {id:'maya',soc:['maya','tikal','calakmul'],titles:['Classic Maya city-states'],events:/maya|tikal|calakmul|mayapan/i,
   heading:'Maya history did not end when cities changed',text:'Maya political life involved rival cities, dynastic inscriptions and regional relationships. During the ninth and following centuries, some southern lowland centres underwent serious transformations, but the evidence points to different pressures in different places. Northern continuities and later Maya communities matter just as much as the famous monumental cities: political disruption was not the disappearance of the Maya people.',
   refs:['event_b650d95e6ede79','event_d4505476307313','geographical_knowledge_e0aabd6ed01a2c']},
  {id:'tang-printing',soc:['tang'],titles:['Tang dynasty'],events:/tang|diamond sutra|dunhuang|woodblock/i,tech:/woodblock|printing/i,
   heading:'A surviving book, not the first printed book ever',text:'Tang China already had a developed culture of Buddhist images and texts printed from carved blocks. The Diamond Sutra carries a date equivalent to 11 May 868 and even identifies the person who sponsored its production. Its importance is that a complete dated printed book survives—not that printing suddenly began in that year. Surviving material from Dunhuang shows a much wider textual world.',
   refs:['technology_development_9f4fcbf1077240','event_6a767e3a6650fe','technology_development_bb3092b0a03901']},
  {id:'abbasid',soc:['abbasid'],titles:['Abbasid Caliphate'],events:/abbasid|baghdad|al.khwarizmi|paper manufacture.*baghdad/i,tech:/paper|algebra|numeral|manuscript|arithmetic/i,
   heading:'Baghdad: politics, paper and learning',text:'After the Abbasids displaced Umayyad rule in 750, Baghdad was established as a new capital in 762. Paper manufacture was taking hold there by the late eighth century, helping support a flourishing manuscript and scholarly culture. Al-Khwarizmi’s writing on algebra and Indian numeral methods belongs to this wider intellectual world. The caliphate’s political authority changed over time: Seljuk power reached Baghdad in 1055, and Mongol forces sacked the city in 1258.',
   refs:['event_195c417d523ae3','event_1089d0276ebb71','event_9e360f32321038','event_c6d71dd51ab43c','event_3839578c38f064']},
  {id:'paper-journey',soc:[],titles:[],events:/papermaking|paper manufacture|paper production/i,tech:/paper/i,
   heading:'Paper travelled through many hands',text:'The movement of papermaking westwards was a long regional process, not a single invention handed over after the Battle of Talas in 751. The catalogue identifies Central Asian paper use before that date, manufacture in Baghdad by the late eighth century and further spread into Egypt and the Mediterranean world. Use those observations as stepping stones, not proof of a particular person carrying the technique between two capitals.',
   refs:['technology_development_cbf3d95f824bcb','technology_development_1d4e3aaa8a1d49','technology_development_6f4a1ba15aacb8']},
  {id:'song',soc:['song'],titles:['Northern Song dynasty'],events:/northern song|bi sheng|wujing zongyao|song dynasty/i,tech:/movable type|gunpowder|woodblock/i,
   heading:'Ideas in a busy world of books and workshops',text:'Song China’s information culture rested on more than one invention. Woodblock printing already supported mature book production, while the ceramic movable type associated with Bi Sheng offered a distinct method. A military treatise of 1044 also preserves gunpowder mixture recipes. Each observation has its own kind of evidence and date: the appearance of a surviving record is not necessarily the moment a technique was invented.',
   refs:['technology_development_1f0957c5abdac2','technology_development_847d842c7a58f4','technology_development_e1474c73d11d70']},
  {id:'goryeo',soc:['goryeo'],titles:['Goryeo dynasty'],events:/goryeo|jikji/i,tech:/movable type/i,
   heading:'Korean printing was its own achievement',text:'The surviving Jikji was printed with metal movable type at a Korean Buddhist temple in 1377, well before Gutenberg’s European metal-type books. Goryeo also developed sophisticated celadon ceramics, while Buddhist monasteries and texts were important features of cultural life. These are related parts of Goryeo history, not evidence that the Jikji technique was directly passed to Gutenberg.',
   refs:['event_88af8591eedf78','cultural_practice_4fb1a3393d616b','cultural_practice_8074203227e7a8','event_b0c2628700ae35']},
  {id:'angkor',soc:['angkor'],titles:['Khmer centres and institutions at Angkor'],events:/angkor|roluos|hariharalaya|khmer hydraulic/i,tech:/irrigat|water.management|hydraulic/i,
   heading:'A cityscape shaped by water and ritual',text:'Angkor was not only a collection of spectacular temples. Successive Khmer centres combined monumental building with reservoirs, canals and other waterworks that shaped the landscape. The buildings and hydraulic features developed over different periods: treating them as one project completed in a single year would hide the scale of that long history.',
   refs:['event_7ea30bcfcca067','event_aac41ac1cf9a95','technology_development_9e5c2194c35f3f']},
  {id:'chola',soc:['chola'],titles:['Chola dynasty'],events:/chola/i,
   heading:'Temples, skilled makers and overseas power',text:'Chola temples brought together ritual life, artisans, landholding and local labour. Sacred bronze images reveal remarkable casting traditions, but court and temple objects cannot stand in for every household’s experience. Chola forces also attacked Srivijayan centres in 1025, showing how military and maritime activity could overlap with the region’s commercial networks.',
   refs:['cultural_practice_d12c1be1ecc4be','cultural_practice_1a386f9fa4e9ae','relationship_e120697ca86eba']},
  {id:'kilwa',soc:['swahili','kilwa'],titles:['Kilwa Kisiwani sultanate and urban society','Swahili coastal communities'],events:/kilwa|swahili|husuni kubwa/i,tech:/swahili coral|maritime navigation|seafaring/i,
   heading:'Indian Ocean trade was also a local way of life',text:'Kilwa’s prosperity involved more than ships passing through a port. Its coral-stone architecture, including mosques and palatial complexes, reflects wealthy and changing town communities on the Swahili coast. Imported material and local craft help show how East African traders participated in wider Indian Ocean exchange without losing their distinct regional traditions.',
   refs:['event_4ede2467a2a729','event_7e912cf7e7e622','cultural_practice_8733314a9fc287']},
  {id:'mali',soc:['mali','songhai'],titles:['Mali Empire','Timbuktu urban and scholarly community'],events:/mali|timbuktu|mansa musa|songhai/i,tech:/manuscript copying|libraries/i,
   heading:'An empire of trade—and cities of learning',text:'Mali’s power was connected with Mandinka-led imperial authority and trans-Saharan exchange. Timbuktu grew as a place where commerce, religious learning, libraries and manuscript traditions intersected. The city’s best-known later scholarly heights should not be projected backwards unchanged into earlier centuries; this history unfolded over generations.',
   refs:['societie_d0a00f8b020679','event_fae9cb52c26908','cultural_practice_f852595af9c223']},
  {id:'mongols',soc:['mongols'],titles:['Mongol Empire and early imperial system'],events:/mongol|khwarazm|baghdad.*1258|yuan.*japan/i,
   heading:'Conquests connected places but changed them differently',text:'Mongol armies fought campaigns from Central Asia to East Asia and parts of Europe, with very different outcomes. Khwarazmian cities suffered major destruction; campaigns in Korea involved both invasions and negotiation; expeditions against Japan failed. The wider empire evolved into successor political systems rather than remaining one unchanged state across its entire maximum extent.',
   refs:['event_a6d82312b50162','event_aa77025309b340','event_b66782aeb4e909']},
  {id:'inca',soc:['inca'],titles:['Inca Empire / Tawantinsuyu'],events:/inca|tawantinsuyu|pachacuti|cusco|chim.u/i,tech:/khipu|knotted.cord|roads and courier/i,
   heading:'An empire built on older Andean skills',text:'Fifteenth-century Inca rulers extended power from Cusco across a landscape with older communities and infrastructure. Road and courier systems were enlarged rather than invented from nothing, while khipu cords supported administrative recordkeeping whose traditions also had deeper roots. When the Spanish conquest began, the collapse of Inca central power was a prolonged process, not the outcome of one single encounter.',
   refs:['event_96a3355d74a7fc','technology_development_7ae8a42ba49a63','relationship_2505f0ac42c4a0']},
  {id:'polynesian',soc:['polynesian-voyagers'],titles:['Western Polynesian island communities'],events:/polynesian|aotearoa|voyag|society islands/i,tech:/pacific voyag|navigation/i,
   heading:'Navigation was knowledge carried in people',text:'Long-established western Polynesian island communities maintained sophisticated voyaging traditions. Archaeological and radiocarbon research places later East Polynesian settlement in different phases, and the permanent settlement of Aotearoa around the thirteenth century. Shared heritage does not establish that all islands stayed in regular direct contact after settlement.',
   refs:['cultural_practice_8953bce9ddd86e','event_7e932ff6d856e4','event_2cd44fc2f0284e']},
  {id:'haiti',soc:['haiti'],titles:['Republic of Haiti'],events:/haitian revolution|haiti.*independence|independence of haiti/i,
   heading:'The struggle changed the meaning of independence',text:'Beginning in 1791, the Haitian Revolution involved enslaved people, colonial forces and international conflict. It culminated in the proclamation of an independent Black republic in 1804 after the defeat of French forces. The dates mark a long and contested struggle, not a single battle or an uncomplicated change of government.',
   refs:['conflict_decbd0630ae76a','event_fab110421ccf1a','event_09b8ae5a748c7e']},
  {id:'kokoda',soc:[],titles:[],events:/kokoda|papuan theatre|buna.*gona/i,
   heading:'Kokoda was a campaign, not just a captured village',text:'The fighting along the Kokoda Track depended heavily on supply lines, local carriers and the evacuation of wounded people through difficult terrain. Allied forces retook Kokoda village on 2 November 1942, but the wider campaign continued after that. The surrounding operations formed related, distinct phases of the Second World War in Papua.',
   refs:['campaign_63b72403bb7eba','event_ef513e44085e8b','technology_development_47b1ca3de8c608']},
  {id:'viking-age',soc:['viking'],titles:[],events:/viking|lindisfarne|norse/i,
   heading:'More than one famous raid',text:'The attack on Lindisfarne in 793 became a powerful symbol in British accounts, but it was not the first Scandinavian voyage. Later raiding, campaigning and settlement reshaped English politics, including the arrival of a major Viking army. The wider Viking Age also included trade and migration, not only warfare.',
   refs:['event_029167cf8d9446','event_b16b0f6e0fe508','event_01eff5db26f39e']}
 ]);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=x=>String(x||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const url=x=>{try{let u=new URL(x);return /^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}};
 const linkFor=r=>r?.u?.map(url).find(Boolean)||null;
 const usedRefs=h=>h.refs.map(id=>source.byId.get(id)).filter(Boolean);
 function entitySeed(c){if(!c)return null;
  const aliases=[c.id,c.researchId,...(c.masterCatalogueIds||[])].filter(Boolean);
  const names=[c.name,...(c.masterCatalogueIds||[]).map(id=>source.byId.get(id)?.t)].filter(Boolean).map(clean);
  return H.find(h=>h.soc.some(id=>aliases.includes(id))||h.titles.some(t=>names.includes(clean(t))))||null;
 }
 function eventSeed(e){if(!e)return null;
  const title=String(e.title||'');
  return H.find(h=>h.events?.test(title))||null;
 }
 function techSeed(t,a){if(!t)return null;
  const candidates=H.filter(h=>h.tech?.test(t.name||''));
  if(!candidates.length)return null;
  const id=a?.civ;
  return candidates.find(h=>h.soc.includes(id)) || candidates.find(h=>!h.soc.length) || candidates[0];
 }
 function render(h, opts={}){
  if(!h)return '';
  const rows=usedRefs(h), references=[...new Map(rows.flatMap(r=>(r.u||[]).map(u=>[u,{u,r}])).filter(([u])=>url(u))).values()].slice(0,3);
  if(rows.length<2||references.length===0)return '';
  const preview=opts.open?' open':'';
  return `<details class="atlas-deeper-story"${preview}><summary><span class="atlas-deeper-ornament" aria-hidden="true">✧</span><span><strong>${esc(h.heading)}</strong><small>More historical context · ${rows.length} research records</small></span><span aria-hidden="true" class="atlas-deeper-arrow">⌄</span></summary><div class="atlas-deeper-body"><p>${esc(h.text)}</p><p class="atlas-deeper-label">Evidence to explore</p><div class="atlas-deeper-references">${references.map(({u,r})=>`<a href="${esc(url(u))}" target="_blank" rel="noopener noreferrer" title="${esc(r.t)}">${esc(r.t)} ↗</a>`).join('')}</div><small class="atlas-deeper-qualifier">Short editorial synthesis of linked catalogue records, not a verbatim extract or proof of direct contact. <a href="catalogue.html?record=${encodeURIComponent(rows[0].i)}">See research record ↗</a></small></div></details>`;
 }
 // For a short event with no curated essay, use close subject-linked observations
 // that add a different piece of information. The matching is deliberately strict.
 const topicWords=v=>new Set(clean(v).split(' ').filter(w=>w.length>4&&!/^(empire|dynasty|state|kingdom|political|early|later|after|before|begin|begins|history|system|century|community|communities)$/.test(w)));
 function related(e){
  if(!e||!Number.isFinite(e.year))return [];
  const ids=new Set([e.civ,...(e.societyIds||[]),...(e.entityIds||[]),e.primaryId].filter(Boolean));
  const words=topicWords(e.title),own=new Set([e.catalogueId,...(e.masterCatalogueIds||[]),...(e.catalogueIds||[])].filter(Boolean));
  const shortlist=new Map();
  for(const id of ids)for(const r of source.forSociety(id)||[]){
   if(own.has(r.i)||!['events','technology_developments','cultural_practices','relationships','geographical_knowledge'].includes(r.c)||!r.s||r.s.length<48||!Number.isFinite(r.a)||Math.abs(r.a-e.year)>125||!linkFor(r))continue;
   const title=topicWords(r.t),body=topicWords(r.s);
   let score=0;for(const w of words)if(title.has(w))score+=3;else if(body.has(w))score++;
   if(score<2||clean(r.t)===clean(e.title))continue;
   const key=clean(r.t);const v={r,score:score-(Math.abs(r.a-e.year)/180)};
   if(!shortlist.has(key)||v.score>shortlist.get(key).score)shortlist.set(key,v);
  }
  return [...shortlist.values()].sort((a,b)=>b.score-a.score).slice(0,2).map(x=>x.r);
 }
 function relatedHTML(e){const rows=related(e);if(!rows.length)return '';
  return '<details class="atlas-deeper-story atlas-related"><summary><span class="atlas-deeper-ornament" aria-hidden="true">⌁</span><span><strong>Related research from this period</strong><small>'+rows.length+' additional source-linked observations</small></span><span aria-hidden="true" class="atlas-deeper-arrow">⌄</span></summary><div class="atlas-deeper-body"><p class="atlas-deeper-qualifier">These are nearby records sharing a topic and society, not automatically proof that one caused the other.</p>'+rows.map(r=>'<div class="atlas-related-entry"><strong>'+esc(r.t)+'</strong><p>'+esc(r.s)+'</p><a href="'+esc(linkFor(r))+'" target="_blank" rel="noopener noreferrer">Read cited reference ↗</a> · <a href="catalogue.html?record='+encodeURIComponent(r.i)+'">Research details ↗</a></div>').join('')+'</div></details>';
 }
 root.AtlasHistoryStories=Object.freeze({seeds:H,usedRefs,entitySeed,eventSeed,techSeed,
   forSociety:c=>render(entitySeed(c)),forEvent:e=>render(eventSeed(e))||relatedHTML(e),
   forTechnology:(t,r)=>render(techSeed(t,r)),related});
})(globalThis);