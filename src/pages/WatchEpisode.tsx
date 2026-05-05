import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeEpisodes, getEpisodeServers, getEpisodeSources, Episode, ServersData, SourcesData, getAnimeDetails, AnimeDetails } from '../lib/api';
import VideoPlayer from '../components/VideoPlayer';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WatchEpisode() {
  const { episodeId } = useParams<{ episodeId: string }>();
  
  const [animeId, setAnimeId] = useState<string>('');
  const [details, setDetails] = useState<AnimeDetails | null>(null);
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [servers, setServers] = useState<ServersData | null>(null);
  const [activeServer, setActiveServer] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'sub' | 'dub' | 'raw'>('sub');
  
  const [sources, setSources] = useState<SourcesData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(false);

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
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 min-h-screen grid grid-cols-1 xl:grid-cols-4 gap-8">
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
            <VideoPlayer sourcesData={sources} />
          ) : (
            <div className="w-full aspect-video bg-black/50 relative rounded-xl overflow-hidden glass-panel flex items-center justify-center text-white/50">
               Failed to load video source for the selected server.
            </div>
          )}
        </div>
        
        {/* Server Selection */}
        {servers && (
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-sm font-mono tracking-widest uppercase text-white/50">Version:</span>
              <div className="flex bg-black/40 rounded-lg p-1">
                {(['sub', 'dub', 'raw'] as const).map(cat => {
                   if (!servers[cat] || servers[cat].length === 0) return null;
                   return (
                     <button
                       key={cat}
                       onClick={() => {
                         setActiveCategory(cat);
                         setActiveServer(servers[cat][0].serverName);
                       }}
                       className={cn(
                         "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors",
                         activeCategory === cat ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
                       )}
                     >
                       {cat}
                     </button>
                   );
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-sm font-mono tracking-widest uppercase text-white/50">Servers:</span>
              <div className="flex flex-wrap gap-2">
                {servers[activeCategory]?.map((srv) => (
                  <button
                    key={srv.serverName}
                    onClick={() => setActiveServer(srv.serverName)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-colors border",
                      activeServer === srv.serverName 
                        ? "bg-accent/20 border-accent text-accent" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/70"
                    )}
                  >
                    {srv.serverName}
                  </button>
                ))}
              </div>
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
  );
}
