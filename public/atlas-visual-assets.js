/* Curated historical-object references; rendered imagery is delivered ONLY after
   the media Worker checks the Met object record for an open-access image. */
(function (root) {
  'use strict';
  const entries = [
    {id:451768,entities:['abbasid'],topics:[],title:'Luster Bowl with Four Camels',date:'10th century',origin:'Attributed to Iraq',type:'period artefact',fit:'contain',note:'Ceramic object from Abbasid-era Iraq; not a view of Baghdad.'},
    {id:40056,entities:['song'],topics:[],title:'Retreats in the Spring Hills',date:'First half of the 12th century',origin:'China',type:'period painting',fit:'cover',note:'A Song-era landscape painting, not a territorial map.'},
    {id:464531,entities:['byzantium'],topics:[],title:'Icon with Christ Pantokrator',date:'11th–12th century',origin:'Eastern Mediterranean',type:'period artefact',fit:'contain',note:'Religious artwork; not a portrait of the entire Eastern Roman world.'},
    {id:24832,entities:['viking'],topics:[],title:'Viking Sword',date:'10th century',origin:'Northern Europe',type:'period artefact',fit:'contain',note:'A surviving weapon; not evidence of every Viking-age community.'},
    {id:38303,entities:['angkor'],topics:[],title:'Pillar Fragment with Dancing Apsaras',date:'Late 12th–early 13th century',origin:'Khmer cultural sphere',type:'period artefact',fit:'contain',note:'Architectural sculpture associated with Khmer culture.'},
    {id:675980,entities:['wari'],topics:[],title:'Tunic',date:'650–1000 CE',origin:'Central Andes',type:'period artefact',fit:'contain',note:'A surviving Wari textile, not a depiction of a polity’s extent.'},
    {id:318662,entities:['maya','tikal','calakmul','copan','quirigua'],topics:[],title:'Vessel with Throne Scene',date:'600–900 CE',origin:'Maya cultural region',type:'period artefact',fit:'contain',note:'A Classic Maya ceramic; not specifically attested to each Maya city-state.'},
    {id:450587,entities:['ottomans'],topics:[],title:'Ottoman Army Entering a City',date:'Late 16th century',origin:'Ottoman/Safavid visual tradition',type:'historical painting',fit:'cover',note:'Interpretation of the depicted occasion is complex; do not treat as conquest evidence.'},
    {id:452104,entities:['mughal'],topics:[],title:'Madonna and Child in a Domestic Interior',date:'Early 17th century',origin:'Mughal India',type:'historical painting',fit:'cover',note:'An example of cross-cultural visual adaptation, not a generic Mughal court scene.'},
    {id:310752,entities:['benin'],topics:[],title:'Plaque with Equestrian Ọba and Attendants',date:'c. 1540–1570',origin:'Edo/Benin court',type:'period artefact',fit:'contain',note:'Royal court artwork. Explore collecting history and provenance on the museum record.'},
    {id:63404,entities:['ming'],topics:['woodblock','movable-type'],title:'Ten Bamboo Studio Manual of Painting and Calligraphy',date:'First edition printed in 1633',origin:'China',type:'surviving printed work',fit:'cover',note:'Surviving printed example, not the origin of printing.'},
    {id:42189,entities:['tang'],topics:[],title:'Horse',date:'Late 7th–early 8th century',origin:'Tang China',type:'period artefact',fit:'contain',note:'Tang ceramic horse; not a portrait of all Tang life.'},
    {id:39250,entities:['chola'],topics:[],title:'Shiva as Pashupati',date:'12th century',origin:'South India',type:'period artefact',fit:'contain',note:'Devotional sculpture, not a representation of Chola territorial boundaries.'},
    {id:50842,entities:['qing'],topics:[],title:"Vase with Women’s Activities",date:'Late 17th–early 18th century',origin:'Qing China',type:'period artefact',fit:'contain',note:'Painted ceramic showing selected activities, not a complete society account.'},
    {id:307642,entities:['aztec'],topics:[],title:'Chicomecoatl Goddess',date:'1325–1521 CE',origin:'Central Mexico',type:'period artefact',fit:'contain',note:'Mexica religious object; avoid suggesting it depicts all peoples in the Triple Alliance.'},
    {id:316486,entities:['benin'],topics:[],title:'Plaque with Portuguese Traders and Manillas',date:'c. 1540–1570',origin:'Edo/Benin court',type:'period artefact',fit:'contain',note:'Depicts Portuguese traders; use with object provenance and context.'},
    {id:449723,entities:['abbasid'],topics:[],title:'Imported Luster Bowl',date:'10th century',origin:'Iraq / archaeological find in Nishapur',type:'period artefact',fit:'contain',note:'An object evidencing circulation; its precise route cannot be inferred from one find.'},
    {id:451300,entities:[],topics:['irrigation'],title:'Design for a Clock in the Form of an Elephant',date:'1315 manuscript copy',origin:'Islamic engineering manuscript',type:'historical manuscript',fit:'contain',note:'Surviving illustration of a mechanical device; not its invention date.'},
    {id:451302,entities:[],topics:['irrigation'],title:'Design for the Water Clock of the Peacocks',date:'1315 manuscript copy',origin:'Islamic engineering manuscript',type:'historical manuscript',fit:'contain',note:'Clock design from a surviving manuscript, not an earliest invention claim.'},
    {id:209211,entities:[],topics:['compass','oceanic-navigation'],title:'Astronomical Table Clock',date:'1568',origin:'Europe',type:'period instrument',fit:'contain',note:'Historic astronomical timepiece, not a maritime compass.'},
    {id:358367,entities:[],topics:['oceanic-navigation'],title:'The Celestial Globe—Southern Hemisphere',date:'1515',origin:'Europe',type:'historical print',fit:'cover',note:'Historical astronomical image, not an Earth navigation chart.'}
  ].map(row => Object.freeze({
    ...row,
    source:'The Metropolitan Museum of Art',
    sourceUrl:'https://www.metmuseum.org/art/collection/search/'+row.id,
    imageUrl:'/atlas/media/met/'+row.id,
    alt:row.title+' ('+row.date+'), '+row.type+', '+row.origin
  }));
  const byEntity = new Map();
  const byTopic = new Map();
  for (const row of entries) {
    for (const key of row.entities) if (!byEntity.has(key)) byEntity.set(key,row);
    for (const key of row.topics) if (!byTopic.has(key)) byTopic.set(key,row);
  }
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function html(asset,variant='card') {
    if(!asset)return '';
    return '<figure class="atlas-artwork atlas-artwork--'+(variant==='reader'?'reader':variant==='tech'?'tech':'card')+'" data-atlas-object="'+asset.id+'">'+
      '<div class="atlas-artwork-picture '+(asset.fit==='cover'?'atlas-artwork-cover':'')+'"><img class="atlas-object-image" src="'+asset.imageUrl+'" loading="lazy" decoding="async" alt="'+escapeHtml(asset.alt)+'" width="480" height="340">'+
      '<div class="atlas-artwork-placeholder" aria-hidden="true"><span>✧</span><small>Historical object</small></div></div>'+
      '<figcaption><span class="atlas-artwork-label">'+escapeHtml(asset.title)+'</span><span class="atlas-artwork-date">'+escapeHtml(asset.date)+'</span>'+
      '<a href="'+asset.sourceUrl+'" target="_blank" rel="noopener noreferrer" title="'+escapeHtml(asset.note)+'">Object &amp; provenance ↗</a></figcaption></figure>';
  }
  function bindImages(parent) {
    if(!parent)return;
    parent.querySelectorAll('img.atlas-object-image').forEach(img=>{
      const fail=()=>{img.hidden=true;img.closest('.atlas-artwork')?.classList.add('atlas-artwork-fallback');};
      img.addEventListener('error',fail,{once:true});
      if(img.complete && img.naturalWidth===0)fail();
    });
  }
  root.AtlasVisualAssets=Object.freeze({
    entries:Object.freeze(entries),
    forSociety:id=>byEntity.get(id)||null,
    forTechnology:id=>byTopic.get(id)||null,
    html,
    bindImages,
    allowedObjectIds:Object.freeze([...new Set(entries.map(row=>row.id))])
  });
})(globalThis);
