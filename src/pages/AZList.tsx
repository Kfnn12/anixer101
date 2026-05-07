import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getAZList, Anime, ApiError } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import ErrorState from '../components/ErrorState';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AZList() {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const currentLetter = letter || 'all';

  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getAZList(currentLetter, page);
      if (res && res.animes) {
        setItems(res.animes);
        setHasNextPage(res.hasNextPage);
        setTotalPages(res.totalPages);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setItems([]);
      if (err instanceof ApiError) setErrorMsg(err.message);
      else setErrorMsg('Failed to load anime list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [currentLetter, page, retryCount]);

  const handleNextPage = () => {
    if (hasNextPage || page < totalPages) {
      if (currentLetter === 'all') {
        navigate(`/az-list?page=${page + 1}`);
      } else {
        navigate(`/az-list/${currentLetter}?page=${page + 1}`);
      }
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      if (currentLetter === 'all') {
        navigate(`/az-list?page=${page - 1}`);
      } else {
        navigate(`/az-list/${currentLetter}?page=${page - 1}`);
      }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 min-h-[100dvh]">
      <h1 className="text-3xl font-black mb-6 text-white tracking-tight">
        A-Z List: {currentLetter.toUpperCase()} <span className="text-white/40 text-lg font-medium ml-2">Page {page}</span>
      </h1>
      
      <div className="flex flex-wrap gap-2 mb-10 bg-white/5 p-4 rounded-xl border border-white/5">
        <Link 
          to="/az-list" 
          className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${currentLetter === 'all' ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
        >
          All
        </Link>
        <Link 
          to="/az-list/other" 
          className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${currentLetter === 'other' ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
        >
          #
        </Link>
        {LETTERS.map(l => (
          <Link 
            key={l}
            to={`/az-list/${l}`}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${currentLetter === l || currentLetter === l.toLowerCase() ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorMsg ? (
        <ErrorState message={errorMsg} onRetry={() => setRetryCount(c => c + 1)} className="my-20" />
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
          No items found for letter {currentLetter.toUpperCase()}.
        </div>
      )}
    </div>
  );
}
