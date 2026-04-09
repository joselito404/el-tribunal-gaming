const fs = require('fs');

let c = fs.readFileSync('src/App.jsx', 'utf8');

const startStr = 'const SINGLE_PLAYER_GAMES = ';
const startIdx = c.indexOf(startStr) + startStr.length;
const endIdx = c.indexOf('];', startIdx) + 1; // Find precisely the closing bracket

if (startIdx === -1 || c.indexOf('];', startIdx) === -1) {
    console.error("Could not find the array bounds.");
    process.exit(1);
}

const arrStr = c.substring(startIdx, endIdx);
let arr = JSON.parse(arrStr);

const descriptions = {
  // Las 5 fijadas por el usuario
  'eldenring': "Surca las Tierras Intermedias en una epopeya de fantasía oscura creada por Hidetaka Miyazaki y George R. R. Martin. Como un Sinluz, deberás blandir el poder del Círculo de Elden y alzarte como el Señor de Elden en un mundo abierto sin precedentes donde la libertad de exploración se encuentra con el desafío implacable de jefes legendarios y una mitología críptica.",
  'tlou1': "Vive la experiencia definitiva del juego que definió una generación narrativa. En una civilización colapsada por el hongo Cordyceps, Joel, un contrabandista cansado del mundo, debe escoltar a Ellie a través de unos Estados Unidos devastados. Lo que comienza como un encargo se convierte en un viaje emocional brutal que explora la moralidad y la supervivencia humana.",
  'expedition33': "Un RPG por turnos reactivo ambientado en un mundo inspirado en la Belle Époque. Cada año, la Pintora despierta para condenar a una generación. Únete a la Expedición 33 en una misión desesperada para destruir el ciclo de la muerte en una obra que mezcla la estrategia clásica con mecánicas de combate en tiempo real.",
  'deathstranding_2': "Sam Porter Bridges regresa para reconectar un mundo fragmentado más allá de las fronteras conocidas. A bordo de la nave Magellan y junto a la organización Drawbridge, deberás navegar por terrenos hostiles y enfrentar amenazas sobrenaturales en una odisea filosófica que redefine el viaje como el destino final.",
  'ninesols': "Un metroidvania 2D dibujado a mano en un universo 'Taopunk' que fusiona el ciberpunk con el taoísmo. Sigue al guerrero Yi en su cruzada de venganza contra los 9 Soles en un sistema de combate implacable basado en desvíos (parry) que exige una precisión milimétrica.",

  // Veteranos y clásicos
  'rdr2': "Arthur Morgan y la banda de van der Linde son forajidos en busca y captura tras un atraco fallido. Sumérgete en un mundo abierto viviente y reactivo, forjando tu camino a través de la América del siglo XIX en una obra maestra sobre la lealtad, la traición y el inevitable fin del Salvaje Oeste.",
  'hades': "Desafía al Dios de los Muertos y ábrete camino fuera del Inframundo a base de tajos en este roguelike de acción trepidante. Enfréntate a hordas de almas perdidas empuñando las armas y poderes del mismísimo Olimpo en un bucle narrativo donde cada intento de escape revela nuevos secretos.",
  'hollowknight': "Forja tu propio camino a través del reino subterráneo de Hallownest, un laberinto de cavernas en ruinas y ciudades olvidadas. Este magistral metroidvania te exige dominar un combate preciso, desentrañar misterios ancestrales y aliarte con extraños insectos en una atmósfera insuperable.",
  'witcher3': "Encarna a Geralt de Rivia, un curtido cazador de monstruos a sueldo embarcado en la búsqueda de la Niña de la Profecía. Explora un inabarcable continente asolado por la guerra, habitado por criaturas letales y personajes ambiguos, en un RPG maduro donde cada decisión moldea irreversiblemente el mundo a tu alrededor.",
  'portal2': "Una brillante amalgama de puzles espaciales, humor negro y ciencia ficción. Despierta 9999 días después de los eventos de Aperture Science y vuelve a empuñar la pistola de portales junto a la carismática Inteligencia Artificial GLaDOS y la peculiar esfera Wheatley.",
  'outerwilds': "Estás atrapado en un bucle temporal de 22 minutos, en un sistema solar inexplorado a punto de ser devorado por una supernova. Este aclamado título de misterio espacial te invita a deducir cómo funciona el universo uniendo los enigmáticos fragmentos de la antigua civilización Nomai, guiado únicamente por tu curiosidad.",
  'stardew': "Heredaste la vieja granja de tu abuelo en el entrañable Valle Stardew. Armado con herramientas de segunda mano, empezarás una nueva vida cultivando la tierra, cuidando animales y forjando relaciones íntimas con los lugareños en un indispensable simulador de vida y rol pastoral.",
  'discoelysium': "Despiertas con una amnesia brutal en un hotel destrozado y descubres que eres un detective en Revachol, una ciudad fracturada política y moralmente. Este inigualable RPG isométrico sustituye el combate físico por batallas dialécticas entre las distintas facciones psicológicas de tu propia mente.",
  'cuphead': "Déjate cautivar por la gloriosa animación tradicional de los años 30 en este despiadado run-and-gun. Cuphead y Mugman apostaron sus almas con el mismísimo Diablo y perdieron; ahora deben recolectar las deudas de otros pintorescos y demenciales jefes en una danza mortal que exige reflejos impecables.",

  // Recientes y Action-RPGs
  'sifu': "Domina el letal Kung-Fu estilo Pak Mei en tu cruzada solitaria de venganza por las calles de una ciudad contemporánea. Un beat 'em up revolucionario donde cada muerte te hace envejecer físicamente, volviéndote más fuerte pero más frágil, obligándote a dominar cada combate al compás de las artes marciales cinematográficas.",
  'cp2077': "Adéntrate en Night City, la megalópolis hiperviolenta del futuro dominada por megacorporaciones y ciberimplantes. Como V, un mercenario en constante evolución, lidiarás con una reliquia experimental implantada en tu mente que alberga el constructo digital del legendario roquero terrorista Johnny Silverhand.",
  'tsushima': "Tsushima arde bajo el paso de la arrolladora invasión mongol en pleno Japón feudal de 1274. Jin Sakai, un noble samurái superviviente, deberá sacrificar la doctrina de su linaje y convertirse en el temido Fantasma para liberar su hogar y proteger a su asediado pueblo.",
  'ds3': "La ceniza cae sobre el Reino de Lothric donde la Primera Llama amenaza con apagarse para siempre. Un viaje solemne, oscuro y brutal te aguarda mientras combates formidables criaturas corrompidas para devolver a los Señores de la Ceniza a sus tronos caídos en la obra magna que cimentó el género soulslike.",
  'sekiro': "Como el 'Lobo Manco', un guerrero samurái rescatado de la muerte, tu honor te ata al joven Señor Divino, al que deberás recuperar sea cual sea el precio. Experimenta el sistema de combate más electrizante jamás creado enfrentando magistrales duelos a espada donde el dominio del desvío rige tu supervivencia en el letal Japón Sengoku.",
  're4remake': "La supervivencia apenas es el inicio en la reinvención del clásico que transformó los juegos de terror y acción. Seis años tras el desastre de Raccoon City, Leon S. Kennedy viaja a una recóndita aldea europea bajo el macabro control del culto Los Iluminados en un rescate agónico teñido de horror.",
  'liesofp': "Una tenebrosa reimaginación hiperviolenta del clásico de Carlo Collodi ambientado en Krat, una majestuosa metrópolis de la Belle Époque consumida por locura cibernética y autómatas asesinos. Tu condición como marioneta humana implica enjabonar el delicado hilo entre la verdad y la mentira mientras forjas tu propio estilo de lucha.",
  'bg3': "Reúne a tu grupo y regresa al vasto reino de Faerûn en la secuela que ha redefinido los RPG tácticos isométricos. Tus decisiones moldean una historia inabarcable de alianzas inciertas, traiciones oscuras y profundas amistades mientras liberas o sucumbes a la corrupción de la deidad destructiva insertada en tu mente.",
  'godofwar': "Huyendo de la sangre derramada en Grecia, Kratos vive ahora como hombre en el gélido reino nórdico de Midgard junto a su hijo Atreus. En un viaje inquebrantable para esparcir las cenizas de su amada esposa desde el pico más alto, padre e hijo forjarán su turbio legado frente al amenazante panteón nórdico.",

  // Los añadidos especiales recientes
  'ballxpit': "Un título de plataformas laberíntico basado puramente en físicas mecánicas. Olvídate de los saltos automáticos; dependiendo de la inercia, rebotes programados y maniobras de extrema exactitud milimétrica, recorrerás trampas mortales que destrozarán tu paciencia y alimentarán tu determinación.",
  'yangtze': "Experimenta un refinado thriller de misterio histórico en la China de la década de 1900. Surca el exótico río Yangtsé y adéntrate en complejos crímenes utilizando el fino arte de la deducción londinense en combinación con un fuerte contexto dramático sobre el engaño humano.",
  'plague_requiem': "Sigue a los mellizos De Rune en su viaje al extremo sur intentando evadir la devastadora bendición encubierta de La Macula del pequeño Hugo. Esta aventura desgarradora combina intenso sigilo táctico con secuencias abrumadoras infestadas por inabarcables enjambres de ratas frenéticas en la desesperada Francia del siglo XIV.",
  'plague_innocence': "Francia, año de gracia 1349. Sumérgete en las deprimentes horas de la historia europea al amparo de Amicia de Rune y su frágil hermano. Perseguidos incesantemente por una opresiva congregación monástica y oleadas espectrales de ratas purulentas, confiarán su supervivencia exclusivamente a las antorchas y su astucia.",
  'nobodywantsdie': "Entra en los empapados callejones de la distópica ciudad de Nueva York del año 2329. Enfrentado al crudo abismo del neonoir, manejarás la neuroprótesis temporal para avanzar, retroceder e investigar macabros campos hiperrealistas, buscando verdades siniestras que las corporaciones desean omitir.",
  'deathstranding_dc': "La experiencia extendida de Hideo Kojima te sumerge en un mundo apocalíptico desolado donde los mortales están atrapados entre dos realidades insidiosas. Tu labor como repartidor de esperanza es vital en esta reflexiva obra colaborativa conectando a la humanidad en una solitaria red contra los Entes Varados.",
  'megabonk': "Combates de acción frenética y vibrante caos dominan tu trayectoria a lomos de un martillar gigante que se beneficia espectacularmente del rebote físico total. Machaca a contrarreloj y destroza escenarios en una entrega arcade brillante, caóticamente entretenida y visualmente estimulante.",
  'paragnosia': "Explora perturbadores laberintos en primera persona sumergido en un crudo visual de la época PlayStation original. Superando intrincadas lógicas sobrenaturales y rompecabezas opresivos, perderás el control sobre tu propio sentido de la cordura ante anomalías grotescas del más allá en una aterradora pesquisa paranormal.",
  'pluckysquire': "Una deliciosa aventura interdimensional en la vida de Jot un héroe literario expulsado directamente fuera de su imaginario reino bidimensional. Resuelve situaciones innovadoras moviéndote del colorido cuento ilustrado hacia los imponentes escenarios y plataformas del escritorio tridimensional interactuando con palabras dinámicas."
};

