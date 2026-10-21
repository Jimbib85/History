# World History Atlas Research Pack: 500 BCE–500 CE

## Executive summary

The useful research window is **500 BCE–500 CE**, but it should not be described as “the Roman Empire period” without qualification. At the opening boundary Rome was still a republic; the conventional beginning of the imperial Principate is **27 BCE**, when Octavian received the title Augustus. Likewise, **476 CE marks the deposition of the last western emperor, not the extinction of the Roman Empire**: imperial government continued from Constantinople. Recent scholarship also treats Rome's fifth-century transformation less as a single catastrophic “fall” than as a set of political, economic and regional changes with very different chronologies. citeturn16search9turn19search2turn12search4turn12search11

I have therefore treated **500 BCE–500 CE as a global macro-window**, deliberately retaining predecessor and successor records when they are necessary to explain developments inside it. This follows the World History Atlas requirement to preserve cross-boundary events, distinguish political collapse from cultural disappearance, model uncertainty explicitly and build reusable rather than merely narrative records. fileciteturn0file0

This period is exceptionally good for the Atlas because it contains several large but substantially independent historical systems at the same time: Classical and Hellenistic Mediterranean societies followed by Rome; Achaemenid, Parthian and Sasanian Iran; Mauryan, Kushan, Satavahana and Gupta South Asia; Qin and Han China followed by several centuries of political division; Aksum and Meroitic Kush in northeast Africa; the Korean Three Kingdoms and Yayoi/Kofun Japan; early states and trading centres in Southeast Asia; Hopewell networks in North America; Teotihuacan, Monte Albán and Maya polities in Mesoamerica; and Nazca, Moche and early Tiwanaku traditions in the Andes. citeturn16search1turn16search0turn16search4turn19search4turn19search5turn19search12turn4search1turn1search3turn8search3

The most important interpretive point is that **this was not yet one connected “world system”**. Rome, India, Central Asia, China, Arabia and East Africa were linked through overlapping terrestrial and maritime exchange networks, often through intermediaries. The Americas developed urban, political, agricultural and technological traditions independently of these Old World networks. There is no credible evidence in the sources researched here for Roman–American or Han–American contact. The mid-first-century *Periplus Maris Erythraei* directly describes commercial routes from Roman Egypt along East Africa, around Arabia and to India, while Chinese geographical traditions such as the *Weilue* record increasingly elaborate knowledge of distant western regions including Da Qin, the Roman world. citeturn17view4turn17view5

I have also produced an import-oriented **seed dataset** rather than pretending this first pass satisfies the specification's demand for exhaustive global coverage. It currently contains **48 societies, 29 events, 12 technology records, 14 intersocietal relationships, 10 historical figures, 15 mapped locations, 4 synchronistic connection cards, 3 geographical-knowledge records, 30 source-register entries and 12 explicit research gaps**. These are deliberately conservative: records for which I did not yet obtain adequate source depth are flagged rather than padded with fabricated detail.

[Download the complete JSON/CSV/JSONL seed pack](sandbox:/mnt/data/world_history_atlas_500BCE_500CE_seed_pack.zip)

[Download the master JSON](sandbox:/mnt/data/world_history_atlas_500BCE_500CE/world_history_atlas_500BCE_500CE.json)

## Scope, chronology and historical model

### Machine-readable period boundaries

For the application, I recommend treating the thousand-year macro-period as two adjacent 500-year research partitions while presenting them seamlessly to users:

| Research partition | Astronomical interval | Human-readable interval | Rule |
|---|---:|---|---|
| Early half | `[-499, 1)` | 500 BCE–1 BCE | Includes astronomical year 0 = 1 BCE |
| Late half | `[1, 501)` | 1–500 CE | Includes year 500 CE |
| Atlas macro-view | `[-499, 501)` | 500 BCE–500 CE | Combined comparative view |

This preserves the project's astronomical-year rule and uses half-open intervals, so there is neither a duplicate nor a missing year at the BCE/CE transition. Cross-boundary entities are retained with their actual start and end ranges rather than clipped to the research window, as required by the Atlas specification. fileciteturn0file0

