/* Personal Compare row ordering, persisted in this browser; no account or backend. */
(() => {
  'use strict';
  const STORAGE_KEY = 'world-history-atlas-compare-order-v1';
  const chart = document.getElementById('comparisonChart');
  if (!chart) return;
  const byId = new Map(CIVILISATIONS.map(c => [c.id, c]));
  let order = {society: [], empire: []};
  let pendingFocus = null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      for (const type of ['society', 'empire']) {
        if (Array.isArray(saved[type])) order[type] = [...new Set(saved[type].filter(id => typeof id === 'string' && byId.has(id) && byId.get(id).kind === type))];
      }
    }
  } catch (_) { /* Private browsing may block storage. Ordering still works until refresh. */ }
  const hasOrder = () => order.empire.length + order.society.length > 0;
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch (_) {} };
  const compare = (a, b) => {
    if (!hasOrder() || a.kind !== b.kind) return null;
    const set = order[a.kind] || [];
    const ia = set.indexOf(a.id), ib = set.indexOf(b.id);
    if (ia < 0 && ib < 0) return null;
    if (ia < 0) return 1;
    if (ib < 0) return -1;
    return ia - ib;
  };
  const sort = rows => { if (!hasOrder()) return rows; rows.sort((a, b) => compare(a, b) ?? 0); return rows; };
  function currentPeers(id) {
    const entity = byId.get(id);
    if (!entity) return [];
    const lane = [...chart.querySelectorAll('.lane')].find(x => x.dataset.orderLane === id);
    if (!lane) return [];
    const mode = window.HistoryCompare?.state?.mode;
    const region = ['overlap','regions'].includes(mode) ? entity.region : null;
    return [...chart.querySelectorAll('.lane[data-order-lane]')].filter(x => {
      const c = byId.get(x.dataset.orderLane);
      return c && c.kind === entity.kind && (!region || c.region === region);
    }).map(x => x.dataset.orderLane);
  }
  function move(id, delta, targetId) {
    const c = byId.get(id), t = targetId && byId.get(targetId);
    if (!c || (t && t.kind !== c.kind)) return;
    const peers = currentPeers(id);
    const src = peers.indexOf(id), dst = targetId ? peers.indexOf(targetId) : src + delta;
    if (src < 0 || dst < 0 || dst >= peers.length || src === dst) return;
    peers.splice(src, 1);
    peers.splice(dst, 0, id);
    const known = order[c.kind].filter(x => !peers.includes(x));
    order[c.kind] = [...peers, ...known];
    save();
    if (!targetId) pendingFocus = {id, direction:delta < 0 ? 'up' : 'down'};
    window.HistoryCompare?.render();
  }
  function decorate() {
    chart.querySelectorAll('.lane').forEach(lane => {
      const link = lane.querySelector('.lane-name[data-civ]');
      const id = link?.dataset.civ;
      if (!id || !byId.has(id)) return;
      lane.dataset.orderLane = id;
      if (lane.querySelector('.lane-order-controls')) return;
      const controls = document.createElement('div');
      controls.className = 'lane-order-controls';
      controls.innerHTML = '<button type="button" draggable="true" class="lane-drag-handle" data-order-drag="'+id+'" aria-label="Drag to reorder '+byId.get(id).name.replace(/["<>]/g,'')+'" title="Drag to reorder">⠿</button><div class="lane-nudges"><button type="button" data-order-up="'+id+'" aria-label="Move '+byId.get(id).name.replace(/["<>]/g,'')+' up" title="Move up">↑</button><button type="button" data-order-down="'+id+'" aria-label="Move '+byId.get(id).name.replace(/["<>]/g,'')+' down" title="Move down">↓</button></div>';
      lane.prepend(controls);
    });
    // Decoration runs after chart rendering; return keyboard focus to the moved row then.
    if (pendingFocus) {
      const key = pendingFocus.direction === 'up' ? 'orderUp' : 'orderDown';
      const focus = [...chart.querySelectorAll('[data-order-up],[data-order-down]')].find(button => button.dataset[key] === pendingFocus.id);
      focus?.focus({preventScroll:true});
      pendingFocus = null;
    }
  }
  chart.addEventListener('click', e => {
    const up = e.target.closest('[data-order-up]'), down = e.target.closest('[data-order-down]');
    if (up || down) {
      e.preventDefault(); e.stopPropagation();
      move(up?.dataset.orderUp || down.dataset.orderDown, up ? -1 : 1);
    }
  });
  let dragged = null;
  chart.addEventListener('dragstart', e => {
    const handle = e.target.closest('[data-order-drag]');
    if (!handle) return;
    dragged = handle.dataset.orderDrag;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragged);
  });
  chart.addEventListener('dragover', e => {
    const row = e.target.closest('.lane[data-order-lane]');
    if (!dragged || !row) return;
    const source = byId.get(dragged), dest = byId.get(row.dataset.orderLane);
    if (!source || !dest || source.kind !== dest.kind || (['overlap','regions'].includes(window.HistoryCompare?.state?.mode) && source.region !== dest.region)) return;
    e.preventDefault();e.dataTransfer.dropEffect = 'move';
    chart.querySelectorAll('.lane-drop-target').forEach(el=>el.classList.remove('lane-drop-target'));
    row.classList.add('lane-drop-target');
  });
  chart.addEventListener('drop', e => {
    const row = e.target.closest('.lane[data-order-lane]');
    if (dragged && row) {e.preventDefault();move(dragged,0,row.dataset.orderLane);}
    dragged = null;
    chart.querySelectorAll('.lane-drop-target').forEach(el=>el.classList.remove('lane-drop-target'));
  });
  chart.addEventListener('dragend', () => { dragged = null;chart.querySelectorAll('.lane-drop-target').forEach(el=>el.classList.remove('lane-drop-target')); });
  const reset = document.createElement('button');
  reset.type='button'; reset.id='resetRowOrder'; reset.className='row-order-reset';
  reset.textContent='↕ Reset row order'; reset.title='Return to automatic ordering and clear saved custom order';
  reset.addEventListener('click', () => { order = {society:[],empire:[]};save();window.HistoryCompare?.render(); });
  const toolbar = document.querySelector('.zoom-controls');
  if(toolbar) toolbar.append(reset);
  const caption=document.createElement('span');caption.className='row-order-caption';caption.textContent='⠿ Drag rows or use ↑↓. Your order is saved in this browser.';
  const legend=document.querySelector('.chart-bottom');if(legend) legend.append(caption);
  const observer = new MutationObserver(() => decorate());
  observer.observe(chart,{childList:true});
  // First render already happened in compare.js; persisted order is applied on this second render.
  window.HistoryRowOrder = {sort,compare,move,reset:()=>reset.click(),get order(){return order;}};
  if (hasOrder()) window.HistoryCompare?.render();
  decorate();
})();
