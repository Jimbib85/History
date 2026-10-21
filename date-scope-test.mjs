import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
await import('./public/date-scope.js');
const {year,label} = globalThis.AtlasDateScope;
assert.equal(year(0),'1 BCE');
assert.equal(year(-499),'500 BCE');
assert.equal(year(1),'1 CE');
assert.match(label({start:500,end:999,periodScope:'research-window'}),/^Research coverage: 500 CE – 999 CE \(not a complete lifespan\)$/);
assert.match(label({start:1000,end:1499,periodScope:'source-range'}),/^Source-dated range: .*not necessarily a complete lifespan/);
assert.equal(label({start:-499,end:500}), '500 BCE – 500 CE');
assert.equal(label({start:null,end:100}), 'Dates not established');
for (const name of ['index','compare']) {
  const page=readFileSync(`public/${name}.html`,'utf8');
  assert.match(page,/<script src="date-scope\.js\?v=0\.13\.0"><\/script>/);
  assert.ok(page.indexOf('date-scope.js') < page.indexOf(name === 'index'?'app.js?v=':'compare.js?v='), `${name}: date helper should load before reader`);
}
for (const name of ['app','compare']) {
  const code=readFileSync(`public/${name}.js`,'utf8');
  assert.match(code,/AtlasDateScope\?\.label/);
}
console.log('Date-scope labels and consumer loading: passed');