### The Roman spine of the period

Rome is useful as a chronological spine, but it should not become the organising principle for the rest of world history.

Around 500 BCE, Rome was one among a number of societies in the central Mediterranean while the Achaemenid Empire dominated much of West Asia, Classical Greek political communities were developing, and Carthage was the major Punic power of the western Mediterranean. The Greek Classical period is conventionally placed around 480–323 BCE, followed by the Hellenistic period after Alexander; the Achaemenid state lasted to about 330 BCE, while Carthage survived until Roman destruction of the city in 146 BCE. citeturn16search8turn16search1turn16search2

Alexander's conquests in the late fourth century BCE destroyed Achaemenid imperial rule and produced a successor landscape that included the Seleucid monarchy in much of western Asia and Ptolemaic Egypt. Alexander defeated Darius III at Issus in 333 BCE; after Alexander's death, Hellenistic successor kingdoms divided his conquests. citeturn16search6turn16search1

The Roman Republic's eastern and western expansion then transformed the Mediterranean. Rome destroyed Carthage in 146 BCE, Greek mainland territories came under Roman rule in the same general period, and the bequest of Pergamon in 133 BCE provided Rome with a major foothold in Asia Minor. Roman expansion did not erase local languages, religions or institutions; the Atlas should therefore model “Roman province”, “local population/culture” and “city” as separable layers. citeturn16search2turn16search8turn16search6

Octavian's victory over Antony and Cleopatra in 31 BCE was followed by the end of Ptolemaic Egypt and, in **27 BCE**, the political settlement conventionally used to mark Augustus and the Roman imperial period. citeturn19search6turn16search9

Late antiquity likewise needs to be represented as transformation rather than a single “fall”. Constantinople was established as New Rome in 330; Roman forces suffered a major defeat near Adrianople in 378; after Theodosius I died in 395, eastern and western imperial courts became a durable division; Rome was sacked in 410; Vandals established control in North Africa during 429–439; and Odoacer deposed Romulus Augustulus in Italy in 476. Eastern Roman imperial government, however, persisted from Constantinople. citeturn19search2turn19search8turn19search9

For the application, **476 CE should therefore be encoded as**:

```text
event_type: western_imperial_office_termination
region: Italy / Western Roman imperial court
historical_significance: HIGH
civilisation_extinction: false
eastern_roman_continuity: true
```

That is materially more accurate than a user-facing event called simply “Roman Empire falls”. Modern late-antique scholarship explicitly questions clean-break narratives and single-cause explanations of Rome's end. citeturn12search4turn12search11

## The world alongside Rome

The table below is the core civilisation-coverage matrix. It intentionally mixes states, city-state systems, archaeological cultures and interaction spheres because forcing every society into the category “empire” would badly distort the evidence.

