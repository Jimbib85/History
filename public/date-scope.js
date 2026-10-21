/* Historical date labels: research coverage is not a society's actual lifespan. */
(function(root) {
  'use strict';
  const year = value => value <= 0 ? `${1-value} BCE` : `${value} CE`;
  function label(entity) {
    if (!entity || !Number.isFinite(entity.start) || !Number.isFinite(entity.end)) return 'Dates not established';
    const dates = `${year(entity.start)} – ${year(entity.end)}`;
    if (entity.periodScope === 'research-window') return `Research coverage: ${dates} (not a complete lifespan)`;
    if (entity.periodScope === 'source-range') return `Source-dated range: ${dates} (not necessarily a complete lifespan)`;
    return dates;
  }
  root.AtlasDateScope = Object.freeze({year,label});
})(globalThis);
