import { useState, useMemo, useEffect } from 'react';


import { SINGLE_PLAYER_GAMES, GAMES, PLAYERS } from './data/games';
/* eslint-disable no-unused-vars */
import { 
  Filter, ListFilter, Trophy, Clock,
  Users, BarChart3, History, Menu, X, Wifi, WifiOff, LogIn, ChevronLeft, 
  ShieldAlert, CheckCircle, AlertTriangle, Play, Star, Info, 
  ExternalLink, Search, ArrowUp, ArrowDown, Gamepad2, Layers, BookOpen, 
  Brain, Dices, Wallet, RotateCcw, Share2, Heart, Zap, MessageSquare, Trash2, Smile
} from 'lucide-react';
/* eslint-enable no-unused-vars */
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { db, auth } from './firebase';

const EMOJI_PALETTE = ["🔥","🐕","👾","💀","👑","💩"];




// ----------------------------------------------------------------------------
// RENDER: TARJETA DE JUEGO (STEAM MODE)
// ----------------------------------------------------------------------------
/* eslint-disable-next-line no-unused-vars */
const CoopGameCard = ({ game, score, onVote }) => {

  const isProhibida = game.category === 'Zona Prohibida';
  const isGuerreros = game.category === 'Guerreros';

  return (
    <div className={`p-5 md:p-7 rounded-2xl border-2 mb-8 transition-all bg-gray-900/60 backdrop-blur-md shadow-xl ${isProhibida ? 'border-red-900/50 hover:border-red-500/50' :
      isGuerreros ? 'border-yellow-900/50 hover:border-yellow-500/50' :
        'border-green-900/50 hover:border-green-500/50'
      }`}>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* COLUMNA IZQUIERDA: PORTADA */}
        <div className="w-full lg:w-3/5 flex flex-col gap-3">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-base border border-gray-800/80 relative">
            <img
              src={game.headerImage}
              alt={`Portada de ${game.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/600x337/1f2937/a5b4fc?text=${encodeURIComponent(game.title)}`;
              }}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: INFO Y VOTOS */}
        <div className="w-full lg:w-2/5 flex flex-col justify-between pt-1 lg:pt-0">
          <div>
            <div className="flex flex-col mb-4 gap-3">
              <div className="flex justify-between items-start">
                <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">{game.title}</h3>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold self-start uppercase tracking-wider shrink-0 ml-4 ${isProhibida ? 'bg-red-950 text-red-400 border border-red-900/50' :
                  isGuerreros ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/50' :
                    'bg-green-950 text-green-400 border border-green-900/50'
                  }`}>
                  {game.category}
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-base mb-6 leading-relaxed opacity-95">{game.desc}</p>

            <div className="flex items-center gap-3 mb-6 text-sm font-semibold bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-inner">
              {isProhibida ? <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" /> :
                isGuerreros ? <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-500" /> :
                  <CheckCircle className="w-5 h-5 shrink-0 text-green-500" />}
              <span className={isProhibida ? 'text-red-400' : isGuerreros ? 'text-yellow-400' : 'text-green-400'}>
                {game.perf}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-800/80">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-1">
              <span className="text-red-400/80">Veto (1-4.9)</span>
              <span>Neutral (5-6.9)</span>
              <span className="text-indigo-400/80">Jugar (7-10)</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => onVote(parseFloat(e.target.value))}
              className="w-full h-3.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-colors"
              style={{
                background: `linear-gradient(to right, ${score === 0 ? '#1f2937' :
                    score <= 4.9 ? `rgba(248, 113, 113, ${score / 10})` :
                      score <= 6.9 ? `rgba(156, 163, 175, ${score / 10})` :
                        `rgba(99, 102, 241, ${score / 10})`
                  } 0%, #1f2937 ${score * 10}%, #1f2937 100%)`
              }}
            />
            <div className="text-center mt-5">
              {score === 0
                ? <span className="text-gray-500 text-sm font-black uppercase tracking-[0.2em] bg-gray-900/80 px-5 py-2 rounded-full border border-gray-800">Sin votar</span>
                : <span className="text-4xl font-black text-white">{score} <span className="text-indigo-500 text-xl font-bold">/ 10</span></span>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(null); // Iniciamos en null
  const [votes, setVotes] = useState({ Jose: {}, Mario: {}, Iván: {}, Carmen: {}, Lázaro: {}, Alejandro: {} });
  const [evaluations, setEvaluations] = useState({ Jose: {}, Mario: {}, Iván: {}, Carmen: {}, Lázaro: {}, Alejandro: {} });
  const [view, setView] = useState('voting'); // 'voting' or 'results'
  const [hideVoted, setHideVoted] = useState(false);
  const [mode, setMode] = useState('coop'); // 'coop' o 'single'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSingleId, setSelectedSingleId] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userReviews, setUserReviews] = useState({}); // { gameId: { note: 8.5, text: "...", date: "...", noVote: false } }
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'specs', 'review', 'progress'
  const [theme, setTheme] = useState('dark');
  const [librarySort, setLibrarySort] = useState('news'); // 'news', 'top', 'alpha'
  const [libraryGenreFilter, setLibraryGenreFilter] = useState('all');
  const [reactionDropdownOpen, setReactionDropdownOpen] = useState(null);
  const [minMetacritic, setMinMetacritic] = useState(0);

  // ESTADOS DE LA RULETA
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [votedSnapshot, setVotedSnapshot] = useState([]);

  // ESTADOS ORÁCULO INTELIGENTE Y CASINO
  const [oracleFilters, setOracleFilters] = useState({ noProhibida: false, noVetos: false });
  const [oracleQuality, setOracleQuality] = useState('all'); // 'all', 'over7', 'over8', 'sobresaliente'
  const [bet, setBet] = useState({ type: null, value: null }); // type: 'color'|'category'
  const [betResult, setBetResult] = useState(null); // 'win' | 'lose' | null
  const [discordEnabled, setDiscordEnabled] = useState(true);
  const [playerChips, setPlayerChips] = useState({ Jose: 0, Mario: 0, Iván: 0, Carmen: 0, Lázaro: 0, Alejandro: 0 });
  const [isSaving, setIsSaving] = useState(false);


  const spinWheel = async () => {
    if (isSpinning) return;
    if (activePool.length === 0) return alert("¡Ningún juego cumple los filtros!");
    if (bet.type && !currentPlayer) return alert("¡Selecciona tu perfil arriba para poder apostar tus fichas!");

    if (bet.type && activePool.length < 10) {
      return alert("👮♂️ ¡ALTO AHÍ! Seguridad del Casino: No se permiten apuestas con menos de 10 juegos en la mesa. Desactiva filtros para evitar el fraude matemático.");
    }

    // VALIDACIÓN DE COSTE ACTUALIZADA
    let cost = 0;
    if (bet.type === 'color') cost = 10;
    if (bet.type === 'category') cost = 20;
    if (bet.type === 'game') cost = 20; // El pleno ahora solo cuesta 20 fichas arriesgarlo

    if (currentPlayer && bet.type && (playerChips[currentPlayer] || 0) < cost) {
      return alert(`¡Fondos insuficientes! Necesitas ${cost} fichas para esta apuesta.`);
    }

    setIsSpinning(true);
    setWinner(null);
    setBetResult(null);

    const segmentSize = 360 / activePool.length;
    const totalRotation = rotation + (360 * 5) + Math.floor(Math.random() * 360);
    setRotation(totalRotation);

    // SUBIMOS A 5000ms (5 segundos)
    setTimeout(async () => {
      setIsSpinning(false);
      const normalizedDegrees = totalRotation % 360;
      const winnerIndex = Math.floor(((360 - normalizedDegrees + (segmentSize / 2)) % 360) / segmentSize) % activePool.length;
      const finalGame = activePool[winnerIndex];
      const isRed = winnerIndex % 2 === 0; // Rojo si es par, Negro si es impar

      const winnerData = { ...finalGame, color: isRed ? 'red' : 'black' };
      setWinner(winnerData);

      // RESOLUCIÓN DE APUESTAS BALANCEADA
      if (bet.type && currentPlayer) {
        let isWin = false;
        let chipChange = 0;

        // COLOR (1:1) -> Riesgo 10, Gana 10
        if (bet.type === 'color' && bet.value === winnerData.color) { isWin = true; chipChange = 10; }
        else if (bet.type === 'color') chipChange = -10;

        // CATEGORÍA (2:1) -> Riesgo 20, Gana 40
        if (bet.type === 'category' && bet.value === winnerData.category) { isWin = true; chipChange = 40; }
        else if (bet.type === 'category') chipChange = -20;

        // PLENO (25:1) -> Riesgo 20, Gana 500
        if (bet.type === 'game' && bet.value === winnerData.id) { isWin = true; chipChange = 500; }
        else if (bet.type === 'game') chipChange = -20;

        setBetResult(isWin ? 'win' : 'lose');

        // Guardar en Firebase
        const newTotal = (playerChips[currentPlayer] || 0) + chipChange;
        try {
          await setDoc(doc(db, 'votos-gaming', 'data', 'grupo_fichas', currentPlayer), { total: newTotal }, { merge: true });
        } catch (e) { console.error("Error guardando fichas", e); }
      }

      // DISCORD TOGGLE
      const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1486472127006904492/5OrVw-Af8k7pZ-KFQU1pzXX2wwCi1jjatbvyi_VcTnS-DWQ3SqImUGt7ojc6jYxBRwB-";
      if (DISCORD_WEBHOOK_URL !== "" && discordEnabled) {
        const payload = {
          content: "🔮 **¡EL ORÁCULO HA DICTADO SENTENCIA!** 🔮\nPreparad los PCs, esta noche se juega a...",
          embeds: [{
            title: winnerData.title,
            description: winnerData.desc,
            color: winnerData.color === 'red' ? 14811135 : 2303786, // Rojo o Gris oscuro según el color ganador
            image: { url: winnerData.headerImage },
            footer: { text: "El Tribunal Gaming v4.4.2" }
          }]
        };

        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.error("Error enviando a Discord:", err));
      }
    }, 5000);
  };

  useEffect(() => {
    if (hideVoted) {
      const currentScores = view === 'voting' ? votes[currentPlayer] : evaluations[currentPlayer];
      setVotedSnapshot(GAMES.filter(g => (currentScores?.[g.id] || 0) === 0).map(g => g.id));
    } else {
      setVotedSnapshot([]);
    }
  }, [hideVoted, view, currentPlayer, evaluations, votes]);

  const handleBankruptcy = async () => {
    if (!currentPlayer) return;
    if (window.confirm("¿Estás en la calle? El Oráculo te presta 500 fichas para que sigas pecando.")) {
      try {
        await setDoc(doc(db, 'votos-gaming', 'data', 'grupo_fichas', currentPlayer), { total: 500 }, { merge: true });
      } catch (e) { console.error("Error en bancarrota", e); }
    }
  };

  const resetGlobalEconomy = async () => {
    if (window.confirm("⚠️ ¿Estás seguro de que quieres resetear la economía? Todos volverán a tener 1000 fichas.")) {
      try {
        for (const player of PLAYERS) {
          await setDoc(doc(db, 'votos-gaming', 'data', 'grupo_fichas', player), { total: 1000 }, { merge: true });
        }
        alert("💸 Economía global restaurada a 1000 fichas por jugador.");
      } catch (e) { console.error("Error reseteando economía", e); }
    }
  };

  const [user, setUser] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('connecting');

  // ----------------------------------------------------------------------------
  // INICIALIZACIÓN DE FIREBASE
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error autenticando:", error);
        setCloudStatus('error');
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setCloudStatus('connected');
    });

    return () => unsubscribe();
  }, []);

  // Sincronización con Firestore
  useEffect(() => {
    if (!user) return;
    const votesRef = collection(db, 'votos-gaming', 'data', 'grupo_votos');

    const unsubscribe = onSnapshot(votesRef, (snapshot) => {
      const dbVotes = { Jose: {}, Mario: {}, Iván: {}, Carmen: {}, Lázaro: {}, Alejandro: {} };
      snapshot.forEach(docSnap => {
        if (PLAYERS.includes(docSnap.id)) {
          dbVotes[docSnap.id] = docSnap.data();
        }
      });
      setVotes(dbVotes);
      setCloudStatus('connected');
    }, (error) => {
      console.error("Error sincronizando:", error);
      setCloudStatus('error');
    });

    // Sincronización de Evaluaciones (0-100)
    const evalsRef = collection(db, 'votos-gaming', 'data', 'grupo_evaluaciones');
    const unsubscribeEvals = onSnapshot(evalsRef, (snapshot) => {
      const dbEvals = { Jose: {}, Mario: {}, Iván: {}, Carmen: {}, Lázaro: {}, Alejandro: {} };
      snapshot.forEach(docSnap => {
        if (PLAYERS.includes(docSnap.id)) dbEvals[docSnap.id] = docSnap.data();
      });
      setEvaluations(dbEvals);
    });

    // Sincronización de Fichas del Casino
    const chipsRef = collection(db, 'votos-gaming', 'data', 'grupo_fichas');
    const unsubscribeChips = onSnapshot(chipsRef, (snapshot) => {
      const dbChips = { Jose: 1000, Mario: 1000, Iván: 1000, Carmen: 1000, Lázaro: 1000, Alejandro: 1000 };
      snapshot.forEach(docSnap => {
        if (PLAYERS.includes(docSnap.id)) dbChips[docSnap.id] = docSnap.data().total || 0;
      });
      setPlayerChips(dbChips);
    });

    // Sincronización de Reseñas Single Player
    const singleReviewsRef = collection(db, 'votos-gaming', 'data', 'single_player_reviews');
    const unsubscribeSingle = onSnapshot(singleReviewsRef, (snapshot) => {
      const dbSingleReviews = {};
      snapshot.forEach(docSnap => {
        dbSingleReviews[docSnap.id] = docSnap.data();
      });
      setUserReviews(dbSingleReviews);
    });

    return () => {
      unsubscribe();
      unsubscribeEvals();
      unsubscribeChips();
      unsubscribeSingle();
    };
  }, [user]);

  const handleSingleReview = async (gameId, reviewData) => {
    if (!currentPlayer || !user) return;
    try {
      const gameReviewRef = doc(db, 'votos-gaming', 'data', 'single_player_reviews', gameId);
      await setDoc(gameReviewRef, {
        [currentPlayer]: {
          ...reviewData,
          date: new Date().toLocaleDateString()
        }
      }, { merge: true });
    } catch (error) {
      console.error("Error guardando review individual:", error);
    }
  };

  const handleDeleteReview = async (gameId) => {
    if (!currentPlayer || !user) return;
    if (!window.confirm("¿Seguro que quieres borrar tu reseña? No hay vuelta atrás.")) return;

    try {
      const gameReviewRef = doc(db, 'votos-gaming', 'data', 'single_player_reviews', gameId);
      await updateDoc(gameReviewRef, {
        [currentPlayer]: deleteField()
      });
      // El estado local se actualizará solo gracias al onSnapshot
    } catch (error) {
      console.error("Error borrando review:", error);
    }
  };

  const handleReaction = async (gameId, reviewOwner, emoji) => {
    if (!currentPlayer || !user) return;
    try {
      const gameReviewRef = doc(db, 'votos-gaming', 'data', 'single_player_reviews', gameId);
      const currentReviews = userReviews[gameId] || {};
      const ownerReview = currentReviews[reviewOwner] || {};
      const reactions = ownerReview.reactions || {};
      const emojiUsers = reactions[emoji] || [];

      let newEmojiUsers;
      if (emojiUsers.includes(currentPlayer)) {
        newEmojiUsers = emojiUsers.filter(p => p !== currentPlayer);
      } else {
        newEmojiUsers = [...emojiUsers, currentPlayer];
      }

      const newReactions = { ...reactions, [emoji]: newEmojiUsers };
      // Limpiar emojis vacíos
      if (newEmojiUsers.length === 0) delete newReactions[emoji];

      await setDoc(gameReviewRef, {
        [reviewOwner]: {
          ...ownerReview,
          reactions: newReactions
        }
      }, { merge: true });
    } catch (e) { console.error("Error updating reaction", e); }
  };

  // ----------------------------------------------------------------------------
  // MANEJO DE VOTOS
  // ----------------------------------------------------------------------------
  const handleVote = async (gameId, score) => {
    if (!currentPlayer) return;

    setVotes(prev => ({
      ...prev,
      [currentPlayer]: {
        ...prev[currentPlayer],
        [gameId]: score
      }
    }));

    if (!user) return;
    try {
      const playerDocRef = doc(db, 'votos-gaming', 'data', 'grupo_votos', currentPlayer);
      await setDoc(playerDocRef, { [gameId]: score }, { merge: true });
    } catch (error) {
      console.error("Error guardando voto:", error);
    }
  };

  const getCurrentVote = (gameId) => {
    if (!currentPlayer) return 0;
    return votes[currentPlayer]?.[gameId] || 0;
  };

  const handleEvaluation = async (gameId, score) => {
    if (!currentPlayer) return;
    setEvaluations(prev => ({ ...prev, [currentPlayer]: { ...prev[currentPlayer], [gameId]: score } }));
    if (!user) return;
    try {
      const playerDocRef = doc(db, 'votos-gaming', 'data', 'grupo_evaluaciones', currentPlayer);
      await setDoc(playerDocRef, { [gameId]: score }, { merge: true });
    } catch (error) { console.error("Error guardando evaluación:", error); }
  };

  const getCurrentEval = (gameId) => {
    if (!currentPlayer) return 0;
    return evaluations[currentPlayer]?.[gameId] || 0;
  };

  // ----------------------------------------------------------------------------
  // LÓGICA DE RANKINGS (v2.8 - 4 Modos y Doble Columna)
  // ----------------------------------------------------------------------------
  const [col1Config, setCol1Config] = useState({ type: 'media', players: PLAYERS });
  const [col2Config, setCol2Config] = useState({ type: 'total', players: PLAYERS });

  const getDynamicRanking = (config) => {
    if (!config || config.players.length === 0) return [];

    // Caso especial: Ranking de Fichas del Casino
    if (config.type === 'fichas') {
      return config.players.map(p => ({ player: p, score: playerChips[p] || 0 })).sort((a, b) => b.score - a.score);
    }

    // Lógica para Votos y Evaluaciones
    const dataSource = config.type === 'eval_media' ? evaluations : votes;
    const calcType = config.type === 'total' ? 'total' : 'media';
    return getCalculatedRanking(config.players, calcType, dataSource);
  };

  const getCalculatedRanking = (playersToCount, sortBy, dataSource = votes) => {
    const scores = {};
    GAMES.forEach(game => {
      let total = 0;
      let vetos = 0;
      let voters = 0;

      playersToCount.forEach(player => {
        const score = dataSource[player]?.[game.id];
        if (score !== undefined && score > 0) {
          total += score;
          voters++;
          if (score <= 4.9) vetos++;
        }
      });

      const media = voters > 0 ? (total / voters) : 0;
      scores[game.id] = { total, media, vetos, voters, ...game };
    });

    return Object.values(scores).sort((a, b) => {
      if (sortBy === 'media') {
        if (b.media !== a.media) return b.media - a.media;
        // [x] Verification & Deployment
        // - [x] Verify v2.9 functionality (filters and real-time stats calculations)
        // - [x] Verify hater/fanboy logic
        // - [x] Verify roulette filter consistency
        // - [x] Deploy to Vercel (https://tribunal-gaming.vercel.app)
        if (a.vetos !== b.vetos) return a.vetos - b.vetos;
        return b.total - a.total;
      } else { // sortBy === 'total'
        if (b.total !== a.total) return b.total - a.total;
        if (b.media !== a.media) return b.media - a.media;
        return a.vetos - b.vetos;
      }
    });
  };

  const rankingsData = useMemo(() => ({
    global_media: getCalculatedRanking(PLAYERS, 'media', votes),
    pcDecente_media: getCalculatedRanking(PLAYERS.filter(p => p !== 'Iván' && p !== 'Lázaro'), 'media', votes),
    global_total: getCalculatedRanking(PLAYERS, 'total', votes),
    pcDecente_total: getCalculatedRanking(PLAYERS.filter(p => p !== 'Iván' && p !== 'Lázaro'), 'total', votes),
    triunvirato_media: getCalculatedRanking(['Jose', 'Mario', 'Iván'], 'media', votes),
    triunvirato_total: getCalculatedRanking(['Jose', 'Mario', 'Iván'], 'total', votes),
    global_eval_media: getCalculatedRanking(PLAYERS, 'media', evaluations),
    ranking_fichas: PLAYERS.map(p => ({ player: p, score: playerChips[p] || 0 })).sort((a, b) => b.score - a.score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [votes, evaluations, playerChips]);

  const playerStats = useMemo(() => {
    const stats = {};
    PLAYERS.forEach(p => stats[p] = {
      vetos: 0, dieses: 0, neutrales: 0, totalVotes: 0, sum: 0,
      sinVotar: 0, prohibidaSum: 0, prohibidaCount: 0, desviacionTotal: 0
    });

    Object.entries(votes).forEach(([player, playerVotes]) => {
      GAMES.forEach(game => {
        const score = playerVotes[game.id] || 0;
        const mediaGlobal = rankingsData.global_media.find(r => r.id === game.id)?.media || 0;

        if (score > 0) {
          stats[player].totalVotes++;
          stats[player].sum += score;

          if (score <= 4.9) stats[player].vetos++;
          else if (score >= 9) stats[player].dieses++;
          else if (score <= 6.9) stats[player].neutrales++;

          if (game.category === 'Zona Prohibida') {
            stats[player].prohibidaSum += score;
            stats[player].prohibidaCount++;
          }

          if (mediaGlobal > 0) {
            stats[player].desviacionTotal += Math.abs(score - mediaGlobal);
          }
        } else {
          stats[player].sinVotar++;
        }
      });
    });
    return stats;
  }, [votes, rankingsData]);

  const activePool = useMemo(() => {
    let pool = GAMES;
    if (oracleFilters.noProhibida) pool = pool.filter(g => g.category !== 'Zona Prohibida');
    if (oracleFilters.noVetos) {
      pool = pool.filter(g => {
        let hasVeto = false;
        PLAYERS.forEach(p => { if (votes[p]?.[g.id] > 0 && votes[p]?.[g.id] <= 4.9) hasVeto = true; });
        return !hasVeto;
      });
    }
    if (oracleQuality === 'over7') pool = pool.filter(g => (rankingsData.global_media.find(r => r.id === g.id)?.media || 0) >= 7);
    if (oracleQuality === 'over8') pool = pool.filter(g => (rankingsData.global_media.find(r => r.id === g.id)?.media || 0) >= 8);
    if (oracleQuality === 'sobresaliente') pool = pool.filter(g => (rankingsData.global_media.find(r => r.id === g.id)?.media || 0) >= 9);
    return pool;
  }, [oracleFilters, oracleQuality, votes, rankingsData]);


  // ----------------------------------------------------------------------------
  // RENDER: PANTALLA DE SELECCIÓN DE PERFIL (Forzada)
  // ----------------------------------------------------------------------------
  if (!currentPlayer && view === 'voting') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 w-full max-w-2xl text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500">
            Identificación Requerida
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            ¿Quién eres? Selecciona tu perfil para entrar en la sala de votación del Tribunal.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PLAYERS.map(p => (
              <button
                key={p}
                onClick={() => setCurrentPlayer(p)}
                className="group relative px-6 py-6 rounded-2xl bg-gray-800 hover:bg-indigo-600 transition-all duration-300 border border-gray-700 hover:border-indigo-400 overflow-hidden"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-xl font-bold text-gray-300 group-hover:text-white transition-colors">{p}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getExtendedLabel = (note) => {
    if (note === null || note < 0) return "Sin Votos";
    if (note >= 9.5) return "Obra Maestra";
    if (note >= 8.5) return "Imprescindible";
    if (note >= 7.5) return "Muy Recomendado";
    if (note >= 6.5) return "Buen Juego";
    if (note >= 5.5) return "Pasable";
    if (note >= 4.5) return "Mediocre";
    if (note >= 3.0) return "Deficiente";
    return "Basura Injugable";
  };

  return (
    <div className={`min-h-dvh bg-[#0b0f19] text-gray-100 p-4 md:p-8 font-sans pb-24 selection:bg-indigo-500/30 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER Y ESTADO DE LA NUBE */}
        <header className="mb-10 text-center relative">
          <div className="absolute top-0 right-0 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 shadow-lg">
            {cloudStatus === 'connected' ? (
              <><Wifi className="w-4 h-4 text-green-500" /> <span className="text-green-400 hidden md:inline">Sincronizado</span></>
            ) : cloudStatus === 'connecting' ? (
              <><Wifi className="w-4 h-4 text-yellow-500 animate-pulse" /> <span className="text-yellow-400 hidden md:inline">Conectando...</span></>
            ) : (
              <><WifiOff className="w-4 h-4 text-red-500" /> <span className="text-red-400 hidden md:inline">Desconectado</span></>
            )}
          </div>
          <div className="absolute top-0 left-0 pt-8 md:pt-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-indigo-400 hover:text-white transition-all shadow-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-linear-to-br from-indigo-400 via-purple-400 to-pink-500 pb-2 mb-4 pt-8 md:pt-0 tracking-tight text-center">
            El Tribunal Gaming <span className="text-pink-500 text-2xl md:text-3xl">v6.7.3</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium text-center">Temporada {mode === 'coop' ? 'Cooperativa' : 'Individual'} 2026</p>
        </header>

        {/* SIDEBAR NAVIGATION */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="relative w-80 bg-gray-950 h-full border-r border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-black text-white italic">MENÚ</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-900 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => { setMode('coop'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${mode === 'coop' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                >
                  <Users className="w-6 h-6" /> ⚔️ Modo Cooperativo
                </button>
                <button
                  onClick={() => { setMode('single'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${mode === 'single' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                >
                  <Play className="w-6 h-6" /> 🗡️ Modo Individual
                </button>
                <button
                  onClick={() => { setView('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${view === 'settings' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-lg">⚙️</div> Ajustes
                </button>
              </nav>
              <div className="mt-auto p-6 border-t border-gray-800">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Tribunal Gaming Engine v6.7.3</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO SEGÚN MODO */}
        {mode === 'coop' ? (
          <>
        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-10 px-4">
          <button
            onClick={() => setView('voting')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'voting' ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <Users className="w-5 h-5 md:w-6 md:h-6" /> Panel de Votos
          </button>
          <button
            onClick={() => setView('evaluation')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'evaluation' ? 'bg-cyan-600 text-white shadow-[0_0_30px_rgba(8,145,178,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> Sala de Evaluación
          </button>
          <button
            onClick={() => setView('rankings')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'rankings' ? 'bg-purple-600 text-white shadow-[0_0_30px_rgba(147,51,234,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6" /> Rankings
          </button>
          <button
            onClick={() => setView('stats')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'stats' ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" /> Muro de la Vergüenza
          </button>
          <button
            onClick={() => setView('changelog')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'changelog' ? 'bg-gray-700 text-white shadow-[0_0_30px_rgba(0,0,0,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <History className="w-5 h-5 md:w-6 md:h-6" /> Archivo
          </button>
          <button
            onClick={() => setView('roulette')}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all ${view === 'roulette' ? 'bg-pink-600 text-white shadow-[0_0_30px_rgba(219,39,119,0.3)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 rotate-90" /> El Oráculo
          </button>
        </div>

        {/* VISTA DE VOTACIÓN */}
        {view === 'voting' && (
          <div className="space-y-4 max-w-6xl mx-auto min-h-[80dvh]">
            <div className="flex justify-between items-center mb-8 px-2 flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-gray-900/80 px-5 py-3 rounded-2xl border border-gray-800 shadow-md">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votando como</p>
                  <p className="text-xl font-black text-white">{currentPlayer}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-500 rounded bg-gray-800 border-gray-700"
                    checked={hideVoted} onChange={(e) => setHideVoted(e.target.checked)} />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Ocultar Votados</span>
                </label>
                <button
                  onClick={() => setCurrentPlayer(null)}
                  className="text-sm font-bold text-gray-500 hover:text-white transition-colors bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Cambiar perfil
                </button>
              </div>
            </div>

            {/* Cabecera Informativa: Escala de Ganas */}
            <div className="w-full mx-auto mb-10 bg-gray-900/40 border border-gray-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-indigo-500"></div>
                <h2 className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs text-center">
                  Escala de Ganas (Criterio de Voto)
                </h2>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-indigo-500"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                {[
                  { n: "10", c: "text-pink-500", t: "Hype Máximo", d: "Hay que jugarlo YA. Cancelo mis planes si hace falta para probar esto hoy." },
                  { n: "9", c: "text-purple-400", t: "Ganas Locas", d: "Tiene una pinta brutal. Lo voy a votar todos los días hasta que por fin caiga." },
                  { n: "8", c: "text-indigo-400", t: "Muy Apetecible", d: "Me llama muchísimo la atención. Es una apuesta casi segura para el grupo." },
                  { n: "7", c: "text-blue-400", t: "Buena Pinta", d: "Parece divertido. Me apunto sin quejarme si sale elegido." },
                  { n: "6", c: "text-green-400", t: "Me Vale", d: "Si la mayoría quiere probarlo, me sumo. (La zona de confort del Indeciso)." },
                  { n: "5", c: "text-yellow-400", t: "Pereza", d: "Me da bastante igual. Lo jugaría si no hay más remedio, pero preferiría otra cosa." },
                  { n: "4", c: "text-orange-400", t: "No me llama", d: "Tiene pinta de aburrirme rápido. Paso un poco." },
                  { n: "3", c: "text-red-400", t: "Rechazo", d: "No le veo la gracia por ningún lado. Me voy a quejar por el micro si jugamos a esto." },
                  { n: "2", c: "text-red-500", t: "Veto Activo", d: "Ni de broma. Si sale este juego, me voy a ver una serie o a cenar." },
                  { n: "1", c: "text-red-600", t: "Ni con un palo", d: "Antes desinstalo Steam que meter esta basura en mi disco duro." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-950/40 p-3 rounded-xl border border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                    <span className={`font-black text-2xl min-w-[45px] text-center ${item.c}`}>{item.n}</span>
                    <div className="leading-tight">
                      <span className="block font-black text-white uppercase text-[13px] tracking-wider mb-1">{item.t}</span>
                      <span className="text-gray-300 text-[14px] leading-snug">{item.d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {GAMES.filter(game => !hideVoted || votedSnapshot.includes(game.id)).map(game => (
              <CoopGameCard
                key={game.id}
                game={game}
                score={getCurrentVote(game.id)}
                onVote={(newScore) => handleVote(game.id, newScore)}
              />
            ))}
          </div>
        )}

        {/* VISTA DE EVALUACIÓN (0-100) */}
        {view === 'evaluation' && (
          <div className="space-y-4 max-w-6xl mx-auto min-h-[80dvh] animate-in fade-in duration-500">
            <div className="bg-gray-900/80 p-6 rounded-2xl border border-cyan-900/50 mb-8 text-center shadow-lg">
              <h2 className="text-3xl font-black text-white mb-2">Sala de Evaluación Crítica</h2>
              <p className="text-gray-400">Puntúa del 0 al 100 los juegos que ya hemos probado.</p>
              <div className="mt-5 flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer group bg-gray-950 px-5 py-2 rounded-full border border-gray-800 hover:border-cyan-500/50 transition-all">
                  <input type="checkbox" className="w-4 h-4 accent-cyan-500 rounded bg-gray-800 border-gray-700"
                    checked={hideVoted} onChange={(e) => setHideVoted(e.target.checked)} />
                  <span className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">Ocultar Evaluados</span>
                </label>
              </div>
            </div>

            {GAMES.filter(game => !hideVoted || votedSnapshot.includes(game.id)).map(game => {
              const score = getCurrentEval(game.id);
              let gradeText = "Sin Evaluar";
              let colorClass = "text-gray-500";
              let barColor = "#1f2937";

              if (score > 0) {
                if (score < 50) { gradeText = "Suspenso"; colorClass = "text-red-500"; barColor = "rgba(239, 68, 68, 1)"; }
                else if (score < 60) { gradeText = "Aprobado"; colorClass = "text-orange-500"; barColor = "rgba(249, 115, 22, 1)"; }
                else if (score < 70) { gradeText = "Bien"; colorClass = "text-yellow-500"; barColor = "rgba(234, 179, 8, 1)"; }
                else if (score < 90) { gradeText = "Notable"; colorClass = "text-green-500"; barColor = "rgba(34, 197, 94, 1)"; }
                else { gradeText = "Sobresaliente"; colorClass = "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"; barColor = "rgba(34, 211, 238, 1)"; }
              }

              return (
                <div key={game.id} className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/4 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img src={game.headerImage} alt={game.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="w-full md:w-3/4 flex flex-col">
                    <h3 className="text-2xl font-black text-white mb-4">{game.title}</h3>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      <span>0</span> <span>50</span> <span>100</span>
                    </div>
                    <input type="range" min="0" max="100" value={score} onChange={(e) => handleEvaluation(game.id, parseInt(e.target.value))}
                      className="w-full h-4 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${barColor} 0%, ${barColor} ${score}%, #1f2937 ${score}%, #1f2937 100%)` }}
                    />
                    <div className="mt-4 flex justify-between items-end">
                      <span className={`text-xl font-black uppercase tracking-wider ${colorClass}`}>{gradeText}</span>
                      <span className="text-5xl font-black text-white">{score}<span className="text-2xl text-gray-500">/100</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA DE RANKINGS v2.9 */}
        {view === 'rankings' && (
          <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8 bg-gray-900/50 p-6 rounded-3xl border border-gray-800 shadow-xl w-fit mx-auto md:mx-0">
              <div className="bg-yellow-500/20 p-4 rounded-2xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Trophy className="text-yellow-500 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Rankings Dinámicos</h2>
                <p className="text-gray-400 font-medium mt-1">Sincronización y filtros en tiempo real</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[{ id: 1, config: col1Config, setter: setCol1Config }, { id: 2, config: col2Config, setter: setCol2Config }].map(col => {
                const currentData = getDynamicRanking(col.config);

                return (
                  <div key={col.id} className="w-full bg-gray-900/40 p-4 md:p-6 rounded-3xl border border-gray-800 shadow-xl">

                    {/* PANEL DE CONTROL DEL RANKING */}
                    <div className="flex flex-col gap-4 mb-6 bg-gray-950/50 p-4 rounded-2xl border border-gray-800/50">
                      {/* Selector de Métrica */}
                      <select
                        value={col.config.type}
                        onChange={(e) => col.setter({ ...col.config, type: e.target.value })}
                        className="w-full bg-gray-900 text-white font-bold px-4 py-3 rounded-xl outline-none border border-indigo-900/30 focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="media">📊 Hype: Media de Notas (0-10)</option>
                        <option value="total">📈 Hype: Puntos Totales (0-10)</option>
                        <option value="eval_media">🏆 Realidad: Calificación Crítica (0-100)</option>
                        <option value="fichas">💰 Casino: Fichas Totales</option>
                      </select>

                      {/* Selector de Jugadores (Filtro Dinámico) */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {PLAYERS.map(player => {
                          const isActive = col.config.players.includes(player);
                          return (
                            <button
                              key={player}
                              onClick={() => {
                                const newPlayers = isActive
                                  ? col.config.players.filter(p => p !== player)
                                  : [...col.config.players, player];
                                // Evitar que se queden a 0 jugadores
                                if (newPlayers.length > 0) col.setter({ ...col.config, players: newPlayers });
                              }}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all border ${isActive
                                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
                                }`}
                            >
                              {player}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* RENDERIZADO DE LAS TARJETAS */}
                    <div className="space-y-4">
                      {currentData.map((gameOrChip, index) => {
                        if (col.config.type === 'fichas') {
                          return (
                            <div key={gameOrChip.player} className="bg-gray-800/60 p-5 rounded-2xl flex items-center justify-between border border-gray-700/50 hover:border-emerald-500/50 transition-all gap-4 relative overflow-hidden group">
                              <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-xl ${index === 0 ? 'bg-linear-to-br from-yellow-300 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
                                #{index + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-black text-xl text-white">{gameOrChip.player}</h3>
                              </div>
                              <div className="text-3xl font-black text-emerald-400">
                                {gameOrChip.score} 💰
                              </div>
                            </div>
                          );
                        }

                        if (gameOrChip.total === 0 && col.config.type !== 'eval_media') return null;
                        const game = gameOrChip;
                        const isTotalMode = col.config.type === 'total';
                        const expectedVoters = col.config.players.length;

                        return (
                          <div key={game.id} className="bg-gray-800/60 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-700/50 hover:border-gray-500 transition-colors gap-4 relative overflow-hidden group">
                            {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>}
                            {index === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-gray-300"></div>}
                            {index === 2 && <div className="absolute top-0 left-0 w-1 h-full bg-amber-700"></div>}

                            <div className="flex items-center gap-4 w-full sm:w-auto pl-2">
                              <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-xl ${index === 0 ? 'bg-linear-to-br from-yellow-300 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                                index === 1 ? 'bg-linear-to-br from-gray-200 to-gray-400 text-gray-900' :
                                  index === 2 ? 'bg-linear-to-br from-amber-500 to-amber-700 text-amber-100' :
                                    'bg-gray-900 text-gray-500 border border-gray-800'
                                }`}>
                                #{index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-black text-lg text-white mb-1.5 leading-tight truncate">{game.title}</h3>
                                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                                  <span className={`px-2 py-0.5 rounded border ${game.voters === expectedVoters ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30' : 'bg-gray-900 text-gray-400 border-gray-700'}`}>
                                    {game.voters}/{expectedVoters} Votos
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="sm:text-right flex flex-col items-start sm:items-end justify-center w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-700/50 pl-2 sm:pl-0 shrink-0">
                              <div className="flex items-center gap-3">
                                {isTotalMode ? (
                                  <div className="text-2xl font-black text-white flex items-baseline gap-1">
                                    {parseFloat(game.total.toFixed(2))} <span className="text-base text-gray-400 font-bold">PTS</span>
                                  </div>
                                ) : (
                                  <div className="text-2xl font-black text-white flex items-baseline gap-1">
                                    {parseFloat(game.media.toFixed(2))} <span className="text-base text-gray-400 font-bold">/{col.config.type === 'eval_media' ? '100' : '10'}</span>
                                  </div>
                                )}
                                {game.vetos > 0 && (
                                  <div className="text-xs font-black text-red-400 bg-red-950/80 border border-red-900/80 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide" title={`${game.vetos} vetos`}>
                                    <AlertTriangle className="w-3.5 h-3.5" /> {game.vetos}
                                  </div>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                                {isTotalMode ? `Media: ${parseFloat(game.media.toFixed(2))}/${col.config.type === 'eval_media' ? '100' : '10'}` : `${parseFloat(game.total.toFixed(2))} Puntos Totales`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {currentData.length === 0 && (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-2xl h-full flex flex-col items-center justify-center">
                          <BarChart3 className="w-12 h-12 text-gray-800 mb-4" />
                          <p className="text-gray-500 font-bold">Aún no hay datos aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA MURO DE LA VERGÜENZA */}
        {view === 'stats' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-red-900/30">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center flex items-center justify-center gap-4">
                <AlertTriangle className="text-red-500 w-10 h-10" /> Muro de la Vergüenza
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* EL HATER */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-red-500 shadow-lg text-center flex flex-col items-center justify-center">
                  <div className="text-red-500 font-black text-xl mb-1 uppercase tracking-widest">El Hater</div>
                  <p className="text-xs text-gray-400 mb-4">El que más juegos ha vetado</p>
                  <div className="text-3xl font-black text-white bg-red-500/10 px-6 py-2 rounded-xl border border-red-500/20">
                    {PLAYERS.reduce((a, b) => playerStats[a].vetos > playerStats[b].vetos ? a : b)}
                  </div>
                </div>

                {/* EL FANBOY */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-green-500 shadow-lg text-center flex flex-col items-center justify-center">
                  <div className="text-green-500 font-black text-xl mb-1 uppercase tracking-widest">El Fanboy</div>
                  <p className="text-xs text-gray-400 mb-4">El que más 9s y 10s ha dado</p>
                  <div className="text-3xl font-black text-white bg-green-500/10 px-6 py-2 rounded-xl border border-green-500/20">
                    {PLAYERS.reduce((a, b) => playerStats[a].dieses > playerStats[b].dieses ? a : b)}
                  </div>
                </div>

                {/* EL INDECISO */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-yellow-500 shadow-lg text-center flex flex-col items-center justify-center">
                  <div className="text-yellow-500 font-black text-xl mb-1 uppercase tracking-widest">El Indeciso</div>
                  <p className="text-xs text-gray-400 mb-4">El rey de las notas tibias (5-6.9)</p>
                  <div className="text-3xl font-black text-white bg-yellow-500/10 px-6 py-2 rounded-xl border border-yellow-500/20">
                    {PLAYERS.reduce((a, b) => playerStats[a].neutrales > playerStats[b].neutrales ? a : b)}
                  </div>
                </div>

                {/* EL PASOTA */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-gray-500 shadow-lg text-center flex flex-col items-center justify-center opacity-90 transition-opacity hover:opacity-100">
                  <div className="text-gray-400 font-black text-xl mb-1 uppercase tracking-widest">El Pasota</div>
                  <p className="text-xs text-gray-400 mb-4">El que tiene más juegos sin votar</p>
                  <div className="text-3xl font-black text-white bg-gray-500/10 px-6 py-2 rounded-xl border border-gray-500/20">
                    {PLAYERS.reduce((a, b) => playerStats[a].sinVotar > playerStats[b].sinVotar ? a : b)}
                  </div>
                </div>

                {/* EL ESPECIALITO */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-purple-500 shadow-lg text-center flex flex-col items-center justify-center">
                  <div className="text-purple-400 font-black text-xl mb-1 uppercase tracking-widest">El Especialito</div>
                  <p className="text-xs text-gray-400 mb-4">Sus notas difieren más del grupo</p>
                  <div className="text-3xl font-black text-white bg-purple-500/10 px-6 py-2 rounded-xl border border-purple-500/20">
                    {PLAYERS.reduce((a, b) => playerStats[a].desviacionTotal > playerStats[b].desviacionTotal ? a : b)}
                  </div>
                </div>

                {/* EL KAMIKAZE */}
                <div className="bg-gray-800 p-6 rounded-2xl border-t-4 border-orange-600 shadow-lg text-center flex flex-col items-center justify-center">
                  <div className="text-orange-500 font-black text-xl mb-1 uppercase tracking-widest">El Kamikaze</div>
                  <p className="text-xs text-gray-400 mb-4">Adictos a la Zona Prohibida</p>
                  <div className="text-3xl font-black text-white bg-orange-600/10 px-6 py-2 rounded-xl border border-orange-600/20">
                    {PLAYERS.reduce((a, b) => (playerStats[a].prohibidaSum / (playerStats[a].prohibidaCount || 1)) > (playerStats[b].prohibidaSum / (playerStats[b].prohibidaCount || 1)) ? a : b)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA DE CHANGELOG */}
        {view === 'changelog' && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-800 max-w-4xl mx-auto text-gray-300">
            <h2 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">Bitácora de Versiones</h2>
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-orange-500/50 before:via-gray-800/50 before:to-gray-800/20">

              {/* v6.7.3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.7.3 - Limpieza de Catálogo y Ajuste de UI</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">16 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Eliminado Paragnosia del tribunal. Corregidas imágenes críticas de Ball x pit y Death Stranding 2. Eliminado el indicador visual de "Nuevo" de las tarjetas; la sección de novedades ahora ordena los títulos de más reciente a más antiguo según su posición en la base de datos.
                  </p>
                </div>
              </div>

              {/* v6.7.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.7.2 - Extracción de Tiempos y Enlaces (HLTB)</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">16 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Aplicada extracción de datos en vivo desde HowLongToBeat para Ball x pit, Megabonk, DS2 y Paragnosia. AppIDs corregidos y sistema de 3 enlaces (Steam, Meta, HLTB) verificado y operativo.
                  </p>
                </div>
              </div>

                                          {/* v6.7.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.7.1 - Restauración de UI y Filtros</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Restaurado el buscador original y los contadores de reseñas del grupo en las tarjetas. Integrado el nuevo filtro desplegable de Metacritic y añadido el botón "Cortos" para ordenar por duración (HLTB). El logo de Metacritic ahora se ubica limpiamente dentro de la imagen.
                  </p>
                </div>
              </div>

                                          {/* v6.7.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.7.0 - Integración Segura de Arquitectura</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">10 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Componentización de Header y GameCard. Implementación del motor de ordenación inteligente por duración y sistema de filtros críticos por puntuación Metacritic en el entorno Single Player.
                  </p>
                </div>
              </div>

                                          {/* v6.4.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.6.0 - The Quality Update</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Limpieza de etiquetas 'NUEVO' en juegos veteranos reparando la lógica del filtro de ordenación. Implementación masiva de assets verticales para evitar estiramiento de imágenes y reescritura de 12 sinopsis con estándar de calidad editorial.
                  </p>
                </div>
              </div>

              {/* v6.4.1 */}
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
              </div>

{/* v6.4.0 */}
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
                    v6.4.0 - Expansión de Catálogo y Mejora Narrativa. Reparada la imagen de The Last of Us Part I (vía CDN Steam). Añadidos 11 nuevos títulos a la base de datos (Ball x pit, Murders on the Yangtze River, A Plague Tale: Requiem, A Plague Tale: Innocence, Nobody Wants to Die, DEATH STRANDING DIRECTOR\'S CUT, Death Stranding 2 [Próximamente], Megabonk, Paragnosia, El Escudero Valiente, Nine Sols) incluyendo redacción extendida de alta calidad para las sinopsis y metadatos oficiales sincronizados.
                  </p>
                </div>
              </div>

{/* v6.3.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.3.2 - Hotfix de Ordenación</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.3.2 - Hotfix de Ordenación. Corregido un error en la lógica de renderizado del catálogo. El filtro 'Novedades' ahora reconoce y prioriza correctamente los títulos con la propiedad isNew en la parte superior de la biblioteca.
                  </p>
                </div>
              </div>

              {/* v6.3.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-sky-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.3.1 - Parche de UX y Contenido</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.3.1 - Parche de UX y Contenido. Implementada restauración de scroll al navegar atrás desde fichas individuales. Reparada imagen de The Last of Us Part I. Rotación de badges de 'NUEVO'. Añadido Clair Obscur: Expedition 33 a la base de datos.
                  </p>
                </div>
              </div>

              {/* v6.3.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.3.0 - Los 10 Titanes</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.3.0 - Los 10 Titanes. Expansión masiva de la biblioteca con 10 títulos legendarios y metadatos verificados para una experiencia completa.
                  </p>
                </div>
              </div>

              {/* v6.2.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-green-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.2.1 - Auditoría Total</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.2.1 - Auditoría Total. Reparación de base de datos, sincronización HLTB y nuevo badge de volumen de participación del Tribunal.
                  </p>
                </div>
              </div>

              {/* v6.2.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-[#2970b1] text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-[#2970b1]/30 shadow-[0_0_20px_rgba(41,112,177,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.2.0 - Fidelidad Absoluta</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.2.0 - Fidelidad Absoluta. Corrección de lógica en 'El Indeciso' (6.9), rediseño de bloque HLTB horizontal, sincronización de metadatos reales de Steam y HowLongToBeat para títulos clave.
                  </p>
                </div>
              </div>

              {/* v6.1.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-fuchsia-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_20px_rgba(192,38,211,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.1.0 - La Gran Expansión</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.1.0 - La Gran Expansión. Añadidos 5 juegazos con etiquetas oficiales de Steam, efecto de interacción en tarjetas y badges de novedades.
                  </p>
                </div>
              </div>

              {/* v6.0.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.0.2 - Auditoría de Metadatos</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    v6.0.2 - Auditoría de Metadatos. Verificación y corrección individual de todos los enlaces a Steam, Metacritic y HowLongToBeat para los juegos base.
                  </p>
                </div>
              </div>

              {/* v6.0.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.0.1 - Refinado de Utilidad</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Refinado de Utilidad. Sustitución de ProtonDB por enlace directo a HowLongToBeat y limpieza de metadatos sobrantes.
                  </p>
                </div>
              </div>

              {/* v6.0.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-pink-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v6.0.0 - Lanzamiento Oficial Individual</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Lanzamiento Oficial Individual. Fuera estado Alpha. Incorporación de HowLongToBeat, Enlaces Oficiales, seguimiento de Progreso (Estado y Dificultad), sistema de reacciones con emojis en las reseñas y Biblioteca con filtros avanzados.
                  </p>
                </div>
              </div>

              {/* v5.7.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-teal-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.7.1 - Gestión Total de Crítica</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementado borrado de reseñas en la nube y feedback visual "Guardado" en tiempo real.
                  </p>
                </div>
              </div>

              {/* v5.7.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.7.0 - El Archivo Eterno</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Las reseñas y notas individuales ahora se guardan en Firebase Firestore, permitiendo que todo el grupo vea las críticas de los demás en tiempo real.
                  </p>
                </div>
              </div>

              {/* v5.6.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-yellow-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.6.0 - La Crítica Ilustrada</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Integración de reseñas estilo Steam para todos los magistrados, cálculo real de medias y sistema extendido de 8 categorías de calidad.
                  </p>
                </div>
              </div>

              {/* v5.5.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-cyan-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.5.0 - Alpha Individual "Revuelta"</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm text-gray-300 font-medium">
                    <li><span className="text-cyan-400 font-bold">Alpha Individual:</span> Buscador funcional implementado con filtrado en tiempo real.</li>
                    <li><span className="text-cyan-400 font-bold">Crítica 2.0:</span> Sistema de reseñas con precisión decimal (0.1) y requisitos técnicos oficiales.</li>
                    <li><span className="text-cyan-400 font-bold">Unificación:</span> Corrección de base de datos y nuevo menú con sección de Ajustes.</li>
                  </ul>
                </div>
              </div>

              {/* v5.4.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <Play className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.4.0 - Prototipo Individual</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">9 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Prototipo inicial del Modo Individual. Implementada navegación por Sidebar y estructura de biblioteca Single-Player con vista detallada para títulos seleccionados.
                  </p>
                </div>
              </div>

              {/* v5.3.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.3.0 - Precisión Total</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">8 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Actualización del motor de votación. Se elimina la restricción de los cuartos de punto (0.25) permitiendo notas decimales exactas de 0.1 en 0.1. El Tribunal alcanza su forma definitiva.
                  </p>
                </div>
              </div>

              {/* v5.2.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-pink-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.2.0 - Escala de Ganas Completa</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">8 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementación de la "Escala de Ganas" completa de 10 puntos en el Panel de Votos para estandarizar el hype del grupo de forma precisa.
                  </p>
                </div>
              </div>

              {/* v5.1.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <History className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.1.0 - Expansión del Muro</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">7 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Expansión del Muro de la Vergüenza con tres nuevos perfiles psicométricos: El Pasota (juegos sin votar), El Especialito (mayor desviación grupal) y El Kamikaze (amor por la Zona Prohibida).
                  </p>
                </div>
              </div>

              {/* v5.0.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v5.0.0 - Reajuste de Umbrales</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">7 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Sincronización del sistema con la precisión decimal. Los vetos abarcan hasta el 4.75 y se ha solucionado el desajuste de colores en la barra de notas (la zona azul exige un 7 mínimo).
                  </p>
                </div>
              </div>

              {/* v4.9.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-cyan-400 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.9.1 - Limpieza de Decimales</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">7 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm md:text-base text-gray-300 font-medium">
                    <li>Corrección del redondeo de las medias a 2 decimales exactos.</li>
                  </ul>
                </div>
              </div>

              {/* v4.9 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-pink-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-pink-500/30 shadow-[0_0_20px_rgba(219,39,119,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.9 - Precisión de Votos</h3>
                    <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-800 rounded-lg whitespace-nowrap">7 ABR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Aumento de la precisión en la sala de votaciones. Ahora el slider permite asignar notas con decimales de .25 y .75.
                  </p>
                </div>
              </div>

              {/* v4.8.3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.8.3 - Limpieza y Corrección</h3>
                    <span className="text-xs text-indigo-400 font-bold px-2 py-1 bg-indigo-950 rounded-lg whitespace-nowrap uppercase tracking-tighter">7 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm md:text-base text-gray-300 font-medium">
                    <li><span className="text-indigo-400 font-bold">Corrección Crítica:</span> Sincronización definitiva de la ID de Steam de Biped 2 para cargar su portada oficial y corrección del árbol de versiones.</li>
                  </ul>
                </div>
              </div>

              {/* v4.8.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-cyan-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.8.2 - Restauración de Medios</h3>
                    <span className="text-xs text-cyan-400 font-bold px-2 py-1 bg-cyan-950 rounded-lg whitespace-nowrap uppercase tracking-tighter">7 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm md:text-base text-gray-300 font-medium">
                    <li><span className="text-cyan-400 font-bold">Lore Premium:</span> Restauración íntegra de imágenes personalizadas e historias detalladas para los 61 juegos del catálogo.</li>
                  </ul>
                </div>
              </div>

              {/* v4.8 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-purple-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.8 - Depuración y UX</h3>
                    <span className="text-xs text-purple-400 font-bold px-2 py-1 bg-purple-950 rounded-lg whitespace-nowrap uppercase tracking-tighter">7 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm md:text-base text-gray-300 font-medium">
                    <li><span className="text-purple-400 font-bold">Snapshot UX:</span> Nuevo sistema de refresco de votos que evita saltos visuales al filtrar juegos votados.</li>
                  </ul>
                </div>
              </div>

              {/* v4.7 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-pink-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 md:p-8 rounded-3xl border border-pink-500/30 shadow-[0_0_20px_rgba(219,39,119,0.1)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.7 - El Sexto Miembro</h3>
                    <span className="text-xs text-pink-400 font-bold px-2 py-1 bg-pink-950 rounded-lg whitespace-nowrap uppercase tracking-tighter">7 ABR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm md:text-base text-gray-300 font-medium">
                    <li><span className="text-pink-400 font-bold">Bienvenido Alejandro:</span> Incorporación oficial del sexto integrante al censo del Tribunal.</li>
                    <li><span className="text-pink-400 font-bold">Motor de Rankings Dinámico:</span> Refactorización total de la pestaña de Resultados.</li>
                  </ul>
                </div>
              </div>

              {/* v4.6 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-70">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-900 bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-orange-900/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.6 - El Triunvirato <span className="text-xs text-gray-500 font-normal ml-2">27 MAR 2026</span></h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Añadidos dos nuevos rankings (Media y Puntos Totales) que filtran y calculan los resultados usando exclusivamente los votos de la "vieja guardia": Jose, Mario e Iván.
                  </p>
                </div>
              </div>

              {/* v4.5 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-yellow-400 text-yellow-950 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-yellow-900/30 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.5 - Rediseño Neón <span className="text-xs text-gray-500 font-normal ml-2">25 MAR 2026</span></h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Rediseño estético de la mesa de casino (Adiós al verde, hola al modo Neón Dark), reseteo administrativo de la economía global a 1000 fichas y corrección de la UI de apuestas.
                  </p>
                </div>
              </div>

              {/* v4.4.3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-orange-900/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.4.3 - Protocolo Anti-Tongo <span className="text-xs text-gray-500 font-normal ml-2">25 MAR 2026</span></h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementado un sistema de seguridad que bloquea la mesa de apuestas si hay menos de 10 juegos disponibles. Esto evita exploits matemáticos mediante el uso de filtros excesivamente restrictivos.
                  </p>
                </div>
              </div>

              {/* v4.4.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-red-900/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.4.2 - Balanceo de Pagos</h3>
                    <span className="text-[10px] text-red-200 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Ajustadas las cuotas y premios del casino para mayor equilibrio matemático. El pleno ahora es mucho más rentable y los costes de participación están claramente definidos antes de girar.
                  </p>
                </div>
              </div>

              {/* v4.4 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-emerald-900/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.4 - High Roller Casino</h3>
                    <span className="text-[10px] text-emerald-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Evolución del Casino con sistema económico real de Fichas (±10 a ±500), apuestas a pleno (juegos individuales), toggle de notificaciones de Discord y Ranking financiero global.
                  </p>
                </div>
              </div>

              {/* v4.3.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-400 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-indigo-900/30 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.3.1 - Productividad y Limpieza</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Añadido un botón interactivo (Toggle) en ambas salas de votación para filtrar y ocultar los juegos completados, dejando a la vista únicamente las tareas pendientes.
                  </p>
                </div>
              </div>

              {/* v4.3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-indigo-900/30 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.3 - Mensajero del Destino</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Integración oficial con Discord. Cada vez que El Oráculo dicta sentencia, el resultado (incluyendo portada, descripción y color ganador) se notifica automáticamente al servidor.
                  </p>
                </div>
              </div>

              {/* v4.2.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-gray-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.2.1 - Ajuste de Filtros Élite</h3>
                    <span className="text-[10px] text-gray-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Ajustado el filtro de Élite de la ruleta para priorizar juegos con Media de Hype &gt; 9.0 en lugar de basarse en evaluaciones críticas (v4.2).
                  </p>
                </div>
              </div>

              {/* v4.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-emerald-900/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.2 - El Casino del Tribunal</h3>
                    <span className="text-[10px] text-emerald-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Rediseño completo de El Oráculo con temática de Casino (Rojo/Negro). Añadidos filtros de Élite (Hype &gt; 7, &gt; 8 y Sobresalientes) y una mesa de apuestas lateral para predecir el resultado.
                  </p>
                </div>
              </div>

              {/* v4.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-400 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-indigo-900/30 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.1 - Precisión Decimal</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    El Panel de Votos (Expectativa) ahora soporta puntuaciones con precisión de 0.5 (ej: 7.5, 8.5) para reflejar mejor los matices de decisión del grupo.
                  </p>
                </div>
              </div>

              {/* v4.0.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-gray-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.0.1 - Fix de Menú Oculto</h3>
                    <span className="text-[10px] text-gray-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Corregido un bug visual nativo en los selectores de los Rankings que causaba texto invisible (blanco sobre blanco). Ahora las opciones tienen fondo oscuro forzado y se ha ajustado la escala 0-100.
                  </p>
                </div>
              </div>

              {/* v4.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-cyan-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-cyan-900/30 shadow-[0_0_20px_rgba(8,145,178,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v4.0 - El Veredicto Final</h3>
                    <span className="text-[10px] text-cyan-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementación de la Sala de Evaluación Crítica (0-100). Sistema paralelo de calificación independiente del hype (0-10) con su propia sincronización en Firebase y rankings integrados.
                  </p>
                </div>
              </div>

              {/* v3.0.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-yellow-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-yellow-900/30 shadow-[0_0_20px_rgba(202,138,4,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v3.0.2 - El Experimento Murkoff</h3>
                    <span className="text-[10px] text-yellow-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Añadido The Outlast Trials (AppID 1304930) al catálogo dentro de la categoría Guerreros. Gracias a la optimización de Red Barrels, el juego alcanza un rendimiento 🟡 Aceptable ajustando gráficos a 720p/Bajo.
                  </p>
                </div>
              </div>

              {/* v3.0.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-purple-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v3.0.1 - Invocación Paranormal</h3>
                    <span className="text-[10px] text-purple-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Añadido Demonologist (AppID 1929610) al catálogo dentro de la categoría Guerreros. Aunque usa Unreal Engine 5, el rendimiento es viable ("🟡 Justito") usando técnicas de reescalado como FSR.
                  </p>
                </div>
              </div>

              {/* v3.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-blue-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-blue-900/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v3.0 - Expansión del Catálogo</h3>
                    <span className="text-[10px] text-blue-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    El catálogo crece a 48 títulos. Se han incorporado grandes pesos pesados cooperativos con sus AppIDs verificados: WEBFISHING, Murky Divers, Bloons TD 6, Abiotic Factor, Risk of Rain 2 y el letal GTFO.
                  </p>
                </div>
              </div>

              {/* v2.9 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.9 - Análisis y Destino</h3>
                    <span className="text-[10px] text-red-400 font-bold opacity-60">25 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Nuevo "Muro de la Vergüenza": Calcula en tiempo real quién es "El Hater" (más vetos), "El Fanboy" (más dieses) y "El Indeciso".</li>
                    <li>Oráculo Inteligente: Añadidos filtros a la ruleta para excluir "Zona Prohibida" o juegos vetados antes de girar.</li>
                  </ul>
                </div>
              </div>

              {/* v2.8.8 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-indigo-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-indigo-900/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.8 - Corrección Final de Identidad</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Sustitución del AppID incorrecto para PEAK (de 3506430 a 3527290) y vinculación de su asset oficial de Akamai, completando la restauración total de la galería visual del Tribunal.
                  </p>
                </div>
              </div>

              {/* v2.8.7 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-pink-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-pink-900/30 shadow-[0_0_20px_rgba(219,39,119,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.7 - Rescate de Activos Definitivo</h3>
                    <span className="text-[10px] text-pink-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementación de las rutas finales en el CDN de Akamai con hashes de contenido específicos para Battlefield 6 y LORT, garantizando la visibilidad total del catálogo sin bloqueos regionales o de CDN.
                  </p>
                </div>
              </div>

              {/* v2.8.6 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-red-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.6 - Rescate de Activos Final</h3>
                    <span className="text-[10px] text-red-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Corrección definitiva de las portadas críticas para LORT (migrada a Fastly CDN) y Battlefield 6 (usando la ruta directa definitiva), eliminando los últimos placeholders del sistema.
                  </p>
                </div>
              </div>

              {/* v2.8.5 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-orange-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-orange-900/30 shadow-[0_0_20px_rgba(234,88,12,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.5 - Perfeccionamiento de Portadas</h3>
                    <span className="text-[10px] text-orange-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Corrección final de las portadas de LORT, PEAK y Battlefield 6 (usando su arte original de Steam), logrando una estabilidad visual del 100% en todo el catálogo.
                  </p>
                </div>
              </div>

              {/* v2.8.4 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-emerald-900/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.4 - Saneamiento de Activos Final</h3>
                    <span className="text-[10px] text-emerald-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Restauración definitiva de las portadas de Mimesis (imagen corregida), Helldivers 1, YAPYAP y Mage Arena mediante enlaces directos a sus respectivos repositorios de activos en Steam.
                  </p>
                </div>
              </div>

              {/* v2.8.3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-sky-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-sky-900/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.3 - Reparación de Activo (RV There Yet?)</h3>
                    <span className="text-[10px] text-sky-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Corregido el error 404 en la portada de RV There Yet? mediante la vinculación directa al asset verificado en los servidores de Steam, sustituyendo la ruta genérica inactiva.
                  </p>
                </div>
              </div>

              {/* v2.8.2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-cyan-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-cyan-900/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.2 - Ampliación de Parche CDN (4 Portadas)</h3>
                    <span className="text-[10px] text-cyan-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Expandida la ruta alternativa (<code>customImage</code>) hacia el CDN clásico para Mimesis, YAPYAP, Mage Arena y RV There Yet, evadiendo miniaturas desactualizadas y bloqueos totales.
                  </p>
                </div>
              </div>

              {/* v2.8.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-teal-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-teal-900/30 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8.1 - Parche de CDN (3 Portadas)</h3>
                    <span className="text-[10px] text-teal-400 font-bold opacity-60 uppercase tracking-widest">25 MAR 2026</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Implementada ruta alternativa (<code>customImage</code>) hacia el CDN clásico de Steam para evadir bloqueos de restricción de edad en Ultimate Sheep Raccoon, R.E.P.O y Schedule.
                  </p>
                </div>
              </div>

              {/* v2.8 */}
              <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-orange-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 mt-6 lg:mt-8">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-orange-900/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.8 - Guerra de Rankings (Doble Vista)</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-orange-400 font-bold opacity-60">24 MAR 2026</span>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Renovación de la UI de Resultados: Implementación de un Grid de doble columna para comparar rankings simultáneamente.</li>
                    <li>Ampliación de Lógica: Creación de 4 rankings independientes (Global Media, PC Decente Media, Global Totales, PC Decente Totales).</li>
                    <li>Inversión de jerarquía visual: Los rankings por "Totales" muestran los puntos en grande y la media en pequeño.</li>
                  </ul>
                </div>
              </div>

              {/* v2.7.3 */}
              <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 mt-6 lg:mt-8">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-emerald-900/10 shadow-lg opacity-85 transition-opacity hover:opacity-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.7.3 - Saneamiento de Portadas</h3>
                    <span className="text-[10px] text-emerald-400 font-bold opacity-60">24 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Corrección final de AppIDs y enlaces directos para: A Way Out, PEAK, RV There Yet?, YAPYAP, y Battlefield 6.</li>
                    <li>Estabilización visual total: Verificado el cargado del 100% de las portadas mediante navegación automatizada.</li>
                  </ul>
                </div>
              </div>

              {/* v2.7.2 */}
              <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 mt-6 lg:mt-8">
                  <History className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-emerald-900/10 shadow-lg opacity-85 transition-opacity hover:opacity-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.7.2 - Minimalismo Visual y Portadas</h3>
                    <span className="text-[10px] text-emerald-400 font-bold opacity-60">24 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Simplificación absoluta de la UI: Eliminados los iframes de vídeo y los carruseles de miniaturas secundarios.</li>
                    <li>Mantenimiento de los textos descriptivos detallados originales.</li>
                    <li>Saneamiento final: Corrección de los 16 AppIDs conflictivos (Buckshot Roulette, Pico Park 2, Battlefield 6, etc.).</li>
                  </ul>
                </div>
              </div>

              {/* v2.7.1 */}
              <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-emerald-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 mt-6 lg:mt-8">
                  <History className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800 p-5 rounded-2xl border border-gray-700/50 shadow-lg opacity-80 transition-opacity hover:opacity-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-white">v2.7.1 - Limpieza Total</h3>
                    <span className="text-[10px] text-emerald-500 font-bold opacity-60">24 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Simplificación arquitectónica total de la Tarjeta del Juego: Eliminado el carrusel de miniaturas sobrantes.</li>
                    <li>Restauración de la jerarquía visual: Solo se muestra una única imagen de portada (header), libre de errores 404.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.6.4 - Erradicación del Re-render</h3>
                    <span className="text-[10px] text-emerald-500 font-bold opacity-60">24 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Refactorización arquitectónica crítica: Extracción del componente <code>GameCard</code> fuera del scope del componente principal <code>App</code>.</li>
                    <li>Eliminación del anti-patrón de desmontaje de React que causaba la pérdida del anclaje de scroll en móviles al actualizar el estado de los votos.</li>
                    <li>Paso de datos mediante delegación de props (<code>score</code> y <code>onVote</code>) para mantener la inmutabilidad de los nodos del DOM.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-pink-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.6.3 - Operación Ancla</h3>
                    <span className="text-[10px] text-pink-500 font-bold opacity-60">24 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Implementado Viewport Dinámico (100dvh) para evitar recálculos de pantalla en móviles.</li>
                    <li>Bloqueo estricto del comportamiento por defecto en los botones de voto (type="button" y preventDefault) para eliminar el scroll al inicio (top: 0).</li>
                    <li>Estabilización de altura mínima en la cuadrícula de tarjetas para evitar el colapso del DOM al renderizar datos en tiempo real.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.6.2 - Alineación de Oráculo</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Corrección del desfase angular en la física de "El Oráculo" mediante precisión trigonométrica.</li>
                    <li>Compensación del padding para asegurar que el segmento seleccionado quede 100% centrado bajo la aguja.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-amber-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.6.1 - UI Oracle Fix</h3>
                    <span className="text-[10px] text-amber-500 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Optimización visual de la Ruleta para soportar 40+ juegos.</li>
                    <li>Ajuste de legibilidad: truncado de nombres y rotación compensada.</li>
                    <li>Limpieza de lógica: eliminación de assets redundantes para mayor velocidad.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-amber-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.5 - Sistema de Medias</h3>
                    <span className="text-[10px] text-amber-500 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Renovación completa del algoritmo de ordenamiento base regido matemáticamente por medias exactas, un decimal y dobles desempates.</li>
                    <li>Revisión estética drástica de las tarjetas añadiendo testigos tácticos laterales de color púrpura y carmesí de los castigos por veto.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.4 - Optimización Móvil Parallax</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Implementación de `loading="lazy"` para diferir la carga de imágenes pesadas y vídeos embebidos acelerando TTI.</li>
                    <li>Soporte `-webkit-overflow-scrolling` forzado en CSS en línea para revivir el scroll nativo de Safari en carruseles.</li>
                    <li>Intercepción por bandera `touch-action: pan-y` sobre iFrames evitando la captura de eventos táctiles en smartphones y decolgando la UI principal.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.3 - El Archivo Histórico</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Registro de actualización (Changelog) súper dinámico añadido.</li>
                    <li>Refuerzo total del escudo Anti-Imágenes Rotas redirigiendo carátulas de Steam al detectarse errores en los banners panorámicos.</li>
                    <li>Desbloqueo masivo y saneamiento de 25 tráilers de YouTube con restricción de incrustación externa.</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.2 - Lázaro y PC Decente</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Incorporación oficial del 5º juez al tablero de votaciones en bases de datos Firestore.</li>
                    <li>Modificación algorítmica de matriz del botón del Ranking para forzar purga selectiva sobre los votos provenientes de hardware de la old-gen (Iván y Lázaro).</li>
                  </ul>
                </div>
              </div>

              {/* v2.1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.1 - Reparación del Engranaje</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Supresión de Bug Crítico: Reparado el reseteo de scroll masivo en dispositivos móviles provocado por el re-renderizado de la raíz en las votaciones.</li>
                    <li>Inyección de códigos de rescate a los endpoints premium de Steam para extraer carátulas puras.</li>
                  </ul>
                </div>
              </div>

              {/* v2.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/60 p-5 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-300">v2.0 - La Era de la Nube</h3>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-400">
                    <li>Migración y sincronización de base de datos completa a Firebase Firestore.</li>
                    <li>Sistema de Ranking automático global en tiempo real.</li>
                    <li>Restructuración profunda usando React y Tailwind CSS, abandonando el viejo cascarón.</li>
                  </ul>
                </div>
              </div>

              {/* v1.0 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-gray-900 bg-gray-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-800/40 p-5 rounded-2xl border border-gray-800 opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-400">v1.0 - Orígenes Humildes</h3>
                    <span className="text-[10px] text-gray-500 font-bold opacity-60">23 MAR 2026</span>
                  </div>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-500">
                    <li>Lanzamiento original del Tribunal Gaming. HTML desnudo, estilos toscos y sueños grandes.</li>
                    <li>Las votaciones se anotaban a mano y no había categorización interactiva.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VISTA DE RULETA v4.2 - CASINO */}
        {view === 'roulette' && (
          <div className="max-w-[1400px] mx-auto py-6 animate-in fade-in duration-700">

            {/* BARRA DE FILTROS SUPERIOR */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 bg-gray-900/80 p-6 rounded-3xl border border-gray-800 shadow-xl items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 accent-pink-500 rounded bg-gray-800 border-gray-700" checked={oracleFilters.noProhibida} onChange={(e) => setOracleFilters({ ...oracleFilters, noProhibida: e.target.checked })} />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Sin Zona Prohibida</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 accent-pink-500 rounded bg-gray-800 border-gray-700" checked={oracleFilters.noVetos} onChange={(e) => setOracleFilters({ ...oracleFilters, noVetos: e.target.checked })} />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Sin Vetos</span>
                </label>
              </div>
              <div className="w-full md:w-auto flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">Filtro de Élite:</span>
                <select value={oracleQuality} onChange={(e) => setOracleQuality(e.target.value)} className="bg-gray-950 text-white font-bold px-4 py-2 rounded-xl outline-none border border-gray-700 focus:border-pink-500 w-full md:w-auto">
                  <option value="all">Todas las notas</option>
                  <option value="over7">Media Hype &gt; 7.0</option>
                  <option value="over8">Media Hype &gt; 8.0</option>
                  <option value="sobresaliente">Media Hype &gt; 9.0</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-center">
              {/* IZQUIERDA: LA RULETA ROJA Y NEGRA */}
              <div className="flex flex-col items-center">
                <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] mb-10">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]">
                    <div className="w-0 h-0 border-l-20 border-l-transparent border-r-20 border-r-transparent border-t-30 border-t-current"></div>
                  </div>
                  <div
                    className="w-full h-full rounded-full border-12 border-gray-950 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-transform duration-5000 cubic-bezier(0.1, 0.9, 0.2, 1)"
                    style={{
                      transform: `rotate(${rotation - (360 / activePool.length / 2)}deg)`,
                      background: `conic-gradient(${activePool.map((g, i) => `${i % 2 === 0 ? '#b91c1c' : '#111827'} ${(i * 360) / activePool.length}deg ${((i + 1) * 360) / activePool.length}deg`).join(', ')})`
                    }}
                  >
                    {activePool.map((game, i) => (
                      <div key={game.id} className="absolute top-1/2 left-1/2 origin-left text-[6.5px] md:text-[9.5px] font-black text-white/90 uppercase pl-[60px] md:pl-[120px] select-none pointer-events-none tracking-widest drop-shadow-md whitespace-nowrap"
                        style={{ transform: `rotate(${(i * 360) / activePool.length + (180 / activePool.length) - 90}deg) translateY(-50%)`, maxWidth: '100%', overflow: 'hidden' }}>
                        {game.title.length > 15 ? game.title.substring(0, 13) + "..." : game.title}
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 border-8 border-gray-950 rounded-full z-10 flex items-center justify-center shadow-2xl">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_20px_#facc15]"></div>
                  </div>
                </div>

                <div className="text-gray-500 font-bold mb-6 bg-gray-900/50 px-4 py-1 rounded-full border border-gray-800">
                  Juegos en la mesa: <span className="text-white">{activePool.length}</span>
                </div>
              </div>

              {/* DERECHA: MESA DE APUESTAS Y BOTÓN GIRAR */}
              <div className="w-full xl:w-[450px] flex flex-col gap-6">

                {/* CONTROLES SUPERIORES (Discord y Reseteo) */}
                <div className="flex justify-between items-center bg-gray-900/50 border border-gray-800 p-4 rounded-2xl mb-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={discordEnabled} onChange={() => setDiscordEnabled(!discordEnabled)} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5865F2]"></div>
                    </label>
                    <span className="text-gray-400 font-bold text-sm">Discord</span>
                  </div>

                  {/* BOTÓN ADMIN RESETEO */}
                  <button onClick={resetGlobalEconomy} className="text-[10px] bg-red-950/50 hover:bg-red-900 text-red-500 border border-red-900 px-3 py-1.5 rounded-lg uppercase font-black tracking-widest transition-all">
                    Resetear Economía
                  </button>
                </div>

                {/* MESA DE CASINO (REDISEÑO OSCURO) */}
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                  <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Haz tu Apuesta</h3>

                  {/* SALDO ACTUAL */}
                  {currentPlayer && (
                    <div className="text-center bg-gray-950 py-4 rounded-xl border border-gray-800 mb-6 flex flex-col items-center shadow-inner">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Tus Fichas ({currentPlayer})</span>
                      <span className={`text-4xl font-black tracking-tighter ${playerChips[currentPlayer] < 20 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]'}`}>
                        {playerChips[currentPlayer]} <span className="text-2xl">🪙</span>
                      </span>
                      {playerChips[currentPlayer] < 20 && (
                        <button onClick={handleBankruptcy} className="mt-3 text-[10px] bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] px-4 py-1.5 rounded-full uppercase font-black tracking-wider transition-colors">
                          Bancarrota (+500)
                        </button>
                      )}
                    </div>
                  )}

                  {/* CONDICIONAL ANTI-TONGO */}
                  {activePool.length < 10 ? (
                    <div className="bg-red-950/50 border border-red-900 p-6 rounded-2xl text-center mt-4">
                      <span className="text-3xl mb-2 block">🛑</span>
                      <h4 className="text-red-500 font-black uppercase tracking-widest mb-1 text-sm">Mesa Cerrada</h4>
                      <p className="text-red-400 text-xs font-medium">Mínimo 10 juegos para apostar.</p>
                      {bet.type && (
                        <button onClick={() => setBet({ type: null, value: null })} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase transition-colors">
                          Retirar Apuesta Ilegal
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10 mt-6">
                      <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-center">Apuesta a Color <span className="text-gray-400">(10 🪙 | Gana 10)</span></p>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setBet({ type: 'color', value: 'red' })} className={`py-3 rounded-xl font-black uppercase tracking-widest transition-all ${bet.value === 'red' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gray-950 border border-red-900/50 text-red-600 hover:bg-red-950/80'}`}>Rojo</button>
                          <button onClick={() => setBet({ type: 'color', value: 'black' })} className={`py-3 rounded-xl font-black uppercase tracking-widest transition-all ${bet.value === 'black' ? 'bg-gray-700 text-white shadow-[0_0_20px_rgba(75,85,99,0.4)]' : 'bg-gray-950 border border-gray-700 text-gray-400 hover:bg-gray-800'}`}>Negro</button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-center">Apuesta a Categoría <span className="text-gray-400">(20 🪙 | Gana 40)</span></p>
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => setBet({ type: 'category', value: 'Salvavidas' })} className={`py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${bet.value === 'Salvavidas' ? 'bg-green-600 text-white' : 'bg-gray-950 border border-green-900/50 text-green-500 hover:bg-green-950/80'}`}>Salvar</button>
                          <button onClick={() => setBet({ type: 'category', value: 'Guerreros' })} className={`py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${bet.value === 'Guerreros' ? 'bg-yellow-600 text-white' : 'bg-gray-950 border border-yellow-900/50 text-yellow-500 hover:bg-green-950/80'}`}>Guerra</button>
                          <button onClick={() => setBet({ type: 'category', value: 'Zona Prohibida' })} className={`py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${bet.value === 'Zona Prohibida' ? 'bg-red-600 text-white' : 'bg-gray-950 border border-red-900/50 text-red-500 hover:bg-green-950/80'}`}>Prohib</button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-center">Apuesta a Pleno <span className="text-yellow-500">(20 🪙 | BOTE: 500)</span></p>
                        <select
                          className="w-full bg-gray-950 border border-gray-700 text-white font-bold px-4 py-3 rounded-xl focus:border-yellow-500 outline-none transition-colors"
                          onChange={(e) => setBet({ type: 'game', value: e.target.value })}
                          value={bet.type === 'game' ? bet.value : ""}
                        >
                          <option value="">Selecciona un juego...</option>
                          {activePool.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÓN MAESTRO */}
                <button onClick={spinWheel} disabled={isSpinning || activePool.length === 0}
                  className={`w-full py-6 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-xl ${isSpinning || activePool.length === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-yellow-950 hover:bg-yellow-300 hover:scale-[1.02] shadow-[0_0_40px_rgba(250,204,21,0.3)]'
                    }`}>
                  {isSpinning ? 'Girando...' : '¡No va más!'}
                </button>

                {/* RESULTADO Y PREMIO */}
                {winner && !isSpinning && (
                  <div className="mt-4 p-6 bg-gray-900 border-2 border-gray-700 rounded-3xl text-center animate-in zoom-in duration-500 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${winner.color === 'red' ? 'bg-red-600' : 'bg-gray-950'}`}></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 mt-2">La ruleta dicta:</p>
                    <h2 className="text-3xl font-black text-white mb-6 italic leading-tight">{winner.title}</h2>

                    {bet.type && (
                      <div className={`p-4 rounded-xl border-2 mb-6 ${betResult === 'win' ? 'bg-green-950 border-green-500' : 'bg-red-950/50 border-red-900'}`}>
                        <p className={`text-xl font-black uppercase tracking-wider ${betResult === 'win' ? 'text-green-400' : 'text-red-500'}`}>
                          {betResult === 'win' ? '🎉 ¡HAS GANADO LA APUESTA!' : '💀 Has perdido la apuesta'}
                        </p>
                      </div>
                    )}

                    <button onClick={() => { setView('voting'); setTimeout(() => { document.getElementById(winner.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full">
                      Ver Ficha del Juego
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto py-20 text-center animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-white mb-10">⚙️ Configuración del Sistema</h2>
            
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 inline-block text-left w-full max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-gray-300 mb-6 border-b border-gray-800 pb-4">Apariencia</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all border ${theme === 'light' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800'}`}
                >
                  ☀️ Tema Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all border ${theme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-800'}`}
                >
                  🌙 Tema Oscuro
                </button>
              </div>
            </div>

            <div className="mt-12">
              <button onClick={() => setView('voting')} className="px-8 py-3 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all border border-gray-700">
                Volver al Tribunal
              </button>
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {selectedSingleId ? (
              (() => {
                const game = SINGLE_PLAYER_GAMES.find(g => g.id === selectedSingleId);
                const gameReviews = userReviews[selectedSingleId] || {};
                
                // Get valid votes
                const validVotes = PLAYERS.map(p => gameReviews[p]).filter(r => r && !r.noVote && r.note >= 0);
                const globalAverage = validVotes.length > 0 ? (validVotes.reduce((sum, r) => sum + r.note, 0) / validVotes.length).toFixed(1) : null;
                
                const currentReview = gameReviews[currentPlayer] || { note: 5, text: '', noVote: false };

                const handleReviewChange = (updates) => {
                  if (!currentPlayer || !user) return alert("Selecciona tu perfil en el modo cooperativo para poder publicar reseñas.");
                  const newReview = { ...currentReview, ...updates };
                  handleSingleReview(selectedSingleId, newReview);
                };

                return (
                  <div className="max-w-6xl mx-auto bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative h-64 md:h-96">
                      <img src={game?.headerImg} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
                      <button
                        onClick={() => {
                          setSelectedSingleId(null);
                          setTimeout(() => window.scrollTo(0, scrollPos), 0);
                        }}
                        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white font-bold border border-white/10 hover:bg-black transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" /> Volver
                      </button>
                    </div>

                    <div className="p-8 md:p-12 -mt-12 relative z-10">
                      <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tight">{game?.title}</h2>
                      
                      {/* PESTAÑAS */}
                      <div className="flex gap-4 mb-10 border-b border-gray-800 pb-px overflow-x-auto">
                        {['overview', 'specs', 'progress', 'review'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-black uppercase text-xs tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-indigo-400' : 'text-gray-500 hover:text-white'}`}
                          >
                            {tab === 'overview' ? 'Resumen' : tab === 'specs' ? 'Requisitos' : tab === 'progress' ? 'Progreso' : 'Reseñas'}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 animate-in slide-in-from-left duration-300"></div>}
                          </button>
                        ))}
                      </div>

                      <div className="min-h-[300px]">
                        {activeTab === 'overview' && (
                          <div className="animate-in fade-in duration-500">
                            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mb-12">{game?.description || game?.summary}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* BLOQUE HOWLONGTOBEAT */}
                              {game?.hltb && (
                                <div className="flex flex-col md:flex-row bg-[#2970b1] text-white rounded-2xl overflow-hidden shadow-xl border border-[#235d94] mt-4">
                                  <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-[#235d94]/50 flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">HOWLONGTOBEAT</span>
                                    <span className="text-xl font-black">{game.hltb.general || '---'}</span>
                                    <span className="text-[8px] font-bold uppercase opacity-50 mt-1">PROMEDIO</span>
                                  </div>
                                  <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-[#235d94]/50 flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">Main Story</span>
                                    <span className="text-xl font-black">{game.hltb.main || '---'}</span>
                                  </div>
                                  <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-[#235d94]/50 flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">Main + Sides</span>
                                    <span className="text-xl font-black">{game.hltb.extras || '---'}</span>
                                  </div>
                                  <div className="flex-1 p-4 flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">Completionist</span>
                                    <span className="text-xl font-black">{game.hltb.completionist || '---'}</span>
                                  </div>
                                </div>
                              )}

                              {/* ENLACES OFICIALES */}
                              {game?.links && (
                                <div className="bg-gray-950/50 p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-center">
                                  <h4 className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-widest mb-6">
                                    🔗 Enlaces Oficiales
                                  </h4>
                                  <div className="flex flex-wrap gap-4">
                                    {game.links.steam && (
                                      <a href={game.links.steam} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-gray-700">
                                        Steam
                                      </a>
                                    )}
                                    {game.links.metacritic && (
                                      <a href={game.links.metacritic} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-yellow-500/30">
                                        Metacritic
                                      </a>
                                    )}
                                    {game.links.hltb && (
                                      <a href={game.links.hltb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-indigo-500/30">
                                        HowLongToBeat
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'specs' && (
                          <div className="animate-in fade-in duration-500 overflow-hidden border border-gray-800 rounded-2xl">
                            <table className="w-full text-left">
                              <tbody className="divide-y divide-gray-800">
                                {Object.entries(game?.minRequirements || {}).map(([key, value]) => (
                                  <tr key={key} className="bg-gray-950/30">
                                    <td className="px-6 py-4 font-black uppercase text-[10px] text-gray-500 tracking-widest w-1/4">{key}</td>
                                    <td className="px-6 py-4 text-gray-200 font-medium">{value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {activeTab === 'progress' && (
                          <div className="animate-in fade-in duration-500">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                               {/* SECCIÓN TU PROGRESO */}
                               <div className="bg-gray-950/30 p-8 rounded-3xl border border-gray-800 shadow-inner">
                                 <h4 className="text-white font-black text-xl mb-8 flex items-center gap-2">🕹️ Tu Progreso ({currentPlayer || 'Invitado'})</h4>
                                 
                                 <div className="space-y-8">
                                   <div>
                                     <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Estado de la Partida</p>
                                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                       {['Pendiente', 'Jugando', 'Terminado', 'Abandonado'].map(st => (
                                         <button
                                           key={st}
                                           onClick={() => handleReviewChange({ status: st })}
                                           className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${currentReview.status === st ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'}`}
                                         >
                                           {st}
                                         </button>
                                       ))}
                                     </div>
                                   </div>

                                   <div>
                                     <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Dificultad Elegida</p>
                                     <div className="grid grid-cols-2 gap-2">
                                       {[
                                         { id: 'Fácil', sub: 'Historia' },
                                         { id: 'Normal', sub: 'Estándar' },
                                         { id: 'Difícil', sub: 'Desafío' },
                                         { id: 'Extrema', sub: 'Pesadilla' }
                                       ].map(diff => (
                                         <button
                                           key={diff.id}
                                           onClick={() => handleReviewChange({ difficulty: diff.id })}
                                           className={`py-3 px-4 rounded-xl flex flex-col items-center transition-all border ${currentReview.difficulty === diff.id ? 'bg-gray-800 border-indigo-500 text-indigo-400' : 'bg-gray-900 border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-400'}`}
                                         >
                                           <span className="font-black uppercase tracking-widest text-xs">{diff.id}</span>
                                           <span className="text-[9px] uppercase tracking-widest opacity-60 mt-0.5">{diff.sub}</span>
                                         </button>
                                       ))}
                                     </div>
                                   </div>
                                 </div>
                               </div>

                               {/* ESCUADRÓN */}
                               <div>
                                 <h4 className="text-white font-black text-xl mb-8 border-b border-gray-800 pb-4">Muro de Progreso</h4>
                                 <div className="space-y-3">
                                   {PLAYERS.map(player => {
                                     const pRev = gameReviews[player];
                                     if (!pRev || (!pRev.status && !pRev.difficulty)) return null;

                                     return (
                                       <div key={player} className="flex items-center justify-between p-4 bg-gray-900/60 rounded-2xl border border-gray-800">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center border border-indigo-500/20">
                                               <Users className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <span className="font-black text-white">{player}</span>
                                         </div>
                                         <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
                                           {pRev.status && (
                                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                pRev.status === 'Jugando' ? 'text-blue-400 bg-blue-500/10' :
                                                pRev.status === 'Terminado' ? 'text-green-400 bg-green-500/10' :
                                                pRev.status === 'Abandonado' ? 'text-red-400 bg-red-500/10' :
                                                'text-gray-400 bg-gray-800'
                                              }`}>
                                                {pRev.status}
                                              </span>
                                           )}
                                           {pRev.difficulty && (
                                              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-px">
                                                En {pRev.difficulty}
                                              </span>
                                           )}
                                         </div>
                                       </div>
                                     );
                                   })}
                                   {PLAYERS.filter(p => gameReviews[p]?.status || gameReviews[p]?.difficulty).length === 0 && (
                                     <div className="p-8 text-center border border-dashed border-gray-800 rounded-3xl opacity-50">
                                       <p className="text-gray-500 font-bold text-sm tracking-widest uppercase mb-2">Señal Perdida</p>
                                       <p className="text-gray-600 text-xs">Aún no hay datos de progreso de los magistrados.</p>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </div>
                        )}

                        {activeTab === 'review' && (
                          <div className="animate-in fade-in duration-500">
                            
                            {/* BLOQUE SUPERIOR: Tu Veredicto y Media Global */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                              {/* IZQUIERDA: TU VOTO */}
                              <div className="space-y-8 bg-gray-950/30 p-8 rounded-3xl border border-gray-800 shadow-inner">
                                <div>
                                  <div className="flex justify-between items-center mb-6 px-1 border-b border-gray-800 pb-4">
                                    <h4 className="text-white font-black text-xl flex items-center gap-2">👤 Tu Veredicto ({currentPlayer || 'Invitado'})</h4>
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4 accent-indigo-500 rounded bg-gray-800 border-gray-700"
                                        checked={currentReview.noVote}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          const currentRev = userReviews[selectedSingleId]?.[currentPlayer] || {};
                                          const updatedData = { 
                                            ...currentRev, 
                                            noVote: isChecked,
                                            note: isChecked ? 0 : (currentRev.note || 5)
                                          };
                                          handleSingleReview(selectedSingleId, updatedData);
                                        }}
                                      />
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sin Votar</span>
                                    </label>
                                  </div>
                                  
                                  {!currentReview.noVote && (
                                    <div className="text-center mb-6">
                                      <span className="text-6xl font-black text-white">{currentReview.note.toFixed(1)}</span>
                                      <span className="text-2xl font-bold text-gray-600 block mt-1 uppercase tracking-widest">{getExtendedLabel(currentReview.note)}</span>
                                    </div>
                                  )}

                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    disabled={currentReview.noVote}
                                    value={currentReview.noVote ? 0 : currentReview.note}
                                    onChange={(e) => handleReviewChange({ note: parseFloat(e.target.value) })}
                                    className={`w-full h-3.5 bg-gray-800 rounded-lg appearance-none cursor-pointer transition-all ${currentReview.noVote ? 'opacity-20 cursor-not-allowed hidden' : ''}`}
                                    style={currentReview.noVote ? {} : {
                                      background: `linear-gradient(to right, ${currentReview.note === 0 ? '#1f2937' :
                                          currentReview.note <= 4.9 ? `rgba(248, 113, 113, ${currentReview.note / 10})` :
                                            currentReview.note <= 6.9 ? `rgba(156, 163, 175, ${currentReview.note / 10})` :
                                              `rgba(99, 102, 241, ${currentReview.note / 10})`
                                        } 0%, #1f2937 ${currentReview.note * 10}%, #1f2937 100%)`
                                    }}
                                  />
                                </div>

                                <div>
                                  <textarea
                                    placeholder="Escribe tus impresiones aquí..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-6 text-gray-300 font-medium focus:outline-none focus:border-indigo-500/50 transition-all min-h-[160px] resize-none"
                                    value={currentReview.text}
                                    onChange={(e) => {
                                      // Actualización local rápida para el input
                                      setUserReviews(prev => ({
                                        ...prev,
                                        [selectedSingleId]: {
                                          ...prev[selectedSingleId],
                                          [currentPlayer]: { ...currentReview, text: e.target.value }
                                        }
                                      }));
                                    }}
                                    onBlur={(e) => handleReviewChange({ text: e.target.value })}
                                  ></textarea>
                                  <div className="flex gap-4 items-center justify-end mt-4">
                                    <button
                                      onClick={() => handleDeleteReview(selectedSingleId)}
                                      className="text-[10px] font-black text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest px-3 py-2"
                                    >
                                      🗑️ Borrar Reseña
                                    </button>
                                    <button
                                      onClick={async () => {
                                        setIsSaving(true);
                                        await handleSingleReview(selectedSingleId, userReviews[selectedSingleId]?.[currentPlayer]);
                                        setTimeout(() => setIsSaving(false), 2000);
                                      }}
                                      className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all border ${isSaving ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/40'}`}
                                    >
                                      {isSaving ? '✅ ¡Guardado!' : '💾 Guardar Comentario'}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* DERECHA: MEDIA GLOBAL */}
                              <div className="bg-gray-900 p-8 md:p-12 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-br from-indigo-900/10 to-transparent"></div>
                                <h4 className="text-gray-500 font-black uppercase text-[12px] tracking-[0.3em] mb-8 relative z-10">Puntuación del Tribunal</h4>
                                {globalAverage === null ? (
                                  <div className="flex flex-col items-center gap-4 relative z-10 transition-all animate-in zoom-in duration-500">
                                    <div className="text-6xl md:text-8xl text-gray-700 font-black tracking-tighter">---</div>
                                    <div className="px-6 py-2 bg-gray-800 text-gray-400 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-inner mb-2">
                                      Sin Votos
                                    </div>
                                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest opacity-40">Basado en 0 reseñas</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-4 relative z-10 transition-all animate-in zoom-in duration-500">
                                    <div className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.2)] tracking-tighter">
                                      {globalAverage}
                                    </div>
                                    <div className="px-6 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-2">
                                      {getExtendedLabel(parseFloat(globalAverage))}
                                    </div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Basado en {validVotes.length} reseñas</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BLOQUE INFERIOR: MURO DE RESEÑAS */}
                            <div>
                               <h3 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">Muro de Reseñas del Grupo</h3>
                               <div className="space-y-4">
                                 {PLAYERS.map(player => {
                                   const r = gameReviews[player];
                                   if (r && !r.noVote) {
                                     return (
                                       <div key={player} className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-6 shadow-xl transition-all hover:border-indigo-500/30">
                                         <div className="w-full md:w-32 shrink-0 flex flex-col items-center justify-center py-4 bg-gray-950 rounded-xl border border-gray-800/80">
                                           <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center mb-3">
                                              <Users className="w-6 h-6 text-indigo-400" />
                                           </div>
                                           <span className="font-black text-white mb-2">{player}</span>
                                           <div className="text-3xl font-black leading-none bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">{r.note.toFixed(1)}</div>
                                           <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold mt-2 text-center px-2">{getExtendedLabel(r.note)}</span>
                                         </div>
                                         <div className="flex-1 flex flex-col">
                                           <div className="flex justify-between items-start mb-4">
                                             <div className="flex items-center gap-2">
                                                <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Crítica Oficial</span>
                                             </div>
                                             {r.date && <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{r.date}</span>}
                                           </div>
                                           <p className="text-gray-300 leading-relaxed italic border-l-2 border-gray-700 pl-4 mb-4">
                                             {r.text || "El usuario ha emitido su veredicto sin proporcionar texto adicional."}
                                           </p>
                                           
                                           {/* SISTEMA DE REACCIONES */}
                                           <div className="mt-auto pt-4 border-t border-gray-800/50 flex flex-wrap items-center gap-2 relative">
                                             {/* Render de Reacciones Activas */}
                                             {Object.entries(r.reactions || {}).map(([emoji, users]) => {
                                               if (!users || users.length === 0) return null;
                                               const userHasReacted = users.includes(currentPlayer);
                                               return (
                                                 <button 
                                                   key={emoji}
                                                   onClick={() => handleReaction(selectedSingleId, player, emoji)}
                                                   className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border ${userHasReacted ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200' : 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-400'}`}
                                                   title={`Reacciones: ${users.join(', ')}`}
                                                 >
                                                   <span>{emoji}</span>
                                                   <span className="font-bold">{users.length}</span>
                                                 </button>
                                               );
                                             })}
                                             
                                             {/* Botón para Desplegar Paleta */}
                                             <button 
                                               onClick={() => setReactionDropdownOpen(reactionDropdownOpen === player ? null : player)}
                                               className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-500 hover:text-gray-300 transition-colors text-xs font-bold uppercase tracking-wider"
                                             >
                                                + Reaccionar
                                             </button>

                                             {/* Paleta Flotante */}
                                             {reactionDropdownOpen === player && (
                                               <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 p-2 rounded-2xl shadow-2xl flex flex-wrap w-[220px] gap-1 z-50 animate-in slide-in-from-bottom-2">
                                                 {EMOJI_PALETTE.map(e => (
                                                   <button 
                                                     key={e}
                                                     onClick={() => {
                                                       handleReaction(selectedSingleId, player, e);
                                                       setReactionDropdownOpen(null);
                                                     }}
                                                     className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 hover:scale-125 transition-all rounded-lg cursor-pointer text-lg"
                                                   >
                                                     {e}
                                                   </button>
                                                 ))}
                                               </div>
                                             )}
                                           </div>
                                         </div>
                                       </div>
                                     );
                                   } else {
                                     return (
                                       <div key={player} className="bg-gray-950/40 p-6 rounded-2xl border border-gray-800/50 flex items-center justify-center opacity-70">
                                         <p className="text-gray-500 font-medium italic"><span className="not-italic mr-2">👤</span> {player} no ha publicado ninguna reseña todavía.</p>
                                       </div>
                                     );
                                   }
                                 })}
                               </div>
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* BARRA SUPERIOR PRO */}
                <div className="flex flex-col xl:flex-row gap-6 mb-12 items-center justify-between bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-xl">
                  
                  <div className="relative w-full xl:w-96 group shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Buscar título o lore..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700/50 rounded-2xl py-3 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600 shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800 shrink-0">
                      {[ 
                        { id: 'news', label: 'Novedades' },
                        { id: 'top', label: 'Mejores' },
                        { id: 'short', label: 'Cortos' },
                        { id: 'alpha', label: 'A-Z' }
                      ].map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setLibrarySort(opt.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${librarySort === opt.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={libraryGenreFilter}
                      onChange={(e) => setLibraryGenreFilter(e.target.value)}
                      className="w-full sm:w-36 bg-gray-950 border border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                    >
                      <option value="all">TODOS LOS GÉNEROS</option>
                      {Array.from(new Set(SINGLE_PLAYER_GAMES.flatMap(g => g.genres || []))).map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>

                    <select
                      value={minMetacritic}
                      onChange={(e) => setMinMetacritic(Number(e.target.value))}
                      className="w-full sm:w-36 bg-gray-950 border border-gray-800 text-yellow-500 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-2xl focus:outline-none focus:border-yellow-500/50 transition-colors cursor-pointer appearance-none"
                    >
                      <option value={0}>CUALQUIER NOTA</option>
                      <option value={80}>META: +80</option>
                      <option value={85}>META: +85</option>
                      <option value={90}>META: +90</option>
                      <option value={95}>META: +95</option>
                    </select>
                  </div>

                </div>

                {/* GRID DE JUEGOS PRO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                  {(() => {
                    let filteredLibrary = SINGLE_PLAYER_GAMES.filter(game => {
                      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (game.summary && game.summary.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchesGenre = libraryGenreFilter === 'all' || (game.genres && game.genres.includes(libraryGenreFilter));
                      const matchesMeta = minMetacritic === 0 || (game.metacritic && game.metacritic >= minMetacritic);
                      return matchesSearch && matchesGenre && matchesMeta;
                    });

                    if (librarySort === 'news') {
                      filteredLibrary = [...filteredLibrary].reverse();
                    } else if (librarySort === 'alpha') {
                      filteredLibrary.sort((a, b) => a.title.localeCompare(b.title));
                    } else if (librarySort === 'short') {
                      filteredLibrary.sort((a, b) => {
                        const timeA = parseInt((a.hltb && a.hltb.main) || '999');
                        const timeB = parseInt((b.hltb && b.hltb.main) || '999');
                        return timeA - timeB;
                      });
                    } else if (librarySort === 'top') {
                      filteredLibrary.sort((a, b) => {
                        const getAvg = (id) => {
                          const gameRev = userReviews[id] || {};
                          const valid = PLAYERS.map(p => gameRev[p]).filter(r => r && !r.noVote && r.note >= 0);
                          return valid.length > 0 ? (valid.reduce((sum, r) => sum + r.note, 0) / valid.length) : 0;
                        };
                        return getAvg(b.id) - getAvg(a.id);
                      });
                    }

                    return filteredLibrary;
                  })().map(game => {
                    const gameRev = userReviews[game.id] || {};
                    const valid = PLAYERS.map(p => gameRev[p]).filter(r => r && !r.noVote && r.note >= 0);
                    const avg = valid.length > 0 ? (valid.reduce((sum, r) => sum + r.note, 0) / valid.length).toFixed(1) : '---';

                    return (
                      <div
                        key={game.id}
                        onClick={() => {
                          setScrollPos(window.scrollY);
                          setSelectedSingleId(game.id);
                          window.scrollTo(0, 0);
                        }}
                        className="group cursor-pointer bg-gray-900/40 rounded-3xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full hover:scale-[1.02]"
                      >
                        <div className="aspect-3/4 overflow-hidden relative shadow-inner">
                          <img
                            src={game.img}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={game.title}
                          />
                          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                            <div className="bg-gray-950/80 backdrop-blur-md px-3 py-1 mr-[-2px] rounded-xl border border-gray-700/50 flex flex-col items-center shadow-lg">
                               <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Media</span>
                               <span className="text-white font-black text-sm">{avg}</span>
                            </div>
                            <div className="bg-gray-950/80 backdrop-blur-md px-3 py-1 mr-[-2px] rounded-xl border border-gray-700/50 flex flex-col items-center shadow-lg">
                               <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Reseñas</span>
                               <span className="text-white font-black text-sm">{valid.length > 0 ? valid.length : '---'}</span>
                            </div>
                          </div>
                          
                          {/* Contador de Metacritic */}
                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-500/30 flex items-center gap-1.5 shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-black text-yellow-400">{game.metacritic || '---'}</span>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-white font-black text-xl mb-3 leading-tight group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-auto">
                             {game.genres && game.genres.slice(0, 6).map(g => (
                               <span key={g} className="text-[9px] font-black px-2 py-1 bg-gray-800 text-gray-400 rounded-lg uppercase tracking-widest border border-gray-700/50 h-fit">{g}</span>
                             ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

