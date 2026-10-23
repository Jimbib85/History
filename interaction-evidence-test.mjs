import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('./public/interaction-evidence.js',import.meta.url),'utf8');
const html=readFileSync(new URL('./public/interactions.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('./public/interactions.js',import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(source,context);
const model=context.AtlasInteractionEvidence;
assert.ok(model,'Evidence model is available without a browser');
const societies=new Map([['rome',{name:'Rome'}],['parthia',{name:'Parthia'}],['han',{name:'Han dynasty'}],['sassanid',{name:'Sasanian Empire'}]]);
const rows=[
 {key:'a',year:200,type:'Trade',title:'Recorded merchants',kind:'trade',participants:['rome','parthia','parthia']},
 {key:'b',year:210,type:'Conflict',title:'Historical encounter',kind:'war',participants:['rome','parthia']},
 {key:'c',year:230,type:'Knowledge',title:'Copied texts',kind:'knowledge',participants:['rome','han']},
 {key:'d',year:450,type:'Diplomacy',title:'Later agreement',kind:'diplomacy',participants:['parthia','han']},
 {key:'e',year:500,type:'Trade',title:'Another record',kind:'trade',participants:['rome','sassanid']}
];
const all=model.filter(rows,{start:150,end:260});
assert.equal(all.length,3);
assert.equal(model.filter(rows,{start:150,end:260,focus:'rome',partner:'parthia'}).length,2);
assert.equal(model.filter(rows,{start:150,end:260,focus:'rome',partner:'han',type:'Trade'}).length,0);
assert.equal(model.filter(rows,{start:150,end:260,focus:'rome',partner:'parthia',search:'merchants',societyNames:societies}).length,1);
assert.equal(model.filter(rows,{start:150,end:260,focus:'rome',partner:'parthia',search:'sasanian',societyNames:societies}).length,0);
assert.equal(model.filter(rows,{start:150,end:260,partner:'han'}).length,0,'A partner alone must not create an unscoped pair');
const partners=model.partners(all,'rome',societies);
assert.equal(partners.length,2);
assert.equal(partners[0].id,'parthia');
assert.equal(partners[0].count,2,'Duplicated participant IDs in one record count once');
assert.equal(partners[0].from,200);
assert.equal(partners[0].to,210);
assert.equal(partners[1].id,'han');
assert.equal(model.partners(all,'sassanid',societies).length,0);
const timeline=model.timeline(rows,150,260,12);
assert.equal(timeline.length,12);
assert.equal(timeline.reduce((sum,b)=>sum+b.count,0),3);
assert.ok(timeline.every(b=>b.start<=b.end));
assert.match(html,/id="interactionSociety"/);
assert.match(html,/id="interactionPartners"/);
assert.match(html,/id="interactionTimeRibbon"/);
assert.ok(html.indexOf('interaction-evidence.js')<html.indexOf('interactions.js'));
assert.match(html,/Choose a society to explore its connections/);
assert.match(ui,/data-network-partner/);
assert.match(ui,/interactionTimeRibbon.*addEventListener/);
assert.match(ui,/query\.set\('with',state\.partner\)/);
console.log('PASS interaction evidence explorer: scoped society pairs, dated partner counts, accessible time navigation and caveat preservation');