| Region | Major societies or systems inside the window | Approximate chronological position | Atlas interpretation |
|---|---|---|---|
| Mediterranean Europe | Classical Greek poleis; Macedonia; Hellenistic states; Roman Republic; Roman Empire; Western Roman imperial court | Greek Classical c. 480–323 BCE; Hellenistic c. 323–31 BCE; imperial Rome from 27 BCE | Do not collapse Greek, Hellenistic and Roman layers into a single “Greco-Roman civilisation”. citeturn16search8turn16search9 |
| Western North Africa | Carthage; Numidia; Roman African provinces; Vandal Kingdom | Carthage to 146 BCE; Numidia 202–46 BCE; Vandal kingdom from 439 CE | Political succession occurs over persistent Punic, Berber/Amazigh, Romanised and other populations. citeturn16search2turn19search8 |
| Iran and Mesopotamia | Achaemenid Empire; Seleucid rule; Parthian/Arsacid Empire; Sasanian Empire | Achaemenid to 330 BCE; Parthian 247 BCE–224 CE; Sasanian from 224 CE | A major imperial sequence parallel to Rome, not a peripheral Roman frontier story. citeturn16search1turn3search6 |
| Arabia and southern Levant | Nabataean kingdom; Saba, Himyar, Hadhramaut and other southern Arabian kingdoms | Nabataea annexed by Rome 106 CE; Himyar increasingly important in first centuries CE | Incense and Red Sea networks connect Mediterranean, northeast Africa, Arabia and India. citeturn19search10turn3search7 |
| Nile Valley and Horn of Africa | Meroitic Kingdom of Kush; Aksum | Kush/Meroe continues into c. 4th century CE; Aksum rises in first centuries CE | Keep Nile and Red Sea systems distinct while showing exchange links. citeturn3search0turn19search13 |
| West Africa | Jenne-jeno and other increasingly settled/urban communities | Jenne-jeno occupied from around the later first millennium BCE | Evidence is archaeological rather than state-annalistic; sparse texts must not become sparse Atlas coverage. citeturn14search0 |
| South Asia | Mahajanapadas; Maurya; Kushan; Shaka/Western Kshatrapa; Satavahana; Vakataka; Gupta; Anuradhapura | Maurya c. 323–185 BCE; Kushan broadly late BCE–3rd c. CE; Gupta c. 321–500 CE | Several overlapping political and religious zones; there is no single continuous “Indian empire”. citeturn16search0turn16search4 |
| China | Warring States; Qin; Western Han; Wang Mang/Xin; Eastern Han; Three Kingdoms; Jin; Sixteen Kingdoms; Northern/Southern regimes | Qin 221–206 BCE; Han 206 BCE–220 CE; fragmented regimes thereafter | One of the strongest areas for precise political chronology, but later fragmentation requires concurrent entities rather than a single “China” polygon. citeturn19search14turn19search4 |
| Korea | Lelang commandery; Goguryeo; Baekje; Silla; Gaya | Major kingdoms span much of first 500 CE; Lelang ends 313 | Strong political and technological connections with multiple Chinese regimes and Japan. citeturn19search0turn19search5 |
| Japan | Yayoi societies; emerging Kofun/Yamato political order | Yayoi conventionally through c. 300 CE; Kofun thereafter | Archaeological period and political formation should be separate concepts; centralisation was gradual. citeturn19search12turn7search0 |
| Mainland Southeast Asia | Dong Son cultural traditions; northern Vietnam under Han influence; Mekong-delta/Oc Eo and Funan-associated networks | First millennium BCE through first centuries CE | “Funan” is particularly dangerous to render as an exact empire polygon from later Chinese texts. Archaeology and textual geography should remain distinct layers. citeturn8search10turn4search10 |
| Eastern North America | Hopewell interaction sphere | c. 200 BCE–500 CE | Not a single people, tribe or state; model ceremonial centres and exchange networks. citeturn4search1turn4search2 |
| Mesoamerica | Teotihuacan; Monte Albán/Zapotec states; Maya polities | Teotihuacan grows from late BCE centuries; Classic Maya states from c. 250 CE | Multiple large urban and dynastic systems developed independently of Eurasia. citeturn1search3turn1search13turn1search6 |
| Central/Southern Andes | Paracas–Nazca traditions; Moche; Recuay; early Tiwanaku and related regional formations | Major developments throughout first 500 CE | Avoid turning archaeological style zones automatically into unitary political states. citeturn8search0turn8search3 |
| Western Pacific | Late/post-Lapita societies in western Polynesia; Melanesian and Micronesian regional networks | Established western Pacific settlement long predates 500 CE | East and West Polynesia require different chronologies. citeturn8search11turn17view6 |
| Australia | Many Aboriginal Australian societies and regional cultural traditions | Occupation vastly predates and continues throughout the entire window | No single “Australian civilisation” polygon; precise ancient group boundaries cannot be reconstructed from the modern AIATSIS map. citeturn18view0 |

### A major chronology correction for Oceania

One old institutional timeline still places East Polynesian settlement broadly around the first millennium CE. That should **not** be imported into production data. High-precision analysis of **1,434 radiocarbon dates** by Wilmshurst and colleagues found an initial East Polynesian colonisation phase in the Society Islands around **1025–1120 CE**, followed by a much larger expansion to the remaining East Polynesian islands around **1190–1290 CE**. citeturn17view6

