/* Evidence-first atlas: works only with the research records and source URLs already in the repository. */
(function(root){
  'use strict';
  const yearText=y=>y<=0?String(1-y)+' BCE':String(y)+' CE';
  const safeUrl=u=>{try{const x=new URL(String(u));return /^https?:$/.test(x.protocol)?x.href:null;}catch(_){return null;}};
  const firstYear=(...values)=>values.find(Number.isFinite)??null;
  const sourceArray=record=>Array.isArray(record.source_ids)?record.source_ids:[];
  const featuredImages={'map_ptolemy_geography':'ptolemy','map_kangnido':'kangnido','map_framauro':'fra-mauro'};
  function build(packs,entities,curatedMaps){
    const names=new Map((entities||[]).map(e=>[e.id,e.name]));
    const sources=new Map(),maps=[],knowledge=[],relationships=[];
    const archives=packs||[];
    for(const {scope,pack} of archives){
      if(!pack)continue;
      const catalog=new Map((pack.source_register||[]).map(s=>[s.id,s]));
      function getSources(record){
        const rows=sourceArray(record).map(id=>{
          const s=catalog.get(id);return {id,title:s?.title||id,url:safeUrl(s?.url),
            access:s?.access_status||'Source register entry; verification not specified'};
        });
        for(const url of (record.source_urls||[])){
          const href=safeUrl(url);if(href&&!rows.some(s=>s.url===href))rows.push({id:href,title:'Research source',url:href,access:'Linked source; item-level verification not implied'});
        }
        return rows;
      }
      for(const m of (pack.historical_maps||[])){
        const year=firstYear(m.composition_earliest_year,m.original_composition_year,m.year_composed_earliest);
        const endYear=firstYear(m.composition_latest_year,m.original_composition_year,m.year_composed_latest,year);
        const imageRef=curatedMaps?.[featuredImages[m.id]];
        maps.push({
          id:scope+':'+m.id,rawId:m.id,scope,title:m.title,year,endYear,
          type:m.representation_type||m.map_kind||'Catalogued map or atlas',
          objectDate:m.surviving_object_date||m.object_date_note||m.physical_object_date_label||'Object date requires item-level review',
          contentDate:m.intellectual_content_date_label||m.surviving_object_year||null,
          place:m.region||m.repository||m.holding_or_link||'Location not specified',
          description:m.summary||m.description||m.content_scope||'Bibliographic map record',
          warning:m.worldview_caution||m.reproduction_status||m.copyright_reuse||'Do not assume this record represents a universal worldview',
          confidence:m.confidence||'NOT_ASSESSED',
          associated:[...(m.associated_society_ids||[]),...(m.associated_society_id?[m.associated_society_id]:[])],
          image:imageRef&&safeUrl(imageRef.image)?imageRef.image:null,
          imagePage:imageRef?safeUrl(imageRef.page):null,
          sources:getSources(m),recordKind:'map'
        });
      }
      for(const k of (pack.geographical_knowledge||[])){
        const level=String(k.knowledge_level||k.evidence_layer||'unknown').toLowerCase();
        const certainty=(level.startsWith('a')||level==='attested')?'attested':
          (level.startsWith('b')||level==='inferred')?'inferred':'unsupported';
        knowledge.push({
          id:scope+':'+k.id,scope,title:k.title||k.region_or_place||k.description?.slice(0,80)||'Geographical knowledge',
          description:k.summary||k.description||k.evidence_basis||'No summary supplied',
          area:k.known_geographic_scope||k.region_or_place||'Geographic scope not specified',
          caveat:k.scope_warning||k.notes||'One record does not describe the knowledge of everyone in a society',
          confidence:k.confidence||'NOT_ASSESSED',certainty,year:firstYear(k.start_year),endYear:firstYear(k.end_year_exclusive),
          associated:k.society_id?[k.society_id]:[],sources:getSources(k),recordKind:'knowledge'
        });
      }
      for(const rel of (pack.relationships||[])){
        const from=rel.source_society_id||rel.society_a_id;
        const to=rel.target_society_id||rel.society_b_id;
        const type=String(rel.relationship_type||'relationship');
        const comparisonOnly=/simultaneity|contemporaneity|parallel_/i.test(type);
        const indirect=/indirect|regional_exchange|shared_heritage|diffusion/i.test(type)||rel.direct_contact_proven===false;
        const direct=rel.direct_contact_proven===true||rel.direction_evidence==='direct';
        const assessment=comparisonOnly?'Contemporaneity only — no contact implied':direct?'Direct contact recorded':
          indirect?'Indirect or regional evidence — no direct route implied':'Recorded relationship — specific route not established';
        relationships.push({
          id:scope+':'+rel.id,scope,title:(names.get(from)||from||'Unknown group')+' / '+(names.get(to)||to||'Unknown group'),
          type:type.replaceAll('_',' '),assessment,
          description:rel.description||rel.summary||'The source record does not include explanatory detail',
          confidence:rel.confidence||'NOT_ASSESSED',
          year:firstYear(rel.start_year),endYear:firstYear(rel.end_year_exclusive),
          associated:[from,to].filter(Boolean),sources:getSources(rel),
          comparisonOnly,direct,recordKind:'relationship'
        });
      }
    }
    const byTime=(a,b)=>(a.year??Infinity)-(b.year??Infinity)||a.title.localeCompare(b.title);
    maps.sort(byTime);knowledge.sort(byTime);relationships.sort(byTime);
    function filter(records,{society='all',period='all',year=1200,search='',includeUnsupported=false}={}){
      const needle=String(search||'').toLocaleLowerCase().trim();
      return records.filter(r=>{
        if(r.recordKind==='knowledge'&&r.certainty==='unsupported'&&!includeUnsupported)return false;
        if(society!=='all'&&!r.associated.includes(society))return false;
        if(period==='near'){
          if(!Number.isFinite(year)||!Number.isFinite(r.year))return false;
          const hi=r.endYear??(r.endYear===0?0:null);
          const end=(hi??r.endYear??r.year);
          if(r.year>year+125 || (Number.isFinite(end)?end-1:r.year)<year-125)return false;
        }
        if(!needle)return true;
        return [r.title,r.description,r.type,r.area,r.place,r.assessment,r.warning,r.scope,
          ...r.associated.map(id=>names.get(id)||id)].filter(Boolean).join(' ').toLocaleLowerCase().includes(needle);
      });
    }
    const societies=new Map();
    for(const r of [...maps,...knowledge,...relationships])for(const id of r.associated)
      if(!societies.has(id))societies.set(id,names.get(id)||id.replace(/[_-]/g,' '));
    return Object.freeze({maps,knowledge,relationships,filter,yearText,safeUrl,societies,
      stats:{maps:maps.length,knowledge:knowledge.length,relationships:relationships.length,
        unsupported:knowledge.filter(k=>k.certainty==='unsupported').length}});
  }
  root.WorldViewModel=Object.freeze({build,yearText,safeUrl});
})(typeof window!=='undefined'?window:globalThis);
