import { Link } from 'react-router-dom';
import { WatchProgress, useContinueWatching } from '../hooks/useContinueWatching';
import { Play, X } from 'lucide-react';

export default function ContinueWatching({ animeId }: { animeId?: string }) {
  const { history, removeProgress } = useContinueWatching();

  let displayedHistory = history;
  if (animeId) {
    displayedHistory = history.filter(h => h.animeId === animeId);
  }

  if (!displayedHistory || displayedHistory.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">Continue Watching</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedHistory.slice(0, 4).map((item) => {
          const progressPercent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;

          
          return (
            <div key={item.animeId} className="relative group glass-panel rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-accent/20 hover:border-accent/40 flex flex-col">
              <Link to={`/watch/${encodeURIComponent(item.episodeId)}`} className="flex-1 flex gap-3 p-3">
                <div className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-black/40">
                  <img 
                    src={item.poster} 
                    alt={item.animeTitle} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                       <Play className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col py-1">
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                    {item.animeTitle}
                  </h3>
                  <div className="text-xs text-white/60 mb-auto mt-1">
                    Episode {item.episodeNumber}
                  </div>
                  
                  <div className="mt-2 w-full">
                    <div className="flex justify-between items-center text-[10px] text-white/50 mb-1">
                      <span>{Math.floor(item.progress / 60)}:{(Math.floor(item.progress % 60)).toString().padStart(2, '0')}</span>
                      <span>{Math.floor(item.duration / 60)}:{(Math.floor(item.duration % 60)).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent relative" 
                        style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 truncate" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeProgress(item.animeId);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10"
                title="Remove from history"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