That means **Hawai‘i, Rapa Nui, New Zealand and the other East Polynesian settlement histories should not appear as populated East Polynesian societies in a 500 BCE–500 CE layer** merely because an older reference timeline says otherwise. This is precisely why the Atlas needs claim-level provenance rather than copying dates out of general reference works. citeturn17view6

Australia requires a related restraint. AIATSIS explicitly says its widely used Indigenous Australia map represents only general locations, draws on published sources through 1994, is **not exact**, and should not be regarded as depicting fixed boundaries. It is therefore unsuitable for back-projecting modern or ethnographically recorded nation/language boundaries into 500 BCE–500 CE. citeturn18view0

## Chronology and interconnected historical developments

### High-value global timeline

| Approximate date | Development | Why it matters for the Atlas |
|---|---|---|
| c. 508/507 BCE | Democratic reforms at Athens | One political experiment within a diverse Greek city-state system; should not be generalised to “Greek democracy”. citeturn16search8 |
| 334–330 BCE | Alexander's Macedonian forces overthrow Achaemenid imperial rule | Creates Hellenistic successor systems across an enormous area from the eastern Mediterranean into Asia. citeturn16search6turn16search1 |
| c. 323 BCE | Mauryan imperial consolidation begins in South Asia | At almost the same historical moment that Alexander's empire fragments, another major imperial system is forming farther east. citeturn16search0turn16search7 |
| c. 273–232 BCE | Reign of Ashoka | His inscriptions provide unusually strong primary evidence for kingship, ethics, administration and Buddhist patronage; one edict even names Hellenistic rulers to the west. citeturn16search7 |
| 221 BCE | Qin unifies the Chinese Warring States | Establishes the short-lived Qin imperial regime followed by Han. citeturn19search14 |
| 206 BCE | Han dynasty begins | Begins a durable imperial order that survives, with interruption, to 220 CE. citeturn19search14turn19search4 |
| 146 BCE | Carthage destroyed by Rome; Greek mainland under Roman power in the same broad era | Major Mediterranean political consolidation under Rome. citeturn16search2turn16search8 |
| 133 BCE | Pergamon passes to Rome | Key Roman entry into direct government in Asia Minor. citeturn16search6 |
| 53 BCE | Carrhae | Parthian forces inflict a major defeat on Crassus' Roman army, illustrating that Rome's eastern expansion met another powerful imperial system. citeturn16search1 |
| 31–27 BCE | Actium, end of Ptolemaic Egypt, Augustan settlement | Transition from late Roman Republic to imperial Principate. citeturn19search6turn16search9 |
| 1st century CE | *Periplus* documents Red Sea–East Africa–Arabia–India commerce | Exceptional primary evidence for actual commercial geography rather than a modern reconstructed “Silk Road”. citeturn17view4 |
| 106 CE | Rome annexes Nabataea | Transforms an Arabian trading kingdom into the Roman province of Arabia. citeturn19search10 |
| 166 CE | Chinese sources later record visitors claiming association with Da Qin | Valuable evidence for Chinese awareness of Rome, but not secure evidence of regular official Roman–Han diplomacy. citeturn17view5 |
| 220 CE | Eastern Han ends | China enters the Three Kingdoms and subsequent centuries of competing regimes. citeturn19search4 |
| 224 CE | Sasanian dynasty supplants Parthian rule | Rome's principal eastern rival changes dynasty without the Iranian imperial system simply disappearing. citeturn19search10 |
| late 3rd century CE | Aksum mints its own coinage | Strong evidence of a powerful Red Sea state embedded in international commerce. citeturn19search13 |
| 313 CE | Constantine's religious settlement; Goguryeo eliminates Lelang | Two major but entirely independent political changes occur across Eurasia in the same year. citeturn19search2turn19search0 |
| 330 CE | Constantinople inaugurated as New Rome | Major relocation of Roman imperial gravity toward the eastern Mediterranean. citeturn19search2 |
| 4th century CE | Ezana's Aksumite kingship adopts Christianity | Christian royal iconography replaces earlier symbols on Aksumite coins. citeturn19search13 |
| 372 CE | Buddhism reaches the Goguryeo court | A clear milestone in the institutional transmission of Buddhism from China into Korea. citeturn19search0 |
| **378 CE** | **Adrianople in the Roman world; Teotihuacan-linked intervention at Tikal** | An excellent “Meanwhile, elsewhere…” card: striking simultaneity with no asserted causal connection. citeturn19search2turn1search6 |
| 395 CE | Durable division between eastern and western Roman courts | Better treated as administrative/political divergence than the creation of two completely unrelated civilisations overnight. citeturn19search2 |
| 410 CE | Alaric's Visigoths sack Rome | Highly symbolic shock, but western Roman government continues for decades. citeturn19search2 |
| 429–439 CE | Vandals establish control in Roman North Africa | A major transfer of western imperial territory and resources. citeturn19search8 |
| 475 CE | Goguryeo captures Baekje's Han River capital | Important contemporaneous East Asian political transformation near the end of western Roman imperial rule. citeturn19search0 |
| 476 CE | Romulus Augustulus deposed | Conventional termination date for western imperial office—not the end of Roman imperial history. citeturn19search2turn12search11 |
| 493 CE | Theodoric establishes Ostrogothic rule in Italy | Demonstrates why 476 should be presented as a transition into successor political orders rather than an empty post-Roman map. citeturn19search2 |

