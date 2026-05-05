import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAnime } from '../lib/api';
import AnimeCard from '../components/AnimeCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    async function doSearch() {
      setLoading(true);
      setError('');
      try {
        const res = await searchAnime(query, 1);
        setResults(res.animes || []);
      } catch (err) {
        console.error(err);
        setError('Failed to search anime. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    doSearch();
  }, [query]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-white tracking-tight">
        {query ? (
          <>Search Results for <span className="text-accent">"{query}"</span></>
        ) : (
          'Search Anime'
        )}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-10 glass-panel rounded-xl">{error}</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {results.map((item: any) => (
            <AnimeCard key={item.id} anime={item} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center text-white/50 py-20 glass-panel rounded-xl">
          No results found for "{query}".
        </div>
      ) : (
        <div className="text-center text-white/50 py-20 glass-panel rounded-xl">
          Enter a search query in the search bar above to begin.
        </div>
      )}
    </div>
  );
}
