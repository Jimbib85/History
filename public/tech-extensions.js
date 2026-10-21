/* Additional examples are individually sourced. Dates are illustrative evidence points. */
Object.assign(TECH_SOURCES, {
  royalroad:'https://www.iranicaonline.org/articles/achaemenid-dynasty/achaemenid-dynasty-ii-the-empire/',
  romanroads:'https://www.worldhistory.org/article/758/roman-roads/',
  incaroads:'https://whc.unesco.org/en/list/1459/',
  mohenjo:'https://whc.unesco.org/en/list/138/',
  aqueduct:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7004096/',
  angkorsource:'https://whc.unesco.org/en/list/668/'
});
TECHNOLOGIES.push(
  tech('road-networks','navigation','Road and courier networks','Ancient to early modern',
    'Long-distance roads and relay systems were developed in many regions. These examples represent different engineering traditions, not a single shared invention.', [], [
      ['persia',-500,'developed','Persian Royal Road','The Achaemenid administration maintained routes and royal post stations connecting imperial centres.','royalroad'],
      ['rome',100,'developed','Roman road network','Roman engineers expanded hard-surfaced roads for military, administrative and civil travel.','romanroads'],
      ['inca',1490,'developed','Qhapaq Nan','Andean road systems, partly built upon older regional routes, were expanded under Inca rule.','incaroads']
    ]),
  tech('urban-water','food','Urban water engineering','Bronze Age onward',
    'Urban water provision, wastewater removal and canal systems addressed different needs. Similar-looking infrastructure is not proof of direct transmission.', [], [
      ['indus',-2500,'attested','Mohenjo-daro drainage','Planned streets, wells and drainage systems are documented in Indus urban archaeology.','mohenjo'],
      ['rome',100,'developed','Roman aqueducts','Gravity-fed aqueduct systems delivered water to Roman cities and public buildings.','aqueduct'],
      ['angkor',1100,'developed','Angkor hydraulic landscape','Khmer reservoirs, basins, dykes and canals formed an extensive engineered water landscape.','angkorsource']
    ])
);