### Synchronistic Atlas cards

A particularly strong feature for this millennium is to place users at a date and show the genuinely different worlds operating simultaneously.

**Around 100 CE**, a user could see the Roman Empire around the Mediterranean; Parthian rule across Iran and Mesopotamia; Kushan and Satavahana political systems in South Asia; Eastern Han China; Meroitic Kush and emerging Aksum in northeast Africa; Yayoi communities in Japan and developing Korean states; Teotihuacan's expanding urban system; Hopewell ceremonial and exchange networks in eastern North America; and Nazca/Moche-related developments in the Andes. These societies were not all mutually connected: the Atlas must visually distinguish historical simultaneity from historical contact. citeturn3search6turn16search4turn19search4turn19search13turn7search0turn4search1turn1search3turn8search3

**Around 300 CE**, Rome faced a Sasanian rather than Parthian Iran; China had passed beyond the Han into competing regimes; Gupta power was emerging in northern India; Aksum was increasingly visible through coinage and Red Sea exchange; Korea's kingdoms were consolidating; Kofun political structures were emerging in Japan; Teotihuacan was an enormous Mesoamerican urban centre; and Moche and Nazca traditions flourished in the Andes. citeturn19search4turn16search4turn19search13turn19search5turn19search12turn1search13turn8search3

**The year 378 CE** is an unusually effective cross-civilisation discovery card. Near Adrianople, Gothic forces defeated an Eastern Roman army and killed Emperor Valens; in the Maya lowlands, the same year is associated with a dramatic Teotihuacan-linked arrival and dynastic transformation at Tikal. There is no relationship between these events, and the Atlas should say so explicitly. Their educational value lies in defeating the tendency to imagine that one region's famous event was “the history of the world” at that moment. citeturn19search2turn1search6

## Technology, trade and the worlds people actually knew

### Technology tree principles

The source specification is right to insist that **earliest surviving evidence is not synonymous with invention**. This matters repeatedly in this period. fileciteturn0file0

For example, glassblowing appears in the Syro-Palestinian region during the first century BCE and spread rapidly through the Roman world. It should therefore be modelled as an eastern Mediterranean technological development followed by very large-scale Roman-era adoption—not simply entered as “Rome invents glassblowing”. citeturn13search1turn13search2

Paper provides an even cleaner warning. Traditional histories often attach “invention of paper” to Cai Lun in 105 CE. The Metropolitan Museum more cautiously describes him as helping develop a method for mass production, while archaeological scholarship places forms of paper in China centuries earlier, including evidence dating into the third century BCE. A robust technology record therefore needs separate fields for `earliest_attested`, `refinement`, `institutional_documentation` and `widespread_use`. citeturn19search4turn13search12

