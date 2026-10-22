#!/usr/bin/env python3
"""Deterministic, dependency-free Atlas bridge from the canonical master ZIP.

Usage: python3 scripts/build-master-bridge.py PATH_TO_ZIP [OUTPUT_DIRECTORY]
The canonical archive remains authoritative; the generated JS is a small read-only
browser index, not a replacement for its claims/source-claim register.
"""
import json
import re
import sys
import zipfile
import hashlib
from pathlib import Path
from collections import Counter

if len(sys.argv) not in (2, 3):
    raise SystemExit('Usage: python3 scripts/build-master-bridge.py MASTER.zip [OUTPUT_DIR]')
archive = Path(sys.argv[1]); out = Path(sys.argv[2]) if len(sys.argv) == 3 else Path('public')
out.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(archive) as z:
    root = next(name.split('data/master_catalogue.json')[0] for name in z.namelist() if name.endswith('data/master_catalogue.json'))
    records = json.loads(z.read(root + 'data/master_catalogue.json'))
    sources = {s['id']: s for s in json.loads(z.read(root + 'data/source_register.json'))}

# Each row uses stable short keys to keep this browser index light. The Research
# Explorer retains full raw records, all claims and provenance.
fields = {
    'id':'i','category':'c','title':'t','record_subtype':'k','date_text':'d',
    'start_year':'a','end_year_exclusive':'b','date_precision':'p',
    'temporal_kind':'m','region':'r','summary':'s','source_urls':'u',
    'original_ids':'o','linked_catalogue_ids':'l','review_status':'v',
    'historical_confidence':'h','notes':'n','content_warnings':'w',
    'display_group':'g','origin_context':'x','importance_tier':'q',
    'polity_geometry_permitted':'f'
}

def clean(row):
    result={}
    for long, short in fields.items():
        value=row.get(long)
        if value is None or value == '' or value == [] or value == {}:
            continue
        if long == 'source_urls':
            value=list(dict.fromkeys([u for u in value if isinstance(u,str) and u.startswith(('https://','http://'))]))[:5]
        if long == 'summary':
            value=value[:1500]
        if long == 'notes':
            value=value[:1200]
        result[short]=value
    # Source IDs remain available through the full catalogue; attach source URLs
    # here even when the original source_urls field is incomplete.
    urls=result.get('u',[])
    for sid in row.get('source_ids',[]):
        u=sources.get(sid,{}).get('url')
        if isinstance(u,str) and u.startswith(('https://','http://')) and u not in urls:
            urls.append(u)
    if urls: result['u']=urls[:5]
    return result

usable=[clean(r) for r in records if r.get('review_status')!='LEAD_ONLY' and not r.get('content_warnings')]
core=[r for r in usable if r['c'] not in ('technologies','technology_dependencies')]
tech=[r for r in usable if r['c'] in ('technologies','technology_dependencies')]

# Split at whole record boundaries. No JS source file exceeds 62 KiB so GitHub
# connectors can transfer the generated assets without truncating a huge blob.
written=[]
for kind, rows in [('core',core),('tech',tech)]:
    chunks=[]; chunk=[]; size=0
    for row in rows:
        encoded=json.dumps(row,ensure_ascii=False,separators=(',',':'))
        if chunk and size+len(encoded.encode('utf8'))+2>56000:
            chunks.append(chunk);chunk=[];size=0
        chunk.append(encoded);size+=len(encoded.encode('utf8'))+1
    if chunk:chunks.append(chunk)
    for i, batch in enumerate(chunks,1):
        content=f"(globalThis.ATLAS_MASTER_{kind.upper()}_PARTS ??= []).push(...["+','.join(batch)+"]);\n"
        path=out/f'atlas-master-{kind}-{i:02}.js'
        path.write_text(content,encoding='utf8')
        written.append({'file':path.name,'bytes':path.stat().st_size,'records':len(batch)})
manifest={
    'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
    'canonical_record_count':len(records),
    'bridge_record_count':len(usable),
    'excluded_leads':sum(r.get('review_status')=='LEAD_ONLY' for r in records),
    'excluded_sensitive':sum(r.get('review_status')!='LEAD_ONLY' and bool(r.get('content_warnings')) for r in records),
    'core_records':len(core),'technology_records':len(tech),
    'categories':dict(sorted(Counter(r['c'] for r in usable).items())),
    'chunks':written,
    'date_policy':'Preserve original date text; use midpoint for broad periods; no year invented when dates are missing',
    'location_policy':'No inferred historic borders or geocoordinates',
    'source_policy':'Original source URLs and catalogue record IDs retained; unverified leads remain in Research Explorer only'
}
(out/'atlas-master-bridge-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in manifest.items() if k not in ('chunks','categories')},indent=2))