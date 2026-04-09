const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Actualizar Death Stranding 2
c = c.replace(
  /{[\s\S]*?id: 'deathstranding_2',[\s\S]*?isNew: true\n  },/,
  `{
    id: 'deathstranding_2',
    title: 'Death Stranding 2: On The Beach',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902340/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902340/header.jpg',
    description: '[ACCIÓN / AVENTURA / NARRATIVO / MUNDO ABIERTO / CIENCIA FICCIÓN] Embárcate en una nueva odisea de conexión humana más allá de las Ciudades Unidas de América. Sam Porter Bridges regresa junto a la organización Drawbridge para explorar territorios desconocidos y enfrentarse a nuevas amenazas sobrenaturales en un mundo que cambia drásticamente. Con un sistema de físicas de terreno evolucionado y una narrativa cinematográfica rompedora, esta secuela redefine el viaje como el destino final.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'MUNDO ABIERTO', 'CIENCIA FICCIÓN'],
    hltb: { general: '55h', main: '34h', extras: '62h', completionist: '115h' },
    links: { steam: 'https://store.steampowered.com/app/2902340/DEATH_STRANDING_2_ON_THE_BEACH/', metacritic: 'https://www.metacritic.com/game/pc/death-stranding-2-on-the-beach', hltb: 'https://howlongtobeat.com/game/118315' },
    isNew: true
  },`
);

// 2. Corregir el historial de v6.3.2 que fue dañado:
// Buscar el bloque que dice "v6.4.0 - Hotfix de Ordenación" y restaurarlo a v6.3.2
c = c.replace(
  /<h3 className="font-bold text-lg text-white">v6\.4\.0 - Hotfix de Ordenación<\/h3>([\s\S]*?)v6\.4\.0 - Hotfix de Ordenación/g,
  '<h3 className="font-bold text-lg text-white">v6.3.2 - Hotfix de Ordenación</h3>$1v6.3.2 - Hotfix de Ordenación'
);
// También el comentario anterior
c = c.replace(
  /\{\/\* v6\.4\.0 \*\/\}\s+<div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">\s+<div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-600/g,
  '{/* v6.3.2 */}\n              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">\n                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-600'
);


// 3. Añadir el nuevo changelog para v6.4.1 (encima del de v6.4.0)
const v641Log = `              {/* v6.4.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.4.1 - Hotfix de Lanzamiento</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.4.1 - Hotfix de Lanzamiento. Actualizada la ficha de Death Stranding 2: On The Beach con metadatos oficiales post-lanzamiento. Sincronizados tiempos de HLTB, enlaces de tienda y arte oficial del encabezado de Steam.
                  </p>
                </div>
              </div>\n\n`;

c = c.replace(
  /(\{\/\* v6\.4\.0 \*\/\}\s+<div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">\s+<div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-amber-500)/,
  v641Log + '$1'
);

// 4. Update Header and Sidebar version to v6.4.1
// Since there might be multiple v6.4.0, we only want to update the UI ones.
c = c.replace(/El Tribunal Gaming <span className="text-pink-500 text-2xl md:text-3xl">v6\.4\.0<\/span>/, 'El Tribunal Gaming <span className="text-pink-500 text-2xl md:text-3xl">v6.4.1</span>');
c = c.replace(/Tribunal Gaming Engine v6\.4\.0<\/p>/, 'Tribunal Gaming Engine v6.4.1</p>');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Update complete');
