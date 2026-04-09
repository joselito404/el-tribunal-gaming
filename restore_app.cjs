const fs = require('fs');

const EMOJI_PALETTE = ['🔥', '🐕', '👾', '💀', '👑', '💩'];

const SINGLE_PLAYER_GAMES = [
  { 
    id: 'eldenring', 
    title: 'Elden Ring', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
    description: '[ACCIÓN / RPG / MUNDO ABIERTO] Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en el señor de Elden en las Tierras Intermedias.',
    minRequirements: { cpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X', gpu: 'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB', ram: '12 GB', os: 'Windows 10' },
    hltb: { general: '100h', main: '60h', extras: '100h', completionist: '135h' },
    links: {
      steam: 'https://store.steampowered.com/app/1245620/ELDEN_RING/',
      metacritic: 'https://www.metacritic.com/game/pc/elden-ring',
      hltb: 'https://howlongtobeat.com/game/68151'
    },
    genres: ['TIPO «DARK SOULS»', 'MUNDO ABIERTO', 'DIFICÍLES', 'ROL', 'ACCIÓN']
  },
  { 
    id: 'rdr2', 
    title: 'Red Dead Redemption 2', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
    description: '[ACCIÓN / AVENTURA / WESTERN] Arthur Morgan y la banda de van der Linde son forajidos en busca y captura. La banda deberá atracar, robar y luchar para sobrevivir en el despiadado corazón de América.',
    minRequirements: { cpu: 'Intel Core i5-2500K / AMD FX-6300', gpu: 'NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280 3GB', ram: '8 GB', os: 'Windows 7 SP1' },
    hltb: { general: '78½h', main: '50½h', extras: '84½h', completionist: '194h' },
    links: {
      steam: 'https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/',
      metacritic: 'https://www.metacritic.com/game/pc/red-dead-redemption-2',
      hltb: 'https://howlongtobeat.com/game/27100'
    },
    genres: ['MUNDO ABIERTO', 'AVENTURA', 'WESTERN', 'ACCIÓN', 'NARRATIVOS']
  },
  { 
    id: 'hades', 
    title: 'Hades', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg',
    description: '[ROGUELIKE / ACCIÓN / ISOMÉTRICO] Desafía al Dios de los Muertos y ábrete camino fuera del Inframundo en este juego de mazmorras de los creadores de Bastion y Transistor.',
    minRequirements: { cpu: 'Dual Core 2.4 GHz', gpu: '1GB VRAM / DirectX 10+ support', ram: '4 GB', os: 'Windows 7 SP1' },
    hltb: { general: '50h', main: '23½h', extras: '48½h', completionist: '95h' },
    links: {
      steam: 'https://store.steampowered.com/app/1145360/Hades/',
      metacritic: 'https://www.metacritic.com/game/pc/hades',
      hltb: 'https://howlongtobeat.com/game/62941'
    },
    genres: ['ROGUELIKE', 'ACCIÓN', 'MITOLOGÍA', 'ISOMÉTRICO', 'INDIE']
  },
  { 
    id: 'hollowknight', 
    title: 'Hollow Knight', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/367520/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg',
    description: '[METROIDVANIA / ACCIÓN / AVENTURA] ¡Forja tu propio camino en Hollow Knight! Una aventura épica a través de un vasto reino en ruinas de insectos y héroes.',
    minRequirements: { cpu: 'Intel Core i3-2100 / AMD Phenom II X4 940', gpu: 'NVIDIA GeForce GTX 460', ram: '4 GB', os: 'Windows 7' },
    hltb: { general: '40h', main: '27h', extras: '41h', completionist: '65h' },
    links: {
      steam: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
      metacritic: 'https://www.metacritic.com/game/pc/hollow-knight',
      hltb: 'https://howlongtobeat.com/game/26286'
    },
    genres: ['METROIDVANIA', 'INDIE', 'DIFICÍLES', 'PLATAFORMAS', 'EXPLORACIÓN']
  },
  { 
    id: 'witcher3', 
    title: 'The Witcher 3: Wild Hunt', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
    description: '[ACCIÓN / RPG / FANTASÍA] Te conviertes en Geralt de Rivia, cazador de monstruos a sueldo. Ante ti se despliega un continente devastado por la guerra e infestado de monstruos.',
    minRequirements: { cpu: 'Intel CPU Core i5-2500K / AMD CPU Phenom II X4 940', gpu: 'NVIDIA GPU GeForce GTX 660 / AMD GPU Radeon HD 7870', ram: '6 GB', os: '64-bit Windows 7, 64-bit Windows 8 (8.1) or 64-bit Windows 10' },
    hltb: { general: '100h', main: '51½h', extras: '103h', completionist: '174h' },
    links: {
      steam: 'https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/',
      metacritic: 'https://www.metacritic.com/game/pc/the-witcher-3-wild-hunt',
      hltb: 'https://howlongtobeat.com/game/10270'
    },
    genres: ['ROL', 'MUNDO ABIERTO', 'FANTASÍA', 'NARRATIVO', 'ACCIÓN']
  },
  { 
    id: 'sifu', 
    title: 'Sifu', 
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2138710/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/2138710/header.jpg',
    description: '[ROGUELIKE / BEAT \'EM UP] Un brutal juego de lucha realista en tercera persona. Domina el Kung-Fu Pak Mei y embárcate en un camino de venganza cinematográfico donde cada muerte te envejece, exigiéndote la perfección para avanzar.',
    minRequirements: { cpu: 'AMD FX-4350 / Intel Core i5-3470', gpu: 'Radeon R7 250 / GeForce GT 640', ram: '8 GB', os: 'Windows 8.1 64-bit' },
    hltb: { general: '12h', main: '8h', extras: '14h', completionist: '22h' },
    links: {
      steam: 'https://store.steampowered.com/app/1817230/Sifu/',
      metacritic: 'https://www.metacritic.com/game/pc/sifu',
      hltb: 'https://howlongtobeat.com/game/89091'
    },
    genres: ['ACCIÓN', 'BEAT \'EM UP', 'INDIE', 'UN JUGADOR', 'DIFICÍLES']
  },
  { 
    id: 'cp2077', 
    title: 'Cyberpunk 2077', 
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
    description: '[ACTION RPG / MUNDO ABIERTO] Adéntrate en Night City, una megalópolis obsesionada con el poder, el glamur y la modificación corporal. Juega como V, un mercenario ciber-mejorado, en una historia densa y llena de decisiones morales.',
    minRequirements: { cpu: 'Core i7-6700 / Ryzen 5 1600', gpu: 'GTX 1060 6GB / RX 580 8GB / Arc A380', ram: '12 GB', os: 'Windows 10 64-bit' },
    hltb: { general: '65½h', main: '26h', extras: '63h', completionist: '108h' },
    links: {
      steam: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
      metacritic: 'https://www.metacritic.com/game/pc/cyberpunk-2077',
      hltb: 'https://howlongtobeat.com/game/2127'
    },
    genres: ['ROL', 'MUNDO ABIERTO', 'CYBERPUNK', 'ACCIÓN', 'NARRATIVOS']
  },
  { 
    id: 'tsushima', 
    title: 'Ghost of Tsushima Director\'s Cut', 
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2215430/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/2215430/header.jpg',
    description: '[ACCIÓN-AVENTURA / MUNDO ABIERTO] A finales del siglo XIII, la isla de Tsushima es el último bastión ante el Imperio mongol. Jin Sakai deberá abandonar la tradición samurái y abrazar el camino del Fantasma para liberar su hogar.',
    minRequirements: { cpu: 'Intel Core i3-7100 / AMD Ryzen 3 1200', gpu: 'NVIDIA GeForce GTX 960 4GB / AMD Radeon RX 5500 XT', ram: '8 GB', os: 'Windows 10 64-bit' },
    hltb: { general: '51h', main: '25h', extras: '47½h', completionist: '65h' },
    links: {
      steam: 'https://store.steampowered.com/app/2215430/Ghost_of_Tsushima_Directors_Cut/',
      metacritic: 'https://www.metacritic.com/game/pc/ghost-of-tsushima-directors-cut',
      hltb: 'https://howlongtobeat.com/game/51225'
    },
    genres: ['ACCIÓN', 'AVENTURA', 'MUNDO ABIERTO']
  },
  { 
    id: 'ds3', 
    title: 'Dark Souls III', 
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/374320/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/374320/header.jpg',
    description: '[ACTION RPG / SOULSLIKE] El cierre magistral de la trilogía de FromSoftware. Un mundo oscuro, melancólico y despiadado que pondrá a prueba tu paciencia con combates letales, jefes épicos y un diseño de niveles interconectado.',
    minRequirements: { cpu: 'Intel Core i3-2100 / AMD® FX-6300', gpu: 'NVIDIA® GeForce GTX 750 Ti / ATI Radeon HD 7950', ram: '4 GB', os: 'Windows 7 SP1 64-bit' },
    hltb: { general: '55½h', main: '31h', extras: '48½h', completionist: '100h' },
    links: {
      steam: 'https://store.steampowered.com/app/374320/DARK_SOULS_III/',
      metacritic: 'https://www.metacritic.com/game/pc/dark-souls-iii',
      hltb: 'https://howlongtobeat.com/game/26803'
    },
    genres: ['TIPO «DARK SOULS»', 'FANTASÍA OSCURA', 'DIFICÍLES', 'ROL', 'ACCIÓN']
  },
  {
    id: 'godofwar',
    title: 'God of War (2018)',
    summary: "Kratos, ahora un hombre fuera de la sombra de los dioses, debe adaptarse a tierras desconocidas y ser un padre para Atreus en el reino nórdico de Midgard.",
    genres: ['ACCIÓN', 'AVENTURA', 'NARRATIVO', 'HACK AND SLASH', 'MITOLOGÍA'],
    hltb: { general: '30h', main: '21h', extras: '33h', completionist: '51h' },
    links: { steam: 'https://store.steampowered.com/app/1593500/God_of_War/', metacritic: 'https://www.metacritic.com/game/pc/god-of-war', hltb: 'https://howlongtobeat.com/game/38050' },
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg'
  },
  {
    id: 'bg3',
    title: "Baldur's Gate 3",
    summary: "Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo, traición, sacrificio y la tentación del poder absoluto.",
    genres: ['ROL', 'ESTRATEGIA', 'POR TURNOS', 'FANTASÍA', 'NARRATIVO'],
    hltb: { general: '100h', main: '60h', extras: '100h', completionist: '150h' },
    links: { steam: 'https://store.steampowered.com/app/1086940/Baldurs_Gate_3/', metacritic: 'https://www.metacritic.com/game/pc/baldurs-gate-3', hltb: 'https://howlongtobeat.com/game/68033' },
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg'
  },
  {
    id: 'inside',
    title: 'Inside',
    summary: "Perseguido y solo, un niño se encuentra en el centro de un proyecto oscuro. Un rompecabezas de plataformas inquietante y atmosférico.",
    genres: ['PUZZLES', 'PLATAFORMAS', 'ATMOSFÉRICO', 'INDIE', 'TERROR'],
    hltb: { general: '4h', main: '3h', extras: '4h', completionist: '5h' },
    links: { steam: 'https://store.steampowered.com/app/304430/INSIDE/', metacritic: 'https://www.metacritic.com/game/pc/inside', hltb: 'https://howlongtobeat.com/game/21694' },
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/304430/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/304430/header.jpg'
  },
  {
    id: 'ln2',
    title: 'Little Nightmares II',
    summary: "Regresa a un mundo de terror encantador en Little Nightmares II, un juego de aventuras y suspense en el que juegas como Mono.",
    genres: ['TERROR', 'PUZZLES', 'PLATAFORMAS', 'ATMOSFÉRICO', 'AVENTURA'],
    hltb: { general: '6h', main: '5h', extras: '6h', completionist: '9h' },
    links: { steam: 'https://store.steampowered.com/app/860510/Little_Nightmares_II/', metacritic: 'https://www.metacritic.com/game/pc/little-nightmares-ii', hltb: 'https://howlongtobeat.com/game/69851' },
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/860510/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/860510/header.jpg'
  },
  {
    id: 're4',
    title: 'Resident Evil 4 (Remake)',
    summary: "Seis años después del desastre biológico en Raccoon City, Leon S. Kennedy debe rescatar a la hija del presidente en un pueblo europeo.",
    genres: ['TERROR', 'ACCIÓN', 'SURVIVAL HORROR', 'DISPAROS', 'AVENTURA'],
    hltb: { general: '21h', main: '16h', extras: '22h', completionist: '58h' },
    links: { steam: 'https://store.steampowered.com/app/2050650/Resident_Evil_4/', metacritic: 'https://www.metacritic.com/game/pc/resident-evil-4', hltb: 'https://howlongtobeat.com/game/108881' },
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2050650/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/2050650/header.jpg'
  },
  { 
    id: 'tlou1', 
    title: 'The Last of Us Part I', 
    isNew: true,
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888140/header.jpg',
    description: '[NARRATIVO / ACCIÓN / AVENTURA] En una civilización devastada, Joel, un superviviente endurecido, es contratado para sacar a escondidas a Ellie, una niña de 14 años, de una zona de cuarentena militar.',
    minRequirements: { cpu: 'AMD Ryzen 5 1500X / Intel Core i7-4770K', gpu: 'AMD Radeon RX 470 (4 GB) / NVIDIA GeForce GTX 970 (4 GB)', ram: '16 GB', os: 'Windows 10' },
    hltb: { general: '16h', main: '14h', extras: '16h', completionist: '23h' },
    links: {
      steam: 'https://store.steampowered.com/app/1888140/The_Last_of_Us_Part_I/',
      metacritic: 'https://www.metacritic.com/game/pc/the-last-of-us-part-i',
      hltb: 'https://howlongtobeat.com/game/101111'
    },
    genres: ['NARRATIVO', 'ACCIÓN', 'AVENTURA', 'SIGILO', 'POSTAPOCALÍPTICO']
  },
  { 
    id: 'portal2', 
    title: 'Portal 2', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/620/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
    description: '[PUZZLES / CIENCIA FICCIÓN / COMEDIA] Vuelve a los laboratorios de Aperture Science y enfréntate de nuevo a GLaDOS en una aventura de puzles que redefine el ingenio y la narrativa.',
    minRequirements: { cpu: '3.0 GHz P4, Dual Core 2.0 / AMD64X2', gpu: 'ATI Radeon X1900 / NVIDIA GeForce 7600', ram: '2 GB', os: 'Windows 7 / Vista / XP' },
    hltb: { general: '11h', main: '8h', extras: '11h', completionist: '21h' },
    links: {
      steam: 'https://store.steampowered.com/app/620/Portal_2/',
      metacritic: 'https://www.metacritic.com/game/pc/portal-2',
      hltb: 'https://howlongtobeat.com/game/7231'
    },
    genres: ['PUZZLES', 'CIENCIA FICCIÓN', 'COMEDIA', 'PRIMERA PERSONA', 'INDIE']
  },
  { 
    id: 'outerwilds', 
    title: 'Outer Wilds', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/753640/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/753640/header.jpg',
    description: '[EXPLORACIÓN / MISTERIO / ESPACIO] Un misterio de mundo abierto sobre un sistema solar atrapado en un bucle temporal infinito. Explora planetas que cambian con el paso del tiempo.',
    minRequirements: { cpu: 'Intel Core i5-2300 / AMD FX-4350', gpu: 'NVIDIA GeForce GTX 660 / AMD Radeon HD 7870', ram: '4 GB', os: 'Windows 7' },
    hltb: { general: '21h', main: '16h', extras: '22h', completionist: '32h' },
    links: {
      steam: 'https://store.steampowered.com/app/753640/Outer_Wilds/',
      metacritic: 'https://www.metacritic.com/game/pc/outer-wilds',
      hltb: 'https://howlongtobeat.com/game/57523'
    },
    genres: ['EXPLORACIÓN', 'MISTERIO', 'ESPACIO', 'AVENTURA', 'INDIE']
  },
  { 
    id: 'stardew', 
    title: 'Stardew Valley', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg',
    description: '[SIMULADOR / GRANJA / RELAJANTE] Has heredado la vieja parcela agrícola de tu abuelo. Armado con herramientas de mano y unas pocas monedas, te dispones a comenzar tu nueva vida.',
    minRequirements: { cpu: '2 Ghz', gpu: '256 mb video memory, shader model 3.0+', ram: '2 GB', os: 'Windows Vista or greater' },
    hltb: { general: '100h', main: '53h', extras: '97h', completionist: '154h' },
    links: {
      steam: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
      metacritic: 'https://www.metacritic.com/game/pc/stardew-valley',
      hltb: 'https://howlongtobeat.com/game/8933'
    },
    genres: ['SIMULADOR', 'GRANJA', 'RELAJANTE', 'INDIE', 'RPG']
  },
  { 
    id: 'discoelysium', 
    title: 'Disco Elysium - The Final Cut', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/632470/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/632470/header.jpg',
    description: '[RPG / DETECTIVE / NARRATIVO] Eres un detective con un sistema de habilidades único a tu disposición y toda una manzana para abrirte paso. Interroga personajes, resuelve crímenes o acepta sobornos.',
    minRequirements: { cpu: 'Intel Core 2 Duo', gpu: 'DirectX 11 compatible video card (integrated or dedicated with min 512MB memory)', ram: '2 GB', os: 'Windows 7' },
    hltb: { general: '33h', main: '23h', extras: '33h', completionist: '52h' },
    links: {
      steam: 'https://store.steampowered.com/app/632470/Disco_Elysium__The_Final_Cut/',
      metacritic: 'https://www.metacritic.com/game/pc/disco-elysium-the-final-cut',
      hltb: 'https://howlongtobeat.com/game/57335'
    },
    genres: ['RPG', 'DETECTIVE', 'NARRATIVO', 'FILOSÓFICO', 'ISOMÉTRICO']
  },
  { 
    id: 'cuphead', 
    title: 'Cuphead', 
    isNew: true,
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/268910/library_600x900_2x.jpg',
    headerImg: 'https://cdn.akamai.steamstatic.com/steam/apps/268910/header.jpg',
    description: '[DIFÍCIL / BOSS RUSH / PLATAFORMAS] Un juego de acción clásico de \'corre y dispara\' centrado en batallas contra jefes. Inspirado en los dibujos animados de la década de 1930.',
    minRequirements: { cpu: 'Intel Core2 Duo E8400 / AMD Athlon 64 X2 6000+', gpu: 'NVIDIA GeForce 9600 GT / AMD Radeon HD 3870', ram: '3 GB', os: 'Windows 7' },
    hltb: { general: '14h', main: '11h', extras: '14h', completionist: '25h' },
    links: {
      steam: 'https://store.steampowered.com/app/268910/Cuphead/',
      metacritic: 'https://www.metacritic.com/game/pc/cuphead',
      hltb: 'https://howlongtobeat.com/game/21680'
    },
    genres: ['DIFÍCIL', 'BOSS RUSH', 'PLATAFORMAS', 'INDIE', 'DIBUJOS ANIMADOS']
  },
  {
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
  },
  {
    id: 'ballxpit',
    title: 'Ball x pit',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3110390/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3110390/header.jpg',
    description: '[FÍSICAS / PUZZLES / INDIE / DIFÍCIL / PRECISION] Un desafiante juego de plataformas basado en físicas donde controlas una pequeña bola a través de un mundo laberíntico. Olvídate de los saltos tradicionales; aquí dependes del impulso, la gravedad y una precisión milimétrica para superar obstáculos que parecen imposibles. Cada nivel es un puzle de inercia que pondrá a prueba tu paciencia y habilidad técnica.',
    minRequirements: {},
    genres: ['FÍSICAS', 'PUZZLES', 'INDIE', 'DIFICÍL', 'PRECISIÓN'],
    hltb: { general: '---', main: '---', extras: '---', completionist: '---' },
    links: { steam: 'https://store.steampowered.com/app/3110390/Ball_x_pit/', metacritic: '---', hltb: '---' },
    isNew: true
  },
  {
    id: 'yangtze',
    title: 'Murders on the Yangtze River',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2274640/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2274640/header.jpg',
    description: '[MISTERIO / DETECTIVE / NARRATIVO / INVESTIGACIÓN / HISTÓRICO] Una aventura de misterio al estilo "whodunnit" ambientada en la China de principios del siglo XX. A bordo de un barco por el río Yangtsé, deberás investigar una serie de asesinatos entrelazados. Recoge pistas, interroga a sospechosos con personalidades complejas y utiliza el razonamiento lógico para desvelar una conspiración que va mucho más allá de un simple crimen pasional.',
    minRequirements: {},
    genres: ['MISTERIO', 'DETECTIVE', 'NARRATIVO', 'INVESTIGACIÓN', 'HISTÓRICO'],
    hltb: { general: '15h', main: '12h', extras: '---', completionist: '20h' },
    links: { steam: 'https://store.steampowered.com/app/2274640/Murders_on_the_Yangtze_River/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/144185' },
    isNew: true
  },
  {
    id: 'plague_requiem',
    title: 'A Plague Tale: Requiem',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    description: '[AVENTURA / NARRATIVO / SIGILO / ACCIÓN / POSTAPOCALÍPTICO] La desgarradora conclusión del viaje de Amicia y Hugo. Tras huir de su hogar devastado, los hermanos viajan al sur, hacia nuevas regiones y vibrantes ciudades, intentando comenzar una nueva vida y controlar la maldición de Hugo. Sin embargo, cuando sus poderes resurgen, la muerte y la destrucción regresan en forma de una inundación de ratas voraces, obligándoles a huir de nuevo hacia una isla profetizada.',
    minRequirements: { cpu: 'Intel Core i5-4690K / AMD FX-8300', gpu: 'NVIDIA GeForce GTX 970 / AMD Radeon RX 590', ram: '16 GB', os: 'Windows 10' },
    genres: ['AVENTURA', 'NARRATIVO', 'SIGILO', 'ACCIÓN', 'TERROR'],
    hltb: { general: '21h', main: '17h', extras: '22h', completionist: '27h' },
    links: { steam: 'https://store.steampowered.com/app/1182900/A_Plague_Tale_Requiem/', metacritic: 'https://www.metacritic.com/game/pc/a-plague-tale-requiem', hltb: 'https://howlongtobeat.com/game/93939' },
    isNew: true
  },
  {
    id: 'plague_innocence',
    title: 'A Plague Tale: Innocence',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    description: '[AVENTURA / NARRATIVO / SIGILO / TERROR / HISTÓRICO] Sigue la lúgubre historia de la joven Amicia y su hermano pequeño Hugo en un viaje por los momentos más oscuros de la historia. Perseguidos por la Inquisición y rodeados por imparables enjambres de ratas, Amicia y Hugo aprenderán a conocerse y a confiar entre sí mientras luchan por sobrevivir contra viento y marea y encontrar su lugar en el mundo en plena Guerra de los Cien Años.',
    minRequirements: { cpu: 'Intel Core i3-2100 / AMD FX-4100', gpu: 'NVIDIA GeForce GTX 660 / AMD Radeon HD 7870', ram: '8 GB', os: 'Windows 7/8/10' },
    genres: ['AVENTURA', 'NARRATIVO', 'SIGILO', 'TERROR', 'HISTÓRICO'],
    hltb: { general: '12h', main: '10h', extras: '12h', completionist: '16h' },
    links: { steam: 'https://store.steampowered.com/app/752590/A_Plague_Tale_Innocence/', metacritic: 'https://www.metacritic.com/game/pc/a-plague-tale-innocence', hltb: 'https://howlongtobeat.com/game/46502' },
    isNew: true
  },
  {
    id: 'nobodywantsdie',
    title: 'Nobody Wants to Die',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1939970/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1939970/header.jpg',
    description: '[DETECTIVE / CYBERPUNK / NARRATIVO / NOIR / MISTERIO] Sumérgete en una Nueva York distópica del año 2329, donde la tecnología ofrece la vida eterna... a un precio. Encarna al detective James Karra en una investigación noir ultra-tecnológica. Utiliza herramientas de manipulación temporal y tecnología avanzada para reconstruir escenas del crimen y dar caza a un asesino en serie que ataca a la élite de la ciudad, en un mundo donde la muerte es casi un concepto olvidado.',
    minRequirements: { cpu: 'Intel Core i3-8100 / AMD Ryzen 3 2300X', gpu: 'NVIDIA GeForce GTX 1660 Super / AMD Radeon RX 5600 XT', ram: '16 GB', os: 'Windows 10' },
    genres: ['DETECTIVE', 'CYBERPUNK', 'NARRATIVO', 'NOIR', 'MISTERIO'],
    hltb: { general: '6h', main: '5h', extras: '6h', completionist: '7h' },
    links: { steam: 'https://store.steampowered.com/app/1939970/Nobody_Wants_to_Die/', metacritic: 'https://www.metacritic.com/game/pc/nobody-wants-to-die', hltb: 'https://howlongtobeat.com/game/146059' },
    isNew: true
  },
  {
    id: 'deathstranding_dc',
    title: 'DEATH STRANDING DIRECTOR\'S CUT',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg',
    description: '[ACCIÓN / AVENTURA / MUNDO ABIERTO / NARRATIVO / CIENCIA FICCIÓN] La experiencia definitiva de la obra de Hideo Kojima. En el futuro, un evento misterioso conocido como el Death Stranding ha abierto una puerta entre los vivos y los muertos, lo que lleva a grotescas criaturas del otro mundo a deambular por un planeta en ruinas ante una sociedad desolada. Como Sam Porter Bridges, deberás entregar esperanza a la humanidad conectando a los últimos supervivientes de unos Estados Unidos diezmados.',
    minRequirements: { cpu: 'Intel Core i5-3470 / AMD Ryzen 3 1200', gpu: 'NVIDIA GeForce GTX 1050 / AMD Radeon RX 560', ram: '8 GB', os: 'Windows 10' },
    genres: ['ACCIÓN', 'AVENTURA', 'MUNDO ABIERTO', 'NARRATIVO', 'CIENCIA FICCIÓN'],
    hltb: { general: '58h', main: '36h', extras: '60h', completionist: '113h' },
    links: { steam: 'https://store.steampowered.com/app/1850570/DEATH_STRANDING_DIRECTORS_CUT/', metacritic: 'https://www.metacritic.com/game/pc/death-stranding-directors-cut', hltb: 'https://howlongtobeat.com/game/93457' },
    isNew: true
  },
  {
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
  },
  {
    id: 'megabonk',
    title: 'Megabonk',
    img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3182800/header.jpg',
    headerImg: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3182800/header.jpg',
    description: '[ACCIÓN / PLATAFORMAS / INDIE / CASUAL / DIFÍCIL] Adrenalina pura en formato bidimensional. Controlas a un héroe armado con un martillo gigante en un plataformas de acción vertiginosa. El sistema de combate se basa completamente en el \'momentum\' y la inercia, exigiendo reflejos felinos para aplastar enemigos y superar intrincados niveles llenos de trampas, con un apartado artístico vibrante y mecánicas extremadamente satisfactorias.',
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
    description: '[AVENTURA / PUZZLES / INDIE / CASUAL / MISTERIO] Un viaje al terror psicológico con estética retro de la era de los 32 bits (estilo PS1). Este título mezcla la exploración en primera persona con mecánicas clásicas de \'point-and-click\'. Te adentrarás en un universo surrealista y opresivo, resolviendo puzles encriptados mientras la línea entre la realidad y la locura se difumina en tu intento por desenmascarar los oscuros secretos de una agencia paranormal.',
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
    description: '[ACCIÓN / AVENTURA / PLATAFORMAS / INDIE / DIFÍCIL] Un metroidvania 2D dibujado a mano, ambientado en un mundo \'Taopunk\' que mezcla ciberpunk y taoísmo. Acompaña a Yi, un héroe del pasado en busca de venganza contra los 9 Soles, formidables gobernantes de un reino desolado. Su combate es implacable y se inspira fuertemente en las mecánicas de desvío (parry) de Sekiro, exigiendo ritmo y precisión milimétrica en peleas contra jefes espectaculares.',
    minRequirements: {},
    genres: ['ACCIÓN', 'AVENTURA', 'PLATAFORMAS', 'INDIE', 'DIFICÍL'],
    hltb: { general: '26h', main: '23h', extras: '---', completionist: '38h' },
    links: { steam: 'https://store.steampowered.com/app/1809540/Nine_Sols/', metacritic: '---', hltb: 'https://howlongtobeat.com/game/112812' },
    isNew: true
  }
];

const header = `import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, BarChart3, History, Menu, X, Wifi, WifiOff, LogIn, ChevronLeft, 
  ShieldAlert, CheckCircle, AlertTriangle, Play, Trophy, Star, Clock, Info, 
  ExternalLink, Search, Filter, ArrowUp, ArrowDown, Gamepad2, Layers, BookOpen, 
  Brain, Dices, Wallet, RotateCcw, Share2, Heart, Zap, MessageSquare, Trash2, Smile 
} from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { db, auth } from './firebase';

import { GAMES, PLAYERS } from './data/games';

const EMOJI_PALETTE = ${JSON.stringify(EMOJI_PALETTE)};

const SINGLE_PLAYER_GAMES = ${JSON.stringify(SINGLE_PLAYER_GAMES, null, 2)};
\n\n`;

const currentApp = fs.readFileSync('src/App.jsx', 'utf8');
const lines = currentApp.split('\n');
const logic = lines.slice(lines.findIndex(l => l.includes('// ----------------------------------------------------------------------------'))).join('\n');

fs.writeFileSync('src/App.jsx', header + logic, 'utf8');
console.log('Restoration complete');
