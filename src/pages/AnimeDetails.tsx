import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeDetails, AnimeDetails as AnimeDetailsType } from '../lib/api';
import { Play } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import AnimeTrailer from '../components/AnimeTrailer';
import ContinueWatching from '../components/ContinueWatching';

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnimeDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const details = await getAnimeDetails(id);
        setData(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-white/50">Anime not found.</div>;

  const { info, moreInfo } = data.anime;

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={info.poster}
            alt={info.name}
            className="w-full h-full object-cover blur-xl scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />
        </div>
        
        <div className="absolute inset-0 z-10 flex items-end pb-12">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 w-full flex flex-col md:flex-row gap-8 items-end md:items-stretch">
            {/* Poster */}
            <div className="w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden glass-panel shadow-2xl relative z-20 mx-auto md:mx-0 -mb-16 md:mb-0">
              <img src={info.poster} alt={info.name} className="w-full aspect-[2/3] object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 text-center md:text-left mt-16 md:mt-0">
              <h1 className="text-3xl md:text-5xl font-black font-bold tracking-tight text-white drop-shadow-lg">
                {info.name}
              </h1>
              {moreInfo.japanese && (
                <p className="text-white/50 font-mono text-sm">{moreInfo.japanese}</p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 my-4">
                 {info.stats?.quality && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">{info.stats.quality}</span>}
                 {info.stats?.type && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">{info.stats.type}</span>}
                 {info.stats?.duration && <span className="text-white/60 text-xs font-mono">{info.stats.duration}</span>}
                 {info.stats?.episodes?.sub != null && (
                   <span className="text-white/80 text-xs font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">SP {info.stats.episodes.sub}</span>
                 )}
                 {info.stats?.episodes?.dub != null && info.stats.episodes.dub > 0 && (
                   <span className="text-accent text-xs font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">DUB {info.stats.episodes.dub}</span>
                 )}
              </div>

              {moreInfo.genres && moreInfo.genres.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                  {moreInfo.genres.map(g => (
                    <Link
                      key={g}
                      to={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold tracking-wide transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex justify-center md:justify-start">
                  <Link
                    to={`/watch/${info.id}`}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full font-bold tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,78,0,0.4)]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    WATCH NOW
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-24 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
           <ContinueWatching animeId={id} />

           <section>
             <h2 className="text-2xl font-black text-white mb-4">Synopsis</h2>
             <p className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap font-sans">
               {info.description || 'No description available.'}
             </p>
           </section>

           {info.malId && <AnimeTrailer malId={info.malId} />}

           {/* Characters */}
           {info.charactersVoiceActors && info.charactersVoiceActors.length > 0 && (
             <section>
               <h2 className="text-2xl font-black text-white mb-6">Characters</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {info.charactersVoiceActors.map((item, idx) => (
                    <div key={idx} className="flex gap-4 glass-panel p-3 rounded-xl items-center">
                       <img src={item.character.poster} className="w-12 h-16 object-cover rounded shadow" alt={item.character.name} />
                       <div className="flex-1">
                          <p className="text-sm font-medium text-white line-clamp-1">{item.character.name}</p>
                          <p className="text-xs text-white/50">{item.character.cast}</p>
                       </div>
                    </div>
                 ))}
               </div>
             </section>
           )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-panel p-6 rounded-2xl space-y-4">
              {moreInfo.aired && <SidebarItem label="Aired" value={moreInfo.aired} />}
              {moreInfo.premiered && <SidebarItem label="Premiered" value={moreInfo.premiered} />}
              {moreInfo.status && <SidebarItem label="Status" value={moreInfo.status} />}
              {moreInfo.malscore && <SidebarItem label="MAL Score" value={moreInfo.malscore} />}
              {moreInfo.studios && <SidebarItem label="Studios" value={moreInfo.studios} />}
              {moreInfo.producers && moreInfo.producers.length > 0 && (
                <SidebarItem label="Producers" value={moreInfo.producers.join(', ')} />
              )}
           </div>
        </div>
      </div>

      {data.relatedAnimes && data.relatedAnimes.length > 0 && (
         <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-16">
           <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Related Anime</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {data.relatedAnimes.slice(0, 12).map((item: any) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
           </div>
         </div>
      )}

      {data.recommendedAnimes && data.recommendedAnimes.length > 0 && (
         <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-16">
           <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Recommended for You</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {data.recommendedAnimes.slice(0, 12).map((item: any) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
           </div>
         </div>
      )}
    </div>
  );
}

function SidebarItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest font-mono">{label}</p>
      <p className="text-white/90 text-sm mt-0.5">{value}</p>
    </div>
  );
}
