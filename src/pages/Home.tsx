import { useState, useEffect } from 'react';
import { getHome, HomeData, ApiError } from '../lib/api';
import { Link } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import SpotlightCarousel from '../components/SpotlightCarousel';
import ScheduleSection from '../components/ScheduleSection';
import ContinueWatching from '../components/ContinueWatching';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const homeData = await getHome();
      if (!homeData || Object.keys(homeData).length === 0 || (!homeData.spotlightAnimes?.length && !homeData.trendingAnimes?.length)) {
        setErrorMsg("Failed to load anime content. The API might be down.");
      } else {
        setData(homeData);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) setErrorMsg(err.message);
      else setErrorMsg("Network error: Could not fetch home data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <ErrorState message={errorMsg || "Failed to load content."} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {data.spotlightAnimes && data.spotlightAnimes.length > 0 && (
        <SpotlightCarousel items={data.spotlightAnimes} />
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-12 space-y-16">
        <ContinueWatching />
        <AnimeSection title="Trending Now" items={data.trendingAnimes} href="/list/trending" />
        <AnimeSection title="Recently Updated" items={data.latestEpisodeAnimes} href="/list/updated" />
        <ScheduleSection />
        <AnimeSection title="Latest Completed" items={data.latestCompletedAnimes} href="/list/completed" />
        <AnimeSection title="Top Upcoming" items={data.topUpcomingAnimes} href="/list/upcoming" />
      </div>
    </div>
  );
}

function AnimeSection({ title, items, href }: { title: string; items: any[]; href?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {href && (
          <Link to={href} className="text-sm text-accent hover:text-white transition-colors flex items-center gap-1 group">
            View All
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
        {items.slice(0, 12).map((item: any) => (
          <AnimeCard key={item.id} anime={item} />
        ))}
      </div>
    </section>
  );
}
