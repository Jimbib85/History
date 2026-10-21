/* Every link is curated rather than inferred from date ordering.
   Links illustrate broad historical traditions and knowledge movement, never a proven person-to-person journey. */
const TECH_PATHWAYS = [
  {
    tech:'paper', from:'tang', to:'abbasid', type:'regional',
    label:'Through Central Asian and Islamic networks',
    detail:'Paper and papermaking spread west through complex networks of trade, craft and cultural exchange. This is a broad regional pathway, not proof of a direct Tang-to-Baghdad handover or a single Battle of Talas origin story.',
    source:'https://www.spurlock.illinois.edu/events/event.php?ID=250'
  },
  {
    tech:'paper', from:'abbasid', to:'medieval-europe', type:'regional',
    label:'Mediterranean and Iberian transmission',
    detail:'Papermaking became established in Islamic lands and later reached European workshops through multiple Mediterranean networks. The route shown connects representative societies, not a literal historical itinerary.',
    source:'https://paper.gatech.edu/early-papermaking'
  },
  {
    tech:'zero', from:'abbasid', to:'medieval-europe', type:'documented',
    label:'Hindu-Arabic arithmetic enters European scholarship',
    detail:'Mathematical methods developed in India and developed further in Arabic-language scholarship became known to European readers. Fibonacci was one important figure, not the sole transmitter.',
    source:'https://www.britannica.com/biography/Fibonacci'
  },
  {
    tech:'woodblock', from:'tang', to:'song', type:'continuity',
    label:'Chinese printing tradition continues',
    detail:'Woodblock printing developed across successive dynasties. This connection illustrates technical continuity within a broad region, not transmission between independent civilisations.',
    source:'https://www.britannica.com/technology/printing-publishing'
  }
];