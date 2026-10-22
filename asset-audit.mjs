/* A transparent asset budget for the new discovery page; does not pretend to measure network latency. */
import assert from 'node:assert/strict';import {statSync,readFileSync} from 'node:fs';
const size=name=>statSync(new URL('./public/'+name,import.meta.url)).size;
const html=readFileSync(new URL('./public/discover.html',import.meta.url),'utf8');
const core=['discover.html',...new Set([...html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]).filter(f=>/\.(js|css)$/.test(f)&&!f.includes('://')))];
const bytes=core.reduce((n,f)=>n+size(f),0);
const archives=['research-1000-1499.js','research-1500-2026-data.js','research-classical-data.js']
  .reduce((n,f)=>n+size(f),0);
assert.ok(bytes<115*1024,'Discovery should remain below 115 KiB before network compression');
assert.ok(bytes<archives*.16,'Discovery should load less than 16% of the corresponding archive data bytes');
console.log('PASS discovery asset size: '+(bytes/1024).toFixed(1)+' KiB first-party page assets vs '+(archives/1024).toFixed(1)+' KiB raw research archives. Network paint/time not measured.');
