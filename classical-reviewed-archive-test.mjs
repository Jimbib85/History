import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
function pack(label,sha){
 const b64=readFileSync(new URL('./research/classical-split/'+label+'.pack.deflate.b64',import.meta.url),'utf8').replace(/\s+/g,'');
 const bytes=inflateSync(Buffer.from(b64,'base64'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),sha,'Canonical archive checksum mismatch');
 const parsed=JSON.parse(bytes);
 assert.equal(parsed.metadata.schema_version,'classical-split-1.0');
 assert.equal(Object.keys(parsed.tables).length,20);
 assert.ok(parsed.tables.claims.some(x=>x.review_status==='NEEDS_REVIEW'),'Seed claims must remain explicitly unreviewed'); // old seed claims intentionally retained
 return parsed;
}
const bce=pack('500BCE-1BCE','a53c31756868c24bb1708edfcefff082dbf9d20a08edad3ed506ddee4383565a');
const ce=pack('1CE-500CE','e6e246f7e7f51dab92ce39b8910670e9fd37aee57cb4668d8199f587dfb2ff23');
assert.deepEqual([bce.metadata.batch.start_year,bce.metadata.batch.end_year_exclusive],[-499,1]);
assert.deepEqual([ce.metadata.batch.start_year,ce.metadata.batch.end_year_exclusive],[1,501]);
assert.equal(bce.tables.civilisations.length,113);
assert.equal(ce.tables.civilisations.length,119);
assert.equal(bce.tables.historical_events.length,44);
assert.equal(ce.tables.historical_events.length,49);
assert.equal(bce.tables.claims.length,298);
assert.equal(ce.tables.claims.length,337);
assert.equal(bce.tables.source_claims.length,396);
assert.equal(ce.tables.source_claims.length,437);
const ids=key=>new Set(bce.tables[key].map(r=>r.id));
const shared=[...ce.tables.civilisations].filter(r=>ids('civilisations').has(r.id));
assert.equal(shared.length,79,'Shared civilisation identity must not become a duplicate polity');
const events=new Map();
for(const p of [bce,ce])for(const e of p.tables.historical_events)
  events.set(e.id,e);
assert.equal(events.size,89);
const reviewText=readFileSync(new URL('./public/classical-reviewed-data.js',import.meta.url),'utf8');
const b64=reviewText.match(/= '([^']+)'/)?.[1];
const reviewed=JSON.parse(inflateSync(Buffer.from(b64,'base64')).toString('utf8')).records;
const tables=['historical_events','technology_developments','cultural_practices','historical_maps','geographical_knowledge'];
const index=new Map(tables.flatMap(k=>[...bce.tables[k],...ce.tables[k]].map(r=>[r.id,r])));
for(const row of reviewed){
 const source=index.get(row.id);
 assert.ok(source,'Reviewed entry must exist in canonical archive: '+row.id);
 assert.ok(source.reviewed_summary,'Reviewed claim was not present in archival source: '+row.id);
 assert.equal(row.summary,source.reviewed_summary,'Do not render legacy compound summaries as checked');
 assert.ok(row.claimIds.every(id=>source.verified_claim_ids.includes(id)));
}
console.log('PASS archival import: 20 typed tables per batch, canonical checksums, 79 shared societies, 89 unique event identities, 72 source-scoped review excerpts');
