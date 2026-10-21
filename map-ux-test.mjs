import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const publicDirectory = new URL('./public/', import.meta.url);
const readPublic = file => fs.readFileSync(new URL(file, publicDirectory), 'utf8');
const html = readPublic('index.html');
const applicationScripts = new Set(['story-navigation.js', 'app.js', 'technology-tree.js']);
const dataScripts = [...html.matchAll(/<script src="([^"?]+)[^"]*"/g)]
  .map(match => match[1])
  .filter(file => !applicationScripts.has(file));

// This fixture checks complete-data rendering and data integrity. Native disclosure,
// keyboard, focus and responsive layout behavior are verified in the browser.
class FixtureElement {
  constructor() {
    this.style = {};
    this.dataset = {};
    this.classList = {toggle() {}, add() {}, remove() {}};
    this.innerHTML = '';
    this.listeners = {};
  }
  addEventListener(event, handler) { this.listeners[event] = handler; }
  querySelectorAll() { return []; }
  querySelector() { return null; }
  setAttribute() {}
}

const elementIds = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
const elements = Object.fromEntries(
  [...elementIds, 'sameYearButton'].map(id => [id, new FixtureElement()])
);
const location = {href:'https://example.com/index.html', search:''};
const window = {
  location,
  history:{replaceState() {}},
  matchMedia:() => ({matches:false})
};
const document = {
  getElementById:id => elements[id],
  querySelectorAll:() => [],
  addEventListener() {}
};
const context = vm.createContext({
  window, document, location, URL, URLSearchParams,
  HTMLInputElement:FixtureElement, console
});

for (const file of dataScripts) {
  vm.runInContext(readPublic(file), context, {filename:file});
}
const dataSnapshot = () => vm.runInContext(`JSON.stringify({
  entities:CIVILISATIONS,
  events:EVENTS,
  researchEvents:ATLAS_RESEARCH_EVENTS,
  medieval:ATLAS_MEDIEVAL_PACK,
  classical:ATLAS_CLASSICAL_PACK,
  modern:ATLAS_MODERN_PACK
})`, context);
const before = dataSnapshot();
vm.runInContext(readPublic('app.js'), context, {filename:'app.js'});

const atlas = window.WorldHistoryAtlas;
const escapeHtml = text => String(text).replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[character]));

// Every imported entity must be reachable without unbounded catalogue expansion.
for (const entity of atlas.civilisations) {
  atlas.selectCiv(entity.id);
  assert(
    elements.storyPanel.innerHTML.includes(escapeHtml(entity.name)),
    'Selected entity did not render: ' + entity.id
  );
  const contemporarySection = elements.civilisationList.innerHTML
    .split('<section class="catalogue-current">')[1]
    .split('</section>')[0];
  const displayedEntries = (contemporarySection.match(/data-civ=/g) || []).length;
  assert(displayedEntries <= 8, 'Catalogue exceeded its initial batch for ' + entity.id);
}

atlas.go({year:528, civ:'silla'});
assert(
  elements.storyPanel.innerHTML.includes('528 CE or 552 CE'),
  'Competing Silla dates must not become a continuous interval'
);
assert(
  elements.storyPanel.innerHTML.includes('https://www.metmuseum.org/ja/toah/ht/06/eak'),
  'An attached research source must remain accessible in the reader'
);
assert(
  elements.storyPanel.innerHTML.includes('Background reading') &&
  elements.storyPanel.innerHTML.includes('Record source'),
  'Entity background and record sources must remain distinguishable'
);

atlas.go({year:538, civ:'yamato_japan'});
assert(
  elements.storyPanel.innerHTML.includes('538 CE or 552 CE'),
  'Traditional Yamato alternatives must retain their date distinction'
);

atlas.go({year:200, civ:'rome'});
assert(
  elements.storyPanel.innerHTML.includes('Urban housing across Roman social strata'),
  'Classical daily-life evidence was lost from the compact reader'
);

atlas.go({year:1010, civ:'chola'});
assert(
  elements.storyPanel.innerHTML.includes('Rajaraja I'),
  'Medieval figure evidence was lost from the compact reader'
);
assert.equal(dataSnapshot(), before, 'Map rendering mutated imported research data');

console.log(
  'PASS Map UX: ' + atlas.civilisations.length +
  ' entities rendered; bounded catalogue batches, alternative dates, linked sources,' +
  ' classical and medieval evidence, and unchanged research data.'
);