Aksumite coinage is another useful diffusion record. Coin production began in the third century CE; under Ezana, changes in the symbols appearing on coins provide datable evidence for conversion of the royal court to Christianity. The key historical story is not merely that Aksum “had coins”, but that minting tied political authority, international exchange and religious messaging together. citeturn19search13

Japan gives a strong technology-transmission case. The Met chronology records the introduction of high-fired grey **Sue ware** from the Gaya region of Korea in the late fourth to early fifth centuries, including production by or with immigrant potters, wheel technology and high-temperature tunnel kilns. This can be represented explicitly as a Korea → Japan transmission edge rather than an independent-invention node. citeturn19search12

Hopewell monumental earthworks demonstrate why an Atlas technology tree should not rank technology according to state centralisation. North American Hopewell ceremonial landscapes combined large-scale geometric earthworks with very extensive material-exchange networks, yet “Hopewell” was not one empire or even one ethnic group. citeturn4search1turn4search2

### Trade was networked, not a single Silk Road line

The strongest direct source in the current research batch is the mid-first-century CE *Periplus Maris Erythraei*. It describes routes from Egyptian Red Sea ports south along East Africa and east around Arabia and across to India, discussing sailing conditions, ports, markets, imports and exports. Its author also notes the seasonal winds governing Indian Ocean voyages. citeturn17view4

That makes it far better evidence for a Roman-era trade layer than drawing an undifferentiated line labelled “Silk Road from Rome to China”. The evidence instead supports a graph of interacting maritime and terrestrial segments: Mediterranean → Egyptian Red Sea ports → Arabian and East African ports → western India, together with overland and Central Asian systems that connected—but did not necessarily give every participant direct knowledge of—their distant endpoints. citeturn17view4turn17view5

The Parthian Empire occupied a strategically important position in these Eurasian networks while simultaneously being a military rival of Rome. The Roman defeat at Carrhae in 53 BCE underscores the point that trade connectivity and political hostility can coexist; an Atlas relationship model should permit multiple simultaneous edge types between the same societies. citeturn16search1

### “See the world through their eyes”

For a **Roman-Egyptian merchant world**, the *Periplus* gives unusually strong Layer A evidence: named ports and practical routes reaching down East Africa and to India. Its information on territories beyond the author's likely travels becomes progressively more second-hand, so distant eastern regions should move from “attested first-hand geography” towards “reported/inferred awareness”. citeturn17view4

For **third-century Chinese geographical scholarship**, the *Weilue*, composed between 239 and 265 CE and preserved in a later historical work, includes sections explicitly describing Da Qin—the Roman world—and routes through western regions. This is Layer A evidence that Chinese literati possessed textual information about Rome. It is **not** evidence that China and Rome maintained routine direct diplomatic relations. The famous 166 CE episode is better represented as a reported delegation whose diplomatic status remains uncertain. citeturn17view5

For **Australia**, the evidentiary asymmetry is profound. There is no written geographical corpus from 500 BCE–500 CE comparable to the *Periplus* or Chinese dynastic histories. That is not evidence that Aboriginal societies lacked sophisticated geographic knowledge; it means the Atlas cannot reconstruct that knowledge using the same documentary method. Region-specific archaeology, cultural landscapes, oral traditions where appropriately interpreted, and collaboration with relevant Traditional Owners would be needed. AIATSIS itself warns that the familiar modern map depicts only broad, non-fixed group locations and is not an exact boundary source. citeturn18view0

## Historical geography and the data package

### Roman geography is a useful test case for uncertainty

One of the strongest newly available sources for the application's map architecture is **Itiner-e**, an open scholarly road dataset. Its 2025 *Scientific Data* description contains **14,769 road segments covering about 299,171 km** across the Roman road system represented by the project. Crucially, the researchers report that only **2.737% of mapped road length has a spatial location classed as certain**, while **89.818% is conjectured and 7.445% hypothesised**. citeturn18view2turn18view3turn18view4

That is a direct demonstration of why a historical map should not visually present every line with equal certainty. An attractive crisp polyline can be false precision. The Atlas should preserve source-level certainty and render, for example, securely located roads differently from reconstructed corridors. citeturn18view3

