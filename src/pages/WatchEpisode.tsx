import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnimeEpisodes, getEpisodeServers, getEpisodeSources, Episode, ServersData, SourcesData, getAnimeDetails, AnimeDetails } from '../lib/api';
import VideoPlayer from '../components/VideoPlayer';
import AnimeCard from '../components/AnimeCard';
import { ArrowLeft, Server, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

import { useContinueWatching } from '../hooks/useContinueWatching';

export default function WatchEpisode() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const { saveProgress, getEpisodeProgress } = useContinueWatching();
  
  const [animeId, setAnimeId] = useState<string>('');
  const [details, setDetails] = useState<AnimeDetails | null>(null);
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [servers, setServers] = useState<ServersData | null>(null);
  const [activeServer, setActiveServer] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'sub' | 'dub' | 'raw'>('sub');
  
  const [sources, setSources] = useState<SourcesData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(() => {
    return localStorage.getItem('autoPlayEnabled') !== 'false';
  });
  
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('autoPlayEnabled', String(autoPlayEnabled));
  }, [autoPlayEnabled]);

  useEffect(() => {
    // Stop countdown when episode changes
    setAutoPlayCountdown(null);
  }, [episodeId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlayCountdown !== null && autoPlayCountdown > 0) {
      timer = setTimeout(() => {
        setAutoPlayCountdown(c => (c !== null ? c - 1 : null));
      }, 1000);
    } else if (autoPlayCountdown === 0) {
      // Find next episode and navigate
      const currentIndex = episodes.findIndex(e => e.episodeId === episodeId);
      if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
        const nextEp = episodes[currentIndex + 1];
        navigate(`/watch/${encodeURIComponent(nextEp.episodeId)}`);
      }
      setAutoPlayCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [autoPlayCountdown, episodes, episodeId, navigate]);

  const handleVideoEnded = () => {
    if (autoPlayEnabled) {
      const currentIndex = episodes.findIndex(e => e.episodeId === episodeId);
      if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
        setAutoPlayCountdown(5); // 5 seconds countdown
      }
    }
  };

  const lastSaveTime = useRef<number>(0);

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (!animeId || !details || !episodeId) return;
    
    // Throttle to save at most once every 5 seconds
    const now = Date.now();
    if (now - lastSaveTime.current < 5000) return;
    
    if (currentTime > 5 && duration > 0) {
      lastSaveTime.current = now;
      const currentEp = episodes.find(e => e.episodeId === episodeId);
      saveProgress({
        animeId,
        animeTitle: details.anime.info.name,
        poster: details.anime.info.poster,
        episodeId,
        episodeNumber: currentEp?.number || 1,
        progress: currentTime,
        duration: duration
      });
    }
  };

  useEffect(() => {
    if (!episodeId) return;
    
    // Attempt to extract animeId from episodeId
    // Usually episodeId is formatted like "anime-id-episode-no" or similar
    // We actually need the correct animeId to fetch the episodes list.
    // Let's assume the episodeId contains the animeId inside Kaido endpoints.
    const _animeId = episodeId.substring(0, episodeId.lastIndexOf('?')) || episodeId; // This is a rough estimation. In reality, you'd navigate with state or fetch details if the API supports it.
    // For Kaido, the episodeId directly gives the server. But to get the *list* of episodes, getAnimeEpisodes needs the *animeId*.
    // However, if we must guess animeId from episodeId, normally episodeId = "anime-name-id?ep=123". Let's split by "?".
    const aId = episodeId.split('?')[0];
    setAnimeId(aId);

    async function loadInitial() {
      setLoading(true);
      try {
        const [eps, srvs, dets] = await Promise.all([
          getAnimeEpisodes(aId),
          getEpisodeServers(episodeId!),
          getAnimeDetails(aId)
        ]);
        
        setEpisodes(eps.episodes);
        setServers(srvs);
        setDetails(dets);
        
        if (srvs.sub.length > 0) {
          setActiveCategory('sub');
          setActiveServer(srvs.sub[0].serverName);
        } else if (srvs.dub.length > 0) {
          setActiveCategory('dub');
          setActiveServer(srvs.dub[0].serverName);
        } else if (srvs.raw.length > 0) {
          setActiveCategory('raw');
          setActiveServer(srvs.raw[0].serverName);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitial();
  }, [episodeId]);

  useEffect(() => {
    if (!episodeId || !activeServer || !activeCategory) return;
    
    async function loadSource() {
      setSourcesLoading(true);
      try {
        const data = await getEpisodeSources(episodeId!, activeCategory, activeServer);
        setSources(data);
      } catch (error) {
        console.error(error);
        setSources(null);
      } finally {
        setSourcesLoading(false);
      }
    }
    
    loadSource();
  }, [episodeId, activeServer, activeCategory]);

  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 min-h-screen flex flex-col gap-12">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Player Area */}
        <div className="xl:col-span-3 space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/anime/${animeId}`} className="p-2 rounded-full glass-panel hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {details && (
            <h1 className="text-xl md:text-2xl font-black text-white">
              {details.anime.info.name}
            </h1>
          )}
        </div>

        <div className="relative">
          {sourcesLoading ? (
            <div className="w-full aspect-video bg-black/50 relative rounded-xl overflow-hidden glass-panel flex items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : sources && sources.sources.length > 0 ? (
            <VideoPlayer 
              sourcesData={sources} 
              onEnded={handleVideoEnded}
              onProgress={handleVideoProgress}
              startTime={getEpisodeProgress(episodeId!)?.progress || 0}
            />
          ) : (
            <div className="w-full aspect-video bg-black/50 relative rounded-xl overflow-hidden glass-panel flex items-center justify-center text-white/50">
               Failed to load video source for the selected server.
            </div>
          )}
          
          {/* Autoplay Countdown Overlay */}
          {autoPlayCountdown !== null && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4">Next episode starting in</h3>
              <div className="text-6xl font-black text-accent mb-8">{autoPlayCountdown}</div>
              <div className="flex gap-4">
                <button
                  onClick={() => setAutoPlayCountdown(0)}
                  className="px-6 py-2.5 rounded-full bg-accent text-white font-bold hover:bg-accent/80 transition-colors"
                >
                  Play Now
                </button>
                <button
                  onClick={() => setAutoPlayCountdown(null)}
                  className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls Area */}
        <div className="flex items-center justify-end gap-3 px-1 text-sm text-white/70">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <span className="font-medium">Autoplay Next</span>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="toggle" 
                  checked={autoPlayEnabled}
                  onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                  className="absolute block w-5 h-5 rounded-full bg-white appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                  style={{ top: 0, left: 0, transform: autoPlayEnabled ? 'translateX(100%)' : 'translateX(0)', border: 'none' }}
                />
                <label 
                  htmlFor="toggle" 
                  className={`toggle-label display-block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${autoPlayEnabled ? 'bg-accent' : 'bg-white/20'}`}
                ></label>
            </div>
          </label>
        </div>

        {/* Server Selection */}
        {servers && (
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-white">Select Server</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              {(['sub', 'dub', 'raw'] as const).map(cat => {
                if (!servers[cat] || servers[cat].length === 0) return null;
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md",
                        cat === 'sub' ? "bg-white/10 text-white" : 
                        cat === 'dub' ? "bg-accent/20 text-accent" : 
                        "bg-yellow-500/20 text-yellow-500"
                      )}>
                        {cat}
                      </span>
                      <div className="h-px bg-white/10 flex-1 ml-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {servers[cat]?.map((srv) => {
                        const isActive = activeCategory === cat && activeServer === srv.serverName;
                        return (
                          <button
                            key={srv.serverName}
                            onClick={() => {
                              setActiveCategory(cat);
                              setActiveServer(srv.serverName);
                            }}
                            className={cn(
                              "relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden group border",
                              isActive
                                ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_-3px_rgba(225,29,72,0.3)]"
                                : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
                            )}
                          >
                            {isActive && (
                              <span className="absolute inset-x-0 bottom-0 h-1 bg-accent/80 shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                            )}
                            <PlayCircle className={cn(
                              "w-4 h-4 transition-transform duration-300 flex-shrink-0",
                              isActive ? "fill-accent text-transparent scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="truncate">{srv.serverName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Episodes List List */}
      <div className="space-y-4">
        <h2 className="text-lg font-mono uppercase tracking-widest text-white/50 bg-black/40 px-4 py-2 rounded-lg sticky top-[5rem] z-20 backdrop-blur-md border border-white/5">
          Episodes ({episodes.length})
        </h2>
        <div className="flex flex-col gap-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {episodes.map((ep) => (
            <Link
              key={ep.episodeId}
              to={`/watch/${encodeURIComponent(ep.episodeId)}`}
              className={cn(
                "p-4 rounded-xl flex gap-4 transition-all border",
                episodeId === ep.episodeId 
                  ? "bg-accent/10 border-accent/30" 
                  : "glass-panel hover:bg-white/5 hover:border-white/20 border-transparent"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex-shrink-0 flex items-center justify-center font-mono text-xl",
                episodeId === ep.episodeId ? "text-accent" : "text-white/30"
              )}>
                {ep.number}
              </div>
              <div className="flex flex-col justify-center">
                <span className={cn(
                  "font-medium line-clamp-1",
                  episodeId === ep.episodeId ? "text-white" : "text-white/80"
                )}>
                  {ep.title}
                </span>
                <div className="flex gap-2 mt-1">
                  {ep.hasSub && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white/60">SUB</span>}
                  {ep.hasDub && <span className="text-[10px] bg-accent/20 px-1.5 py-0.5 rounded font-mono text-accent">DUB</span>}
                  {ep.isFiller && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-mono">FILLER</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>

      {details && details.relatedAnimes && details.relatedAnimes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Recommended For You</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x custom-scrollbar">
            {details.relatedAnimes.map((anime) => (
              <div key={anime.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
