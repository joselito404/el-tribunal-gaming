/* eslint-disable no-unused-vars */
import { Clock, Star, ExternalLink } from 'lucide-react';

const GameCard = ({ game }) => {
  return (
    <div className="group relative bg-gray-800/40 rounded-3xl border border-white/5 overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-2">
      <div className="relative aspect-2/3 overflow-hidden">
        <img 
          src={game.img} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-transparent opacity-80" />

        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs font-bold text-white">{game.metacritic || '---'}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {game.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 italic">"{game.description}"</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {game.genres.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Historia</span>
            <div className="flex items-center gap-1 text-indigo-300 font-mono text-xs">
              <Clock className="w-3 h-3" /> {game.hltb.main}
            </div>
          </div>
          <a href={game.links.steam} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-indigo-500 rounded-2xl text-gray-400 hover:text-white transition-all group/btn">
            <ExternalLink className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