Itiner-e is particularly suitable for ingestion because the project provides downloadable route records modelled as GeoJSON-like LineStrings, assigns URIs to segments, and publishes the data under **CC BY 4.0**. citeturn17view1

**Pleiades** is complementary rather than interchangeable. It is an open gazetteer of ancient places with especially extensive Greek and Roman coverage; it explicitly models places, locations, names and connections separately, provides bulk downloads, and licenses its content under **CC BY 3.0**. Those stable place identifiers are good candidates for external IDs in the Atlas rather than creating a parallel set of Roman-place identifiers without reason. citeturn17view2

**ORBIS** addresses a different question: not “where was the road?” but “what did movement cost?” Stanford's model reconstructs Roman connectivity using roads, navigable rivers and sea routes and calculates travel in terms of time and expense, including seasonal and transport-mode constraints. That can power a much more historically useful map than straight-line distance—for example, explaining why two places geographically close on a modern map could be poorly connected while distant ports could be economically close by sea. citeturn18view5turn18view6

### Recommended map-layer architecture

The appropriate geography stack for this millennium is therefore not a single `civilisation_boundaries.geojson` file. It should behave more like:

```text
historical_places
    stable place identity
    ├── historical_names[]
    ├── point/area observations[]
    └── external_ids { Pleiades, Wikidata, ... }

political_geographies
    ├── core_control
    ├── probable_control
    ├── tributary/dependent zone
    ├── disputed/contact zone
    └── unknown

movement_networks
    ├── roads
    ├── rivers
    ├── sea lanes
    ├── caravan corridors
    ├── migration corridors
    └── evidence/certainty for each segment

archaeological_distribution
    ├── sites
    ├── material-culture distributions
    └── NEVER automatically promoted to political borders
```

The last rule is important for Hopewell, Dong Son, Yayoi, Nazca, Moche and many other archaeological labels. Material culture can spread beyond political authority, and stylistic similarity does not prove membership in one state. The NPS treatment of Hopewell, for example, explicitly supports understanding it as a broad interaction/ceremonial phenomenon rather than one political nation. citeturn4search1turn4search2

### Generated structured package

The files produced in this research pass are:

| Dataset | Records | Current status |
|---|---:|---|
| Societies / political and archaeological entities | **48** | Broad global seed coverage |
| Historical events | **29** | High-value chronology, not exhaustive |
| Technology records | **12** | Selected diffusion/origin-sensitive examples |
| Civilisation relationships | **14** | Direct, indirect, conflict, trade and transmission edges |
| Historical figures | **10** | Deliberately sparse; expansion required |
| Historical locations | **15** | Representative points only; not boundary geometries |
| “Meanwhile…” connections | **4** | Production-ready concept examples |
| Geographical-knowledge records | **3** | Roman-Egyptian, Chinese and Australian methodological cases |
| Source-register entries | **30** | Institutional, primary-text, scholarly and open-data sources |
| Explicit research gaps | **12** | Prioritised rather than concealed |

The package is machine-readable in **JSON, JSONL and CSV-compatible forms** and includes a basic schema, source IDs and confidence fields.

[Download the complete structured research pack](sandbox:/mnt/data/world_history_atlas_500BCE_500CE_seed_pack.zip)

[Download the master JSON dataset](sandbox:/mnt/data/world_history_atlas_500BCE_500CE/world_history_atlas_500BCE_500CE.json)

The package deliberately contains **no invented empire-boundary polygons**. The present location records are points or representative locations; production geometries should be ingested only from defensible historical GIS/archaeological sources with dates and spatial-confidence metadata. That follows both the Atlas research rules and the empirical lesson from Itiner-e that even one of antiquity's best-studied transport systems remains spatially uncertain across most of its reconstructed length. fileciteturn0file0 citeturn18view3

## Research quality, unresolved problems and the next historical layer

### What is strong

