/* Atlas display grouping. Curated classifications, not a hierarchy of cultures. */
const EMPIRE_IDS = new Set([
  'akkad','neo-assyria','persia','maurya','han','rome','gupta','byzantium',
  'ghana','tang','abbasid','angkor','mali','mongols','ottomans','inca',
  'songhai','british','sasanian','chola','song','srivijaya',
  'ming','old-babylon','hittites','kush','aksum',
  'aztec'
]);
/* This single broad Australia-wide entry describes many peoples. It must not be
   graphed as one polity continuously from prehistory to the present. */
const UNDATED_OVERVIEW_IDS = new Set(['aboriginal']);
for (const entity of CIVILISATIONS) {
  entity.kind = UNDATED_OVERVIEW_IDS.has(entity.id) ? 'overview' :
    EMPIRE_IDS.has(entity.id) ? 'empire' : 'society';
}