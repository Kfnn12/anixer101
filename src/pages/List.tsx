import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getHome, getCategory, getAZList, getGenre, Anime } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LIST_TITLES: Record<string, string> = {
  trending: 'Trending Now',
  updated: 'Recently Updated',
  completed: 'Latest Completed',
  upcoming: 'Top Upcoming',
  movie: 'Movies',
  tv: 'TV Series',
  'most-popular': 'Most Popular',
  'top-airing': 'Top Airing',
};

const GENRES = [
  "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama", "Ecchi", "Fantasy", "Game", "Harem",
  "Historical", "Horror", "Isekai", "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music",
  "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo",
  "Shoujo Ai", "Shounen", "Shounen Ai", "Space", "Sports", "Super Power", "Supernatural", "Thriller", "Vampire",
  "Yaoi", "Yuri"
];

export default function List({ isGenre = false }: { isGenre?: boolean }) {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        let fetchType = type;
        if (type === 'updated') fetchType = 'updates';
        
        let fetchedPage = false;
        
        try {
          if (isGenre) {
            const res = await getGenre(fetchType!, page);
            if (res && res.animes && res.animes.length > 0) {
              setItems(res.animes);
              setHasNextPage(res.hasNextPage);
              setTotalPages(res.totalPages);
              fetchedPage = true;
            }
          } else if (['trending', 'completed', 'upcoming', 'movie', 'tv', 'updates'].includes(fetchType || '')) {
            const res = await getCategory(fetchType!, page);
            if (res && res.animes && res.animes.length > 0) {
              setItems(res.animes);
              setHasNextPage(res.hasNextPage);
              setTotalPages(res.totalPages);
              fetchedPage = true;
            }
          }
        } catch (apiErr) {
          console.warn(`Paginatable API endpoint failed for ${fetchType}:`, apiErr);
        }
        
        // Fallback to getHome() if endpoint doesn't work or returns empty (e.g. recently-updated returns 500)
        if (!fetchedPage && page === 1) {
          const homeData = await getHome();
          switch (type) {
            case 'trending':
              setItems(homeData.trendingAnimes);
              break;
            case 'updated':
              setItems(homeData.latestEpisodeAnimes);
              break;
            case 'completed':
              setItems(homeData.latestCompletedAnimes);
              break;
            case 'upcoming':
              setItems(homeData.topUpcomingAnimes);
              break;
            case 'most-popular':
              setItems(homeData.mostPopularAnimes);
              break;
            case 'top-airing':
              setItems(homeData.topAiringAnimes);
              break;
            default:
              setItems([]);
          }
          setHasNextPage(false);
          setTotalPages(1);
        } else if (!fetchedPage) {
          setItems([]);
          setHasNextPage(false);
        }
      } catch (err) {
        console.error(err);
        const errorMsg = "We couldn't load the anime list. Our servers might be experiencing a hiccup.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [type, page, retryCount]);

  const title = isGenre ? `${type ? type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''} Anime` : (type ? LIST_TITLES[type] || 'Anime List' : 'Anime List');

  const handleNextPage = () => {
    if (hasNextPage || page < totalPages) {
      setSearchParams({ page: (page + 1).toString() });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setSearchParams({ page: (page - 1).toString() });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black text-white tracking-tight">{title} <span className="text-white/40 text-lg font-medium ml-2">Page {page}</span></h1>
        
        <div className="flex items-center gap-2">
          <label htmlFor="genre-select" className="text-white/60 font-medium text-sm">Filter by Genre:</label>
          <select 
            id="genre-select"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm md:text-base text-white focus:outline-none focus:border-accent"
            value={isGenre && type ? GENRES.find(g => g.toLowerCase().replace(/ /g, '-') === type?.toLowerCase()) || "" : ""}
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/genre/${e.target.value.toLowerCase().replace(/ /g, '-')}`);
              } else {
                navigate(`/list/trending`); // Or some default
              }
            }}
          >
            <option value="" className="bg-black text-white">Select a Genre</option>
            {GENRES.map(g => (
              <option key={g} value={g} className="bg-black text-white">{g}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
          <p className="text-white/60 mb-6 max-w-md">{error}</p>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {items.map((item: any) => (
              <AnimeCard key={item.id} anime={item} />
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="text-white/60 font-medium">
              Page {page} {totalPages > 1 ? `of ${totalPages}` : ''}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage && page >= totalPages}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-white/50 py-20 glass-panel rounded-xl">
          No items found on this page.
        </div>
      )}
    </div>
  );
}
