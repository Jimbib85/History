
const TECH_BRANCHES=[
{id:'food',name:'Food & water',icon:'◈',intro:'Farming, water and landscapes'},
{id:'materials',name:'Materials & making',icon:'⬡',intro:'Metals and craft'},
{id:'records',name:'Writing & mathematics',icon:'✍',intro:'Records and numbers'},
{id:'printing',name:'Printing & information',icon:'▤',intro:'Sharing ideas'},
{id:'navigation',name:'Navigation & exchange',icon:'⌁',intro:'Routes across the world'},
{id:'warfare',name:'War & defence',icon:'✦',intro:'Technologies of conflict'}
];
const TECH_SOURCES={
farm:'https://www.worldhistory.org/article/1886/origins-of-world-agriculture/',
meso:'https://www.metmuseum.org/toah/ht/02/wam.html',
nat:'https://education.nationalgeographic.org/resource/early-agricultural-communities/',
ubaid:'https://www.metmuseum.org/essays/the-ubaid-period-5500-4000-b-c',
egypt:'https://academic.oup.com/edited-volume/43506/chapter/364131674',
writing:'https://www.loc.gov/exhibits/exploring-the-early-americas/language-and-context.html',
maya:'https://maya.nmai.si.edu/maya-sun/maya-math-game',
zero:'https://www.smithsonianmag.com/history/origin-number-zero-180953392/',
paper:'https://baph.org.uk/resources/paper-history/early-history-of-paper/',
islamicpaper:'https://www.iranicaonline.org/articles/paper-iran-prior-printing/',
diamond:'https://idp.bl.uk/discover/learning/dunhuang/collection-items/cave-17-the-library-cave/',
printing:'https://www.britannica.com/technology/printing-publishing',
jikji:'https://www.bnf.fr/en/jikji-treasure-world-printing',
compass:'https://academic.oup.com/book/566/chapter-abstract/135300537',
oxford:'https://www.mhs.ox.ac.uk/epact/article.php?ArticleID=4',
pacific:'https://teara.govt.nz/en/canoe-navigation',
gunpowder:'https://www.britannica.com/technology/gunpowder',
artillery:'https://www.britannica.com/technology/artillery',
angkor:'https://whc.unesco.org/en/list/668/',
inca:'https://whc.unesco.org/en/list/274/',
iron:'https://www.britannica.com/technology/iron-processing/History',
shangbronze:'https://www.metmuseum.org/fr/essays/shang-and-zhou-dynasties-the-bronze-age-of-china'
};
function tech(id,branch,name,era,description,related,records){
 return {id,branch,name,era,description,related,appearances:records.map(([civ,year,status,label,note,source])=>({civ,year:year<0?year+1:year,status,label,note,source:TECH_SOURCES[source]}))};
}
const TECHNOLOGIES=[
tech('agriculture','food','Crop domestication','Neolithic','Farming developed in multiple places over generations. These dates are approximate examples, not exact invention dates.',[],[
['fertile-early',-8500,'independent','Early cereals','Domestication of wheat and barley in Fertile Crescent communities.','meso'],
['yangtze-early',-7000,'independent','Rice cultivation','Rice farming developed independently in the Yangtze region.','nat'],
['meso-early',-5000,'independent','Regional crop cultivation','Maize and other crops underwent long domestication histories.','farm'],
['andes-early',-3500,'independent','Andean crops','Farming developed through diverse Andean local traditions.','farm']]),
tech('irrigation','food','Organised irrigation','Neolithic onward','Communities independently adapted water storage and irrigation to different climates. These are examples of several engineering approaches.',['agriculture'],[
['ubaid',-5500,'attested','Ubaid irrigation','Early southern Mesopotamian farmers used irrigation.','ubaid'],
['sumer',-3000,'developed','City canals','City states depended on managed irrigation agriculture.','meso'],
['angkor',1100,'developed','Angkor hydraulic works','Khmer cities maintained reservoirs, canals and water infrastructure.','angkor'],
['inca',1450,'developed','Andean water management','Mountain farming used irrigation and cultivated terraces.','inca']]),
tech('bronze','materials','Bronze casting','Bronze Age','Copper alloy technology took different forms across regions and eras. Not all bronze-working centres shared a single direct origin.',[],[
['sumer',-3000,'attested','Mesopotamian metalwork','Bronze Age objects are documented in Mesopotamia.','meso'],
['old-egypt',-2500,'attested','Egyptian copper alloys','Metals formed part of Egyptian craft production.','meso'],
['minoans',-1900,'attested','Cretan Bronze Age craft','Metals featured in Bronze Age Cretan communities.','meso'],
['shang',-1250,'developed','Shang bronze vessels','Distinctive ceramic piece-mould casting produced elaborate Shang ritual bronzes.','shangbronze']]),
tech('iron','materials','Iron tools and production','Iron Age','The spread of iron production was uneven, and in some regions early smelting origins are contested. Bronze and iron often overlapped.',['bronze'],[
['neo-assyria',-850,'attested','Iron Age Assyria','Iron objects were in use during the Neo-Assyrian period.','iron'],
['maurya',-300,'attested','Ironworking in South Asia','Iron tools circulated widely before and during Mauryan rule.','iron'],
['han',-150,'developed','Chinese iron manufacture','Large-scale iron working expanded in early imperial China.','iron']]),
tech('writing','records','Writing systems','Early states','Writing emerged in several regions. Not all ancient symbol systems have been deciphered or were necessarily invented independently.',[],[
['sumer',-3200,'early','Cuneiform origins','Late-fourth-millennium tablets record early administration.','meso'],
['egypt-early',-3200,'early','Early hieroglyphs','The earliest Egyptian inscriptions are attested in this broad period.','egypt'],
['shang',-1250,'attested','Oracle bones','Shang inscriptions attest to established Chinese writing.','writing'],
['maya',350,'developed','Maya script','Maya hieroglyphs were used for historical and ceremonial records.','writing']]),
tech('zero','records','Zero and place value','Ancient and medieval','Zero as a placeholder and zero as a number are distinct mathematical ideas. The traditions shown here are not identical.',['writing'],[
['maya',600,'independent','Maya zero sign','Maya mathematics used a shell-shaped zero sign in a base-twenty system.','maya'],
['abbasid',825,'adopted','Indian positional numerals','Arabic-language mathematics disseminated Hindu-Arabic numeral methods.','zero'],
['medieval-europe',1202,'adopted','Liber Abaci','Fibonacci helped introduce Hindu-Arabic positional arithmetic to European readers.','zero']]),
tech('paper','printing','Papermaking','Ancient and medieval','Papermaking in China predates Cai Lun’s traditional attribution. The craft reached Central Asia, Islamic lands and Europe through complex routes.',['writing'],[
['han',-100,'early','Early Chinese paper','Archaeological paper predates the traditional date of 105 CE.','paper'],
['tang',700,'developed','Established Chinese papermaking','Paper was an established material in Tang China.','paper'],
['abbasid',800,'adopted','Baghdad paper manufacture','Papermaking was established by the late eighth century; the Talas tale is disputed.','islamicpaper'],
['medieval-europe',1200,'adopted','European papermaking','Medieval European workshops developed paper manufacture.','paper']]),
tech('woodblock','printing','Woodblock printing','Medieval','Carved printing blocks reproduced text and illustrations. This method continued alongside movable type.',['paper'],[
['tang',868,'attested','Diamond Sutra','A Chinese scroll dated 868 is the earliest surviving complete dated printed book.','diamond'],
['song',1100,'developed','Large-scale book printing','Printing expanded in Song cultural and administrative life.','printing'],
['goryeo',1200,'developed','Korean Buddhist woodblocks','Korean Buddhist texts were reproduced with carved blocks.','jikji']]),
tech('movable-type','printing','Movable type printing','Medieval to Renaissance','Song ceramic type, Korean metal type and European letterpress represent distinct technical traditions, not one identical process.',['woodblock'],[
['song',1040,'developed','Bi Sheng ceramic type','Movable ceramic type developed in eleventh-century Song China.','printing'],
['goryeo',1377,'attested','Jikji metal-type book','The surviving Jikji is a Korean metal-type book dated 1377.','jikji'],
['renaissance-europe',1455,'developed','Gutenberg Bible','The Gutenberg Bible is a famous example of European metal-type press printing.','printing']]),
tech('compass','navigation','Magnetic sea compass','Medieval','Mariners progressively adapted magnetic direction finding, maps and instruments in different maritime cultures.',[],[
['song',1100,'attested','Chinese sea compass','Maritime magnetic compass use is documented by around the eleventh century.','compass'],
['medieval-europe',1200,'adopted','European sea compass','European seafarers employed magnetic direction-finding by the medieval period.','oxford'],
['europe-navigation',1480,'developed','Ocean navigation','Iberian navigators used compass, charts and celestial instruments together.','compass']]),
tech('oceanic-navigation','navigation','Long-distance sea navigation','Ancient to early modern','Different societies used different techniques. Polynesian ocean knowledge did not depend on a magnetic compass.',[],[
['polynesian-voyagers',1000,'developed','Polynesian voyaging','Pacific seafarers navigated by stars, swells and environmental observation.','pacific'],
['song',1100,'developed','Chinese maritime networks','Chinese trade vessels used multiple navigation methods.','compass'],
['europe-navigation',1490,'developed','Atlantic voyaging','European oceanic expansion combined charting and other maritime techniques.','compass']]),
tech('gunpowder','warfare','Gunpowder and artillery','Medieval','Gunpowder mixtures, explosive weapons and cannon are not the same invention. These examples show distinct stages in Eurasian transmission.',[],[
['tang',850,'early','Chinese alchemical mixtures','Early gunpowder chemistry emerged in Chinese alchemical traditions.','gunpowder'],
['song',1044,'developed','Song military formulas','Song military writings recorded gunpowder mixtures.','gunpowder'],
['mamluk',1300,'adopted','Middle Eastern gunpowder weapons','Gunpowder weapons spread across the medieval Middle East.','gunpowder'],
['medieval-europe',1326,'attested','Early European cannon','Fourteenth-century European records document artillery.','artillery']])
];
