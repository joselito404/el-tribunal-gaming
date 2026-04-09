const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Quitar isNew: true de los 5 veteranos
[ 'eldenring', 'rdr2', 'hades', 'hollowknight', 'witcher3' ].forEach(id => {
  c = c.replace(new RegExp(`(id: '${id}'[\\s\\S]*?)isNew: true,\\n\\s*`), '$1');
});

// 2. Arreglar la imagen de The Last of Us Part I
c = c.replace(
  /id: 'tlou1',\s*title: 'The Last of Us Part I',\s*img: '[^']*',\s*headerImg: '[^']+',/,
  `id: 'tlou1', \n    title: 'The Last of Us Part I', \n    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',\n    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',`
);

// 3. Poner isNew: true a los 10 recientes
[ 'godofwar', 'bg3', 'sekiro', 're4remake', 'tlou1', 'portal2', 'outerwilds', 'stardew', 'discoelysium', 'cuphead' ].forEach(id => {
  if (c.includes(`id: '${id}'`)) {
    // Si ya lo tiene, no ponerselo
    const rx = new RegExp(`(id: '${id}',\\s*title: '[^']+',\\s*)`);
    c = c.replace(rx, '$1isNew: true,\n    ');
  }
});

// 4. Añadir Clair Obscur: Expedition 33 al final de la lista
const newGameObj = `  {
    id: 'expedition33',
    title: "Clair Obscur: Expedition 33",
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1903340/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1903340/header.jpg',
    description: "[ROL / POR TURNOS / FANTASÍA] Lidera a los miembros de la Expedición 33 en su misión para destruir a la Pintora y evitar que vuelva a pintar la muerte. Explora un mundo maravilloso inspirado en la Belle Époque francesa y lucha contra enemigos únicos en este RPG por turnos con mecánicas en tiempo real.",
    minRequirements: { cpu: 'Intel Core i5-8600K / AMD Ryzen 5 3600', gpu: 'NVIDIA GTX 1070 / AMD RX 5700', ram: '16 GB', os: 'Windows 10' },
    genres: ['ROL', 'POR TURNOS', 'FANTASÍA', 'ACCIÓN', 'AVENTURA'],
    hltb: { general: '48½h', main: '29h', extras: '45½h', completionist: '68h' },
    links: { steam: 'https://store.steampowered.com/app/1903340/Clair_Obscur_Expedition_33/', metacritic: 'https://www.metacritic.com/game/pc/clair-obscur-expedition-33', hltb: 'https://howlongtobeat.com/game/152016' },
    isNew: true
  }
];`;
c = c.replace(/  \}\n\];\n/, '  },\n' + newGameObj + '\n');

// 5. Scroll Restoration functionality
// Search for const [selectedSingleId, setSelectedSingleId]
if (!c.includes('const [scrollPos, setScrollPos]')) {
  c = c.replace(
    'const [selectedSingleId, setSelectedSingleId] = useState(null);',
    'const [selectedSingleId, setSelectedSingleId] = useState(null);\n  const [scrollPos, setScrollPos] = useState(0);'
  );
}

// Search for onClick selected single id
c = c.replace(
  /onClick=\{\(\) => setSelectedSingleId\(game\.id\)\}/,
  `onClick={() => {
                          setScrollPos(window.scrollY);
                          setSelectedSingleId(game.id);
                          window.scrollTo(0, 0);
                        }}`
);

// Search for back button
c = c.replace(
  /<button\s+onClick=\{\(\) => setSelectedSingleId\(null\)\}/,
  `<button
                        onClick={() => {
                          setSelectedSingleId(null);
                          setTimeout(() => window.scrollTo(0, scrollPos), 0);
                        }}`
);

// 6. Replace version
c = c.replace(/v6\.3\.0/g, 'v6.3.1');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done!');