arr.forEach(game => {
    // 1. UPDATE IMG URL to library_600x900_2x.jpg
    let appIdMatch = game.headerImg ? (game.headerImg.match(/steam\/apps\/(\d+)\//)) : null;
    if (!appIdMatch && game.img) {
         appIdMatch = game.img.match(/steam\/apps\/(\d+)\//);
    }
    
    if (appIdMatch) {
        let appId = appIdMatch[1];
        game.img = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;
    }

    // 2. UPDATE DESCRIPTION
    if (descriptions[game.id]) {
        game.description = descriptions[game.id];
        delete game.summary;
    } else if (game.summary) {
        // En caso de que se nos escape alguno, asegurar que la clave sea description
        game.description = game.summary;
        delete game.summary;
    }
});

const newArrStr = JSON.stringify(arr, null, 2);
c = c.substring(0, startIdx) + newArrStr + c.substring(endIdx);

// ============================================
// ACTUALIZACIÓN DE VERSIÓN Y BITÁCORA
// ============================================

// Actualizamos versión en Header y Side Menu (que son los únicos lugares donde dice v6.5.0)
c = c.replace(/v6\.5\.0/g, 'v6.6.0');

// Para la bitácora, encontraremos el bloque de la v6.5.0 (que ahora dice v6.6.0 temporalmente por el replace brutal de arriba)
// Y encima le pondremos el nuevo bloque v6.6.0, y revertiremos el de abajo a v6.5.0
const newChangelogEntry = `              {/* v6.6.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-amber-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Star className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-amber-600/30 shadow-[0_0_20px_rgba(217,119,6,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.6.0 - Revisión Maestra y Calidad Total</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Reemplazo integral de la base de datos de juegos. Limpieza masiva de assets asegurando portadas verticales (v2x) para toda la galería central, erradicando distorsiones y bandas horizontales. Expansión y reescritura de 32 sinopsis a calidad premium editorial.
                  </p>
                </div>
              </div>

              {/* v6.5.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.5.0 - The Quality Update</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Limpieza de etiquetas 'NUEVO' en juegos veteranos reparando la lógica del filtro de ordenación. Implementación masiva de assets verticales para evitar estiramiento de imágenes y reescritura de 12 sinopsis con estándar de calidad editorial.
                  </p>
                </div>
              </div>`;

// Since our c.replace(/v6.5.0/g, 'v6.6.0') replaced the changelog title too, we can find the block specifically.
// We search for {/* v6.6.0 */} (which was v6.5.0) and replace that whole block until {/* v6.4.1 */}
const regexChangelog = /\{\/\* v6\.6\.0 \*\/\}[\s\S]*?(?=\{\/\* v6\.4\.1 \*\/\})/;
c = c.replace(regexChangelog, newChangelogEntry + '\n\n');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Update v6.6.0 Applied safely.');
