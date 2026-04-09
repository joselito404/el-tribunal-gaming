const fs = require('fs');

const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Reparación Asset Crítico The Last of Us Part I
content = content.replace(
  /(id: 'tlou1'(?:[\s\S]*?))img: '[^']*',(?:[\s\S]*?)headerImg: '[^']+',/,
  `$1img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',`
);

// New games data with adapted structure
const newGamesStr = `  {
    id: 'ballxpit',
    title: 'Ball x pit',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2917710/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2917710/header.jpg',
    description: '[INDIE / PLATAFORMAS / PUZZLES / CASUAL / DIFÍCIL] Un desafiante juego de plataformas basado en físicas donde controlas una pequeña bola a través de un mundo laberíntico. Olvídate de los saltos tradicionales; aquí dependes del impulso, la inercia y los rebotes calculados al milímetro para superar trampas mortales, resolver puzles de entorno y alcanzar la meta en un entorno minimalista pero implacable.',
    minRequirements: {},
    genres: ['INDIE', 'PLATAFORMAS', 'PUZZLES', 'CASUAL', 'DIFÍCIL'],
    hltb: { general: '3h', main: '2h', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/2917710/Ball_x_pit/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/149633' },
    isNew: true
  },
  {
    id: 'murders_yangtze',
    title: 'Murders on the Yangtze River',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2340330/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2340330/header.jpg',
    description: '[AVENTURA / MISTERIO / ROL / DETECTIVE / INDIE] Sumérgete en la China de principios del siglo XX con esta aventura de detectives tipo \\'point-and-click\\'. Encarnarás a John Shen, un investigador astuto que viaja a lo largo del río Yangtsé resolviendo crímenes imposibles. Mezclando la deducción lógica al estilo Phoenix Wright con una narrativa histórica profunda, deberás buscar pistas, interrogar a sospechosos y desentrañar conspiraciones.',
    minRequirements: {},
    genres: ['AVENTURA', 'MISTERIO', 'ROL', 'DETECTIVE', 'INDIE'],
    hltb: { general: '20½h', main: '14h', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/2340330/Murders_on_the_Yangtze_River/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/143990' },
    isNew: true
  },
  {
    id: 'plaguetale_req',
    title: 'A Plague Tale: Requiem',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    description: '[ACCIÓN / AVENTURA / NARRATIVO / SIGILO / POSTAPOCALÍPTICO] La desgarradora secuela del viaje de Amicia y Hugo de Rune. Tras escapar de su tierra natal devastada, los hermanos viajan hacia el sur, a nuevas regiones y ciudades bulliciosas. Sin embargo, cuando los poderes de Hugo resurgen, la muerte y la destrucción regresan en forma de una marea de ratas devoradoras. Sobrevive combinando sigilo, alquimia y un combate mucho más visceral en un mundo visualmente abrumador.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'SIGILO', 'POSTAPOCALÍPTICO'],
    hltb: { general: '22h', main: '16h', extras: '---', completionist: '58h' },
    links: { steam: 'https://store.steampowered.com/app/1182900/A_Plague_Tale_Requiem/', metacritic: 'https://www.metacritic.com/game/pc/a-plague-tale-requiem', hltb: 'https://howlongtobeat.com/game/93855' },
    isNew: true
  },
  {
    id: 'plaguetale_inn',
    title: 'A Plague Tale: Innocence',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    description: '[ACCIÓN / AVENTURA / NARRATIVO / SIGILO / POSTAPOCALÍPTICO] Francia, 1349. Sigue la lúgubre historia de la joven Amicia y su hermano pequeño Hugo, en un viaje desgarrador a través de las horas más oscuras de la historia. Perseguidos por los soldados de la Inquisición y rodeados por enjambres imparables de ratas portadoras de la peste, los hermanos deberán aprender a confiar el uno en el otro, usando la luz y el fuego como su única salvación.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'SIGILO', 'POSTAPOCALÍPTICO'],
    hltb: { general: '16h', main: '14h', extras: '---', completionist: '23h' },
    links: { steam: 'https://store.steampowered.com/app/752590/A_Plague_Tale_Innocence/', metacritic: 'https://www.metacritic.com/game/pc/a-plague-tale-innocence', hltb: 'https://howlongtobeat.com/game/65293' },
    isNew: true
  },
  {
    id: 'nobodywantsdie',
    title: 'Nobody Wants to Die',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1939970/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1939970/header.jpg',
    description: '[AVENTURA / MISTERIO / CIENCIA FICCIÓN / DETECTIVE / INDIE] Ponte en la piel del detective James Karra en esta aventura narrativa de estilo noir ambientada en una distópica Nueva York en el año 2329. En un mundo donde la muerte es opcional gracias a la transferencia de conciencia, investigarás los asesinatos de la élite de la ciudad utilizando un avanzado manipulador temporal para reconstruir las escenas del crimen, rebobinando el tiempo para descubrir los oscuros secretos de la inmortalidad.',
    minRequirements: {},
    genres: ['AVENTURA', 'MISTERIO', 'CIENCIA FICCIÓN', 'DETECTIVE', 'INDIE'],
    hltb: { general: '11h', main: '8h', extras: '---', completionist: '21h' },
    links: { steam: 'https://store.steampowered.com/app/1939970/Nobody_Wants_to_Die/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/146440' },
    isNew: true
  },
  {
    id: 'deathstranding_dc',
    title: 'DEATH STRANDING DIRECTOR\\'S CUT',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg',
    description: '[ACCIÓN / AVENTURA / NARRATIVO / MUNDO ABIERTO / CIENCIA FICCIÓN] Del legendario creador Hideo Kojima llega una experiencia que desafía los géneros, ahora expandida y remasterizada. Como Sam Porter Bridges, tu misión es entregar esperanza a la humanidad conectando a los últimos supervivientes de una América diezmada. Navega por un terreno traicionero asolado por entidades sobrenaturales (EV) en una obra maestra sobre la soledad, la empatía y la resiliencia humana.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'MUNDO ABIERTO', 'CIENCIA FICCIÓN'],
    hltb: { general: '78½h', main: '50½h', extras: '---', completionist: '194h' },
    links: { steam: 'https://store.steampowered.com/app/1850570/DEATH_STRANDING_DIRECTORS_CUT/', metacritic: 'https://www.metacritic.com/game/pc/death-stranding-directors-cut', hltb: 'https://howlongtobeat.com/game/103001' },
    isNew: true
  },
  {
    id: 'deathstranding_2',
    title: 'Death Stranding 2: On The Beach',
    img: 'https://placehold.co/600x337/1f2937/a5b4fc?text=PROXIMAMENTE',
    headerImg: 'https://placehold.co/600x337/1f2937/a5b4fc?text=PROXIMAMENTE',
    description: '[ACCIÓN / AVENTURA / NARRATIVO / MUNDO ABIERTO / CIENCIA FICCIÓN] ¿Deberíamos habernos conectado? Sam Porter Bridges regresa en la esperadísima secuela de Hideo Kojima. Únete a la organización Drawbridge y a bordo de la nave Magellan en un viaje más allá de las fronteras de las Ciudades Unidas de América. Una nueva odisea repleta de peligros, personajes enigmáticos y las clásicas reflexiones filosóficas de su creador.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'MUNDO ABIERTO', 'CIENCIA FICCIÓN'],
    hltb: { general: '---', main: '---', extras: '---', completionist: '---' },
    links: { steam: '---', metacritic: '---', hltb: '---' },
    isNew: true
  },
  {
    id: 'megabonk',
    title: 'Megabonk',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3182800/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3182800/header.jpg',
    description: '[ACCIÓN / PLATAFORMAS / INDIE / CASUAL / DIFÍCIL] Adrenalina pura en formato bidimensional. Controlas a un héroe armado con un martillo gigante en un plataformas de acción vertiginosa. El sistema de combate se basa completamente en el \\'momentum\\' y la inercia, exigiendo reflejos felinos para aplastar enemigos y superar intrincados niveles llenos de trampas, con un apartado artístico vibrante y mecánicas extremadamente satisfactorias.',
    minRequirements: {},
    genres: ['ACCIÓN', 'PLATAFORMAS', 'INDIE', 'CASUAL', 'DIFÍCIL'],
    hltb: { general: '---', main: '---', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/3182800/Megabonk/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/160475' },
    isNew: true
  },
  {
    id: 'paragnosia',
    title: 'Paragnosia',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2954150/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2954150/header.jpg',
    description: '[AVENTURA / PUZZLES / INDIE / CASUAL / MISTERIO] Un viaje al terror psicológico con estética retro de la era de los 32 bits (estilo PS1). Este título mezcla la exploración en primera persona con mecánicas clásicas de \\'point-and-click\\'. Te adentrarás en un universo surrealista y opresivo, resolviendo puzles encriptados mientras la línea entre la realidad y la locura se difumina en tu intento por desenmascarar los oscuros secretos de una agencia paranormal.',
    minRequirements: {},
    genres: ['AVENTURA', 'PUZZLES', 'INDIE', 'CASUAL', 'MISTERIO'],
    hltb: { general: '---', main: '---', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/2954150/Paragnosia/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/153723' },
    isNew: true
  },
  {
    id: 'pluckysquire',
    title: 'El Escudero Valiente (The Plucky Squire)',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1627800/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1627800/header.jpg',
    description: '[ACCIÓN / AVENTURA / PLATAFORMAS / INDIE / PUZZLES] Cuando Jot, el valiente protagonista de un libro de cuentos, descubre que su archienemigo lo ha expulsado de las páginas de su propia historia, su mundo cambia para siempre. Esta innovadora aventura de acción te permite saltar literalmente entre niveles de plataformas 2D dibujados a mano dentro de las páginas del libro y un vasto mundo en 3D en la habitación de un niño, resolviendo puzles con palabras e ingenio.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'PLATAFORMAS', 'INDIE', 'PUZZLES'],
    hltb: { general: '---', main: '---', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/1627800/The_Plucky_Squire/', metacritic: 'https://www.metacritic.com/game/pc/the-plucky-squire', hltb: 'https://howlongtobeat.com/game/109156' },
    isNew: true
  },
  {
    id: 'ninesols',
    title: 'Nine Sols',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/header.jpg',
    description: '[ACCIÓN / AVENTURA / PLATAFORMAS / INDIE / DIFÍCIL] Un metroidvania 2D dibujado a mano, ambientado en un mundo \\'Taopunk\\' que mezcla ciberpunk y taoísmo. Acompaña a Yi, un héroe del pasado en busca de venganza contra los 9 Soles, formidables gobernantes de un reino desolado. Su combate es implacable y se inspira fuertemente en las mecánicas de desvío (parry) de Sekiro, exigiendo ritmo y precisión milimétrica en peleas contra jefes espectaculares.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'PLATAFORMAS', 'INDIE', 'DIFÍCIL'],
    hltb: { general: '26h', main: '23h', extras: '---', completionist: '38h' },
    links: { steam: 'https://store.steampowered.com/app/1809540/Nine_Sols/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/112812' },
    isNew: true
  }
];`;

content = content.replace(/  \}\n\];/g, '  },\n' + newGamesStr);

// Update versions
content = content.replace(/v6\.3\.2/g, 'v6.4.0');

// Add changelog
const changelogEntry = `              {/* v6.4.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-amber-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.4.0 - Expansión de Catálogo y Mejora Narrativa</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.4.0 - Expansión de Catálogo y Mejora Narrativa. Reparada la imagen de The Last of Us Part I (vía CDN Steam). Añadidos 11 nuevos títulos a la base de datos (Ball x pit, Murders on the Yangtze River, A Plague Tale: Requiem, A Plague Tale: Innocence, Nobody Wants to Die, DEATH STRANDING DIRECTOR\\'S CUT, Death Stranding 2 [Próximamente], Megabonk, Paragnosia, El Escudero Valiente, Nine Sols) incluyendo redacción extendida de alta calidad para las sinopsis y metadatos oficiales sincronizados.
                  </p>
                </div>
              </div>\n\n`;

content = content.replace(/(<div className="space-y-12 [^>]+>\s*)/, '$1' + changelogEntry);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Done!');
