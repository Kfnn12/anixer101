import { useState, useEffect } from 'react';
import { getHome, HomeData } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import SpotlightCarousel from '../components/SpotlightCarousel';

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const homeData = await getHome();
        setData(homeData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-white/50">Failed to load content.</div>;

  return (
    <div className="pb-24">
      {data.spotlightAnimes && data.spotlightAnimes.length > 0 && (
        <SpotlightCarousel items={data.spotlightAnimes} />
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-12 space-y-16">
        <AnimeSection title="Trending Now" items={data.trendingAnimes} />
        <AnimeSection title="Recently Updated" items={data.latestEpisodeAnimes} />
        <AnimeSection title="Latest Completed" items={data.latestCompletedAnimes} />
        <AnimeSection title="Top Upcoming" items={data.topUpcomingAnimes} />
      </div>
    </div>
  );
}

function AnimeSection({ title, items }: { title: string; items: any[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2 hidden md:flex">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-50 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2"></path></svg>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2"></path></svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
        {items.slice(0, 12).map((item: any) => (
          <AnimeCard key={item.id} anime={item} />
        ))}
      </div>
    </section>
  );
}