The **Mediterranean–Iran–South Asia–China political chronology** is comparatively strong in this first pass. Multiple institutional syntheses provide internally coherent dynastic sequences, while sources such as the *Periplus* and ancient Chinese geographical texts give actual historical testimony for exchange and geographic awareness rather than relying entirely on modern reconstructions. citeturn16search1turn16search4turn19search4turn17view4turn17view5

The **Roman geographical-data foundation** is also strong. Pleiades provides reusable place identifiers and open gazetteer data; Itiner-e supplies current open road data with unusually explicit uncertainty; ORBIS can supply a network model of travel time and cost. citeturn17view1turn17view2turn18view5

The **East Polynesian chronology correction** is high-value because it demonstrates an important editorial rule: a more recent, focused archaeological analysis can overturn dates repeated in older museum timelines. The PNAS/ANU radiocarbon synthesis should prevail over the older chronology for initial East Polynesian settlement. citeturn17view6

### What remains weak

The dataset is **not yet globally comprehensive enough for production**, especially relative to the ambition of the uploaded World History Atlas specification. The present 48-society catalogue is substantially better than a Rome-centric list, but important holes remain in Central Asia and the Eurasian steppe; most of West, Central and Southern Africa; much of island and mainland Southeast Asia; Australia at regional archaeological resolution; large portions of North America; the Caribbean; northern South America; and many Pacific societies. This is a coverage limitation of this research batch, not evidence that those areas lacked complex history.

Likewise, the historical-figure count of ten is intentionally inadequate. Expanding it by mechanically collecting famous rulers would be the wrong fix: biographies should include securely evidenced philosophers, religious leaders, scientists, administrators, merchants, writers, military figures and, where the evidence permits, women and non-elites. The source specification correctly requires a distinction between securely documented figures, legendary individuals and later traditional biography. fileciteturn0file0

The **everyday-life layer is currently much weaker than the political layer**. Household archaeology, skeletal evidence, food remains, craft workshops, housing, clothing, childhood, labour, gender, slavery and other dependent status, health and disease all require dedicated source acquisition. Without that work, the Atlas risks reproducing exactly the ruler-and-war bias that the project brief is attempting to avoid. fileciteturn0file0

Population estimates are another area where false precision must be resisted. For example, modern estimates for the population of Teotihuacan can be very large, but archaeological city-population estimates depend on assumptions about occupied area, residential density and chronology. Such figures belong in records containing methodology, minimum/maximum ranges and source disagreement—not a single authoritative-looking number. citeturn1search13

### Research accounting

For this completed seed pass:

| Requested quality metric | Result |
|---|---:|
| Societies documented | **48** |
| Events documented | **29** |
| Technology-development records | **12** |
| Geographical point/features seeded | **15** |
| Relationship records | **14** |
| Historical figures | **10** |
| Verified original historical maps | **0** |
| Modern scholarly/open historical-geography resources assessed | **3 major systems: Pleiades, Itiner-e, ORBIS** |
| Registered research sources | **30** |
| Explicit major research gaps | **12** |

The **zero verified historical maps** is deliberate. Pleiades, Itiner-e and ORBIS are modern scholarly geographic resources, not surviving ancient maps. I have not relabelled them as “historical maps” to inflate the metric. Original or manuscript maps should only enter the map register after verifying title, date, manuscript/object identity, holding institution, image rights and whether the image is original, copy or modern reconstruction, exactly as the project specification requires. fileciteturn0file0

The most useful continuation after this macro-window is **500–1000 CE**, while retaining cross-boundary links back into the fifth century. That interval naturally continues Eastern Roman/Byzantine history rather than treating Rome as finished in 476; follows the Sasanian Empire into its seventh-century collapse; captures the rise and enormous expansion of Islam; continues Aksum; follows Gupta successor systems and major South/Southeast Asian transformations; reaches Sui and Tang reunification in China, Unified Silla and Balhae in Korea, and later Kofun/Asuka/Nara/Heian developments in Japan; and, importantly, approaches the actual archaeological timeframe for the major East Polynesian expansion only in the *following* interval after 1000 CE. The same continuity-first logic is what prevents arbitrary 500-year database partitions from turning into artificial historical breaks. citeturn19search7turn17view6